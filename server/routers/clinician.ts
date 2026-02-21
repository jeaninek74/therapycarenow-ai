/**
 * Clinician Portal tRPC Router
 * All procedures require clinician role + NPI verification
 * except: npiLookup and register (used during onboarding)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  verifyNpi,
  generateSessionNote,
  generateTreatmentPlanSuggestions,
  analyzeRisk,
  getNextIntakeQuestions,
  checkNoteCompliance,
  optimizeBilling,
  calculateBurnoutIndicators,
} from "../clinician";
import {
  getClinicianProfile,
  upsertClinicianProfile,
  setClinicianRole,
  getClients,
  getClientById,
  createClient,
  updateClient,
  getSessionNotes,
  getNoteById,
  createSessionNote,
  updateSessionNote,
  getPendingNotesCount,
  getTreatmentPlan,
  upsertTreatmentPlan,
  getRiskFlags,
  createRiskFlag,
  resolveRiskFlag,
  getClientCheckins,
  createCheckin,
  getHomework,
  createHomework,
  completeHomework,
  getIntakeResponses,
  saveIntakeResponse,
  getBillingRecords,
  createBillingRecord,
  updateBillingRecord,
  getPracticeAnalytics,
} from "../clinicianDb";

// ─── Clinician-gated middleware ───────────────────────────────────────────────

const clinicianProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "clinician" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This section is only accessible to verified clinicians.",
    });
  }
  // Verify NPI is confirmed
  const profile = await getClinicianProfile(ctx.user.id);
  if (!profile?.npiVerified) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "NPI verification required. Please complete your clinician registration.",
    });
  }
  return next({ ctx: { ...ctx, clinicianProfile: profile } });
});

// ─── Clinician Router ─────────────────────────────────────────────────────────

export const clinicianRouter = router({

  // ── Onboarding / NPI ──────────────────────────────────────────────────────

  lookupNpi: publicProcedure
    .input(z.object({ npiNumber: z.string().min(10).max(10) }))
    .query(async ({ input }) => {
      return verifyNpi(input.npiNumber);
    }),

  register: protectedProcedure
    .input(
      z.object({
        npiNumber: z.string().length(10),
        licenseType: z.enum(["therapist", "social_worker", "psychiatrist", "psychologist", "counselor", "other"]),
        licenseState: z.string().length(2),
        licenseNumber: z.string().optional(),
        specialty: z.string().optional(),
        practiceType: z.enum(["solo", "group", "hospital", "community", "telehealth_only"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify NPI via NPPES
      const npiResult = await verifyNpi(input.npiNumber);
      if (!npiResult.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: npiResult.error ?? "NPI verification failed.",
        });
      }

      // Save clinician profile
      await upsertClinicianProfile({
        userId: ctx.user.id,
        npiNumber: input.npiNumber,
        npiVerified: true,
        npiVerifiedAt: new Date(),
        npiData: JSON.stringify(npiResult.rawData ?? {}),
        licenseType: input.licenseType,
        licenseState: input.licenseState,
        licenseNumber: input.licenseNumber,
        specialty: input.specialty,
        practiceType: input.practiceType ?? "solo",
      });

      // Promote user role to clinician
      await setClinicianRole(ctx.user.id);

      return { success: true, providerName: npiResult.providerName, npiData: npiResult };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return getClinicianProfile(ctx.user.id);
  }),

  // ── Clients ───────────────────────────────────────────────────────────────

  getClients: clinicianProcedure.query(async ({ ctx }) => {
    return getClients(ctx.user.id);
  }),

  getClient: clinicianProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      const client = await getClientById(input.clientId, ctx.user.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found." });
      return client;
    }),

  addClient: clinicianProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(128),
        lastName: z.string().min(1).max(128),
        dateOfBirth: z.string().optional(),
        diagnosisCodes: z.array(z.string()).optional(),
        goals: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createClient({
        clinicianId: ctx.user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        diagnosisCodes: input.diagnosisCodes ? JSON.stringify(input.diagnosisCodes) : undefined,
        goals: input.goals ? JSON.stringify(input.goals) : undefined,
        notes: input.notes,
        status: "active",
      });
      return { success: true };
    }),

  updateClient: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        status: z.enum(["active", "inactive", "discharged", "waitlist"]).optional(),
        riskLevel: z.enum(["low", "moderate", "high", "crisis"]).optional(),
        diagnosisCodes: z.array(z.string()).optional(),
        goals: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { clientId, diagnosisCodes, goals, ...rest } = input;
      await updateClient(clientId, ctx.user.id, {
        ...rest,
        diagnosisCodes: diagnosisCodes ? JSON.stringify(diagnosisCodes) : undefined,
        goals: goals ? JSON.stringify(goals) : undefined,
      });
      return { success: true };
    }),

  // ── Session Notes ─────────────────────────────────────────────────────────

  getNotes: clinicianProcedure
    .input(z.object({ clientId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      return getSessionNotes(ctx.user.id, input.clientId);
    }),

  getNote: clinicianProcedure
    .input(z.object({ noteId: z.number() }))
    .query(async ({ input, ctx }) => {
      const note = await getNoteById(input.noteId, ctx.user.id);
      if (!note) throw new TRPCError({ code: "NOT_FOUND", message: "Note not found." });
      return note;
    }),

  generateNote: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        noteType: z.enum(["SOAP", "DAP"]),
        transcript: z.string().min(10).max(20000),
        sessionDate: z.string(),
        sessionDurationMin: z.number().optional(),
        diagnosisCodes: z.array(z.string()).optional(),
        goals: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify client belongs to this clinician
      const client = await getClientById(input.clientId, ctx.user.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found." });

      const result = await generateSessionNote({
        transcript: input.transcript,
        noteType: input.noteType,
        sessionDurationMin: input.sessionDurationMin,
        clientContext: {
          diagnosisCodes: input.diagnosisCodes ?? [],
          goals: input.goals ?? [],
        },
      });

      // Save note as draft
      const note = await createSessionNote({
        clientId: input.clientId,
        clinicianId: ctx.user.id,
        noteType: input.noteType,
        sessionDate: new Date(input.sessionDate),
        rawTranscript: input.transcript,
        generatedNote: result.note,
        status: "pending_review",
        sessionDurationMin: input.sessionDurationMin,
        cptCode: result.cptCodeSuggestion,
      });

      // Auto-create risk flags if signals detected
      if (result.riskSignals.length > 0 && note) {
        await createRiskFlag({
          clientId: input.clientId,
          clinicianId: ctx.user.id,
          flagType: "crisis_language",
          severity: "critical",
          source: "note",
          sourceId: note.id,
          description: `Crisis signals detected in session note: ${result.riskSignals.slice(0, 3).join(", ")}`,
        });
        // Update client risk level
        await updateClient(input.clientId, ctx.user.id, { riskLevel: "crisis" });
      }

      return { ...result, noteId: note?.id };
    }),

  approveNote: clinicianProcedure
    .input(
      z.object({
        noteId: z.number(),
        approvedNote: z.string().min(10),
        cptCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateSessionNote(input.noteId, ctx.user.id, {
        approvedNote: input.approvedNote,
        status: "approved",
        approvedAt: new Date(),
        cptCode: input.cptCode,
      });
      return { success: true };
    }),

  // ── Treatment Plans ───────────────────────────────────────────────────────

  getTreatmentPlan: clinicianProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getTreatmentPlan(input.clientId, ctx.user.id);
    }),

  generateTreatmentPlan: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        diagnosisCodes: z.array(z.string()),
        presentingProblems: z.array(z.string()),
        goals: z.array(z.string()),
        progressNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const client = await getClientById(input.clientId, ctx.user.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found." });

      const suggestions = await generateTreatmentPlanSuggestions({
        diagnosisCodes: input.diagnosisCodes,
        presentingProblems: input.presentingProblems,
        goals: input.goals,
        progressNotes: input.progressNotes,
      });

      await upsertTreatmentPlan({
        clientId: input.clientId,
        clinicianId: ctx.user.id,
        diagnosisCodes: JSON.stringify(input.diagnosisCodes),
        goals: JSON.stringify(input.goals),
        aiSuggestions: JSON.stringify(suggestions),
        status: "active",
      });

      return suggestions;
    }),

  saveTreatmentPlan: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        diagnosisCodes: z.array(z.string()),
        goals: z.array(z.string()),
        interventions: z.array(z.string()),
        progressNotes: z.string().optional(),
        reviewDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertTreatmentPlan({
        clientId: input.clientId,
        clinicianId: ctx.user.id,
        diagnosisCodes: JSON.stringify(input.diagnosisCodes),
        goals: JSON.stringify(input.goals),
        interventions: JSON.stringify(input.interventions),
        progressNotes: input.progressNotes,
        reviewDate: input.reviewDate ? new Date(input.reviewDate) : undefined,
        status: "active",
      });
      return { success: true };
    }),

  // ── Risk Detection ────────────────────────────────────────────────────────

  getRiskFlags: clinicianProcedure
    .input(z.object({ clientId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      return getRiskFlags(ctx.user.id, input.clientId);
    }),

  analyzeClientRisk: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        noteContent: z.string().optional(),
        checkinData: z
          .object({
            mood: z.number().min(1).max(10),
            energy: z.number().min(1).max(10),
            anxiety: z.number().min(1).max(10),
            notes: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const client = await getClientById(input.clientId, ctx.user.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found." });

      const recentCheckins = await getClientCheckins(input.clientId, ctx.user.id, 10);

      const result = analyzeRisk({
        noteContent: input.noteContent,
        checkinData: input.checkinData,
        recentCheckins: recentCheckins.map((c) => ({
          mood: c.mood,
          anxiety: c.anxiety,
          completedAt: c.completedAt,
        })),
      });

      // Persist flags
      for (const flag of result.flags) {
        await createRiskFlag({
          clientId: input.clientId,
          clinicianId: ctx.user.id,
          flagType: flag.type,
          severity: flag.severity,
          source: input.checkinData ? "checkin" : "note",
          description: flag.description,
        });
      }

      // Update client risk level (map 'critical' → 'crisis' for schema enum)
      if (result.riskLevel !== "low") {
        const mappedLevel = result.riskLevel === "critical" ? "crisis" : result.riskLevel;
        await updateClient(input.clientId, ctx.user.id, { riskLevel: mappedLevel });
      }

      return result;
    }),

  resolveRiskFlag: clinicianProcedure
    .input(z.object({ flagId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await resolveRiskFlag(input.flagId, ctx.user.id);
      return { success: true };
    }),

  // ── Client Check-ins ──────────────────────────────────────────────────────

  getCheckins: clinicianProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getClientCheckins(input.clientId, ctx.user.id);
    }),

  addCheckin: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        mood: z.number().min(1).max(10),
        energy: z.number().min(1).max(10),
        anxiety: z.number().min(1).max(10),
        sleep: z.number().optional(),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const client = await getClientById(input.clientId, ctx.user.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found." });

      await createCheckin({
        clientId: input.clientId,
        clinicianId: ctx.user.id,
        mood: input.mood,
        energy: input.energy,
        anxiety: input.anxiety,
        sleep: input.sleep,
        notes: input.notes,
      });

      // Auto-analyze risk on check-in
      const recentCheckins = await getClientCheckins(input.clientId, ctx.user.id, 10);
      const riskResult = analyzeRisk({
        checkinData: input,
        recentCheckins: recentCheckins.map((c) => ({
          mood: c.mood,
          anxiety: c.anxiety,
          completedAt: c.completedAt,
        })),
      });

      for (const flag of riskResult.flags) {
        await createRiskFlag({
          clientId: input.clientId,
          clinicianId: ctx.user.id,
          flagType: flag.type,
          severity: flag.severity,
          source: "checkin",
          description: flag.description,
        });
      }

      return { success: true, riskResult };
    }),

  // ── Homework ──────────────────────────────────────────────────────────────

  getHomework: clinicianProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getHomework(input.clientId, ctx.user.id);
    }),

  addHomework: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        title: z.string().min(1).max(256),
        description: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createHomework({
        clientId: input.clientId,
        clinicianId: ctx.user.id,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });
      return { success: true };
    }),

  completeHomework: clinicianProcedure
    .input(z.object({ homeworkId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await completeHomework(input.homeworkId, ctx.user.id);
      return { success: true };
    }),

  // ── Adaptive Intake ───────────────────────────────────────────────────────

  getIntakeQuestions: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        answeredKeys: z.array(z.string()),
        answers: z.record(z.string(), z.string()),
      })
    )
    .query(async ({ input, ctx: _ctx }) => {
      const typedAnswers = input.answers as Record<string, string | boolean | number>;
      return getNextIntakeQuestions(input.answeredKeys, typedAnswers);
    }),

  saveIntakeResponse: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        questionKey: z.string(),
        questionText: z.string(),
        answer: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await saveIntakeResponse({
        clientId: input.clientId,
        clinicianId: ctx.user.id,
        questionKey: input.questionKey,
        questionText: input.questionText,
        answer: input.answer,
      });
      return { success: true };
    }),

  getIntakeResponses: clinicianProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getIntakeResponses(input.clientId, ctx.user.id);
    }),

  // ── Compliance ────────────────────────────────────────────────────────────

  checkNoteCompliance: clinicianProcedure
    .input(
      z.object({
        noteId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const note = await getNoteById(input.noteId, ctx.user.id);
      if (!note) throw new TRPCError({ code: "NOT_FOUND", message: "Note not found." });

      const content = note.approvedNote ?? note.generatedNote ?? "";
      return checkNoteCompliance({
        noteContent: content,
        noteType: note.noteType,
        hasSessionDate: !!note.sessionDate,
        hasClientIdentifier: !!note.clientId,
        hasCptCode: !!note.cptCode,
        hasSignature: note.status === "approved" || note.status === "signed",
      });
    }),

  // ── Revenue Optimization ──────────────────────────────────────────────────

  optimizeBilling: clinicianProcedure
    .input(
      z.object({
        noteId: z.number(),
        isTelehealth: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const note = await getNoteById(input.noteId, ctx.user.id);
      if (!note) throw new TRPCError({ code: "NOT_FOUND", message: "Note not found." });

      const client = await getClientById(note.clientId, ctx.user.id);
      const diagnosisCodes: string[] = client?.diagnosisCodes
        ? JSON.parse(client.diagnosisCodes)
        : [];

      return optimizeBilling({
        cptCode: note.cptCode ?? undefined,
        sessionDurationMin: note.sessionDurationMin ?? 50,
        noteContent: note.approvedNote ?? note.generatedNote ?? "",
        diagnosisCodes,
        isTelehealth: input.isTelehealth,
      });
    }),

  getBillingRecords: clinicianProcedure.query(async ({ ctx }) => {
    return getBillingRecords(ctx.user.id);
  }),

  saveBillingRecord: clinicianProcedure
    .input(
      z.object({
        clientId: z.number(),
        sessionNoteId: z.number().optional(),
        cptCode: z.string().optional(),
        diagnosisCode: z.string().optional(),
        sessionDate: z.string(),
        sessionDurationMin: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createBillingRecord({
        clinicianId: ctx.user.id,
        clientId: input.clientId,
        sessionNoteId: input.sessionNoteId,
        cptCode: input.cptCode,
        diagnosisCode: input.diagnosisCode,
        sessionDate: new Date(input.sessionDate),
        sessionDurationMin: input.sessionDurationMin,
        status: "pending",
      });
      return { success: true };
    }),

  // ── Practice Analytics ────────────────────────────────────────────────────

  getAnalytics: clinicianProcedure.query(async ({ ctx }) => {
    const [analytics, pendingNotes] = await Promise.all([
      getPracticeAnalytics(ctx.user.id),
      getPendingNotesCount(ctx.user.id),
    ]);

    const burnout = calculateBurnoutIndicators({
      avgSessionsPerWeek: Math.round((analytics?.recentNotes30Days ?? 0) / 4),
      pendingNotesCount: pendingNotes,
      highRiskClientCount: analytics?.highRiskClients ?? 0,
      missedBreaksBetweenSessions: 0,
    });

    return { ...analytics, burnout };
  }),
});
