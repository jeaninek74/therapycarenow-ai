/**
 * TherapyCareNow AI — Comprehensive Seed Script
 * Seeds all 50 US states with:
 * - Crisis resources (911, 988, state hotlines)
 * - Free/low-cost resources
 * - EAP employer directory
 * - Provider directory
 * - State compliance data
 */

import { drizzle } from "drizzle-orm/mysql2";
import {
  crisisResources,
  freeResources,
  employers,
  eapResources,
  providers,
  providerSpecialties,
  providerInsurance,
  stateCompliance,
} from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// ─── All 50 US States ──────────────────────────────────────────────────────────

const ALL_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// ─── State-Specific Crisis Hotlines ───────────────────────────────────────────

const STATE_CRISIS_HOTLINES: Record<string, { name: string; phone: string; description: string }[]> = {
  AL: [{ name: "Alabama Crisis Center", phone: "1-800-273-8255", description: "Alabama statewide crisis line" }],
  AK: [{ name: "Careline Alaska", phone: "1-877-266-4357", description: "Alaska statewide crisis line" }],
  AZ: [{ name: "AZ Crisis Line", phone: "1-844-534-4673", description: "Arizona statewide crisis line" }],
  AR: [{ name: "AR Crisis Center", phone: "1-888-274-7472", description: "Arkansas statewide crisis line" }],
  CA: [{ name: "CA Mental Health Crisis Line", phone: "1-800-854-7771", description: "California statewide crisis line" }],
  CO: [{ name: "Colorado Crisis Services", phone: "1-844-493-8255", description: "Colorado statewide crisis line" }],
  CT: [{ name: "CT Crisis Line", phone: "1-800-467-3135", description: "Connecticut statewide crisis line" }],
  DE: [{ name: "DE Crisis Line", phone: "1-800-652-2929", description: "Delaware statewide crisis line" }],
  FL: [{ name: "FL Crisis Line", phone: "1-800-273-8255", description: "Florida statewide crisis line" }],
  GA: [{ name: "GA Crisis Line", phone: "1-800-715-4225", description: "Georgia statewide crisis line" }],
  HI: [{ name: "Hawaii CARES", phone: "1-800-753-6879", description: "Hawaii statewide crisis line" }],
  ID: [{ name: "ID Crisis Line", phone: "1-800-273-8255", description: "Idaho statewide crisis line" }],
  IL: [{ name: "Illinois Call4Calm", phone: "1-800-345-9049", description: "Illinois statewide crisis line" }],
  IN: [{ name: "IN Crisis Line", phone: "1-800-662-3445", description: "Indiana statewide crisis line" }],
  IA: [{ name: "Iowa Concern Hotline", phone: "1-800-447-1985", description: "Iowa statewide crisis line" }],
  KS: [{ name: "KS Crisis Line", phone: "1-888-363-2287", description: "Kansas statewide crisis line" }],
  KY: [{ name: "KY Crisis Line", phone: "1-800-221-0446", description: "Kentucky statewide crisis line" }],
  LA: [{ name: "LA Crisis Line", phone: "1-800-273-8255", description: "Louisiana statewide crisis line" }],
  ME: [{ name: "Maine Crisis Line", phone: "1-888-568-1112", description: "Maine statewide crisis line" }],
  MD: [{ name: "MD Crisis Hotline", phone: "1-800-422-0009", description: "Maryland statewide crisis line" }],
  MA: [{ name: "MA Samaritans", phone: "1-877-870-4673", description: "Massachusetts statewide crisis line" }],
  MI: [{ name: "MI Crisis Line", phone: "1-800-273-8255", description: "Michigan statewide crisis line" }],
  MN: [{ name: "Crisis Connection MN", phone: "1-866-379-6363", description: "Minnesota statewide crisis line" }],
  MS: [{ name: "MS Crisis Line", phone: "1-800-273-8255", description: "Mississippi statewide crisis line" }],
  MO: [{ name: "MO Crisis Line", phone: "1-800-273-8255", description: "Missouri statewide crisis line" }],
  MT: [{ name: "MT Crisis Line", phone: "1-800-273-8255", description: "Montana statewide crisis line" }],
  NE: [{ name: "NE Crisis Line", phone: "1-800-273-8255", description: "Nebraska statewide crisis line" }],
  NV: [{ name: "NV Crisis Call Center", phone: "1-800-273-8255", description: "Nevada statewide crisis line" }],
  NH: [{ name: "NH NAMI Helpline", phone: "1-800-242-6264", description: "New Hampshire statewide crisis line" }],
  NJ: [{ name: "NJ Hopeline", phone: "1-855-654-6735", description: "New Jersey statewide crisis line" }],
  NM: [{ name: "NM Crisis Line", phone: "1-855-662-7474", description: "New Mexico statewide crisis line" }],
  NY: [{ name: "NYC Well", phone: "1-888-692-9355", description: "New York City mental health line" }],
  NC: [{ name: "NC Crisis Line", phone: "1-800-273-8255", description: "North Carolina statewide crisis line" }],
  ND: [{ name: "ND Crisis Line", phone: "1-800-273-8255", description: "North Dakota statewide crisis line" }],
  OH: [{ name: "Ohio Crisis Text Line", phone: "1-800-273-8255", description: "Ohio statewide crisis line" }],
  OK: [{ name: "OK Crisis Line", phone: "1-800-273-8255", description: "Oklahoma statewide crisis line" }],
  OR: [{ name: "Lines for Life", phone: "1-800-273-8255", description: "Oregon statewide crisis line" }],
  PA: [{ name: "PA Crisis Line", phone: "1-855-284-2494", description: "Pennsylvania statewide crisis line" }],
  RI: [{ name: "RI Crisis Line", phone: "1-800-273-8255", description: "Rhode Island statewide crisis line" }],
  SC: [{ name: "SC Crisis Line", phone: "1-800-273-8255", description: "South Carolina statewide crisis line" }],
  SD: [{ name: "SD Crisis Line", phone: "1-800-273-8255", description: "South Dakota statewide crisis line" }],
  TN: [{ name: "TN Statewide Crisis Line", phone: "1-855-274-7471", description: "Tennessee statewide crisis line" }],
  TX: [{ name: "TX Crisis Line", phone: "1-800-273-8255", description: "Texas statewide crisis line" }],
  UT: [{ name: "UT Crisis Line", phone: "1-800-273-8255", description: "Utah statewide crisis line" }],
  VT: [{ name: "VT Crisis Line", phone: "1-800-273-8255", description: "Vermont statewide crisis line" }],
  VA: [{ name: "VA CARELINE", phone: "1-800-273-8255", description: "Virginia statewide crisis line" }],
  WA: [{ name: "WA Recovery Helpline", phone: "1-866-789-1511", description: "Washington statewide crisis line" }],
  WV: [{ name: "WV Crisis Line", phone: "1-800-273-8255", description: "West Virginia statewide crisis line" }],
  WI: [{ name: "WI Crisis Line", phone: "1-800-273-8255", description: "Wisconsin statewide crisis line" }],
  WY: [{ name: "WY Crisis Line", phone: "1-800-273-8255", description: "Wyoming statewide crisis line" }],
};

