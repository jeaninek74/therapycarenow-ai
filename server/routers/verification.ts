import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { providers, providerSubmissions } from "../../drizzle/schema";
import { verifyProviderLicense } from "../licenseVerification";

export const verificationRouter = router({
  // ── Public: look up an NPI number ────────────────────────────────────────────
  lookupNpi: publicProcedure
    .input(z.object({ npiNumber: z.string().min(10).max(10) }))
    .query(async ({ input }) => {
      return verifyProviderLicense(input.npiNumber);
    }),

  // ── Public: submit a provider for verification ────────────────────────────────
  submitProvider: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        npiNumber: z.string().length(10),
        licenseType: z.string().min(1),
        licenseState: z.string().length(2),
        licenseNumber: z.string().optional(),
        specialty: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        bookingUrl: z.string().optional(),
        telehealthAvailable: z.boolean().optional(),
        city: z.string().optional(),
        stateCode: z.string().optional(),
        zipCode: z.string().optional(),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Run NPI verification
      const npiResult = await verifyProviderLicense(input.npiNumber, input.licenseState);

      // Insert submission regardless of NPI result (admin reviews)
      const [inserted] = await db.insert(providerSubmissions).values({
        userId: ctx.user?.id ?? null,
        name: input.name,
        npiNumber: input.npiNumber,
        licenseType: input.licenseType,
        licenseState: input.licenseState,
        licenseNumber: input.licenseNumber ?? null,
        specialty: input.specialty ?? null,
        phone: input.phone ?? null,
        website: input.website ?? null,
        bookingUrl: input.bookingUrl ?? null,
        telehealthAvailable: input.telehealthAvailable ?? false,
        city: input.city ?? null,
        stateCode: input.stateCode ?? null,
        zipCode: input.zipCode ?? null,
        bio: input.bio ?? null,
        status: "pending",
        npiValid: npiResult.valid,
        npiLookupResult: JSON.stringify(npiResult),
      });

      return {
        submissionId: (inserted as { insertId?: number }).insertId ?? 0,
        npiValid: npiResult.valid,
        npiData: npiResult,
      };
    }),

  // ── Admin: get all pending submissions ───────────────────────────────────────
  getSubmissions: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db.select().from(providerSubmissions).orderBy(desc(providerSubmissions.createdAt));
  }),

  // ── Admin: approve or reject a submission ────────────────────────────────────
  reviewSubmission: protectedProcedure
    .input(
      z.object({
        submissionId: z.number(),
        action: z.enum(["approve", "reject"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Fetch the submission
      const [submission] = await db
        .select()
        .from(providerSubmissions)
        .where(eq(providerSubmissions.id, input.submissionId))
        .limit(1);

      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      if (input.action === "approve") {
        // Create a verified provider record
        const npiData = submission.npiLookupResult ? JSON.parse(submission.npiLookupResult) : {};
        const [newProvider] = await db.insert(providers).values({
          name: submission.name,
          licenseState: submission.licenseState,
          licenseNumber: submission.licenseNumber ?? null,
          licenseType: submission.licenseType,
          npiNumber: submission.npiNumber,
          verificationStatus: "verified",
          npiVerifiedAt: new Date(),
          licenseVerifiedAt: new Date(),
          verificationNotes: input.adminNotes ?? null,
          npiData: submission.npiLookupResult ?? null,
          telehealthAvailable: submission.telehealthAvailable ?? false,
          inPersonAvailable: true,
          city: submission.city ?? null,
          stateCode: submission.stateCode ?? submission.licenseState,
          zipCode: submission.zipCode ?? null,
          phone: submission.phone ?? null,
          bookingUrl: submission.bookingUrl ?? null,
          website: submission.website ?? null,
          bio: submission.bio ?? null,
          isActive: true,
          costTag: "insurance",
          urgencyAvailability: "flexible",
        });

        const newProviderId = (newProvider as { insertId?: number }).insertId ?? 0;

        await db
          .update(providerSubmissions)
          .set({
            status: "approved",
            adminNotes: input.adminNotes ?? null,
            reviewedAt: new Date(),
            reviewedBy: ctx.user.id,
            providerId: newProviderId,
          })
          .where(eq(providerSubmissions.id, input.submissionId));

        return { success: true, action: "approved", providerId: newProviderId };
      } else {
        await db
          .update(providerSubmissions)
          .set({
            status: "rejected",
            adminNotes: input.adminNotes ?? null,
            reviewedAt: new Date(),
            reviewedBy: ctx.user.id,
          })
          .where(eq(providerSubmissions.id, input.submissionId));

        return { success: true, action: "rejected" };
      }
    }),

  // ── Admin: get verification stats ────────────────────────────────────────────
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const allProviders = await db
      .select({ verificationStatus: providers.verificationStatus })
      .from(providers);

    const stats = {
      unverified: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
      expired: 0,
      total: allProviders.length,
    };

    for (const p of allProviders) {
      if (p.verificationStatus in stats) {
        (stats as Record<string, number>)[p.verificationStatus]++;
      }
    }

    const pendingSubmissions = await db
      .select()
      .from(providerSubmissions)
      .where(eq(providerSubmissions.status, "pending"));

    return { ...stats, pendingSubmissions: pendingSubmissions.length };
  }),
});
