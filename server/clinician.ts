/**
 * Clinician Portal Backend
 * NPI verification, SOAP/DAP note AI, treatment planning, risk detection,
 * compliance automation, revenue optimization, practice analytics
 *
 * HIPAA guardrails:
 * - Raw transcripts stored only in session_notes (clinician-owned data)
 * - AI never stores or logs raw clinical content outside the note record
 * - Risk flags store structured metadata only, not raw session content
 */

import { invokeLLM } from "./_core/llm";

// ─── NPI Verification (NPPES Public API) ──────────────────────────────────────

export interface NpiLookupResult {
  valid: boolean;
  npiNumber: string;
  providerName?: string;
  credential?: string;
  taxonomyCode?: string;
  taxonomyDescription?: string;
  licenseState?: string;
  city?: string;
  state?: string;
  rawData?: Record<string, unknown>;
  error?: string;
}

const ALLOWED_TAXONOMY_CODES = new Set([
  // Psychiatry
  "2084P0800X", "2084P0804X", "2084P0805X",
  // Psychology
  "103TC0700X", "103TC2200X", "103TB0200X", "103TP2701X",
  // Social Work
  "1041C0700X", "104100000X",
  // Counseling / Therapy
  "101YA0400X", "101YM0800X", "101YP1600X", "101YP2500X",
  // Marriage & Family Therapy
  "106H00000X",
  // Mental Health Counselor
  "101Y00000X",
  // Behavioral Health
  "163WP0808X",
]);

export async function verifyNpi(npiNumber: string): Promise<NpiLookupResult> {
  if (!/^\d{10}$/.test(npiNumber)) {
    return { valid: false, npiNumber, error: "NPI must be exactly 10 digits." };
  }

  try {
    const url = `https://npiregistry.cms.hhs.gov/api/?number=${npiNumber}&version=2.1`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { valid: false, npiNumber, error: `NPPES API error: ${res.status}` };
    }

    const data = await res.json() as {
      result_count: number;
      results?: Array<{
        number: string;
        basic?: {
          first_name?: string;
          last_name?: string;
          organization_name?: string;
          credential?: string;
        };
        taxonomies?: Array<{
          code: string;
          desc: string;
          primary: boolean;
          state?: string;
          license?: string;
        }>;
        addresses?: Array<{
          city?: string;
          state?: string;
          address_purpose?: string;
        }>;
      }>;
    };

    if (!data.result_count || !data.results?.length) {
      return { valid: false, npiNumber, error: "NPI not found in NPPES registry." };
    }

    const provider = data.results[0];
    const basic = provider.basic ?? {};
    const primaryTaxonomy = provider.taxonomies?.find((t) => t.primary) ?? provider.taxonomies?.[0];
    const practiceAddress = provider.addresses?.find((a) => a.address_purpose === "LOCATION") ?? provider.addresses?.[0];

    // Validate taxonomy — only mental health / behavioral health providers allowed
    if (primaryTaxonomy && !ALLOWED_TAXONOMY_CODES.has(primaryTaxonomy.code)) {
      return {
        valid: false,
        npiNumber,
        error: `This NPI is registered for "${primaryTaxonomy.desc}". TherapyCareNow is only available to mental health and behavioral health clinicians.`,
      };
    }

    const providerName = basic.organization_name
      ? basic.organization_name
      : [basic.first_name, basic.last_name].filter(Boolean).join(" ");

    return {
      valid: true,
      npiNumber,
      providerName,
      credential: basic.credential,
      taxonomyCode: primaryTaxonomy?.code,
      taxonomyDescription: primaryTaxonomy?.desc,
      licenseState: primaryTaxonomy?.state,
      city: practiceAddress?.city,
      state: practiceAddress?.state,
      rawData: provider as Record<string, unknown>,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { valid: false, npiNumber, error: `NPI lookup failed: ${msg}` };
  }
}

// ─── SOAP / DAP Note Generation ───────────────────────────────────────────────

export interface NoteGenerationInput {
  transcript: string;
  noteType: "SOAP" | "DAP";
  clientContext?: {
    diagnosisCodes?: string[];
    goals?: string[];
    previousNotesSummary?: string;
  };
  sessionDurationMin?: number;
}

export interface NoteGenerationResult {
  note: string;
  cptCodeSuggestion?: string;
  riskSignals: string[];
  blocked: boolean;
  blockReason?: string;
}

