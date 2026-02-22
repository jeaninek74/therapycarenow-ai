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
  role: mysqlEnum("role", ["user", "admin", "clinician"]).default("user").notNull(),
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
    // ── License Verification ──────────────────────────────────────────────────
    npiNumber: varchar("npiNumber", { length: 10 }),
    verificationStatus: mysqlEnum("verificationStatus", [
      "unverified",      // default for seed/bulk import — not shown in directory
      "pending",         // submitted for verification, awaiting admin review
      "verified",        // NPI confirmed + admin approved — shown in directory
      "rejected",        // failed verification
      "expired",         // verification older than 90 days, needs re-check
    ]).default("unverified").notNull(),
    npiVerifiedAt: timestamp("npiVerifiedAt"),
    licenseVerifiedAt: timestamp("licenseVerifiedAt"),
    verificationNotes: text("verificationNotes"), // admin notes on approval/rejection
    npiData: text("npiData"), // JSON from NPPES
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
    index("idx_provider_verification").on(table.verificationStatus),
    index("idx_provider_npi").on(table.npiNumber),
  ]
);

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

// ─── Provider Submissions (self-submitted by therapists for verification) ──────

export const providerSubmissions = mysqlTable(
  "provider_submissions",
  {
    id: int("id").autoincrement().primaryKey(),
    // Submitted by a logged-in user (optional — can be anonymous)
    userId: int("userId"),
    // Provider info
    name: varchar("name", { length: 256 }).notNull(),
    npiNumber: varchar("npiNumber", { length: 10 }).notNull(),
    licenseType: varchar("licenseType", { length: 64 }).notNull(),
    licenseState: varchar("licenseState", { length: 2 }).notNull(),
    licenseNumber: varchar("licenseNumber", { length: 64 }),
    specialty: text("specialty"), // comma-separated
    phone: varchar("phone", { length: 32 }),
    website: varchar("website", { length: 512 }),
    bookingUrl: varchar("bookingUrl", { length: 512 }),
    telehealthAvailable: boolean("telehealthAvailable").default(false),
    city: varchar("city", { length: 128 }),
    stateCode: varchar("stateCode", { length: 2 }),
    zipCode: varchar("zipCode", { length: 10 }),
    bio: text("bio"),
    // Verification workflow
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    npiLookupResult: text("npiLookupResult"), // JSON from NPPES
    npiValid: boolean("npiValid").default(false),
    adminNotes: text("adminNotes"),
    reviewedAt: timestamp("reviewedAt"),
    reviewedBy: int("reviewedBy"), // admin userId
    // Linked provider record (set after approval)
    providerId: int("providerId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_submission_status").on(table.status),
    index("idx_submission_npi").on(table.npiNumber),
  ]
);

export type ProviderSubmission = typeof providerSubmissions.$inferSelect;
export type InsertProviderSubmission = typeof providerSubmissions.$inferInsert;

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

// ─── Clinician Profiles (NPI-gated) ────────────────────────────────────────────

export const clinicianProfiles = mysqlTable(
  "clinician_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    npiNumber: varchar("npiNumber", { length: 10 }).notNull().unique(),
    npiVerified: boolean("npiVerified").notNull().default(false),
    npiVerifiedAt: timestamp("npiVerifiedAt"),
    npiData: text("npiData"), // JSON from NPPES API
    licenseType: mysqlEnum("licenseType", [
      "therapist",
      "social_worker",
      "psychiatrist",
      "psychologist",
      "counselor",
      "other",
    ]).notNull(),
    licenseState: varchar("licenseState", { length: 2 }).notNull(),
    licenseNumber: varchar("licenseNumber", { length: 64 }),
    specialty: varchar("specialty", { length: 256 }),
    practiceType: mysqlEnum("practiceType", [
      "solo",
      "group",
      "hospital",
      "community",
      "telehealth_only",
    ]).default("solo"),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_clinician_npi").on(table.npiNumber),
    index("idx_clinician_user").on(table.userId),
  ]
);

export type ClinicianProfile = typeof clinicianProfiles.$inferSelect;
export type InsertClinicianProfile = typeof clinicianProfiles.$inferInsert;

