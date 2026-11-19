/**
 * Seeds Southern California crisis lines, free resources, and California compliance data.
 * Replaces existing rows in crisis_resources and free_resources (seed-only tables).
 * Run: DATABASE_URL=... npx tsx scripts/seed-socal.ts
 */
import { drizzle } from "drizzle-orm/mysql2";
import { crisisResources, freeResources, stateCompliance } from "../drizzle/schema";
import { SOCAL_COUNTIES, SERVICE_STATE_CODE, SERVICE_STATE_NAME } from "../shared/region";
import { GROUP_THERAPY_PROGRAMS, STATE_FUNDED_PROGRAMS, VETERAN_PROGRAMS, type Program } from "../shared/socalPrograms";

const db = drizzle(process.env.DATABASE_URL!);

const NATIONAL_RESOURCES = [
  { name: "SAMHSA National Helpline", category: "hotline" as const, phone: "1-800-662-4357", website: "https://www.samhsa.gov/find-help/national-helpline", description: "Free, confidential, 24/7 treatment referral and information service for mental health and substance use, in English and Spanish." },
  { name: "NAMI HelpLine", category: "hotline" as const, phone: "1-800-950-6264", website: "https://www.nami.org/help", description: "National Alliance on Mental Illness helpline for information, referrals, and support." },
  { name: "Crisis Text Line", category: "hotline" as const, phone: "741741", website: "https://www.crisistextline.org/", description: "Text HOME to 741741 to reach a trained crisis counselor, free and 24/7." },
  { name: "The Trevor Project", category: "hotline" as const, phone: "1-866-488-7386", website: "https://www.thetrevorproject.org/", description: "Crisis support for lesbian, gay, bisexual, transgender, queer, and questioning young people." },
  { name: "Open Path Collective", category: "sliding_scale" as const, website: "https://openpathcollective.org/", description: "Affordable in-person and online therapy for individuals, couples, and families." },
  { name: "FindTreatment.gov", category: "national_program" as const, website: "https://findtreatment.gov/", description: "Federal locator for mental health and substance use treatment facilities, including free and sliding-scale programs." },
];

function toResource(p: Program, category: "hotline" | "support_group" | "county_resource" | "national_program") {
  return {
    stateCode: SERVICE_STATE_CODE,
    name: p.name,
    category,
    phone: p.phone ?? null,
    website: p.website,
    address: p.address ?? null,
    description: `${p.description} Cost: ${p.cost}. Insurance: ${p.insurance}.`,
    isNational: false,
  };
}

async function seed() {
  await db.delete(crisisResources);
  await db.delete(freeResources);

  await db.insert(crisisResources).values([
    { name: "Emergency Services", resourceType: "call_911", phone: "911", isNational: true, priority: 1, description: "Call for immediate life-threatening emergencies" },
    { name: "988 Suicide & Crisis Lifeline", resourceType: "call_988", phone: "988", isNational: true, priority: 2, description: "Free, confidential crisis support 24/7" },
    { name: "988 Crisis Text Line", resourceType: "text_988", smsNumber: "988", isNational: true, priority: 3, description: "Text 988 for crisis support" },
    { name: "988 Chat Support", resourceType: "chat_988", chatUrl: "https://988lifeline.org/chat", isNational: true, priority: 4, description: "Chat online with a crisis counselor" },
    { name: "Crisis Text Line", resourceType: "crisis_text_line", smsNumber: "741741", isNational: true, priority: 5, description: "Text HOME to 741741 for crisis support" },
    ...SOCAL_COUNTIES.map((c) => ({
      stateCode: SERVICE_STATE_CODE,
      name: `${c.name}: ${c.crisisLine.name}`,
      resourceType: "state_hotline" as const,
      phone: c.crisisLine.phone,
      description: `24/7 behavioral health access and crisis line for ${c.name}.`,
      isNational: false,
      priority: 6,
    })),
  ]);

  await db.insert(freeResources).values([
    ...NATIONAL_RESOURCES.map((r) => ({ stateCode: null, phone: null, ...r, isNational: true })),
    ...STATE_FUNDED_PROGRAMS.map((p) => toResource(p, p.counties ? "county_resource" : "national_program")),
    ...GROUP_THERAPY_PROGRAMS.map((p) => toResource(p, "support_group")),
    ...VETERAN_PROGRAMS.map((p) => toResource(p, p.phone && p.phone.length <= 4 ? "hotline" : "national_program")),
  ]);

  await db.insert(stateCompliance).values({
    stateCode: SERVICE_STATE_CODE,
    stateName: SERVICE_STATE_NAME,
    telehealthLawSummary: "California has telehealth payment parity. Providers must hold California licensure.",
    mandatoryReportingNotes: "California therapists are mandated reporters for child abuse, elder abuse, and dependent adult abuse, and have a Tarasoff duty to protect.",
    crisisLineNotes: "988 is active statewide. Each Southern California county runs a 24/7 behavioral health access line.",
    licensureRequirements: "LCSW, LPCC, and LMFT through the Board of Behavioral Sciences; psychologists through the Board of Psychology; psychiatrists through the Medical Board of California.",
    privacyNotes: "HIPAA plus the California Confidentiality of Medical Information Act (CMIA).",
  }).onDuplicateKeyUpdate({ set: { stateName: SERVICE_STATE_NAME } });

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
