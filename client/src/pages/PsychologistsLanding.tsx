import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import {
  Brain, Search, MapPin, ChevronRight, Check, Users,
  ClipboardList, ArrowRight, Loader2, BookOpen, FlaskConical,
} from "lucide-react";
import { SOCAL_COUNTIES } from "@shared/region";
import { useCountyDirectory } from "@/hooks/useCountyDirectory";

export default function PsychologistsLanding() {
  const [, navigate] = useLocation();
  const [stateSearch, setStateSearch] = useState("");

  const { countyMap, isLoading } = useCountyDirectory();
  const { data: categoryCounts } = trpc.providers.getCategoryCounts.useQuery();


  const filteredStates = SOCAL_COUNTIES.filter(
    (c) =>
      stateSearch === "" ||
      c.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      c.cities.some((city) => city.toLowerCase().includes(stateSearch.toLowerCase()))
  );

  function goSearch(countySlug: string) {
    sessionStorage.setItem("tcn_county", countySlug);
    sessionStorage.setItem("tcn_category", "Psychologist");
    navigate("/find-therapist");
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.18_280)]/8 via-background to-background pointer-events-none" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[oklch(0.55_0.18_280)]/10 text-[oklch(0.45_0.18_280)] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Brain className="w-4 h-4" />
              {categoryCounts ? `${categoryCounts.psychologists.toLocaleString()}+ ` : ""}Verified Psychologists · Southern California
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Find a <span className="text-[oklch(0.45_0.18_280)]">Psychologist</span> near you
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Psychologists hold doctoral degrees (PhD or PsyD) and specialize in psychological assessment, testing, and advanced psychotherapy. Browse verified psychologists in every Southern California county and city — searchable by specialty, insurance, and telehealth availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/find-therapist?category=Psychologist"
                className="flex items-center justify-center gap-2 bg-[oklch(0.55_0.18_280)] text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
                Search Psychologists
              </Link>
              <Link
                href="/directory"
                className="flex items-center justify-center gap-2 bg-card border-2 border-[oklch(0.55_0.18_280)]/30 text-foreground font-semibold rounded-xl px-8 py-4 text-lg hover:border-[oklch(0.55_0.18_280)]/60 active:scale-95 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Browse by County
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Psychologist */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">What is a Psychologist?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A psychologist is a doctoral-level mental health professional who specializes in the science of human behavior and mental processes. Psychologists complete a PhD or PsyD program (typically 4–7 years) and are trained in both research and clinical practice.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Psychologists are uniquely qualified to administer and interpret <strong className="text-foreground">psychological tests and assessments</strong> — including IQ testing, personality assessment, ADHD evaluation, autism spectrum assessment, and neuropsychological testing. In California, psychologists cannot prescribe medication.
            </p>
            <div className="space-y-3">
              {[
                "Psychological testing and assessment (IQ, ADHD, autism, personality)",
                "Neuropsychological evaluation",
                "Advanced evidence-based psychotherapy (Cognitive Behavioral Therapy, Dialectical Behavior Therapy, Eye Movement Desensitization and Reprocessing)",
                "Diagnosis of complex mental health conditions",
                "Research-informed treatment approaches",
                "Forensic and educational psychology",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[oklch(0.55_0.18_280)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">Specialties and assessments</h3>
            {[
              { area: "ADHD Evaluation", detail: "Comprehensive testing to diagnose attention deficit hyperactivity disorder in children and adults" },
              { area: "Autism Spectrum Assessment", detail: "ADOS-2, ADI-R, and other gold-standard diagnostic tools for ASD" },
              { area: "Neuropsychological Testing", detail: "Cognitive and memory assessment for TBI, dementia, learning disabilities" },
              { area: "Personality Assessment", detail: "MMPI-3, Rorschach, PAI — for clinical, forensic, and occupational contexts" },
              { area: "Trauma Therapy (Eye Movement Desensitization and Reprocessing, Cognitive Processing Therapy)", detail: "Evidence-based trauma processing for PTSD and complex trauma" },
              { area: "Cognitive Behavioral Therapy", detail: "Structured, goal-oriented therapy for anxiety, depression, OCD, and more" },
            ].map(({ area, detail }) => (
              <div key={area} className="bg-card border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{area}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-foreground mb-3">Psychologist vs. Psychiatrist vs. Therapist</h2>
        <p className="text-muted-foreground mb-8">Understanding which type of provider is right for your needs.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-6 py-3 font-semibold text-foreground">Feature</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_280)]">Psychologist</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_30)]">Psychiatrist</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_200)]">Therapist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Can prescribe medication", "✗", "✓", "✗"],
                ["Psychological testing", "✓", "✗", "✗"],
                ["Provides talk therapy", "✓", "Some", "✓"],
                ["Neuropsychological assessment", "✓", "✗", "✗"],
                ["Typical session focus", "Assessment & therapy", "Medication & diagnosis", "Therapy & coping"],
              ].map(([feature, psychologist, psych, therapist]) => (
                <tr key={feature} className="hover:bg-muted/20">
                  <td className="px-6 py-3 font-medium text-foreground">{feature}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{psychologist}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{psych}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{therapist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/psychiatrists" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Browse Psychiatrists <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/therapists" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Browse Therapists <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* County directory */}
      <section className="bg-muted/40 py-16">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Find Psychologists by County</h2>
              <p className="text-muted-foreground text-sm">
                {categoryCounts ? `${categoryCounts.psychologists.toLocaleString()}+ ` : ""}psychologists across Southern California
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search county or city..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[oklch(0.55_0.18_280)] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredStates.map((state) => {
                const count = countyMap.get(state.slug)?.psychologists ?? 0;
                return (
                  <button
                    key={state.slug}
                    onClick={() => goSearch(state.slug)}
                    className="group bg-card border border-border rounded-xl p-4 text-left hover:border-[oklch(0.55_0.18_280)]/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[oklch(0.55_0.18_280)]/10 text-[oklch(0.45_0.18_280)]">
                        {state.cities.length} cities
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[oklch(0.55_0.18_280)] transition-colors" />
                    </div>
                    <p className="font-medium text-foreground text-sm leading-tight mb-1">{state.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {count > 0 ? `${count.toLocaleString()} psychologists` : "Browse psychologists"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What is the difference between a psychologist and a therapist?",
              a: "Psychologists hold doctoral degrees (PhD or PsyD) and are trained in psychological testing and assessment in addition to therapy. Therapists typically hold master's degrees and focus primarily on counseling and talk therapy. Both can provide effective mental health treatment.",
            },
            {
              q: "Can a psychologist prescribe medication?",
              a: "No. California psychologists are not licensed to prescribe medication. If you need medication management, consider seeing a psychiatrist or psychiatric nurse practitioner.",
            },
            {
              q: "When should I see a psychologist instead of a therapist?",
              a: "Consider a psychologist if you need psychological testing (ADHD evaluation, autism assessment, IQ testing, neuropsychological evaluation), or if you have a complex diagnosis that requires doctoral-level expertise. For ongoing counseling and support, a licensed therapist may be equally effective.",
            },
            {
              q: "Does insurance cover psychology sessions?",
              a: "Most major insurance plans cover psychological services. Coverage for psychological testing varies — some plans require prior authorization. Use the insurance filter in our search to find psychologists who accept your plan.",
            },
            {
              q: "How long does psychological testing take?",
              a: "Psychological testing typically takes 4–8 hours spread across 1–3 sessions, depending on the type of evaluation. A comprehensive ADHD evaluation, for example, may take 3–5 hours. Your psychologist will explain the process during an initial consultation.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-card border border-border rounded-xl p-5">
              <p className="font-semibold text-foreground mb-2">{q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[oklch(0.55_0.18_280)]/8 py-16">
        <div className="container text-center max-w-xl mx-auto">
          <Brain className="w-12 h-12 text-[oklch(0.55_0.18_280)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to find a psychologist?</h2>
          <p className="text-muted-foreground mb-6">
            Search {categoryCounts ? `${categoryCounts.psychologists.toLocaleString()}+ ` : ""}verified psychologists across Southern California. Filter by insurance, telehealth, and specialty.
          </p>
          <Link
            href="/find-therapist?category=Psychologist"
            className="inline-flex items-center gap-2 bg-[oklch(0.55_0.18_280)] text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
            Search Psychologists Now
          </Link>
          <p className="text-xs text-muted-foreground mt-4">Free to use · No account required · Southern California</p>
        </div>
      </section>

      {/* Crisis */}
      <section className="container py-8">
        <div className="bg-destructive/8 border border-destructive/20 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground mb-1">In immediate danger?</p>
            <p className="text-sm text-muted-foreground">Call 911 for emergencies. For mental health crisis support, call or text 988 — free, confidential, 24/7.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a href="tel:911" className="bg-destructive text-destructive-foreground font-bold rounded-xl px-5 py-2.5 text-sm hover:opacity-90 transition-all">Call 911</a>
            <a href="tel:988" className="bg-card border-2 border-destructive text-destructive font-bold rounded-xl px-5 py-2.5 text-sm hover:bg-destructive/5 transition-all">Call 988</a>
          </div>
        </div>
      </section>
    </div>
  );
}