// ─── Clients (managed by clinicians) ──────────────────────────────────────────

export const clients = mysqlTable(
  "clients",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicianId: int("clinicianId").notNull(),
    firstName: varchar("firstName", { length: 128 }).notNull(),
    lastName: varchar("lastName", { length: 128 }).notNull(),
    dateOfBirth: varchar("dateOfBirth", { length: 16 }),
    diagnosisCodes: text("diagnosisCodes"), // JSON array of ICD-10 codes
    goals: text("goals"), // JSON array
    status: mysqlEnum("status", ["active", "inactive", "discharged", "waitlist"]).default("active").notNull(),
    riskLevel: mysqlEnum("riskLevel", ["low", "moderate", "high", "crisis"]).default("low"),
    notes: text("notes"), // general notes
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_client_clinician").on(table.clinicianId),
    index("idx_client_status").on(table.status),
  ]
);

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── Session Notes (SOAP / DAP) ────────────────────────────────────────────────

export const sessionNotes = mysqlTable(
  "session_notes",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    clinicianId: int("clinicianId").notNull(),
    noteType: mysqlEnum("noteType", ["SOAP", "DAP"]).notNull().default("SOAP"),
    sessionDate: timestamp("sessionDate").notNull(),
    rawTranscript: text("rawTranscript"), // stored encrypted / clinician-only
    generatedNote: text("generatedNote"), // AI-generated draft
    approvedNote: text("approvedNote"), // clinician-reviewed final
    status: mysqlEnum("status", ["draft", "pending_review", "approved", "signed"]).default("draft").notNull(),
    approvedAt: timestamp("approvedAt"),
    sessionDurationMin: int("sessionDurationMin"),
    cptCode: varchar("cptCode", { length: 16 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_note_client").on(table.clientId),
    index("idx_note_clinician").on(table.clinicianId),
    index("idx_note_status").on(table.status),
  ]
);

export type SessionNote = typeof sessionNotes.$inferSelect;
export type InsertSessionNote = typeof sessionNotes.$inferInsert;

// ─── Treatment Plans ───────────────────────────────────────────────────────────

export const treatmentPlans = mysqlTable(
  "treatment_plans",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    clinicianId: int("clinicianId").notNull(),
    diagnosisCodes: text("diagnosisCodes"), // JSON array
    goals: text("goals"), // JSON array
    interventions: text("interventions"), // JSON array (clinician-edited)
    aiSuggestions: text("aiSuggestions"), // JSON array (AI-generated)
    progressNotes: text("progressNotes"),
    status: mysqlEnum("status", ["active", "completed", "discontinued"]).default("active").notNull(),
    reviewDate: timestamp("reviewDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_plan_client").on(table.clientId),
    index("idx_plan_clinician").on(table.clinicianId),
  ]
);

export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentPlan = typeof treatmentPlans.$inferInsert;

// ─── Risk Flags ────────────────────────────────────────────────────────────────

export const riskFlags = mysqlTable(
  "risk_flags",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    clinicianId: int("clinicianId").notNull(),
    flagType: varchar("flagType", { length: 64 }).notNull(),
    // 'suicidal_ideation', 'self_harm', 'harm_to_others', 'substance_use',
    // 'crisis_language', 'missed_sessions', 'declining_mood'
    severity: mysqlEnum("severity", ["low", "moderate", "high", "critical"]).notNull(),
    source: mysqlEnum("source", ["note", "checkin", "intake", "manual"]).notNull(),
    sourceId: int("sourceId"), // ID of the note/checkin that triggered it
    description: text("description"), // clinician-safe summary, no raw text
    isResolved: boolean("isResolved").notNull().default(false),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_risk_client").on(table.clientId),
    index("idx_risk_severity").on(table.severity),
    index("idx_risk_resolved").on(table.isResolved),
  ]
);

export type RiskFlag = typeof riskFlags.$inferSelect;
export type InsertRiskFlag = typeof riskFlags.$inferInsert;

// ─── Client Check-ins ──────────────────────────────────────────────────────────

