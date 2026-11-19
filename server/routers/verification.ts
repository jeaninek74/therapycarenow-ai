import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { providerInsurance, providers, providerSubmissions } from "../../drizzle/schema";
import { verifyProviderLicense } from "../licenseVerification";

export const verificationRouter = router({
  // - Public: look up an NPI number -
  lookupNpi: publicProcedure
    .input(z.object({ npiNumber: z.string().min(10).max(10) }))
    .query(async ({ input }) => {
      return verifyProviderLicense(input.npiNumber);
    }),

  // - Admin: get all pending submissions -
  getSubmissions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return db.select().from(providerSubmissions).orderBy(desc(providerSubmissions.createdAt));
  }),

  // - Admin: approve or reject a submission -
  reviewSubmission: adminProcedure
    .input(
      z.object({
        submissionId: z.number(),
        action: z.enum(["approve", "reject"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

        const insuranceNames: string[] = submission.insuranceAccepted ? JSON.parse(submission.insuranceAccepted) : [];
        if (newProviderId && insuranceNames.length > 0) {
          await db.insert(providerInsurance).values(
            insuranceNames.map((insuranceName) => ({ providerId: newProviderId, insuranceName })),
          );
        }

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

  // - Admin: get verification stats -
  getStats: adminProcedure.query(async () => {
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