const SOAP_SYSTEM_PROMPT = `You are a clinical documentation assistant for licensed mental health professionals. 
Generate a professional SOAP note from the provided session transcript.

SOAP Format:
S (Subjective): Client's reported symptoms, concerns, mood, and statements in their own words.
O (Objective): Clinician observations, mental status, behavior, affect, appearance.
A (Assessment): Clinical assessment, diagnostic impressions, progress toward goals.
P (Plan): Treatment plan updates, interventions, homework, next session focus, referrals.

STRICT RULES:
- Do NOT provide diagnoses — only document what was observed and reported
- Do NOT recommend medications
- Do NOT make crisis determinations — flag signals for clinician review only
- Use professional clinical language
- Keep each section concise and factual
- If crisis signals are present, note them clearly in the Plan section for clinician review`;

const DAP_SYSTEM_PROMPT = `You are a clinical documentation assistant for licensed mental health professionals.
Generate a professional DAP note from the provided session transcript.

DAP Format:
D (Data): Objective and subjective information from the session — what the client said and did.
A (Assessment): Clinician's interpretation, progress toward treatment goals, clinical impressions.
P (Plan): Next steps, interventions, homework, follow-up schedule.

STRICT RULES:
- Do NOT provide diagnoses — only document what was observed and reported
- Do NOT recommend medications
- Do NOT make crisis determinations — flag signals for clinician review only
- Use professional clinical language
- Keep each section concise and factual
- If crisis signals are present, note them clearly in the Plan section for clinician review`;

const CRISIS_SIGNAL_KEYWORDS = [
  "suicid", "kill myself", "end my life", "don't want to live", "harm myself",
  "self-harm", "cutting", "overdose", "hurt someone", "homicid", "weapon",
  "can't go on", "no reason to live", "better off dead",
];

function detectCrisisSignals(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of CRISIS_SIGNAL_KEYWORDS) {
    if (lower.includes(kw)) {
      found.push(kw);
    }
  }
  return found;
}

function suggestCptCode(durationMin: number): string {
  if (durationMin >= 53) return "90837"; // 53+ min psychotherapy
  if (durationMin >= 38) return "90834"; // 38-52 min psychotherapy
  if (durationMin >= 16) return "90832"; // 16-37 min psychotherapy
  return "90832"; // default
}

export async function generateSessionNote(
  input: NoteGenerationInput
): Promise<NoteGenerationResult> {
  const riskSignals = detectCrisisSignals(input.transcript);

  const systemPrompt = input.noteType === "SOAP" ? SOAP_SYSTEM_PROMPT : DAP_SYSTEM_PROMPT;

  const contextBlock = input.clientContext
    ? `\nClient Context:\n- Diagnoses: ${(input.clientContext.diagnosisCodes ?? []).join(", ") || "Not provided"}\n- Goals: ${(input.clientContext.goals ?? []).join("; ") || "Not provided"}\n- Previous session summary: ${input.clientContext.previousNotesSummary || "Not provided"}\n`
    : "";

  const userPrompt = `${contextBlock}\nSession Transcript:\n${input.transcript}\n\nGenerate a ${input.noteType} note for this session.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const note = (response as { choices?: Array<{ message?: { content?: string } }> })
      ?.choices?.[0]?.message?.content ?? "";

    return {
      note,
      cptCodeSuggestion: input.sessionDurationMin
        ? suggestCptCode(input.sessionDurationMin)
        : undefined,
      riskSignals,
      blocked: false,
    };
  } catch (err) {
    return {
      note: "",
      riskSignals,
      blocked: true,
      blockReason: `Note generation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ─── Smart Treatment Planning ─────────────────────────────────────────────────

export interface TreatmentPlanInput {
  diagnosisCodes: string[];
  presentingProblems: string[];
  goals: string[];
  progressNotes?: string;
  sessionCount?: number;
}

export interface TreatmentPlanSuggestions {
  interventions: string[];
  goalRefinements: string[];
  evidenceBasedApproaches: string[];
  reviewRecommendation: string;
}

export async function generateTreatmentPlanSuggestions(
  input: TreatmentPlanInput
): Promise<TreatmentPlanSuggestions> {
  const prompt = `You are a clinical treatment planning assistant for licensed mental health professionals.

Client Information:
- Diagnosis Codes: ${input.diagnosisCodes.join(", ") || "Not specified"}
- Presenting Problems: ${input.presentingProblems.join("; ") || "Not specified"}
- Current Goals: ${input.goals.join("; ") || "Not specified"}
- Progress Notes: ${input.progressNotes || "Not available"}
- Sessions Completed: ${input.sessionCount ?? "Unknown"}

Provide evidence-based treatment planning suggestions in JSON format.

STRICT RULES:
- Do NOT prescribe medications
- Do NOT make diagnostic changes — only suggest goal refinements
- Base suggestions on established evidence-based practices (CBT, DBT, ACT, EMDR, etc.)
- Keep suggestions clinician-reviewable and modifiable`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a clinical treatment planning assistant. Always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "treatment_plan_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              interventions: {
                type: "array",
                items: { type: "string" },
                description: "List of evidence-based therapeutic interventions",
              },
              goalRefinements: {
                type: "array",
                items: { type: "string" },
                description: "Suggestions for refining or adding treatment goals",
              },
              evidenceBasedApproaches: {
                type: "array",
                items: { type: "string" },
                description: "Recommended therapeutic modalities (CBT, DBT, ACT, etc.)",
              },
              reviewRecommendation: {
                type: "string",
                description: "Recommendation for next treatment plan review",
              },
            },
            required: ["interventions", "goalRefinements", "evidenceBasedApproaches", "reviewRecommendation"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = (response as { choices?: Array<{ message?: { content?: string } }> })
      ?.choices?.[0]?.message?.content ?? "{}";

    return JSON.parse(content) as TreatmentPlanSuggestions;
  } catch {
    return {
      interventions: ["Unable to generate suggestions at this time. Please try again."],
      goalRefinements: [],
      evidenceBasedApproaches: [],
      reviewRecommendation: "Review with supervisor.",
    };
  }
}