export const clientCheckins = mysqlTable(
  "client_checkins",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    clinicianId: int("clinicianId").notNull(),
    mood: int("mood").notNull(), // 1-10 scale
    energy: int("energy").notNull(), // 1-10 scale
    anxiety: int("anxiety").notNull(), // 1-10 scale
    sleep: int("sleep"), // hours
    notes: text("notes"), // optional client note
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_checkin_client").on(table.clientId),
    index("idx_checkin_date").on(table.completedAt),
  ]
);

export type ClientCheckin = typeof clientCheckins.$inferSelect;
export type InsertClientCheckin = typeof clientCheckins.$inferInsert;

// ─── Homework Assignments ──────────────────────────────────────────────────────

export const homeworkAssignments = mysqlTable(
  "homework_assignments",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    clinicianId: int("clinicianId").notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    dueDate: timestamp("dueDate"),
    isCompleted: boolean("isCompleted").notNull().default(false),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_hw_client").on(table.clientId),
    index("idx_hw_completed").on(table.isCompleted),
  ]
);

export type HomeworkAssignment = typeof homeworkAssignments.$inferSelect;
export type InsertHomeworkAssignment = typeof homeworkAssignments.$inferInsert;

// ─── Adaptive Intake Responses ─────────────────────────────────────────────────

export const intakeResponses = mysqlTable(
  "intake_responses",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    clinicianId: int("clinicianId").notNull(),
    questionKey: varchar("questionKey", { length: 128 }).notNull(),
    questionText: text("questionText"),
    answer: text("answer").notNull(),
    completedAt: timestamp("completedAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_intake_client").on(table.clientId),
  ]
);

export type IntakeResponse = typeof intakeResponses.$inferSelect;
export type InsertIntakeResponse = typeof intakeResponses.$inferInsert;

// ─── Billing / CPT Codes ───────────────────────────────────────────────────────

