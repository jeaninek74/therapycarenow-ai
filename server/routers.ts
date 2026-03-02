import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { registerUser, loginUser, createSessionToken } from "./_core/auth";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { moderateInput, getSupportAssistantResponse } from "./aiGuardrails";
import { searchLiveProviders } from "./liveProviderSearch";
import {
  logAuditEvent,
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
  getProviderStats,
  bulkImportProviders,
  getProviderCountByState,
  getCitiesByState,
  getProviderCategoryCounts,
  getProviderCountByStateAndCategory,
  getCitiesByStateAndCategory,
  getProviderCategory,
} from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { verificationRouter } from "./routers/verification";
import {
  runFullComplianceSync,
  getActiveAlerts,
  getRecentSyncLogs,
  getRecentPolicyUpdates,
  getComplianceSummary,
  dismissAlert,
} from "./complianceSync";

// - Rate limiting (in-memory, simple) -

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

// - Free Resources Router -

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

// - Provider Search Router -

const providerRouter = router({
  search: publicProcedure
    .input(
      z.object({
        stateCode: z.string().length(2).optional(),
        city: z.string().optional(),
        telehealth: z.boolean().optional(),
        specialty: z.string().optional(),
        insurance: z.string().optional(),
        costTag: z.enum(["free", "sliding_scale", "insurance", "self_pay"]).optional(),
        urgency: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      // Run local DB search and live NPPES search in parallel
      const [localResult, liveResult] = await Promise.allSettled([
        searchProviders({ ...input }),
        searchLiveProviders({
          stateCode: input.stateCode,
          city: input.city,
          specialty: input.specialty,
          telehealth: input.telehealth,
          limit: 30,
        }),
      ]);

      const local = localResult.status === "fulfilled" ? localResult.value : [];
      const live = liveResult.status === "fulfilled" ? liveResult.value : [];

      // Deduplicate: skip live results whose NPI matches a local provider
      const localNpis = new Set(
        local.map((p: any) => p.npiNumber).filter(Boolean)
      );
      const filteredLive = live.filter((p) => !localNpis.has(p.npiNumber));

      return { local, live: filteredLive };
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

  getStateDirectory: publicProcedure.query(async () => {
    return getProviderCountByState();
  }),

  getCitiesForState: publicProcedure
    .input(z.object({ stateCode: z.string().length(2) }))
    .query(async ({ input }) => {
      return getCitiesByState(input.stateCode);
    }),

  // Category-aware endpoints
  getCategoryCounts: publicProcedure.query(async () => {
    return getProviderCategoryCounts();
  }),

  getStateDirectoryByCategory: publicProcedure.query(async () => {
    return getProviderCountByStateAndCategory();
  }),

  getCitiesForStateByCategory: publicProcedure
    .input(z.object({ stateCode: z.string().length(2) }))
    .query(async ({ input }) => {
      return getCitiesByStateAndCategory(input.stateCode);
    }),

  searchByCategory: publicProcedure
    .input(
      z.object({
        category: z.enum(['Therapist', 'Psychiatrist', 'Psychologist']).optional(),
        stateCode: z.string().length(2).optional(),
        city: z.string().optional(),
        telehealth: z.boolean().optional(),
        specialty: z.string().optional(),
        insurance: z.string().optional(),
        costTag: z.enum(['free', 'sliding_scale', 'insurance', 'self_pay']).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const { category, ...rest } = input;
      const results = await searchProviders({ ...rest, limit: input.limit ?? 50 });
      if (!category) return results.map(p => ({ ...p, category: getProviderCategory(p.licenseType ?? '') }));
      return results
        .filter(p => getProviderCategory(p.licenseType ?? '') === category)
        .map(p => ({ ...p, category }));
    }),
});

// - Benefits Wallet Router -

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

// - AI Assistant Router -

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

// - State Compliance Router -

const complianceRouter = router({
  getState: publicProcedure
    .input(z.object({ stateCode: z.string().length(2) }))
    .query(async ({ input }) => {
      return getStateCompliance(input.stateCode);
    }),

  getAll: publicProcedure.query(async () => {
    return getAllStateCompliance();
  }),

  // - Automated Monitoring -
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

// - Admin Router -

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    const [auditStats, providerStats] = await Promise.all([
      getAuditEventStats(),
      getProviderStats(),
    ]);
    return { auditStats, providerStats };
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

// - App Router -

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        email: z.string().email(),
        password: z.string().min(8).max(128),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await registerUser(input);
          const token = await createSessionToken(user.openId);
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
        } catch (err: any) {
          if (err.message === 'EMAIL_TAKEN') {
            throw new TRPCError({ code: 'CONFLICT', message: 'An account with this email already exists.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Registration failed.' });
        }
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await loginUser(input);
          const token = await createSessionToken(user.openId);
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
        } catch {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password.' });
        }
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  verification: verificationRouter,
  freeResources: freeResourcesRouter,
  providers: providerRouter,
  benefits: benefitsRouter,
  ai: aiRouter,
  compliance: complianceRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