// ─── Risk Detection Engine ─────────────────────────────────────────────────────

export interface RiskAnalysisInput {
  noteContent?: string;
  checkinData?: {
    mood: number;
    energy: number;
    anxiety: number;
    notes?: string;
  };
  recentCheckins?: Array<{ mood: number; anxiety: number; completedAt: Date }>;
}

export interface RiskAnalysisResult {
  riskLevel: "low" | "moderate" | "high" | "critical";
  flags: Array<{
    type: string;
    severity: "low" | "moderate" | "high" | "critical";
    description: string;
  }>;
  recommendedActions: string[];
}

export function analyzeRisk(input: RiskAnalysisInput): RiskAnalysisResult {
  const flags: RiskAnalysisResult["flags"] = [];
  const actions: string[] = [];

  // Check note content for crisis signals
  if (input.noteContent) {
    const signals = detectCrisisSignals(input.noteContent);
    if (signals.length > 0) {
      flags.push({
        type: "crisis_language",
        severity: "critical",
        description: `Crisis-related language detected in session note. Clinician review required.`,
      });
      actions.push("Review session note immediately for safety planning needs.");
      actions.push("Consider contacting client to assess current safety.");
    }
  }

  // Check check-in scores
  if (input.checkinData) {
    const { mood, anxiety, notes } = input.checkinData;

    if (mood <= 2) {
      flags.push({
        type: "critically_low_mood",
        severity: "critical",
        description: `Client reported mood of ${mood}/10 — critically low.`,
      });
      actions.push("Contact client immediately to assess safety.");
    } else if (mood <= 4) {
      flags.push({
        type: "low_mood",
        severity: "high",
        description: `Client reported mood of ${mood}/10 — significantly below baseline.`,
      });
      actions.push("Schedule check-in call with client.");
    }

    if (anxiety >= 9) {
      flags.push({
        type: "severe_anxiety",
        severity: "high",
        description: `Client reported anxiety of ${anxiety}/10 — severe level.`,
      });
      actions.push("Review anxiety management plan with client at next session.");
    }

    if (notes) {
      const noteSignals = detectCrisisSignals(notes);
      if (noteSignals.length > 0) {
        flags.push({
          type: "crisis_language_checkin",
          severity: "critical",
          description: "Crisis-related language detected in client check-in notes.",
        });
        actions.push("Contact client immediately. Do not wait for next session.");
      }
    }
  }

  // Check trend in recent check-ins (declining mood)
  if (input.recentCheckins && input.recentCheckins.length >= 3) {
    const sorted = [...input.recentCheckins].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const recent = sorted.slice(-3);
    const moodTrend = recent[2].mood - recent[0].mood;
    if (moodTrend <= -3) {
      flags.push({
        type: "declining_mood_trend",
        severity: "moderate",
        description: `Mood has declined by ${Math.abs(moodTrend)} points over the last 3 check-ins.`,
      });
      actions.push("Discuss mood trend with client at next session.");
    }
  }

  // Determine overall risk level
  let riskLevel: RiskAnalysisResult["riskLevel"] = "low";
  if (flags.some((f) => f.severity === "critical")) riskLevel = "critical";
  else if (flags.some((f) => f.severity === "high")) riskLevel = "high";
  else if (flags.some((f) => f.severity === "moderate")) riskLevel = "moderate";

  return { riskLevel, flags, recommendedActions: actions };
}

