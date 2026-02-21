/**
 * Clinician Portal Database Helpers
 * All queries scoped to clinicianId to enforce data isolation
 */

import { and, desc, eq, gte, count, avg } from "drizzle-orm";
import { getDb } from "./db";
import {
  clinicianProfiles,
  clients,
  sessionNotes,
  treatmentPlans,
  riskFlags,
  clientCheckins,
  homeworkAssignments,
  intakeResponses,
  billingRecords,
  users,
  type InsertClinicianProfile,
  type InsertClient,
  type InsertSessionNote,
  type InsertTreatmentPlan,
  type InsertRiskFlag,
  type InsertClientCheckin,
  type InsertHomeworkAssignment,
  type InsertIntakeResponse,
  type InsertBillingRecord,
} from "../drizzle/schema";

// ─── Clinician Profile ────────────────────────────────────────────────────────

export async function getClinicianProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(clinicianProfiles)
    .where(eq(clinicianProfiles.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertClinicianProfile(data: InsertClinicianProfile) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(clinicianProfiles)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        npiVerified: data.npiVerified,
        npiVerifiedAt: data.npiVerifiedAt,
        npiData: data.npiData,
        licenseType: data.licenseType,
        licenseState: data.licenseState,
        licenseNumber: data.licenseNumber,
        specialty: data.specialty,
        practiceType: data.practiceType,
      },
    });
}

export async function setClinicianRole(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ role: "clinician" })
    .where(eq(users.id, userId));
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(clinicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clients)
    .where(eq(clients.clinicianId, clinicianId))
    .orderBy(desc(clients.updatedAt));
}

export async function getClientById(id: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.clinicianId, clinicianId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result[0];
}

export async function updateClient(
  id: number,
  clinicianId: number,
  data: Partial<InsertClient>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(clients)
    .set(data)
    .where(and(eq(clients.id, id), eq(clients.clinicianId, clinicianId)));
}

// ─── Session Notes ────────────────────────────────────────────────────────────

export async function getSessionNotes(clinicianId: number, clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = clientId
    ? and(eq(sessionNotes.clinicianId, clinicianId), eq(sessionNotes.clientId, clientId))
    : eq(sessionNotes.clinicianId, clinicianId);
  return db
    .select()
    .from(sessionNotes)
    .where(conditions)
    .orderBy(desc(sessionNotes.sessionDate));
}

