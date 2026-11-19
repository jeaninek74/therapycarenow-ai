import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { milesBetweenZips } from "../shared/socalZips";
import { getSessionCookieOptions } from "./_core/cookies";
import { loginUser, createSessionToken } from "./_core/auth";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { moderateInput, getSupportAssistantResponse } from "./aiGuardrails";
import { searchLiveProviders } from "./liveProviderSearch";
import { SERVICE_STATE_CODE } from "@shared/region";
import {
  getFreeResources,
  searchProviders,
  getProviderById,
  lookupEAP,
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
import { safeLog } from "./_core/security";
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
      const resources = await getFreeResources(SERVICE_STATE_CODE);

      return resources;
    }),
});

// - Provider Search Router -

const providerRouter = router({
  search: publicProcedure
    .input(
      z.object({
        stateCode: z.string().length(2).optional(),
        county: z.string().optional(),
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
        searchProviders({ ...input, stateCode: SERVICE_STATE_CODE }),
        searchLiveProviders({
          county: input.county,
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

      return provider;
    }),

  getStateDirectory: publicProcedure.query(async () => {
    return getProviderCountByState();
  }),

  getCitiesForState: publicProcedure
    .input(z.object({ stateCode: z.string().length(2) }))
    .query(async ({ input }) => {
      return getCitiesByState(SERVICE_STATE_CODE);
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
      return getCitiesByStateAndCategory(SERVICE_STATE_CODE);
    }),

  searchByCategory: publicProcedure
    .input(
      z.object({
        category: z.enum(['Therapist', 'Psychiatrist', 'Psychologist']).optional(),
        stateCode: z.string().length(2).optional(),
        county: z.string().optional(),
        city: z.string().optional(),
        telehealth: z.boolean().optional(),
        specialty: z.string().optional(),
        insurance: z.string().optional(),
        costTag: z.enum(['free', 'sliding_scale', 'insurance', 'self_pay']).optional(),
        zip: z.string().regex(/^\d{5}$/).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const { category, zip, offset, ...rest } = input;
      const limit = input.limit ?? 50;
      const start = offset ?? 0;
      // Category and distance are computed after the query, so fetch extra rows before filtering and sorting.
      const results = await searchProviders({ ...rest, stateCode: SERVICE_STATE_CODE, ...(category || zip ? { limit: 20000, offset: 0 } : { limit, offset: start }) });
      const distance = (p: { zipCode?: string | null }) => (zip ? milesBetweenZips(zip, p.zipCode) ?? 1e9 : 0);
      return results
        .filter(p => !category || getProviderCategory(p.licenseType ?? '') === category)
        .sort((a, b) => distance(a) - distance(b))
        .slice(category || zip ? start : 0, (category || zip ? start : 0) + limit)
        .map(p => ({ ...p, category: category ?? getProviderCategory(p.licenseType ?? '') }));
    }),
});

// - My Insurance & Benefits Router (lookup only, nothing is stored) -

const benefitsRouter = router({
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
        county: z.string().optional(),
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

      // Step 2: If moderation flags risk → Crisis Mode, block AI
      if (modResult.triggersCrisisMode) {
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
        }).catch((err) => safeLog.warn("[Notification] Crisis moderation notify failed:", err));

        return {
          content: null,
          crisisMode: true,
          blocked: true,
          blockReason: "Safety concern detected. Please use crisis resources.",
        };
      }

      // Step 2b: If moderation flagged but not crisis (e.g., service failure fallback), block AI
      if (modResult.flagged && !modResult.safe) {
        return {
          content: "I'm unable to process that right now. Please use the search tools to find resources, or call 988 if you need immediate support.",
          crisisMode: false,
          blocked: true,
          blockReason: "Moderation could not verify safety. AI response withheld.",
        };
      }

      // Step 3: AI response (only if moderation passed)
      const aiResponse = await getSupportAssistantResponse(input.message, {
        stateCode: input.stateCode,
        county: input.county,
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

  // - Automated Monitoring (admin-only) -
  getSummary: adminProcedure.query(async () => {
    return getComplianceSummary();
  }),

  getAlerts: adminProcedure.query(async () => {
    return getActiveAlerts();
  }),

  getSyncLogs: adminProcedure.query(async () => {
    return getRecentSyncLogs(20);
  }),

  getPolicyUpdates: adminProcedure.query(async () => {
    return getRecentPolicyUpdates(30);
  }),

  dismissAlert: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await dismissAlert(input.alertId, ctx.user.id);
      return { success: true };
    }),

  triggerSync: adminProcedure.mutation(async () => {
    const results = await runFullComplianceSync();
    return { results };
  }),
});

// - Admin Router -

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
