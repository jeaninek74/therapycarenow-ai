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
