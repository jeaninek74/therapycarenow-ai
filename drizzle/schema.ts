import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  index,
} from "drizzle-orm/mysql-core";

// ─── Core Users ────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Profiles ─────────────────────────────────────────────────────────────

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stateCode: varchar("stateCode", { length: 2 }),
  insuranceCarrier: varchar("insuranceCarrier", { length: 256 }),
  insurancePlan: varchar("insurancePlan", { length: 256 }),
  employerName: varchar("employerName", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;

// ─── Consents ──────────────────────────────────────────────────────────────────

export const consents = mysqlTable("consents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consentType: varchar("consentType", { length: 64 }).notNull(), // 'benefits_storage', 'location'
  granted: boolean("granted").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Consent = typeof consents.$inferSelect;

// ─── Audit Events (HIPAA: no raw crisis text) ──────────────────────────────────

export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // nullable for anonymous
  eventType: varchar("eventType", { length: 64 }).notNull(),
  // event types: triage_completed, crisis_mode_triggered, resource_clicked,
  //              provider_contact_clicked, benefits_saved, ai_assistant_used,
  //              moderation_triggered
  riskLevel: mysqlEnum("riskLevel", ["EMERGENCY", "URGENT", "ROUTINE"]),
  triggerSource: varchar("triggerSource", { length: 64 }), // 'triage', 'moderation'
  moderationOutcome: varchar("moderationOutcome", { length: 32 }), // 'safe', 'flagged'
  stateCode: varchar("stateCode", { length: 2 }),
  resourceType: varchar("resourceType", { length: 64 }),
  // NEVER store raw user text — only structured metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditEvent = typeof auditEvents.$inferSelect;

// ─── Crisis Resources ──────────────────────────────────────────────────────────

export const crisisResources = mysqlTable(
  "crisis_resources",
  {
    id: int("id").autoincrement().primaryKey(),
    stateCode: varchar("stateCode", { length: 2 }), // null = national
    name: varchar("name", { length: 256 }).notNull(),
    resourceType: mysqlEnum("resourceType", [
      "call_911",
      "call_988",
      "text_988",
      "chat_988",
      "crisis_text_line",
      "state_hotline",
      "local_crisis_center",
    ]).notNull(),
    phone: varchar("phone", { length: 32 }),
    smsNumber: varchar("smsNumber", { length: 32 }),
    chatUrl: varchar("chatUrl", { length: 512 }),
    description: text("description"),
    isNational: boolean("isNational").notNull().default(false),
    priority: int("priority").notNull().default(10), // lower = higher priority
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_crisis_state").on(table.stateCode),
    index("idx_crisis_national").on(table.isNational),
  ]
);

export type CrisisResource = typeof crisisResources.$inferSelect;

// ─── Providers ─────────────────────────────────────────────────────────────────

export const providers = mysqlTable(
  "providers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    licenseState: varchar("licenseState", { length: 2 }).notNull(),
    licenseNumber: varchar("licenseNumber", { length: 64 }),
    licenseType: varchar("licenseType", { length: 64 }), // LCSW, LPC, PhD, etc.
    telehealthAvailable: boolean("telehealthAvailable").notNull().default(false),
    inPersonAvailable: boolean("inPersonAvailable").notNull().default(true),
    city: varchar("city", { length: 128 }),
    stateCode: varchar("stateCode", { length: 2 }),
    zipCode: varchar("zipCode", { length: 10 }),
    phone: varchar("phone", { length: 32 }),
    bookingUrl: varchar("bookingUrl", { length: 512 }),
    website: varchar("website", { length: 512 }),
    languages: text("languages"), // JSON array
    costTag: mysqlEnum("costTag", ["free", "sliding_scale", "insurance", "self_pay"]).default("insurance"),
    acceptsNewPatients: boolean("acceptsNewPatients").notNull().default(true),
    urgencyAvailability: mysqlEnum("urgencyAvailability", ["within_24h", "within_72h", "this_week", "flexible"]).default("flexible"),
    bio: text("bio"),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_provider_state").on(table.licenseState),
    index("idx_provider_telehealth").on(table.telehealthAvailable),
    index("idx_provider_cost").on(table.costTag),
  ]
);

export type Provider = typeof providers.$inferSelect;

// ─── Provider Specialties ──────────────────────────────────────────────────────

export const providerSpecialties = mysqlTable(
  "provider_specialties",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull(),
    specialty: varchar("specialty", { length: 128 }).notNull(),
    // anxiety, depression, trauma, ptsd, grief, addiction, family, couples,
    // eating_disorders, ocd, adhd, bipolar, schizophrenia, lgbtq, veterans,
    // child_adolescent, geriatric, workplace_stress
  },
  (table) => [index("idx_specialty").on(table.specialty)]
);

