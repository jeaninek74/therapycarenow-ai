/**
 * AI Guardrails Module
 *
 * SAFETY RULES:
 * 1. All user text MUST pass moderation before any AI call
 * 2. If moderation flags risk → trigger Crisis Mode, block AI
 * 3. AI can ONLY: explain options, help refine searches, supportive language
 * 4. AI CANNOT: diagnose, provide therapy, handle crisis, decide urgency
 */

import { invokeLLM } from "./_core/llm";

export interface ModerationResult {
  safe: boolean;
  flagged: boolean;
  triggersCrisisMode: boolean;
  categories?: Record<string, boolean>;
}

export interface AIResponse {
  content: string;
  safe: boolean;
  blocked: boolean;
  blockReason?: string;
}

// Safe fallback template when AI is blocked
const CRISIS_FALLBACK = `I'm not able to respond to that right now, but please know help is available immediately.

**Call or text 988** — Suicide & Crisis Lifeline (free, 24/7)
**Call 911** if you are in immediate danger
**Text HOME to 741741** — Crisis Text Line

You are not alone.`;

const DISALLOWED_CONTENT_FALLBACK = `I can only help with finding mental health resources and explaining your options. For clinical advice or treatment, please connect with a licensed professional.

Would you like help finding a therapist or understanding your options?`;

/**
 * Moderation gateway using built-in LLM with structured output.
 * Screens for self-harm, violence, and crisis content.
 * Returns safe=false and triggersCrisisMode=true if flagged.
 */
export async function moderateInput(userText: string): Promise<ModerationResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a content safety classifier for a mental health navigation app. 
Analyze the user message for safety concerns. Return a JSON object with:
- flagged: boolean (true if ANY safety concern detected)
- selfHarm: boolean (mentions of self-harm, suicide, or hurting oneself)
- harmOthers: boolean (mentions of harming other people)
- crisis: boolean (expressions of immediate danger or emergency)
- categories: object with specific flags

Be conservative — when in doubt, flag it. User safety is the top priority.`,
        },
        {
          role: "user",
          content: `Classify this message for safety: "${userText.substring(0, 500)}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "moderation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              flagged: { type: "boolean" },
              selfHarm: { type: "boolean" },
              harmOthers: { type: "boolean" },
              crisis: { type: "boolean" },
              categories: {
                type: "object",
                properties: {
                  self_harm: { type: "boolean" },
                  violence: { type: "boolean" },
                  crisis: { type: "boolean" },
                },
                required: ["self_harm", "violence", "crisis"],
                additionalProperties: false,
              },
            },
            required: ["flagged", "selfHarm", "harmOthers", "crisis", "categories"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : null;
    if (!content) return { safe: true, flagged: false, triggersCrisisMode: false };

    const parsed = JSON.parse(content);
    const triggersCrisis = parsed.flagged || parsed.selfHarm || parsed.harmOthers || parsed.crisis;

    return {
      safe: !triggersCrisis,
      flagged: parsed.flagged,
      triggersCrisisMode: triggersCrisis,
      categories: parsed.categories,
    };
  } catch (err) {
    console.error("[Moderation] Failed, defaulting to safe:", err);
    // On moderation failure, allow but log — do not block navigation
    return { safe: true, flagged: false, triggersCrisisMode: false };
  }
}

/**
 * Safe AI support assistant.
 * Only called after moderation passes.
 * Strict system prompt prevents clinical advice.
 */
export async function getSupportAssistantResponse(
  userMessage: string,
  context?: { stateCode?: string; insuranceCarrier?: string }
): Promise<AIResponse> {
  const contextInfo = context?.stateCode ? `User is in state: ${context.stateCode}.` : "";
  const insuranceInfo = context?.insuranceCarrier
    ? `User has insurance: ${context.insuranceCarrier}.`
    : "";

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a helpful navigation assistant for TherapyCareNow, a mental health resource platform.

YOUR ROLE: Help users understand their options and navigate to appropriate care. You are NOT a therapist.

ALLOWED:
- Explain the difference between therapy types (CBT, DBT, etc.) in plain language
- Help users understand insurance vs EAP vs self-pay options
- Suggest search filters based on what the user describes
- Provide supportive, non-clinical language
- Explain what different mental health professionals do

FORBIDDEN (respond with refusal if asked):
- Providing diagnosis of any kind
- Giving clinical advice or treatment recommendations
- Handling crisis conversations (immediately redirect to 988/911)
- Providing self-harm instructions or methods
- Replacing professional mental health care

If the user expresses any crisis, danger, or self-harm intent, respond ONLY with:
"Please call or text 988 immediately. Help is available right now."

Keep responses brief, calm, and focused on navigation. Use plain language, no jargon.
${contextInfo} ${insuranceInfo}`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "";

    // Post-response safety check
    const lowerContent = content.toLowerCase();
    const disallowedPatterns = [
      "you have",
      "you are diagnosed",
      "i diagnose",
      "your condition is",
      "you should take",
      "medication for",
      "clinical recommendation",
    ];

    const hasDisallowed = disallowedPatterns.some((p) => lowerContent.includes(p));
    if (hasDisallowed) {
      return {
        content: DISALLOWED_CONTENT_FALLBACK,
        safe: false,
        blocked: true,
        blockReason: "Response contained disallowed clinical content",
      };
    }

    return { content: content as string, safe: true, blocked: false };
  } catch (err) {
    console.error("[AI Assistant] Failed:", err);
    return {
      content: "I'm having trouble right now. Please use the search tools to find resources.",
      safe: true,
      blocked: false,
    };
  }
}

export { CRISIS_FALLBACK };
