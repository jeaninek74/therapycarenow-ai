import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search, Briefcase, BookOpen, Bot, CheckCircle, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";

export default function RoutineOptions() {
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const { data: providers } = trpc.providers.search.useQuery({ stateCode, limit: 3 });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-2xl mx-auto">
        {/* Positive confirmation */}
        <div className="bg-secondary/40 border border-secondary rounded-2xl p-5 flex items-start gap-3 mb-8">
          <CheckCircle className="w-5 h-5 text-secondary-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground">You're taking a great step.</p>
            <p className="text-muted-foreground text-sm mt-1">
              Seeking support is a sign of strength. Let's find the right therapist or resource for you.
            </p>
          </div>
        </div>

        {/* State picker */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">Your state</label>
          <StatePicker value={stateCode} onChange={setStateCode} />
        </div>

        {/* Options grid */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">Where would you like to start?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              href="/find-therapist"
              icon={<Search className="w-6 h-6 text-primary" />}
              title="Find a Therapist"
              description="Search by insurance, specialty, telehealth, and availability."
            />
            <OptionCard
              href="/benefits"
              icon={<Briefcase className="w-6 h-6 text-secondary-foreground" />}
              title="Check Your Benefits"
              description="See what your insurance or employer EAP covers."
            />
            <OptionCard
              href="/free-resources"
              icon={<BookOpen className="w-6 h-6 text-accent-foreground" />}
              title="Free Resources"
              description="Community clinics, hotlines, and sliding scale providers."
            />
            <OptionCard
              href="/ai-assistant"
              icon={<Bot className="w-6 h-6 text-primary" />}
              title="Ask the AI Assistant"
              description="Get help understanding your options and refining your search."
            />
          </div>
        </section>

        {/* Suggested providers */}
        {providers && providers.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Suggested providers</h2>
            <div className="flex flex-col gap-3">
              {providers.map((p) => (
                <Link
                  key={p.id}
                  href={`/provider/${p.id}`}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.licenseType} · {p.city}, {p.stateCode}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
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
              See all providers →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

function OptionCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all group">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-3 flex items-center gap-1 text-primary text-sm font-medium">
        Start <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
