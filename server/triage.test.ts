import { describe, expect, it } from "vitest";
import { classifyRisk, TRIAGE_QUESTIONS } from "./triage";

describe("Triage Engine — Deterministic Classification", () => {
  it("should return EMERGENCY and crisisMode=true when immediateDanger is true", () => {
    const result = classifyRisk({
      immediateDanger: true,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("EMERGENCY");
    expect(result.crisisMode).toBe(true);
    expect(result.nextAction).toBe("crisis_resources");
  });

  it("should return EMERGENCY and crisisMode=true when harmSelf is true", () => {
    const result = classifyRisk({
      immediateDanger: false,
      harmSelf: true,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("EMERGENCY");
    expect(result.crisisMode).toBe(true);
  });

  it("should return EMERGENCY and crisisMode=true when harmOthers is true", () => {
    const result = classifyRisk({
      immediateDanger: false,
      harmSelf: false,
      harmOthers: true,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("EMERGENCY");
    expect(result.crisisMode).toBe(true);
  });

  it("should return URGENT when needHelpSoon is true and no emergency flags", () => {
    const result = classifyRisk({
      immediateDanger: false,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: true,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("URGENT");
    expect(result.crisisMode).toBe(false);
    expect(result.nextAction).toBe("urgent_resources");
  });

  it("should return URGENT when needHelpToday is true and no emergency flags", () => {
    const result = classifyRisk({
      immediateDanger: false,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: true,
    });
    expect(result.riskLevel).toBe("URGENT");
    expect(result.crisisMode).toBe(false);
  });

  it("should return ROUTINE when all answers are false", () => {
    const result = classifyRisk({
      immediateDanger: false,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: false,
      needHelpToday: false,
    });
    expect(result.riskLevel).toBe("ROUTINE");
    expect(result.crisisMode).toBe(false);
    expect(result.nextAction).toBe("provider_search");
  });

  it("EMERGENCY overrides URGENT — immediateDanger + needHelpSoon = EMERGENCY", () => {
    const result = classifyRisk({
      immediateDanger: true,
      harmSelf: false,
      harmOthers: false,
      needHelpSoon: true,
      needHelpToday: true,
    });
    expect(result.riskLevel).toBe("EMERGENCY");
    expect(result.crisisMode).toBe(true);
  });

  it("should have exactly 5 triage questions", () => {
    expect(TRIAGE_QUESTIONS).toHaveLength(5);
  });

  it("should have the correct question IDs", () => {
    const ids = TRIAGE_QUESTIONS.map((q) => q.id);
    expect(ids).toContain("immediateDanger");
    expect(ids).toContain("harmSelf");
    expect(ids).toContain("harmOthers");
    expect(ids).toContain("needHelpSoon");
    expect(ids).toContain("needHelpToday");
  });

  it("first 3 questions should be marked as emergency triggers", () => {
    const emergencyQuestions = TRIAGE_QUESTIONS.filter((q) => q.isEmergencyTrigger);
    expect(emergencyQuestions).toHaveLength(3);
  });
});
