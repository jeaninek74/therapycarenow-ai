/**
 * Deterministic Triage Engine
 *
 * SAFETY RULE: Risk level determination is ALWAYS rule-based backend logic.
 * AI must NEVER determine emergency status or override this classification.
 *
 * Questions (in order per spec):
 * 1. Are you in immediate danger right now?
 * 2. Are you thinking about harming yourself right now?
 * 3. Are you thinking about harming someone else right now?
 * 4. Do you need to talk to someone within the next hour?
 * 5. Do you need help today?
 */

export type RiskLevel = "EMERGENCY" | "URGENT" | "ROUTINE";

export interface TriageAnswers {
  immediateDanger: boolean;
  harmSelf: boolean;
  harmOthers: boolean;
  needHelpSoon: boolean; // within 1 hour
  needHelpToday: boolean;
}

export interface TriageResult {
  riskLevel: RiskLevel;
  nextAction: string;
  crisisMode: boolean;
  message: string;
}

/**
 * Core deterministic triage logic.
 * This function must NEVER call AI or external services.
 * Logic is pure and synchronous for reliability.
 */
export function classifyRisk(answers: TriageAnswers): TriageResult {
  // EMERGENCY: Any immediate danger or harm intent
  if (answers.immediateDanger || answers.harmSelf || answers.harmOthers) {
    return {
      riskLevel: "EMERGENCY",
      nextAction: "crisis_resources",
      crisisMode: true,
      message: "Immediate support resources are available right now.",
    };
  }

  // URGENT: Needs help soon (within 1 hour)
  if (answers.needHelpSoon) {
    return {
      riskLevel: "URGENT",
      nextAction: "urgent_resources",
      crisisMode: false,
      message: "You're not alone. Here are the fastest options.",
    };
  }

  // URGENT: Needs help today
  if (answers.needHelpToday) {
    return {
      riskLevel: "URGENT",
      nextAction: "urgent_resources",
      crisisMode: false,
      message: "You're not alone. Here are the fastest options.",
    };
  }

  // ROUTINE: No urgent flags
  return {
    riskLevel: "ROUTINE",
    nextAction: "provider_search",
    crisisMode: false,
    message: "Let's find the right support for you.",
  };
}

/**
 * Triage question set — versioned spec
 * Must match USER_FLOW_BLUEPRINT.md exactly
 */
export const TRIAGE_QUESTIONS = [
  {
    id: "immediateDanger",
    order: 1,
    text: "Are you in immediate danger right now?",
    answers: ["Yes", "No"],
    isEmergencyTrigger: true,
  },
  {
    id: "harmSelf",
    order: 2,
    text: "Are you thinking about harming yourself right now?",
    answers: ["Yes", "No"],
    isEmergencyTrigger: true,
  },
  {
    id: "harmOthers",
    order: 3,
    text: "Are you thinking about harming someone else right now?",
    answers: ["Yes", "No"],
    isEmergencyTrigger: true,
  },
  {
    id: "needHelpSoon",
    order: 4,
    text: "Do you need to talk to someone within the next hour?",
    answers: ["Yes", "No"],
    isEmergencyTrigger: false,
  },
  {
    id: "needHelpToday",
    order: 5,
    text: "Do you need help today?",
    answers: ["Yes", "No"],
    isEmergencyTrigger: false,
  },
] as const;

export type TriageQuestionId = (typeof TRIAGE_QUESTIONS)[number]["id"];
