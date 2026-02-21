import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Phone, MessageSquare, Monitor, MapPin, ChevronDown, ChevronUp, Heart } from "lucide-react";
import StatePicker from "@/components/StatePicker";

/**
 * Crisis Mode — full-screen emergency state.
 * SPEC: Disables AI, shows 911/988 actions, state-based resources.
 * AI assistant is completely hidden on this page.
 */
export default function CrisisMode() {
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const [showMore, setShowMore] = useState(false);

  const { data: resources } = trpc.crisis.getResources.useQuery({ stateCode });

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.02_25)] text-white flex flex-col">
      {/* Header */}
      <div className="bg-destructive px-6 py-4 text-center">
        <p className="font-bold text-lg tracking-wide">CRISIS SUPPORT — HELP IS AVAILABLE NOW</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-lg mx-auto w-full">
        {/* Main message */}
        <div className="text-center mb-10">
          <Heart className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">You are not alone.</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Help is available right now. Please reach out using one of the options below.
          </p>
        </div>

        {/* Primary emergency actions */}
        <div className="w-full flex flex-col gap-4 mb-8">
          <a
            href="tel:911"
            className="flex items-center justify-between bg-destructive hover:bg-destructive/90 text-white font-bold rounded-2xl px-6 py-5 text-xl shadow-lg active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <div>
                <div>Call 911</div>
                <div className="text-sm font-normal opacity-80">Immediate danger — emergency services</div>
              </div>
            </div>
            <span className="text-2xl font-bold">→</span>
          </a>

          <a
            href="tel:988"
            className="flex items-center justify-between bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl px-6 py-5 text-xl border border-white/30 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <div>
                <div>Call 988</div>
                <div className="text-sm font-normal opacity-80">Suicide & Crisis Lifeline — free, 24/7</div>
              </div>
            </div>
            <span className="text-2xl font-bold">→</span>
          </a>

          <a
            href="sms:988"
            className="flex items-center justify-between bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl px-6 py-5 text-xl border border-white/30 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <div>Text 988</div>
                <div className="text-sm font-normal opacity-80">Text-based crisis support</div>
              </div>
            </div>
            <span className="text-2xl font-bold">→</span>
          </a>

          <a
            href="https://988lifeline.org/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl px-6 py-5 text-xl border border-white/30 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6" />
              <div>
                <div>Chat Online</div>
                <div className="text-sm font-normal opacity-80">988lifeline.org/chat — free, confidential</div>
              </div>
            </div>
            <span className="text-2xl font-bold">→</span>
          </a>

          <a
            href="sms:741741&body=HOME"
            className="flex items-center justify-between bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl px-6 py-5 text-xl border border-white/30 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <div>Text HOME to 741741</div>
                <div className="text-sm font-normal opacity-80">Crisis Text Line — free, 24/7</div>
              </div>
            </div>
            <span className="text-2xl font-bold">→</span>
          </a>
        </div>

        {/* State-specific resources */}
        <div className="w-full bg-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-white/70" />
            <span className="font-semibold">State-specific resources</span>
          </div>
          <StatePicker
            value={stateCode}
            onChange={setStateCode}
            placeholder="Select your state for local resources"
            className="bg-white/10 border-white/20 text-white"
          />
          {stateCode && resources && resources.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {resources
                .filter((r) => r.stateCode === stateCode)
                .map((r) => (
                  <div key={r.id} className="bg-white/10 rounded-xl p-4">
                    <p className="font-semibold">{r.name}</p>
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="text-white/80 text-sm hover:text-white">
                        📞 {r.phone}
                      </a>
                    )}
                    {r.description && <p className="text-white/60 text-xs mt-1">{r.description}</p>}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Expand more resources */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
        >
          {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showMore ? "Show fewer resources" : "Show more crisis resources"}
        </button>

        {showMore && (
          <div className="w-full flex flex-col gap-3 mb-8">
            <ResourceRow name="Veterans Crisis Line" contact="988 (Press 1)" type="call" />
            <ResourceRow name="Trevor Project (LGBTQ+)" contact="1-866-488-7386" type="call" />
            <ResourceRow name="Trans Lifeline" contact="877-565-8860" type="call" />
            <ResourceRow name="Crisis Text Line" contact="Text HOME to 741741" type="text" />
          </div>
        )}

        {/* Safety note */}
        <div className="text-center text-white/50 text-xs max-w-sm">
          <p>
            AI assistant is disabled during crisis mode. Your safety is the only priority. Please reach out to a crisis counselor using the options above.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResourceRow({ name, contact, type }: { name: string; contact: string; type: "call" | "text" }) {
  return (
    <div className="bg-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-white/70 text-sm">{contact}</p>
      </div>
      {type === "call" && (
        <a
          href={`tel:${contact.replace(/[^0-9]/g, "")}`}
          className="bg-destructive text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all"
        >
          Call
        </a>
      )}
    </div>
  );
}
