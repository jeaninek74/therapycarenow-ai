/**
 * AIDisclaimerBanner — shown on all pages with AI-generated content.
 * Addresses misrepresentation risk by clearly labeling AI outputs.
 */
import { AlertTriangle } from "lucide-react";

interface Props {
  compact?: boolean;
}

export default function AIDisclaimerBanner({ compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>AI-generated content.</strong> This is not medical advice. Not a licensed therapist. For emergencies, call <strong>911</strong> or <strong>988</strong>.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
      <div>
        <span className="font-semibold">AI Assistant Disclaimer: </span>
        This assistant is powered by artificial intelligence and is <strong>not a licensed therapist, counselor, or medical professional</strong>. Responses are for general wellness guidance only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified mental health professional for clinical concerns. If you are in crisis, call <strong>911</strong> or the <strong>988 Suicide and Crisis Lifeline</strong> immediately.
      </div>
    </div>
  );
}