// ─── Adaptive Intake Engine ───────────────────────────────────────────────────

export interface IntakeQuestion {
  key: string;
  text: string;
  type: "text" | "scale" | "boolean" | "multiselect";
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  followUpIf?: { answer: string | boolean | number; nextKeys: string[] };
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    key: "presenting_concern",
    text: "What brings you to therapy today? Please describe your main concern.",
    type: "text",
  },
  {
    key: "symptom_duration",
    text: "How long have you been experiencing these concerns?",
    type: "multiselect",
    options: ["Less than 2 weeks", "2–4 weeks", "1–3 months", "3–6 months", "6–12 months", "More than 1 year"],
  },
  {
    key: "mood_baseline",
    text: "On a scale of 1–10, how would you rate your overall mood over the past 2 weeks?",
    type: "scale",
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: { min: "Very low", max: "Excellent" },
    followUpIf: { answer: 3, nextKeys: ["suicidal_ideation_screen"] },
  },
  {
    key: "suicidal_ideation_screen",
    text: "Have you had any thoughts of harming yourself or ending your life?",
    type: "boolean",
    followUpIf: { answer: true, nextKeys: ["si_frequency", "si_plan"] },
  },
  {
    key: "si_frequency",
    text: "How often do these thoughts occur?",
    type: "multiselect",
    options: ["Rarely (once or twice)", "Sometimes (weekly)", "Often (daily)", "Almost constantly"],
  },
  {
    key: "si_plan",
    text: "Do you have a plan or access to means to act on these thoughts?",
    type: "boolean",
  },
  {
    key: "anxiety_baseline",
    text: "How often do you experience anxiety, worry, or panic?",
    type: "multiselect",
    options: ["Rarely", "Sometimes", "Often", "Almost always"],
    followUpIf: { answer: "Almost always", nextKeys: ["anxiety_physical"] },
  },
  {
    key: "anxiety_physical",
    text: "Do you experience physical symptoms of anxiety (racing heart, shortness of breath, sweating)?",
    type: "boolean",
  },
  {
    key: "sleep_quality",
    text: "How would you describe your sleep over the past 2 weeks?",
    type: "multiselect",
    options: ["Good (7–9 hours, restful)", "Fair (some difficulty)", "Poor (significant difficulty)", "Very poor (less than 4 hours)"],
  },
  {
    key: "substance_use",
    text: "Do you currently use alcohol, cannabis, or other substances?",
    type: "boolean",
    followUpIf: { answer: true, nextKeys: ["substance_frequency"] },
  },
  {
    key: "substance_frequency",
    text: "How often do you use substances?",
    type: "multiselect",
    options: ["Occasionally (less than weekly)", "Weekly", "Several times per week", "Daily"],
  },
  {
    key: "trauma_history",
    text: "Have you experienced any traumatic events that continue to affect you?",
    type: "boolean",
  },
  {
    key: "previous_therapy",
    text: "Have you previously received mental health treatment or therapy?",
    type: "boolean",
    followUpIf: { answer: true, nextKeys: ["previous_therapy_outcome"] },
  },
  {
    key: "previous_therapy_outcome",
    text: "How would you describe your experience with previous treatment?",
    type: "multiselect",
    options: ["Very helpful", "Somewhat helpful", "Not helpful", "Had a negative experience"],
  },
  {
    key: "goals",
    text: "What are your main goals for therapy? (Select all that apply)",
    type: "multiselect",
    options: [
      "Reduce anxiety or worry",
      "Improve mood / manage depression",
      "Process trauma",
      "Improve relationships",
      "Develop coping skills",
      "Manage stress",
      "Address substance use",
      "Improve self-esteem",
      "Navigate life transitions",
      "Other",
    ],
  },
];

