import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { classifyRisk, TRIAGE_QUESTIONS } from "./triage";
import { moderateInput, getSupportAssistantResponse } from "./aiGuardrails";
import {
  logAuditEvent,
  saveTriageSession,
  getCrisisResources,
  getFreeResources,
  searchProviders,
  getProviderById,
  lookupEAP,
  getUserProfile,
  upsertUserProfile,
  recordConsent,
  getStateCompliance,
  getAllStateCompliance,
  getAuditEventStats,
  getTriageStats,
  getProviderStats,
  bulkImportProviders,
} from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { clinicianRouter } from "./routers/clinician";
import { verificationRouter } from "./routers/verification";
import { subscriptionRouter, messagingRouter } from "./routers/subscription";
import {
  runFullComplianceSync,
  getActiveAlerts,
  getRecentSyncLogs,
  getRecentPolicyUpdates,
  getComplianceSummary,
  dismissAlert,
} from "./complianceSync";

// ─── Rate limiting (in-memory, simple) ────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// ─── Triage Router ─────────────────────────────────────────────────────────────

const triageRouter = router({
  getQuestions: publicProcedure.query(() => TRIAGE_QUESTIONS),

  submit: publicProcedure
    .input(
      z.object({
        immediateDanger: z.boolean(),
        harmSelf: z.boolean(),
        harmOthers: z.boolean(),
        needHelpSoon: z.boolean(),
        needHelpToday: z.boolean(),
        stateCode: z.string().length(2).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting: 10 triage submissions per 5 minutes per IP
      const ip = ctx.req.headers["x-forwarded-for"] as string || "unknown";
      const rateLimitKey = `triage:${ip}`;
      if (!checkRateLimit(rateLimitKey, 10, 5 * 60 * 1000)) {
        throw new Error("Too many requests. Please wait a moment.");
      }

      // Deterministic classification — never AI
      const result = classifyRisk(input);

      // Save session (no raw text stored)
      const sessionToken = nanoid(32);
      await saveTriageSession({
        sessionToken,
        userId: ctx.user?.id,
        riskLevel: result.riskLevel,
        immediateDanger: input.immediateDanger,
        harmSelf: input.harmSelf,
        harmOthers: input.harmOthers,
        needHelpSoon: input.needHelpSoon,
        needHelpToday: input.needHelpToday,
        stateCode: input.stateCode,
      });

      // Audit log (HIPAA-safe: no raw text)
      await logAuditEvent({
        userId: ctx.user?.id,
        eventType: "triage_completed",
        riskLevel: result.riskLevel,
        triggerSource: "triage",
        stateCode: input.stateCode,
      });

      if (result.crisisMode) {
        await logAuditEvent({
          userId: ctx.user?.id,
          eventType: "crisis_mode_triggered",
          riskLevel: "EMERGENCY",
          triggerSource: "triage",
          stateCode: input.stateCode,
        });

        // Notify owner — HIPAA-safe: no PHI, no raw text, only event metadata
        notifyOwner({
          title: "🚨 TherapyCareNow: Crisis Mode Activated",
          content: [
            "A user has been routed to Crisis Mode via the triage flow.",
            `Trigger: Deterministic triage engine`,
            `State: ${input.stateCode ?? "Not provided"}`,
            `Risk Level: EMERGENCY`,
            `Time (UTC): ${new Date().toISOString()}`,
            "",
            "No personal health information is included in this alert.",
            "User has been shown 911, 988 call/text/chat, and local crisis resources.",
          ].join("\n"),
        }).catch((err) => console.warn("[Notification] Crisis triage notify failed:", err));
      }

      return { ...result, sessionToken };
    }),
});

// ─── Crisis Resources Router ───────────────────────────────────────────────────

const crisisRouter = router({
  getResources: publicProcedure
    .input(z.object({ stateCode: z.string().length(2).optional() }))
    .query(async ({ input, ctx }) => {
      const resources = await getCrisisResources(input.stateCode);

      await logAuditEvent({
        userId: ctx.user?.id,
        eventType: "resource_clicked",
        resourceType: "crisis",
        stateCode: input.stateCode,
      });

      return resources;
    }),
});

// ─── Free Resources Router ─────────────────────────────────────────────────────

const freeResourcesRouter = router({
  getResources: publicProcedure
    .input(z.object({ stateCode: z.string().length(2).optional() }))
    .query(async ({ input, ctx }) => {
      const resources = await getFreeResources(input.stateCode);

      await logAuditEvent({
        userId: ctx.user?.id,
        eventType: "resource_clicked",
        resourceType: "free_resources",
        stateCode: input.stateCode,
      });

      return resources;
    }),
});

// ─── Provider Search Router ────────────────────────────────────────────────────

const providerRouter = router({
  search: publicProcedure
    .input(
      z.object({
        stateCode: z.string().length(2).optional(),
        telehealth: z.boolean().optional(),
        specialty: z.string().optional(),
        insurance: z.string().optional(),
        costTag: z.enum(["free", "sliding_scale", "insurance", "self_pay"]).optional(),
        urgency: z.string().optional(),
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchProviders(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const provider = await getProviderById(input.id);

      await logAuditEvent({
        userId: ctx.user?.id,
        eventType: "provider_contact_clicked",
      });

      return provider;
    }),
});

// ─── Benefits Wallet Router ────────────────────────────────────────────────────

const benefitsRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return getUserProfile(ctx.user.id);
  }),

  saveInsurance: protectedProcedure
    .input(
      z.object({
        insuranceCarrier: z.string().min(1).max(256),
        insurancePlan: z.string().max(256).optional(),
        consentGranted: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.consentGranted) {
        throw new Error("Consent is required to save insurance information.");
      }

      await recordConsent(ctx.user.id, "benefits_storage", true);
      await upsertUserProfile(ctx.user.id, {
        insuranceCarrier: input.insuranceCarrier,
        insurancePlan: input.insurancePlan,
      });

      await logAuditEvent({
        userId: ctx.user.id,
        eventType: "benefits_saved",
        resourceType: "insurance",
      });

      return { success: true };
    }),

  saveEmployer: protectedProcedure
    .input(
      z.object({
        employerName: z.string().min(1).max(256),
        consentGranted: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.consentGranted) {
        throw new Error("Consent is required to save employer information.");
      }

      await recordConsent(ctx.user.id, "benefits_storage", true);
      await upsertUserProfile(ctx.user.id, {
        employerName: input.employerName,
      });

      await logAuditEvent({
        userId: ctx.user.id,
        eventType: "benefits_saved",
        resourceType: "employer",
      });

      return { success: true };
    }),

  clearBenefits: protectedProcedure.mutation(async ({ ctx }) => {
    await upsertUserProfile(ctx.user.id, {
      insuranceCarrier: undefined,
      insurancePlan: undefined,
      employerName: undefined,
    });
    return { success: true };
  }),

  lookupEAP: publicProcedure
    .input(z.object({ employerName: z.string().min(1) }))
    .query(async ({ input }) => {
      return lookupEAP(input.employerName);
    }),
});