export async function getNoteById(id: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(sessionNotes)
    .where(and(eq(sessionNotes.id, id), eq(sessionNotes.clinicianId, clinicianId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createSessionNote(data: InsertSessionNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sessionNotes).values(data);
  const result = await db
    .select()
    .from(sessionNotes)
    .where(
      and(
        eq(sessionNotes.clinicianId, data.clinicianId),
        eq(sessionNotes.clientId, data.clientId)
      )
    )
    .orderBy(desc(sessionNotes.createdAt))
    .limit(1);
  return result[0];
}

export async function updateSessionNote(
  id: number,
  clinicianId: number,
  data: Partial<InsertSessionNote>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(sessionNotes)
    .set(data)
    .where(and(eq(sessionNotes.id, id), eq(sessionNotes.clinicianId, clinicianId)));
}

export async function getPendingNotesCount(clinicianId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: count() })
    .from(sessionNotes)
    .where(
      and(
        eq(sessionNotes.clinicianId, clinicianId),
        eq(sessionNotes.status, "pending_review")
      )
    );
  return result[0]?.count ?? 0;
}

// ─── Treatment Plans ──────────────────────────────────────────────────────────

export async function getTreatmentPlan(clientId: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(treatmentPlans)
    .where(
      and(
        eq(treatmentPlans.clientId, clientId),
        eq(treatmentPlans.clinicianId, clinicianId),
        eq(treatmentPlans.status, "active")
      )
    )
    .orderBy(desc(treatmentPlans.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertTreatmentPlan(data: InsertTreatmentPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(treatmentPlans).values(data).onDuplicateKeyUpdate({
    set: {
      diagnosisCodes: data.diagnosisCodes,
      goals: data.goals,
      interventions: data.interventions,
      aiSuggestions: data.aiSuggestions,
      progressNotes: data.progressNotes,
      status: data.status,
      reviewDate: data.reviewDate,
    },
  });
}

// ─── Risk Flags ───────────────────────────────────────────────────────────────

export async function getRiskFlags(clinicianId: number, clientId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = clientId
    ? and(
        eq(riskFlags.clinicianId, clinicianId),
        eq(riskFlags.clientId, clientId),
        eq(riskFlags.isResolved, false)
      )
    : and(eq(riskFlags.clinicianId, clinicianId), eq(riskFlags.isResolved, false));
  return db
    .select()
    .from(riskFlags)
    .where(conditions)
    .orderBy(desc(riskFlags.createdAt));
}

export async function createRiskFlag(data: InsertRiskFlag) {
  const db = await getDb();
  if (!db) return;
  await db.insert(riskFlags).values(data);
}

export async function resolveRiskFlag(id: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(riskFlags)
    .set({ isResolved: true, resolvedAt: new Date() })
    .where(and(eq(riskFlags.id, id), eq(riskFlags.clinicianId, clinicianId)));
}

// ─── Client Check-ins ─────────────────────────────────────────────────────────

export async function getClientCheckins(clientId: number, clinicianId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clientCheckins)
    .where(
      and(
        eq(clientCheckins.clientId, clientId),
        eq(clientCheckins.clinicianId, clinicianId)
      )
    )
    .orderBy(desc(clientCheckins.completedAt))
    .limit(limit);
}

export async function createCheckin(data: InsertClientCheckin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clientCheckins).values(data);
}

// ─── Homework Assignments ─────────────────────────────────────────────────────

export async function getHomework(clientId: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(homeworkAssignments)
    .where(
      and(
        eq(homeworkAssignments.clientId, clientId),
        eq(homeworkAssignments.clinicianId, clinicianId)
      )
    )
    .orderBy(desc(homeworkAssignments.createdAt));
}

export async function createHomework(data: InsertHomeworkAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(homeworkAssignments).values(data);
}

export async function completeHomework(id: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(homeworkAssignments)
    .set({ isCompleted: true, completedAt: new Date() })
    .where(
      and(
        eq(homeworkAssignments.id, id),
        eq(homeworkAssignments.clinicianId, clinicianId)
      )
    );
}

// ─── Intake Responses ─────────────────────────────────────────────────────────

export async function getIntakeResponses(clientId: number, clinicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(intakeResponses)
    .where(
      and(
        eq(intakeResponses.clientId, clientId),
        eq(intakeResponses.clinicianId, clinicianId)
      )
    )
    .orderBy(intakeResponses.completedAt);
}

export async function saveIntakeResponse(data: InsertIntakeResponse) {
  const db = await getDb();
  if (!db) return;
  await db.insert(intakeResponses).values(data);
}

// ─── Billing Records ──────────────────────────────────────────────────────────

export async function getBillingRecords(clinicianId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(billingRecords)
    .where(eq(billingRecords.clinicianId, clinicianId))
    .orderBy(desc(billingRecords.sessionDate));
}

export async function createBillingRecord(data: InsertBillingRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(billingRecords).values(data);
}

export async function updateBillingRecord(
  id: number,
  clinicianId: number,
  data: Partial<InsertBillingRecord>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(billingRecords)
    .set(data)
    .where(
      and(eq(billingRecords.id, id), eq(billingRecords.clinicianId, clinicianId))
    );
}

// ─── Practice Analytics ───────────────────────────────────────────────────────

export async function getPracticeAnalytics(clinicianId: number) {
  const db = await getDb();
  if (!db) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalClients,
    activeClients,
    highRiskClients,
    totalNotes,
    pendingNotes,
    recentNotes,
    totalBilling,
    checkinAvg,
  ] = await Promise.all([
    db.select({ count: count() }).from(clients).where(eq(clients.clinicianId, clinicianId)),
    db.select({ count: count() }).from(clients).where(and(eq(clients.clinicianId, clinicianId), eq(clients.status, "active"))),
    db.select({ count: count() }).from(clients).where(and(eq(clients.clinicianId, clinicianId))),
    db.select({ count: count() }).from(sessionNotes).where(eq(sessionNotes.clinicianId, clinicianId)),
    db.select({ count: count() }).from(sessionNotes).where(and(eq(sessionNotes.clinicianId, clinicianId), eq(sessionNotes.status, "pending_review"))),
    db.select({ count: count() }).from(sessionNotes).where(and(eq(sessionNotes.clinicianId, clinicianId), gte(sessionNotes.createdAt, thirtyDaysAgo))),
    db.select({ count: count() }).from(billingRecords).where(eq(billingRecords.clinicianId, clinicianId)),
    db.select({ avgMood: avg(clientCheckins.mood), avgAnxiety: avg(clientCheckins.anxiety) }).from(clientCheckins).where(and(eq(clientCheckins.clinicianId, clinicianId), gte(clientCheckins.completedAt, thirtyDaysAgo))),
  ]);

  return {
    totalClients: totalClients[0]?.count ?? 0,
    activeClients: activeClients[0]?.count ?? 0,
    highRiskClients: highRiskClients[0]?.count ?? 0,
    totalNotes: totalNotes[0]?.count ?? 0,
    pendingNotes: pendingNotes[0]?.count ?? 0,
    recentNotes30Days: recentNotes[0]?.count ?? 0,
    totalBillingRecords: totalBilling[0]?.count ?? 0,
    avgClientMood30Days: checkinAvg[0]?.avgMood ? Number(checkinAvg[0].avgMood).toFixed(1) : null,
    avgClientAnxiety30Days: checkinAvg[0]?.avgAnxiety ? Number(checkinAvg[0].avgAnxiety).toFixed(1) : null,
  };
}
