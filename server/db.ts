import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditEvents,
  consents,
  crisisResources,
  employers,
  eapResources,
  freeResources,
  InsertUser,
  providerInsurance,
  providerSpecialties,
  providers,
  stateCompliance,
  triageSessions,
  userProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── User Profiles ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertUserProfile(
  userId: number,
  data: { stateCode?: string; insuranceCarrier?: string; insurancePlan?: string; employerName?: string }
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserProfile(userId);
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...data });
  }
}

// ─── Consents ──────────────────────────────────────────────────────────────────

export async function recordConsent(userId: number, consentType: string, granted: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.insert(consents).values({ userId, consentType, granted });
}

// ─── Audit Events (HIPAA-safe: no raw text) ────────────────────────────────────

export async function logAuditEvent(event: {
  userId?: number;
  eventType: string;
  riskLevel?: "EMERGENCY" | "URGENT" | "ROUTINE";
  triggerSource?: string;
  moderationOutcome?: string;
  stateCode?: string;
  resourceType?: string;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditEvents).values({
      userId: event.userId ?? null,
      eventType: event.eventType,
      riskLevel: event.riskLevel ?? null,
      triggerSource: event.triggerSource ?? null,
      moderationOutcome: event.moderationOutcome ?? null,
      stateCode: event.stateCode ?? null,
      resourceType: event.resourceType ?? null,
    });
  } catch (err) {
    console.error("[Audit] Failed to log event:", err);
  }
}

// ─── Triage Sessions ───────────────────────────────────────────────────────────

