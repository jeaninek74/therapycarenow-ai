import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Phone, Clock, Search, AlertTriangle, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";

export default function UrgentOptions() {
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const { data: crisisResources } = trpc.crisis.getResources.useQuery({ stateCode });
  const { data: searchData } = trpc.providers.search.useQuery({
    stateCode,
    urgency: "within_24h",
    telehealth: true,
    limit: 3,
  });
  const providers = [...(searchData?.local ?? []), ...(searchData?.live ?? [])].slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-2xl mx-auto">
        {/* Urgency banner */}
        <div className="bg-[oklch(0.72_0.16_65)]/15 border border-[oklch(0.72_0.16_65)]/30 rounded-2xl p-5 flex items-start gap-3 mb-8">
          <AlertTriangle className="w-5 h-5 text-[oklch(0.62_0.16_65)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground">You need support soon.</p>
            <p className="text-muted-foreground text-sm mt-1">
              We've identified resources that can help you today. If your situation worsens, please call 988 or 911 immediately.
            </p>
          </div>
        </div>

        {/* State picker */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">Your state (for local resources)</label>
          <StatePicker value={stateCode} onChange={setStateCode} />
        </div>

        {/* Immediate options */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Immediate options</h2>
          <div className="flex flex-col gap-3">
            <a
              href="tel:988"
              className="flex items-center justify-between bg-card border-2 border-[oklch(0.72_0.16_65)]/40 rounded-xl p-5 hover:border-[oklch(0.72_0.16_65)] hover:bg-[oklch(0.72_0.16_65)]/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[oklch(0.72_0.16_65)]/15 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[oklch(0.62_0.16_65)]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Call 988 — Crisis Lifeline</p>
                  <p className="text-sm text-muted-foreground">Free, confidential, available now</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            </a>

            <a
              href="sms:741741&body=HOME"
              className="flex items-center justify-between bg-card border-2 border-border rounded-xl p-5 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Text HOME to 741741</p>
                  <p className="text-sm text-muted-foreground">Crisis Text Line — free, 24/7</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            </a>
          </div>
        </section>

        {/* Urgent providers */}
        {providers.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Available within 24 hours</h2>
            </div>
            <div className="flex flex-col gap-3">
              {providers.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/provider/${p.id}`}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.licenseType} · {p.city}, {p.stateCode}</p>
                      <div className="flex gap-2 mt-2">
                        {p.telehealthAvailable && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Telehealth</span>
                        )}
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full capitalize">{p.costTag?.replace("_", " ")}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground mt-1" />
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/find-therapist" className="block text-center text-primary text-sm font-medium mt-4 hover:underline">
              See all available providers →
            </Link>
          </section>
        )}

        {/* State crisis resources */}
        {stateCode && crisisResources && crisisResources.filter(r => r.stateCode === stateCode).length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Local crisis resources</h2>
            <div className="flex flex-col gap-3">
              {crisisResources
                .filter(r => r.stateCode === stateCode)
                .map((r) => (
                  <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                    <p className="font-medium text-foreground">{r.name}</p>
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="text-primary text-sm hover:underline">{r.phone}</a>
                    )}
                    {r.description && <p className="text-muted-foreground text-xs mt-1">{r.description}</p>}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* More options */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">More options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/find-therapist" className="bg-card border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary/30 transition-all flex items-center gap-3">
              <Search className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Find a therapist</span>
            </Link>
            <Link href="/free-resources" className="bg-card border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary/30 transition-all flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Free resources</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