export type ProviderSpecialty = typeof providerSpecialties.$inferSelect;

// ─── Provider Insurance ────────────────────────────────────────────────────────

export const providerInsurance = mysqlTable(
  "provider_insurance",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull(),
    insuranceName: varchar("insuranceName", { length: 256 }).notNull(),
    planName: varchar("planName", { length: 256 }),
  },
  (table) => [index("idx_insurance_name").on(table.insuranceName)]
);

export type ProviderInsurance = typeof providerInsurance.$inferSelect;

// ─── Employers & EAP ──────────────────────────────────────────────────────────

export const employers = mysqlTable("employers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  nameNormalized: varchar("nameNormalized", { length: 256 }).notNull(), // lowercase for search
  eapProvider: varchar("eapProvider", { length: 256 }),
  eapPhone: varchar("eapPhone", { length: 32 }),
  eapUrl: varchar("eapUrl", { length: 512 }),
  eapSessions: int("eapSessions"), // free sessions per year
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Employer = typeof employers.$inferSelect;

// ─── EAP Resources ────────────────────────────────────────────────────────────

export const eapResources = mysqlTable("eap_resources", {
  id: int("id").autoincrement().primaryKey(),
  employerId: int("employerId").notNull(),
  resourceName: varchar("resourceName", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  url: varchar("url", { length: 512 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EapResource = typeof eapResources.$inferSelect;

// ─── Free Resources ────────────────────────────────────────────────────────────

export const freeResources = mysqlTable(
  "free_resources",
  {
    id: int("id").autoincrement().primaryKey(),
    stateCode: varchar("stateCode", { length: 2 }), // null = national
    name: varchar("name", { length: 256 }).notNull(),
    category: mysqlEnum("category", [
      "community_clinic",
      "sliding_scale",
      "hotline",
      "support_group",
      "county_resource",
      "national_program",
    ]).notNull(),
    phone: varchar("phone", { length: 32 }),
    website: varchar("website", { length: 512 }),
    address: text("address"),
    description: text("description"),
    isNational: boolean("isNational").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_free_state").on(table.stateCode),
    index("idx_free_category").on(table.category),
  ]
);

export type FreeResource = typeof freeResources.$inferSelect;

// ─── State Compliance Data ─────────────────────────────────────────────────────

export const stateCompliance = mysqlTable("state_compliance", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("stateCode", { length: 2 }).notNull().unique(),
  stateName: varchar("stateName", { length: 64 }).notNull(),
  telehealthLawSummary: text("telehealthLawSummary"),
  mandatoryReportingNotes: text("mandatoryReportingNotes"),
  crisisLineNotes: text("crisisLineNotes"),
  licensureRequirements: text("licensureRequirements"),
  privacyNotes: text("privacyNotes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StateCompliance = typeof stateCompliance.$inferSelect;

// ─── Triage Sessions (no raw text stored) ─────────────────────────────────────

export const triageSessions = mysqlTable("triage_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionToken: varchar("sessionToken", { length: 64 }).notNull().unique(),
  userId: int("userId"), // nullable for anonymous
  riskLevel: mysqlEnum("riskLevel", ["EMERGENCY", "URGENT", "ROUTINE"]).notNull(),
  // Store only boolean outcomes, never raw text
  immediateDanger: boolean("immediateDanger").notNull().default(false),
  harmSelf: boolean("harmSelf").notNull().default(false),
  harmOthers: boolean("harmOthers").notNull().default(false),
  needHelpSoon: boolean("needHelpSoon").notNull().default(false),
  needHelpToday: boolean("needHelpToday").notNull().default(false),
  stateCode: varchar("stateCode", { length: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TriageSession = typeof triageSessions.$inferSelect;