export const billingRecords = mysqlTable(
  "billing_records",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicianId: int("clinicianId").notNull(),
    clientId: int("clientId").notNull(),
    sessionNoteId: int("sessionNoteId"),
    cptCode: varchar("cptCode", { length: 16 }),
    diagnosisCode: varchar("diagnosisCode", { length: 16 }),
    suggestedCptCode: varchar("suggestedCptCode", { length: 16 }),
    issueFlags: text("issueFlags"), // JSON array of potential claim issues
    sessionDate: timestamp("sessionDate").notNull(),
    sessionDurationMin: int("sessionDurationMin"),
    status: mysqlEnum("status", ["pending", "submitted", "approved", "denied", "corrected"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_billing_clinician").on(table.clinicianId),
    index("idx_billing_client").on(table.clientId),
    index("idx_billing_status").on(table.status),
  ]
);

export type BillingRecord = typeof billingRecords.$inferSelect;
export type InsertBillingRecord = typeof billingRecords.$inferInsert;

// ─── Clinician Subscriptions (Stripe) ─────────────────────────────────────────

export const clinicianSubscriptions = mysqlTable(
  "clinician_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
    stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
    stripePriceId: varchar("stripePriceId", { length: 64 }),
    status: mysqlEnum("status", [
      "trialing",
      "active",
      "past_due",
      "canceled",
      "unpaid",
      "incomplete",
      "paused",
    ])
      .default("trialing")
      .notNull(),
    trialStartAt: timestamp("trialStartAt").defaultNow().notNull(),
    trialEndAt: timestamp("trialEndAt").notNull(),
    currentPeriodStart: timestamp("currentPeriodStart"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    canceledAt: timestamp("canceledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("idx_sub_user").on(table.userId), index("idx_sub_stripe").on(table.stripeSubscriptionId)]
);

export type ClinicianSubscription = typeof clinicianSubscriptions.$inferSelect;
export type InsertClinicianSubscription = typeof clinicianSubscriptions.$inferInsert;

// ─── Stripe Webhook Events (idempotency log) ───────────────────────────────────

export const stripeEvents = mysqlTable("stripe_events", {
  id: int("id").autoincrement().primaryKey(),
  stripeEventId: varchar("stripeEventId", { length: 64 }).notNull().unique(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});

export type StripeEvent = typeof stripeEvents.$inferSelect;

// ─── Message Threads ───────────────────────────────────────────────────────────

export const messageThreads = mysqlTable(
  "message_threads",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicianId: int("clinicianId").notNull(),
    clientId: int("clientId").notNull(),
    lastMessageAt: timestamp("lastMessageAt"),
    clinicianUnreadCount: int("clinicianUnreadCount").default(0).notNull(),
    clientUnreadCount: int("clientUnreadCount").default(0).notNull(),
    retentionDays: int("retentionDays").default(90).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_thread_clinician").on(table.clinicianId),
    index("idx_thread_client").on(table.clientId),
  ]
);

export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessageThread = typeof messageThreads.$inferInsert;

// ─── Secure Messages (AES-256 encrypted content) ──────────────────────────────

export const secureMessages = mysqlTable(
  "secure_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    threadId: int("threadId").notNull(),
    senderType: mysqlEnum("senderType", ["clinician", "client"]).notNull(),
    senderId: int("senderId").notNull(),
    // AES-256-GCM encrypted content stored as base64
    encryptedContent: text("encryptedContent").notNull(),
    iv: varchar("iv", { length: 32 }).notNull(), // initialization vector (hex)
    authTag: varchar("authTag", { length: 32 }).notNull(), // GCM auth tag (hex)
    readAt: timestamp("readAt"),
    deletedAt: timestamp("deletedAt"), // soft delete with audit trail
    deletedBy: int("deletedBy"),
    purgeAfter: timestamp("purgeAfter").notNull(), // retention policy enforcement
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_msg_thread").on(table.threadId),
    index("idx_msg_sender").on(table.senderId),
    index("idx_msg_purge").on(table.purgeAfter),
  ]
);

export type SecureMessage = typeof secureMessages.$inferSelect;
export type InsertSecureMessage = typeof secureMessages.$inferInsert;

// ─── Compliance Sync Log ───────────────────────────────────────────────────────
export const complianceSyncLog = mysqlTable("compliance_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  source: mysqlEnum("source", ["SAMHSA", "CMS", "LEXISNEXIS", "WESTLAW", "MANUAL"]).notNull(),
  syncType: varchar("syncType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  recordsChecked: int("recordsChecked").default(0).notNull(),
  recordsUpdated: int("recordsUpdated").default(0).notNull(),
  changesDetected: int("changesDetected").default(0).notNull(),
  errorMessage: text("errorMessage"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
});
export type ComplianceSyncLog = typeof complianceSyncLog.$inferSelect;

// ─── Compliance Alerts ─────────────────────────────────────────────────────────
export const complianceAlerts = mysqlTable("compliance_alerts", {
  id: int("id").autoincrement().primaryKey(),
  source: mysqlEnum("source", ["SAMHSA", "CMS", "LEXISNEXIS", "WESTLAW", "MANUAL"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  affectedStates: text("affectedStates"),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  effectiveDate: timestamp("effectiveDate"),
  dismissedAt: timestamp("dismissedAt"),
  dismissedBy: int("dismissedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ComplianceAlert = typeof complianceAlerts.$inferSelect;
export type InsertComplianceAlert = typeof complianceAlerts.$inferInsert;

// ─── CPT Code Registry (auto-updated from CMS) ────────────────────────────────
export const cptCodes = mysqlTable("cpt_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 128 }),
  minDurationMin: int("minDurationMin"),
  maxDurationMin: int("maxDurationMin"),
  isActive: boolean("isActive").notNull().default(true),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CptCode = typeof cptCodes.$inferSelect;
export type InsertCptCode = typeof cptCodes.$inferInsert;

// ─── Federal Policy Updates (from CMS/SAMHSA feeds) ───────────────────────────
export const federalPolicyUpdates = mysqlTable("federal_policy_updates", {
  id: int("id").autoincrement().primaryKey(),
  source: mysqlEnum("source", ["SAMHSA", "CMS", "LEXISNEXIS", "WESTLAW", "MANUAL"]).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 128 }),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  publishedAt: timestamp("publishedAt"),
  effectiveDate: timestamp("effectiveDate"),
  isRead: boolean("isRead").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FederalPolicyUpdate = typeof federalPolicyUpdates.$inferSelect;