export function getNextIntakeQuestions(
  answeredKeys: string[],
  answers: Record<string, string | boolean | number>
): IntakeQuestion[] {
  const answeredSet = new Set(answeredKeys);
  const nextKeys = new Set<string>();

  // Always include base questions not yet answered
  for (const q of INTAKE_QUESTIONS) {
    if (!answeredSet.has(q.key) && !nextKeys.has(q.key)) {
      // Check if this is a follow-up question that should only appear conditionally
      const isFollowUp = INTAKE_QUESTIONS.some(
        (parent) => parent.followUpIf?.nextKeys.includes(q.key)
      );
      if (!isFollowUp) {
        nextKeys.add(q.key);
      }
    }

    // Check follow-up triggers
    if (answeredSet.has(q.key) && q.followUpIf) {
      const answer = answers[q.key];
      const trigger = q.followUpIf;
      let triggered = false;

      if (typeof trigger.answer === "number" && typeof answer === "number") {
        triggered = answer <= trigger.answer;
      } else {
        triggered = answer === trigger.answer;
      }

      if (triggered) {
        for (const key of trigger.nextKeys) {
          if (!answeredSet.has(key)) nextKeys.add(key);
        }
      }
    }
  }

  return INTAKE_QUESTIONS.filter((q) => nextKeys.has(q.key));
}

// ─── HIPAA Compliance Checker ─────────────────────────────────────────────────

export interface ComplianceCheckInput {
  noteContent: string;
  noteType: "SOAP" | "DAP";
  hasSessionDate: boolean;
  hasClientIdentifier: boolean;
  hasCptCode: boolean;
  hasSignature: boolean;
}

export interface ComplianceCheckResult {
  score: number; // 0-100
  issues: Array<{ field: string; issue: string; severity: "error" | "warning" }>;
  passed: boolean;
}

export function checkNoteCompliance(input: ComplianceCheckInput): ComplianceCheckResult {
  const issues: ComplianceCheckResult["issues"] = [];
  let deductions = 0;

  if (!input.hasSessionDate) {
    issues.push({ field: "Session Date", issue: "Session date is missing.", severity: "error" });
    deductions += 20;
  }
  if (!input.hasClientIdentifier) {
    issues.push({ field: "Client Identifier", issue: "Client identifier is missing.", severity: "error" });
    deductions += 20;
  }
  if (!input.hasCptCode) {
    issues.push({ field: "CPT Code", issue: "No CPT billing code assigned.", severity: "warning" });
    deductions += 10;
  }
  if (!input.hasSignature) {
    issues.push({ field: "Signature", issue: "Note has not been approved/signed by clinician.", severity: "error" });
    deductions += 25;
  }

  // Check note content completeness
  if (input.noteType === "SOAP") {
    const sections = ["S:", "O:", "A:", "P:"];
    for (const section of sections) {
      if (!input.noteContent.includes(section)) {
        issues.push({
          field: `SOAP ${section.replace(":", "")} Section`,
          issue: `${section} section is missing from SOAP note.`,
          severity: "error",
        });
        deductions += 5;
      }
    }
  } else {
    const sections = ["D:", "A:", "P:"];
    for (const section of sections) {
      if (!input.noteContent.includes(section)) {
        issues.push({
          field: `DAP ${section.replace(":", "")} Section`,
          issue: `${section} section is missing from DAP note.`,
          severity: "error",
        });
        deductions += 5;
      }
    }
  }

  if (input.noteContent.length < 100) {
    issues.push({
      field: "Note Length",
      issue: "Note appears too brief for a complete clinical record.",
      severity: "warning",
    });
    deductions += 5;
  }

  const score = Math.max(0, 100 - deductions);
  return {
    score,
    issues,
    passed: score >= 70 && !issues.some((i) => i.severity === "error"),
  };
}

// ─── Revenue Optimization ─────────────────────────────────────────────────────

export interface BillingOptimizationInput {
  cptCode?: string;
  sessionDurationMin: number;
  noteContent: string;
  diagnosisCodes: string[];
  isGroupSession?: boolean;
  isTelehealth?: boolean;
}

export interface BillingOptimizationResult {
  suggestedCptCode: string;
  currentCodeIssue?: string;
  potentialIssues: string[];
  telehealthModifier?: string;
  estimatedReimbursementNote: string;
}

const CPT_DURATION_MAP: Record<string, { min: number; max: number; desc: string }> = {
  "90832": { min: 16, max: 37, desc: "Psychotherapy, 16-37 min" },
  "90834": { min: 38, max: 52, desc: "Psychotherapy, 38-52 min" },
  "90837": { min: 53, max: 999, desc: "Psychotherapy, 53+ min" },
  "90847": { min: 50, max: 999, desc: "Family psychotherapy with patient" },
  "90853": { min: 0, max: 999, desc: "Group psychotherapy" },
  "90791": { min: 0, max: 999, desc: "Psychiatric diagnostic evaluation" },
};