// ─── AI Assistant Router ───────────────────────────────────────────────────────

const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        stateCode: z.string().length(2).optional(),
        insuranceCarrier: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting: 20 AI requests per 10 minutes per IP
      const ip = ctx.req.headers["x-forwarded-for"] as string || "unknown";
      const rateLimitKey = `ai:${ip}`;
      if (!checkRateLimit(rateLimitKey, 20, 10 * 60 * 1000)) {
        throw new Error("Too many requests. Please wait a moment.");
      }

      // Step 1: Moderation ALWAYS runs first
      const modResult = await moderateInput(input.message);

      await logAuditEvent({
        userId: ctx.user?.id,
        eventType: "ai_assistant_used",
        moderationOutcome: modResult.flagged ? "flagged" : "safe",
        stateCode: input.stateCode,
      });

      // Step 2: If moderation flags risk → Crisis Mode, block AI
      if (modResult.triggersCrisisMode) {
        await logAuditEvent({
          userId: ctx.user?.id,
          eventType: "crisis_mode_triggered",
          triggerSource: "moderation",
          stateCode: input.stateCode,
        });

        // Notify owner — HIPAA-safe: no raw user message stored or transmitted
        notifyOwner({
          title: "🚨 TherapyCareNow: Crisis Mode Activated via AI Moderation",
          content: [
            "A user's AI assistant input was flagged by the OpenAI moderation gateway.",
            `Trigger: AI moderation (content flagged as high-risk)`,
            `State: ${input.stateCode ?? "Not provided"}`,
            `Risk Level: EMERGENCY`,
            `Time (UTC): ${new Date().toISOString()}`,
            "",
            "The AI assistant was blocked. No clinical advice was provided.",
            "User has been redirected to Crisis Mode with 911/988 resources.",
            "No personal health information or message content is included in this alert.",
          ].join("\n"),
        }).catch((err) => console.warn("[Notification] Crisis moderation notify failed:", err));

        return {
          content: null,
          crisisMode: true,
          blocked: true,
          blockReason: "Safety concern detected. Please use crisis resources.",
        };
      }

      // Step 3: AI response (only if moderation passed)
      const aiResponse = await getSupportAssistantResponse(input.message, {
        stateCode: input.stateCode,
        insuranceCarrier: input.insuranceCarrier,
      });

      return {
        content: aiResponse.content,
        crisisMode: false,
        blocked: aiResponse.blocked,
        blockReason: aiResponse.blockReason,
      };
    }),
});