export async function saveTriageSession(data: {
  sessionToken: string;
  userId?: number;
  riskLevel: "EMERGENCY" | "URGENT" | "ROUTINE";
  immediateDanger: boolean;
  harmSelf: boolean;
  harmOthers: boolean;
  needHelpSoon: boolean;
  needHelpToday: boolean;
  stateCode?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(triageSessions).values({
    sessionToken: data.sessionToken,
    userId: data.userId ?? null,
    riskLevel: data.riskLevel,
    immediateDanger: data.immediateDanger,
    harmSelf: data.harmSelf,
    harmOthers: data.harmOthers,
    needHelpSoon: data.needHelpSoon,
    needHelpToday: data.needHelpToday,
    stateCode: data.stateCode ?? null,
  });
}

// ─── Crisis Resources ──────────────────────────────────────────────────────────

export async function getCrisisResources(stateCode?: string) {
  const db = await getDb();
  if (!db) return [];

  if (stateCode) {
    return db
      .select()
      .from(crisisResources)
      .where(
        and(
          or(eq(crisisResources.stateCode, stateCode), eq(crisisResources.isNational, true)),
          eq(crisisResources.isActive, true)
        )
      )
      .orderBy(crisisResources.priority);
  }

  return db
    .select()
    .from(crisisResources)
    .where(and(eq(crisisResources.isNational, true), eq(crisisResources.isActive, true)))
    .orderBy(crisisResources.priority);
}

// ─── Free Resources ────────────────────────────────────────────────────────────

export async function getFreeResources(stateCode?: string) {
  const db = await getDb();
  if (!db) return [];

  if (stateCode) {
    return db
      .select()
      .from(freeResources)
      .where(
        and(
          or(eq(freeResources.stateCode, stateCode), eq(freeResources.isNational, true)),
          eq(freeResources.isActive, true)
        )
      )
      .orderBy(freeResources.category);
  }

  return db
    .select()
    .from(freeResources)
    .where(and(eq(freeResources.isNational, true), eq(freeResources.isActive, true)))
    .orderBy(freeResources.category);
}

// ─── Provider Search ───────────────────────────────────────────────────────────

export async function searchProviders(params: {
  stateCode?: string;
  telehealth?: boolean;
  specialty?: string;
  insurance?: string;
  costTag?: string;
  urgency?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(providers.isActive, true)];

  if (params.stateCode) {
    conditions.push(
      or(eq(providers.licenseState, params.stateCode), eq(providers.telehealthAvailable, true))!
    );
  }
  if (params.telehealth === true) {
    conditions.push(eq(providers.telehealthAvailable, true));
  }
  if (params.costTag) {
    conditions.push(eq(providers.costTag, params.costTag as any));
  }

  const baseProviders = await db
    .select()
    .from(providers)
    .where(and(...conditions))
    .limit(params.limit ?? 50);

  if (baseProviders.length === 0) return [];

  const providerIds = baseProviders.map((p) => p.id);

  // Filter by specialty
  let specialtyProviderIds: number[] | null = null;
  if (params.specialty) {
    const specs = await db
      .select()
      .from(providerSpecialties)
      .where(
        and(
          inArray(providerSpecialties.providerId, providerIds),
          like(providerSpecialties.specialty, `%${params.specialty}%`)
        )
      );
    specialtyProviderIds = specs.map((s) => s.providerId);
  }

  // Filter by insurance
  let insuranceProviderIds: number[] | null = null;
  if (params.insurance) {
    const ins = await db
      .select()
      .from(providerInsurance)
      .where(
        and(
          inArray(providerInsurance.providerId, providerIds),
          like(providerInsurance.insuranceName, `%${params.insurance}%`)
        )
      );
    insuranceProviderIds = ins.map((i) => i.providerId);
  }

  // Fetch all specialties and insurance for result providers
  const allSpecialties = await db
    .select()
    .from(providerSpecialties)
    .where(inArray(providerSpecialties.providerId, providerIds));

  const allInsurance = await db
    .select()
    .from(providerInsurance)
    .where(inArray(providerInsurance.providerId, providerIds));

  // Build result with match scoring
  const results = baseProviders
    .filter((p) => {
      if (specialtyProviderIds !== null && !specialtyProviderIds.includes(p.id)) return false;
      if (insuranceProviderIds !== null && !insuranceProviderIds.includes(p.id)) return false;
      return true;
    })
    .map((p) => {
      const specs = allSpecialties.filter((s) => s.providerId === p.id).map((s) => s.specialty);
      const ins = allInsurance.filter((i) => i.providerId === p.id).map((i) => i.insuranceName);

      let score = 0;
      const reasons: string[] = [];

      if (p.urgencyAvailability === "within_24h" || p.urgencyAvailability === "within_72h") {
        score += 30;
        reasons.push("Available soon");
      }
      if (params.insurance && ins.some((i) => i.toLowerCase().includes(params.insurance!.toLowerCase()))) {
        score += 25;
        reasons.push("Accepts your insurance");
      }
      if (params.telehealth && p.telehealthAvailable) {
        score += 20;
        reasons.push("Telehealth available");
      }
      if (p.acceptsNewPatients) {
        score += 10;
        reasons.push("Accepting new patients");
      }
      if (params.specialty && specs.some((s) => s.toLowerCase().includes(params.specialty!.toLowerCase()))) {
        score += 15;
        reasons.push(`Specializes in ${params.specialty}`);
      }

      return {
        ...p,
        specialties: specs,
        insuranceAccepted: ins,
        matchScore: score,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (!result[0]) return null;

  const specs = await db
    .select()
    .from(providerSpecialties)
    .where(eq(providerSpecialties.providerId, id));

  const ins = await db
    .select()
    .from(providerInsurance)
    .where(eq(providerInsurance.providerId, id));

  return {
    ...result[0],
    specialties: specs.map((s) => s.specialty),
    insuranceAccepted: ins.map((i) => i.insuranceName),
  };
}

// ─── EAP / Employers ───────────────────────────────────────────────────────────

export async function lookupEAP(employerName: string) {
  const db = await getDb();
  if (!db) return null;

  const normalized = employerName.toLowerCase().trim();
  const result = await db
    .select()
    .from(employers)
    .where(and(like(employers.nameNormalized, `%${normalized}%`), eq(employers.isActive, true)))
    .limit(1);

  if (!result[0]) return null;

  const resources = await db
    .select()
    .from(eapResources)
    .where(eq(eapResources.employerId, result[0].id));

  return { employer: result[0], resources };
}

// ─── State Compliance ──────────────────────────────────────────────────────────

export async function getStateCompliance(stateCode: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(stateCompliance)
    .where(eq(stateCompliance.stateCode, stateCode.toUpperCase()))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllStateCompliance() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stateCompliance).orderBy(stateCompliance.stateName);
}

// ─── Admin Analytics ───────────────────────────────────────────────────────────

export async function getAuditEventStats() {
  const db = await getDb();
  if (!db) return { total: 0, byType: [], byRiskLevel: [], recentEvents: [] };

  // Total events
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditEvents);
  const total = Number(totalResult[0]?.count ?? 0);

  // By event type
  const byType = await db
    .select({
      eventType: auditEvents.eventType,
      count: sql<number>`count(*)`,
    })
    .from(auditEvents)
    .groupBy(auditEvents.eventType)
    .orderBy(sql`count(*) desc`);

  // By risk level (triage events only)
  const byRiskLevel = await db
    .select({
      riskLevel: auditEvents.riskLevel,
      count: sql<number>`count(*)`,
    })
    .from(auditEvents)
    .where(sql`${auditEvents.riskLevel} IS NOT NULL`)
    .groupBy(auditEvents.riskLevel)
    .orderBy(sql`count(*) desc`);

  // Recent 20 events
  const recentEvents = await db
    .select()
    .from(auditEvents)
    .orderBy(sql`${auditEvents.createdAt} desc`)
    .limit(20);

  return {
    total,
    byType: byType.map((r) => ({ eventType: r.eventType, count: Number(r.count) })),
    byRiskLevel: byRiskLevel.map((r) => ({ riskLevel: r.riskLevel, count: Number(r.count) })),
    recentEvents,
  };
}

export async function getTriageStats() {
  const db = await getDb();
  if (!db) return { total: 0, emergency: 0, urgent: 0, routine: 0, byState: [] };

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(triageSessions);
  const total = Number(totalResult[0]?.count ?? 0);

  const emergencyResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(triageSessions)
    .where(eq(triageSessions.riskLevel, "EMERGENCY"));

  const urgentResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(triageSessions)
    .where(eq(triageSessions.riskLevel, "URGENT"));

  const routineResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(triageSessions)
    .where(eq(triageSessions.riskLevel, "ROUTINE"));

  const byState = await db
    .select({
      stateCode: triageSessions.stateCode,
      count: sql<number>`count(*)`,
    })
    .from(triageSessions)
    .where(sql`${triageSessions.stateCode} IS NOT NULL`)
    .groupBy(triageSessions.stateCode)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  return {
    total,
    emergency: Number(emergencyResult[0]?.count ?? 0),
    urgent: Number(urgentResult[0]?.count ?? 0),
    routine: Number(routineResult[0]?.count ?? 0),
    byState: byState.map((r) => ({ stateCode: r.stateCode, count: Number(r.count) })),
  };
}

export async function getProviderStats() {
  const db = await getDb();
  if (!db) return { total: 0, byState: [], byLicenseType: [] };

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(providers)
    .where(eq(providers.isActive, true));
  const total = Number(totalResult[0]?.count ?? 0);

  const byState = await db
    .select({
      stateCode: providers.stateCode,
      count: sql<number>`count(*)`,
    })
    .from(providers)
    .where(eq(providers.isActive, true))
    .groupBy(providers.stateCode)
    .orderBy(sql`count(*) desc`)
    .limit(15);

  const byLicenseType = await db
    .select({
      licenseType: providers.licenseType,
      count: sql<number>`count(*)`,
    })
    .from(providers)
    .where(eq(providers.isActive, true))
    .groupBy(providers.licenseType)
    .orderBy(sql`count(*) desc`);

  return {
    total,
    byState: byState.map((r) => ({ stateCode: r.stateCode ?? "N/A", count: Number(r.count) })),
    byLicenseType: byLicenseType.map((r) => ({ licenseType: r.licenseType ?? "Unknown", count: Number(r.count) })),
  };
}

export async function bulkImportProviders(providerList: Array<{
  name: string;
  licenseState: string;
  licenseType: string;
  telehealth: boolean;
  inPerson: boolean;
  city: string;
  stateCode: string;
  phone?: string;
  website?: string;
  bio?: string;
  costTag: "free" | "sliding_scale" | "insurance" | "self_pay";
  urgency: "within_24h" | "within_72h" | "this_week" | "flexible";
  specialties: string[];
  insurance: string[];
}>) {
  const db = await getDb();
  if (!db) return { imported: 0, errors: 0 };

  let imported = 0;
  let errors = 0;

  for (const p of providerList) {
    try {
      const [result] = await db.insert(providers).values({
        name: p.name,
        licenseState: p.licenseState,
        licenseType: p.licenseType,
        telehealthAvailable: p.telehealth,
        inPersonAvailable: p.inPerson,
        city: p.city,
        stateCode: p.stateCode,
        phone: p.phone ?? null,
        website: p.website ?? null,
        bio: p.bio ?? null,
        costTag: p.costTag,
        urgencyAvailability: p.urgency,
        acceptsNewPatients: true,
      }).onDuplicateKeyUpdate({ set: { isActive: true } });

      const providerId = (result as any).insertId;
      if (providerId) {
        for (const specialty of p.specialties) {
          await db.insert(providerSpecialties).values({ providerId, specialty })
            .onDuplicateKeyUpdate({ set: { specialty } });
        }
        for (const ins of p.insurance) {
          await db.insert(providerInsurance).values({ providerId, insuranceName: ins })
            .onDuplicateKeyUpdate({ set: { insuranceName: ins } });
        }
      }
      imported++;
    } catch (err) {
      console.error(`[BulkImport] Failed to import provider ${p.name}:`, err);
      errors++;
    }
  }

  return { imported, errors };
}