export function optimizeBilling(input: BillingOptimizationInput): BillingOptimizationResult {
  const issues: string[] = [];
  const suggested = suggestCptCode(input.sessionDurationMin);
  let currentCodeIssue: string | undefined;

  // Check if current code matches duration
  if (input.cptCode && CPT_DURATION_MAP[input.cptCode]) {
    const range = CPT_DURATION_MAP[input.cptCode];
    if (input.sessionDurationMin < range.min || input.sessionDurationMin > range.max) {
      currentCodeIssue = `CPT ${input.cptCode} requires ${range.min}–${range.max} min sessions. This session was ${input.sessionDurationMin} min. Suggested: ${suggested}.`;
    }
  }

  // Check diagnosis codes
  if (!input.diagnosisCodes.length) {
    issues.push("No diagnosis (ICD-10) codes linked. Claims without diagnosis codes will be denied.");
  }

  // Check note supports the code
  if (input.noteContent.length < 200) {
    issues.push("Note documentation appears insufficient to support the billed CPT code. Expand clinical documentation.");
  }

  // Telehealth modifier
  const telehealthModifier = input.isTelehealth ? "95" : undefined;
  if (input.isTelehealth) {
    issues.push("Ensure telehealth modifier 95 is appended to the CPT code for telehealth sessions.");
  }

  return {
    suggestedCptCode: suggested,
    currentCodeIssue,
    potentialIssues: issues,
    telehealthModifier,
    estimatedReimbursementNote:
      "Reimbursement rates vary by payer and state. Verify with your billing system or clearinghouse.",
  };
}

// ─── Practice Analytics ───────────────────────────────────────────────────────

export interface BurnoutIndicators {
  score: number; // 0-100 (higher = more burnout risk)
  level: "low" | "moderate" | "high" | "critical";
  indicators: string[];
  recommendations: string[];
}

export function calculateBurnoutIndicators(data: {
  avgSessionsPerWeek: number;
  pendingNotesCount: number;
  highRiskClientCount: number;
  missedBreaksBetweenSessions: number;
  avgSessionRating?: number;
}): BurnoutIndicators {
  const indicators: string[] = [];
  let score = 0;

  if (data.avgSessionsPerWeek > 30) {
    score += 30;
    indicators.push(`High session volume: ${data.avgSessionsPerWeek} sessions/week (recommended max: 25–30)`);
  } else if (data.avgSessionsPerWeek > 25) {
    score += 15;
    indicators.push(`Elevated session volume: ${data.avgSessionsPerWeek} sessions/week`);
  }

  if (data.pendingNotesCount > 10) {
    score += 25;
    indicators.push(`${data.pendingNotesCount} notes pending review — documentation backlog detected`);
  } else if (data.pendingNotesCount > 5) {
    score += 10;
    indicators.push(`${data.pendingNotesCount} notes pending review`);
  }

  if (data.highRiskClientCount > 5) {
    score += 20;
    indicators.push(`${data.highRiskClientCount} high/crisis-risk clients on caseload — consider consultation or supervision`);
  } else if (data.highRiskClientCount > 2) {
    score += 10;
    indicators.push(`${data.highRiskClientCount} high-risk clients on caseload`);
  }

  if (data.missedBreaksBetweenSessions > 3) {
    score += 15;
    indicators.push(`${data.missedBreaksBetweenSessions} sessions scheduled back-to-back without breaks`);
  }

  const level: BurnoutIndicators["level"] =
    score >= 70 ? "critical" : score >= 50 ? "high" : score >= 25 ? "moderate" : "low";

  const recommendations: string[] = [];
  if (score >= 50) {
    recommendations.push("Consider reducing caseload or scheduling protected time off.");
    recommendations.push("Seek clinical supervision or peer consultation.");
  }
  if (data.pendingNotesCount > 5) {
    recommendations.push("Use AI note generation to reduce documentation time.");
  }
  if (data.missedBreaksBetweenSessions > 3) {
    recommendations.push("Schedule 10–15 minute breaks between sessions.");
  }
  if (score < 25) {
    recommendations.push("Caseload appears manageable. Continue monitoring.");
  }

  return { score, level, indicators, recommendations };
}