// ─── State Compliance Router ───────────────────────────────────────────────────

const complianceRouter = router({
  getState: publicProcedure
    .input(z.object({ stateCode: z.string().length(2) }))
    .query(async ({ input }) => {
      return getStateCompliance(input.stateCode);
    }),

  getAll: publicProcedure.query(async () => {
    return getAllStateCompliance();
  }),

  // ─── Automated Monitoring ─────────────────────────────────────────────────
  getSummary: publicProcedure.query(async () => {
    return getComplianceSummary();
  }),

  getAlerts: publicProcedure.query(async () => {
    return getActiveAlerts();
  }),

  getSyncLogs: publicProcedure.query(async () => {
    return getRecentSyncLogs(20);
  }),

  getPolicyUpdates: publicProcedure.query(async () => {
    return getRecentPolicyUpdates(30);
  }),

  dismissAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await dismissAlert(input.alertId, ctx.user.id);
      return { success: true };
    }),

  triggerSync: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    const results = await runFullComplianceSync();
    return { results };
  }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    const [auditStats, triageStats, providerStats] = await Promise.all([
      getAuditEventStats(),
      getTriageStats(),
      getProviderStats(),
    ]);
    return { auditStats, triageStats, providerStats };
  }),

  bulkImportProviders: adminProcedure
    .input(
      z.object({
        providers: z.array(
          z.object({
            name: z.string().min(1),
            licenseState: z.string().length(2),
            licenseType: z.string().min(1),
            telehealth: z.boolean(),
            inPerson: z.boolean(),
            city: z.string().min(1),
            stateCode: z.string().length(2),
            phone: z.string().optional(),
            website: z.string().url().optional(),
            bio: z.string().optional(),
            costTag: z.enum(["free", "sliding_scale", "insurance", "self_pay"]),
            urgency: z.enum(["within_24h", "within_72h", "this_week", "flexible"]),
            specialties: z.array(z.string()),
            insurance: z.array(z.string()),
          })
        ).max(500),
      })
    )
    .mutation(async ({ input }) => {
      return bulkImportProviders(input.providers);
    }),
});

// ─── App Router ────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  triage: triageRouter,
  crisis: crisisRouter,
  clinician: clinicianRouter,
  verification: verificationRouter,
  freeResources: freeResourcesRouter,
  providers: providerRouter,
  benefits: benefitsRouter,
  ai: aiRouter,
  compliance: complianceRouter,
  admin: adminRouter,
  subscription: subscriptionRouter,
  messaging: messagingRouter,
});

export type AppRouter = typeof appRouter;