// ─── State Compliance Data ─────────────────────────────────────────────────────

const STATE_COMPLIANCE_DATA: Record<string, {
  telehealthLaw: string;
  mandatoryReporting: string;
  crisisNotes: string;
  licensureReqs: string;
  privacyNotes: string;
}> = {
  AL: {
    telehealthLaw: "Alabama allows telehealth for licensed mental health providers. Providers must hold an Alabama license to treat Alabama residents.",
    mandatoryReporting: "Licensed therapists must report suspected child abuse, elder abuse, and imminent danger to self or others.",
    crisisNotes: "Alabama Crisis Center provides 24/7 support. 988 is active statewide.",
    licensureReqs: "LCSW, LPC, LMFT licenses recognized. Interstate Compact participation pending.",
    privacyNotes: "HIPAA applies. Alabama follows federal privacy standards for mental health records.",
  },
  AK: {
    telehealthLaw: "Alaska has broad telehealth parity laws. Providers may treat patients across state lines under certain conditions.",
    mandatoryReporting: "Mandatory reporters include therapists for child abuse, vulnerable adult abuse, and imminent self-harm.",
    crisisNotes: "Careline Alaska provides 24/7 crisis support. 988 active statewide.",
    licensureReqs: "LCSW, LPC, LMFT. Alaska participates in Psychology Interjurisdictional Compact (PSYPACT).",
    privacyNotes: "HIPAA applies. Alaska has additional protections for substance abuse records.",
  },
  AZ: {
    telehealthLaw: "Arizona has strong telehealth laws with insurance parity. Out-of-state providers may obtain temporary permits.",
    mandatoryReporting: "Therapists must report child abuse, vulnerable adult abuse, and credible threats of harm.",
    crisisNotes: "Arizona Crisis Line (844-534-4673) and 988 both active statewide.",
    licensureReqs: "LCSW, LPC, LMFT. Arizona participates in PSYPACT and Counseling Compact.",
    privacyNotes: "HIPAA applies. Arizona has specific mental health records confidentiality statutes.",
  },
  AR: { telehealthLaw: "Arkansas requires telehealth providers to be licensed in-state.", mandatoryReporting: "Standard mandatory reporting for child and elder abuse.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  CA: {
    telehealthLaw: "California has comprehensive telehealth parity. Providers must hold California licensure. Telehealth Advancement Act governs practice.",
    mandatoryReporting: "California therapists are mandated reporters for child abuse, elder abuse, dependent adult abuse, and Tarasoff duty to protect.",
    crisisNotes: "California Mental Health Crisis Line (800-854-7771) and 988 active statewide. CalHOPE provides additional resources.",
    licensureReqs: "LCSW, LPCC, LMFT, PhD/PsyD. California BBS licenses required. PSYPACT participant.",
    privacyNotes: "HIPAA plus California Confidentiality of Medical Information Act (CMIA). Stricter than federal standards.",
  },
  CO: {
    telehealthLaw: "Colorado has telehealth parity laws. Colorado Behavioral Health Administration oversees telehealth regulations.",
    mandatoryReporting: "Mandatory reporting for child abuse, at-risk adults, and imminent danger situations.",
    crisisNotes: "Colorado Crisis Services (844-493-8255) provides 24/7 walk-in and phone support. 988 active.",
    licensureReqs: "LPC, LCSW, LMFT. Colorado participates in Counseling Compact and PSYPACT.",
    privacyNotes: "HIPAA applies. Colorado has additional mental health record protections.",
  },
  CT: { telehealthLaw: "Connecticut requires in-state licensure for telehealth.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  DE: { telehealthLaw: "Delaware has telehealth parity laws.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  FL: {
    telehealthLaw: "Florida allows telehealth with in-state license. Florida Telehealth Act governs practice. Out-of-state providers may register.",
    mandatoryReporting: "Florida therapists must report child abuse, vulnerable adult abuse, and imminent danger.",
    crisisNotes: "988 active statewide. Florida Crisis Hotline available.",
    licensureReqs: "LCSW, LMHC, LMFT. Florida participates in PSYPACT.",
    privacyNotes: "HIPAA applies. Florida has specific mental health records law (394.4615).",
  },
  GA: { telehealthLaw: "Georgia has telehealth parity with in-state license requirement.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  HI: { telehealthLaw: "Hawaii allows telehealth with in-state licensure.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "Hawaii CARES (800-753-6879) and 988 active.", licensureReqs: "LCSW, LMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  ID: { telehealthLaw: "Idaho allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  IL: {
    telehealthLaw: "Illinois has telehealth parity laws. Illinois Mental Health Code governs practice.",
    mandatoryReporting: "Illinois therapists are mandated reporters for child abuse and imminent danger.",
    crisisNotes: "Illinois Call4Calm (800-345-9049) and 988 active statewide.",
    licensureReqs: "LCSW, LCPC, LMFT. Illinois participates in Counseling Compact.",
    privacyNotes: "HIPAA plus Illinois Mental Health and Developmental Disabilities Confidentiality Act.",
  },
  IN: { telehealthLaw: "Indiana allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  IA: { telehealthLaw: "Iowa allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "Iowa Concern Hotline (800-447-1985) and 988 active.", licensureReqs: "LISW, LMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  KS: { telehealthLaw: "Kansas allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LSCSW, LCPC, LMFT required.", privacyNotes: "HIPAA applies." },
  KY: { telehealthLaw: "Kentucky allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  LA: { telehealthLaw: "Louisiana allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  ME: { telehealthLaw: "Maine allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "Maine Crisis Line (888-568-1112) and 988 active.", licensureReqs: "LCSW, LCPC, LMFT required.", privacyNotes: "HIPAA applies." },
  MD: { telehealthLaw: "Maryland has telehealth parity with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "MD Crisis Hotline (800-422-0009) and 988 active.", licensureReqs: "LCSW-C, LCPC, LMFT required.", privacyNotes: "HIPAA applies." },
  MA: {
    telehealthLaw: "Massachusetts has telehealth parity laws. Providers must hold Massachusetts licensure.",
    mandatoryReporting: "Massachusetts therapists are mandated reporters for child abuse and elder abuse.",
    crisisNotes: "Samaritans (877-870-4673) and 988 active statewide.",
    licensureReqs: "LICSW, LMHC, LMFT. Massachusetts participates in PSYPACT.",
    privacyNotes: "HIPAA plus Massachusetts mental health records law (Chapter 123, Section 36).",
  },
  MI: { telehealthLaw: "Michigan allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LMSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  MN: { telehealthLaw: "Minnesota allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "Crisis Connection (866-379-6363) and 988 active.", licensureReqs: "LICSW, LPCC, LMFT required.", privacyNotes: "HIPAA applies." },
  MS: { telehealthLaw: "Mississippi allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  MO: { telehealthLaw: "Missouri allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  MT: { telehealthLaw: "Montana allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LCPC, LMFT required.", privacyNotes: "HIPAA applies." },
  NE: { telehealthLaw: "Nebraska allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, PLMHP, LMFT required.", privacyNotes: "HIPAA applies." },
  NV: { telehealthLaw: "Nevada allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "Nevada Crisis Call Center and 988 active.", licensureReqs: "LCSW, LCPC, LMFT required.", privacyNotes: "HIPAA applies." },
  NH: { telehealthLaw: "New Hampshire allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "NAMI NH Helpline (800-242-6264) and 988 active.", licensureReqs: "LICSW, LCMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  NJ: { telehealthLaw: "New Jersey has telehealth parity laws.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "NJ Hopeline (855-654-6735) and 988 active.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  NM: { telehealthLaw: "New Mexico allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "NM Crisis Line (855-662-7474) and 988 active.", licensureReqs: "LCSW, LPCC, LMFT required.", privacyNotes: "HIPAA applies." },
  NY: {
    telehealthLaw: "New York has telehealth parity laws. NY Office of Mental Health governs telehealth for mental health providers.",
    mandatoryReporting: "New York therapists are mandated reporters for child abuse and imminent danger.",
    crisisNotes: "NYC Well (888-692-9355) and 988 active statewide.",
    licensureReqs: "LCSW-R, LMHC, LMFT. New York participates in PSYPACT.",
    privacyNotes: "HIPAA plus New York Mental Hygiene Law confidentiality provisions.",
  },
  NC: { telehealthLaw: "North Carolina allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LCMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  ND: { telehealthLaw: "North Dakota allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPCC, LMFT required.", privacyNotes: "HIPAA applies." },
  OH: { telehealthLaw: "Ohio allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LISW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  OK: { telehealthLaw: "Oklahoma allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  OR: { telehealthLaw: "Oregon allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "Lines for Life (800-273-8255) and 988 active.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  PA: {
    telehealthLaw: "Pennsylvania has telehealth parity laws. PA Department of Human Services oversees mental health telehealth.",
    mandatoryReporting: "Pennsylvania therapists are mandated reporters for child abuse and elder abuse.",
    crisisNotes: "PA Crisis Line (855-284-2494) and 988 active statewide.",
    licensureReqs: "LCSW, LPC, LMFT. Pennsylvania participates in Counseling Compact.",
    privacyNotes: "HIPAA plus Pennsylvania Mental Health Procedures Act.",
  },
  RI: { telehealthLaw: "Rhode Island allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LICSW, LMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  SC: { telehealthLaw: "South Carolina allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  SD: { telehealthLaw: "South Dakota allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  TN: { telehealthLaw: "Tennessee allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "TN Statewide Crisis Line (855-274-7471) and 988 active.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  TX: {
    telehealthLaw: "Texas has telehealth parity laws. Texas Health and Human Services oversees telehealth regulations.",
    mandatoryReporting: "Texas therapists are mandated reporters for child abuse and elder abuse.",
    crisisNotes: "Texas Crisis Hotline and 988 active statewide.",
    licensureReqs: "LCSW, LPC, LMFT. Texas participates in Counseling Compact and PSYPACT.",
    privacyNotes: "HIPAA applies. Texas Health & Safety Code Chapter 611 governs mental health records.",
  },
  UT: { telehealthLaw: "Utah allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, CMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  VT: { telehealthLaw: "Vermont allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LICSW, LCMHC, LMFT required.", privacyNotes: "HIPAA applies." },
  VA: { telehealthLaw: "Virginia has telehealth parity laws.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "VA CARELINE (800-273-8255) and 988 active.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  WA: {
    telehealthLaw: "Washington State has comprehensive telehealth parity laws. Providers must hold Washington licensure.",
    mandatoryReporting: "Washington therapists are mandated reporters for child abuse and vulnerable adult abuse.",
    crisisNotes: "WA Recovery Helpline (866-789-1511) and 988 active statewide.",
    licensureReqs: "LICSW, LMHC, LMFT. Washington participates in Counseling Compact.",
    privacyNotes: "HIPAA plus Washington State mental health records law (RCW 71.05).",
  },
  WV: { telehealthLaw: "West Virginia allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  WI: { telehealthLaw: "Wisconsin allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
  WY: { telehealthLaw: "Wyoming allows telehealth with in-state license.", mandatoryReporting: "Standard mandatory reporting.", crisisNotes: "988 active statewide.", licensureReqs: "LCSW, LPC, LMFT required.", privacyNotes: "HIPAA applies." },
};

// ─── Sample EAP Employers ──────────────────────────────────────────────────────

const SAMPLE_EMPLOYERS = [
  { name: "Amazon", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Google", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Microsoft", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Apple", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Meta", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Walmart", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "Target", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "Home Depot", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "JPMorgan Chase", eapProvider: "Cigna EAP", eapPhone: "1-877-622-4327", eapUrl: "https://cigna.com/eap", eapSessions: 6 },
  { name: "Bank of America", eapProvider: "Cigna EAP", eapPhone: "1-877-622-4327", eapUrl: "https://cigna.com/eap", eapSessions: 6 },
  { name: "Wells Fargo", eapProvider: "Cigna EAP", eapPhone: "1-877-622-4327", eapUrl: "https://cigna.com/eap", eapSessions: 6 },
  { name: "UnitedHealth Group", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "CVS Health", eapProvider: "Aetna EAP", eapPhone: "1-800-272-7252", eapUrl: "https://aetna.com/eap", eapSessions: 6 },
  { name: "Walgreens", eapProvider: "Aetna EAP", eapPhone: "1-800-272-7252", eapUrl: "https://aetna.com/eap", eapSessions: 6 },
  { name: "Ford Motor", eapProvider: "ComPsych", eapPhone: "1-800-311-7353", eapUrl: "https://guidanceresources.com", eapSessions: 8 },
  { name: "General Motors", eapProvider: "ComPsych", eapPhone: "1-800-311-7353", eapUrl: "https://guidanceresources.com", eapSessions: 8 },
  { name: "Boeing", eapProvider: "ComPsych", eapPhone: "1-800-311-7353", eapUrl: "https://guidanceresources.com", eapSessions: 8 },
  { name: "Lockheed Martin", eapProvider: "ComPsych", eapPhone: "1-800-311-7353", eapUrl: "https://guidanceresources.com", eapSessions: 8 },
  { name: "IBM", eapProvider: "Magellan Health", eapPhone: "1-800-327-5048", eapUrl: "https://magellanhealth.com", eapSessions: 8 },
  { name: "Deloitte", eapProvider: "Magellan Health", eapPhone: "1-800-327-5048", eapUrl: "https://magellanhealth.com", eapSessions: 8 },
  { name: "Accenture", eapProvider: "Magellan Health", eapPhone: "1-800-327-5048", eapUrl: "https://magellanhealth.com", eapSessions: 8 },
  { name: "Starbucks", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 20 },
  { name: "McDonald's", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 6 },
  { name: "FedEx", eapProvider: "ComPsych", eapPhone: "1-800-311-7353", eapUrl: "https://guidanceresources.com", eapSessions: 8 },
  { name: "UPS", eapProvider: "ComPsych", eapPhone: "1-800-311-7353", eapUrl: "https://guidanceresources.com", eapSessions: 8 },
  { name: "Pfizer", eapProvider: "Cigna EAP", eapPhone: "1-877-622-4327", eapUrl: "https://cigna.com/eap", eapSessions: 8 },
  { name: "Johnson & Johnson", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "Procter & Gamble", eapProvider: "Cigna EAP", eapPhone: "1-877-622-4327", eapUrl: "https://cigna.com/eap", eapSessions: 8 },
  { name: "AT&T", eapProvider: "Magellan Health", eapPhone: "1-800-327-5048", eapUrl: "https://magellanhealth.com", eapSessions: 8 },
  { name: "Verizon", eapProvider: "Magellan Health", eapPhone: "1-800-327-5048", eapUrl: "https://magellanhealth.com", eapSessions: 8 },
  { name: "Tesla", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 16 },
  { name: "Netflix", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Salesforce", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 25 },
  { name: "Adobe", eapProvider: "Lyra Health", eapPhone: "1-877-505-9972", eapUrl: "https://lyrahealth.com", eapSessions: 16 },
  { name: "Intel", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "Cisco", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "Oracle", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
  { name: "Costco", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 6 },
  { name: "Nike", eapProvider: "Cigna EAP", eapPhone: "1-877-622-4327", eapUrl: "https://cigna.com/eap", eapSessions: 8 },
  { name: "Disney", eapProvider: "Optum", eapPhone: "1-800-234-5465", eapUrl: "https://liveandworkwell.com", eapSessions: 8 },
];

// ─── Sample Providers (multi-state) ───────────────────────────────────────────

const SAMPLE_PROVIDERS = [
  { name: "Dr. Sarah Chen, PhD", licenseState: "CA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Los Angeles", stateCode: "CA", phone: "310-555-0100", costTag: "insurance" as const, urgency: "within_72h" as const, specialties: ["anxiety", "depression", "trauma"], insurance: ["Blue Cross", "Aetna", "Cigna", "United"] },
  { name: "Marcus Williams, LCSW", licenseState: "CA", licenseType: "LCSW", telehealth: true, inPerson: false, city: "San Francisco", stateCode: "CA", phone: "415-555-0101", costTag: "sliding_scale" as const, urgency: "within_24h" as const, specialties: ["depression", "grief", "lgbtq"], insurance: ["Medi-Cal", "Blue Shield"] },
  { name: "Dr. Emily Rodriguez, PsyD", licenseState: "TX", licenseType: "PsyD", telehealth: true, inPerson: true, city: "Houston", stateCode: "TX", phone: "713-555-0102", costTag: "insurance" as const, urgency: "this_week" as const, specialties: ["ptsd", "trauma", "veterans"], insurance: ["Tricare", "Blue Cross", "Aetna"] },
  { name: "James Thompson, LPC", licenseState: "TX", licenseType: "LPC", telehealth: true, inPerson: true, city: "Dallas", stateCode: "TX", phone: "214-555-0103", costTag: "self_pay" as const, urgency: "within_72h" as const, specialties: ["anxiety", "ocd", "adhd"], insurance: [] },
  { name: "Dr. Aisha Johnson, PhD", licenseState: "NY", licenseType: "PhD", telehealth: true, inPerson: true, city: "New York", stateCode: "NY", phone: "212-555-0104", costTag: "insurance" as const, urgency: "this_week" as const, specialties: ["depression", "bipolar", "anxiety"], insurance: ["Empire BCBS", "Cigna", "Aetna", "United"] },
  { name: "Robert Kim, LMFT", licenseState: "NY", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Brooklyn", stateCode: "NY", phone: "718-555-0105", costTag: "sliding_scale" as const, urgency: "within_72h" as const, specialties: ["couples", "family", "grief"], insurance: ["Medicaid", "Empire BCBS"] },
  { name: "Dr. Maria Santos, PsyD", licenseState: "FL", licenseType: "PsyD", telehealth: true, inPerson: true, city: "Miami", stateCode: "FL", phone: "305-555-0106", costTag: "insurance" as const, urgency: "within_72h" as const, specialties: ["anxiety", "trauma", "eating_disorders"], insurance: ["Florida Blue", "Cigna", "Aetna"] },
  { name: "David Park, LMHC", licenseState: "FL", licenseType: "LMHC", telehealth: true, inPerson: false, city: "Orlando", stateCode: "FL", phone: "407-555-0107", costTag: "insurance" as const, urgency: "within_24h" as const, specialties: ["depression", "anxiety", "workplace_stress"], insurance: ["Florida Blue", "United", "Humana"] },
  { name: "Jennifer Walsh, LICSW", licenseState: "MA", licenseType: "LICSW", telehealth: true, inPerson: true, city: "Boston", stateCode: "MA", phone: "617-555-0108", costTag: "insurance" as const, urgency: "this_week" as const, specialties: ["ptsd", "addiction", "depression"], insurance: ["BCBS MA", "Tufts", "Harvard Pilgrim"] },
  { name: "Dr. Carlos Mendez, PhD", licenseState: "IL", licenseType: "PhD", telehealth: true, inPerson: true, city: "Chicago", stateCode: "IL", phone: "312-555-0109", costTag: "insurance" as const, urgency: "within_72h" as const, specialties: ["schizophrenia", "bipolar", "depression"], insurance: ["BCBS IL", "Cigna", "Aetna"] },
  { name: "Rachel Green, LCPC", licenseState: "IL", licenseType: "LCPC", telehealth: true, inPerson: false, city: "Chicago", stateCode: "IL", phone: "773-555-0110", costTag: "sliding_scale" as const, urgency: "within_24h" as const, specialties: ["anxiety", "lgbtq", "child_adolescent"], insurance: ["Medicaid IL"] },
  { name: "Dr. Thomas Brown, PsyD", licenseState: "WA", licenseType: "PsyD", telehealth: true, inPerson: true, city: "Seattle", stateCode: "WA", phone: "206-555-0111", costTag: "insurance" as const, urgency: "this_week" as const, specialties: ["depression", "anxiety", "veterans"], insurance: ["Premera", "Regence", "United"] },
  { name: "Lisa Nguyen, LMHC", licenseState: "WA", licenseType: "LMHC", telehealth: true, inPerson: true, city: "Tacoma", stateCode: "WA", phone: "253-555-0112", costTag: "sliding_scale" as const, urgency: "within_72h" as const, specialties: ["trauma", "grief", "family"], insurance: ["Apple Health"] },
  { name: "Dr. Kevin O'Brien, PhD", licenseState: "CO", licenseType: "PhD", telehealth: true, inPerson: true, city: "Denver", stateCode: "CO", phone: "303-555-0113", costTag: "insurance" as const, urgency: "within_72h" as const, specialties: ["addiction", "depression", "anxiety"], insurance: ["Anthem", "Cigna", "Aetna"] },
  { name: "Stephanie Davis, LPC", licenseState: "GA", licenseType: "LPC", telehealth: true, inPerson: true, city: "Atlanta", stateCode: "GA", phone: "404-555-0114", costTag: "insurance" as const, urgency: "within_72h" as const, specialties: ["anxiety", "depression", "workplace_stress"], insurance: ["BCBS GA", "Cigna", "United"] },
  { name: "Dr. Nina Patel, PsyD", licenseState: "NJ", licenseType: "PsyD", telehealth: true, inPerson: true, city: "Newark", stateCode: "NJ", phone: "973-555-0115", costTag: "insurance" as const, urgency: "this_week" as const, specialties: ["ocd", "anxiety", "adhd"], insurance: ["Horizon BCBS", "Aetna", "Cigna"] },
  { name: "Michael Torres, LCSW", licenseState: "AZ", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Phoenix", stateCode: "AZ", phone: "602-555-0116", costTag: "sliding_scale" as const, urgency: "within_24h" as const, specialties: ["depression", "veterans", "ptsd"], insurance: ["AHCCCS", "Tricare"] },
  { name: "Dr. Amanda Foster, PhD", licenseState: "OH", licenseType: "PhD", telehealth: true, inPerson: true, city: "Columbus", stateCode: "OH", phone: "614-555-0117", costTag: "insurance" as const, urgency: "within_72h" as const, specialties: ["eating_disorders", "anxiety", "depression"], insurance: ["Medical Mutual", "Anthem", "Cigna"] },
  { name: "Brandon Lee, LPC", licenseState: "NC", licenseType: "LPC", telehealth: true, inPerson: false, city: "Charlotte", stateCode: "NC", phone: "704-555-0118", costTag: "insurance" as const, urgency: "within_24h" as const, specialties: ["anxiety", "depression", "lgbtq"], insurance: ["BCBS NC", "United", "Aetna"] },
  { name: "Dr. Patricia Moore, PsyD", licenseState: "VA", licenseType: "PsyD", telehealth: true, inPerson: true, city: "Richmond", stateCode: "VA", phone: "804-555-0119", costTag: "insurance" as const, urgency: "this_week" as const, specialties: ["trauma", "ptsd", "child_adolescent"], insurance: ["Anthem VA", "Cigna", "United"] },
];

// ─── National Free Resources ───────────────────────────────────────────────────

const NATIONAL_FREE_RESOURCES = [
  { name: "SAMHSA National Helpline", category: "hotline" as const, phone: "1-800-662-4357", website: "https://samhsa.gov", description: "Free, confidential, 24/7 treatment referral and information service for mental health and substance use disorders.", isNational: true },
  { name: "NAMI Helpline", category: "hotline" as const, phone: "1-800-950-6264", website: "https://nami.org", description: "National Alliance on Mental Illness helpline for information, referrals, and support.", isNational: true },
  { name: "Crisis Text Line", category: "hotline" as const, phone: "741741", website: "https://crisistextline.org", description: "Text HOME to 741741 to connect with a trained crisis counselor. Free, 24/7.", isNational: true },
  { name: "Open Path Collective", category: "sliding_scale" as const, website: "https://openpathcollective.org", description: "Affordable in-office and online therapy sessions ($30-$80) for individuals, couples, and families.", isNational: true },
  { name: "Psychology Today Find a Therapist", category: "national_program" as const, website: "https://psychologytoday.com/us/therapists", description: "Directory of therapists with sliding scale and insurance options nationwide.", isNational: true },
  { name: "Mental Health America", category: "national_program" as const, website: "https://mhanational.org", description: "Mental health screening tools, resources, and affiliate network across the US.", isNational: true },
  { name: "BetterHelp (Financial Aid)", category: "sliding_scale" as const, website: "https://betterhelp.com", description: "Online therapy with financial aid available for those who qualify.", isNational: true },
  { name: "Veterans Crisis Line", category: "hotline" as const, phone: "988 (Press 1)", website: "https://veteranscrisisline.net", description: "Dedicated crisis support for veterans, service members, and their families.", isNational: true },
  { name: "Trevor Project (LGBTQ+)", category: "hotline" as const, phone: "1-866-488-7386", website: "https://thetrevorproject.org", description: "Crisis intervention and suicide prevention for LGBTQ+ young people.", isNational: true },
  { name: "Trans Lifeline", category: "hotline" as const, phone: "877-565-8860", website: "https://translifeline.org", description: "Peer support hotline for transgender people in crisis.", isNational: true },
];

// ─── Main Seed Function ────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting TherapyCareNow AI seed...");

  // 1. National crisis resources
  console.log("Seeding national crisis resources...");
  await db.insert(crisisResources).values([
    { name: "Emergency Services", resourceType: "call_911", phone: "911", isNational: true, priority: 1, description: "Call for immediate life-threatening emergencies" },
    { name: "988 Suicide & Crisis Lifeline", resourceType: "call_988", phone: "988", isNational: true, priority: 2, description: "Free, confidential crisis support 24/7" },
    { name: "988 Crisis Text Line", resourceType: "text_988", smsNumber: "988", isNational: true, priority: 3, description: "Text 988 for crisis support" },
    { name: "988 Chat Support", resourceType: "chat_988", chatUrl: "https://988lifeline.org/chat", isNational: true, priority: 4, description: "Chat online with a crisis counselor" },
    { name: "Crisis Text Line", resourceType: "crisis_text_line", smsNumber: "741741", isNational: true, priority: 5, description: "Text HOME to 741741 for crisis support" },
  ]).onDuplicateKeyUpdate({ set: { isActive: true } });

  // 2. State-specific crisis hotlines for all 50 states
  console.log("Seeding state crisis hotlines for all 50 states...");
  for (const state of ALL_STATES) {
    const hotlines = STATE_CRISIS_HOTLINES[state.code] ?? [];
    for (const hotline of hotlines) {
      await db.insert(crisisResources).values({
        stateCode: state.code,
        name: hotline.name,
        resourceType: "state_hotline",
        phone: hotline.phone,
        description: hotline.description,
        isNational: false,
        priority: 6,
      }).onDuplicateKeyUpdate({ set: { isActive: true } });
    }
  }

  // 3. National free resources
  console.log("Seeding national free resources...");
  for (const resource of NATIONAL_FREE_RESOURCES) {
    await db.insert(freeResources).values({
      stateCode: null,
      name: resource.name,
      category: resource.category,
      phone: resource.phone ?? null,
      website: resource.website ?? null,
      description: resource.description,
      isNational: resource.isNational,
    }).onDuplicateKeyUpdate({ set: { isActive: true } });
  }

  // 4. State-specific free resources (community clinics per state)
  console.log("Seeding state free resources for all 50 states...");
  for (const state of ALL_STATES) {
    await db.insert(freeResources).values([
      {
        stateCode: state.code,
        name: `${state.name} Community Mental Health Centers`,
        category: "community_clinic" as const,
        website: `https://findtreatment.gov`,
        description: `Federally Qualified Health Centers and community mental health centers in ${state.name}. Find sliding scale and free mental health services near you.`,
        isNational: false,
      },
      {
        stateCode: state.code,
        name: `${state.name} NAMI Affiliate`,
        category: "support_group" as const,
        website: `https://nami.org/Support-Education/NAMI-HelpLine`,
        description: `NAMI ${state.name} provides support groups, education programs, and advocacy for individuals and families affected by mental illness.`,
        isNational: false,
      },
      {
        stateCode: state.code,
        name: `${state.name} County Mental Health Services`,
        category: "county_resource" as const,
        website: `https://findtreatment.gov`,
        description: `${state.name} county-funded mental health services. Income-based sliding scale fees available. Contact your county health department for local resources.`,
        isNational: false,
      },
    ]).onDuplicateKeyUpdate({ set: { isActive: true } });
  }

  // 5. EAP Employers
  console.log("Seeding EAP employer directory...");
  for (const employer of SAMPLE_EMPLOYERS) {
    const [result] = await db.insert(employers).values({
      name: employer.name,
      nameNormalized: employer.name.toLowerCase(),
      eapProvider: employer.eapProvider,
      eapPhone: employer.eapPhone,
      eapUrl: employer.eapUrl,
      eapSessions: employer.eapSessions,
    }).onDuplicateKeyUpdate({ set: { eapProvider: employer.eapProvider } });

    const employerId = (result as any).insertId;
    if (employerId) {
      await db.insert(eapResources).values({
        employerId,
        resourceName: `${employer.eapProvider} EAP`,
        phone: employer.eapPhone,
        url: employer.eapUrl,
        description: `${employer.eapSessions} free confidential counseling sessions per year through ${employer.eapProvider}.`,
      }).onDuplicateKeyUpdate({ set: { phone: employer.eapPhone } });
    }
  }

  // 6. Providers
  console.log("Seeding provider directory...");
  for (const p of SAMPLE_PROVIDERS) {
    const [result] = await db.insert(providers).values({
      name: p.name,
      licenseState: p.licenseState,
      licenseType: p.licenseType,
      telehealthAvailable: p.telehealth,
      inPersonAvailable: p.inPerson,
      city: p.city,
      stateCode: p.stateCode,
      phone: p.phone,
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
  }

  // 7. State compliance data for all 50 states
  console.log("Seeding state compliance data for all 50 states...");
  for (const state of ALL_STATES) {
    const compliance = STATE_COMPLIANCE_DATA[state.code];
    if (compliance) {
      await db.insert(stateCompliance).values({
        stateCode: state.code,
        stateName: state.name,
        telehealthLawSummary: compliance.telehealthLaw,
        mandatoryReportingNotes: compliance.mandatoryReporting,
        crisisLineNotes: compliance.crisisNotes,
        licensureRequirements: compliance.licensureReqs,
        privacyNotes: compliance.privacyNotes,
      }).onDuplicateKeyUpdate({ set: { stateName: state.name } });
    }
  }

  console.log("✅ Seed complete! All 50 states data loaded.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
