import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import {
  Stethoscope, Search, MapPin, ChevronRight, Check, Shield,
  Users, Brain, Pill, ClipboardList, Phone, ArrowRight, Loader2,
} from "lucide-react";
import { US_STATES, getStateName } from "@shared/states";

export default function PsychiatristsLanding() {
  const [, navigate] = useLocation();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateSearch, setStateSearch] = useState("");

  const { data: stateDirectory, isLoading } = trpc.providers.getStateDirectoryByCategory.useQuery();
  const { data: categoryCounts } = trpc.providers.getCategoryCounts.useQuery();

  const stateMap = new Map<string, number>();
  (stateDirectory ?? []).forEach((s) => stateMap.set(s.stateCode, s.psychiatrists));

  const filteredStates = US_STATES.filter((s) =>
    stateSearch === "" ||
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  function goSearch(stateCode: string) {
    sessionStorage.setItem("tcn_state", stateCode);
    sessionStorage.setItem("tcn_category", "Psychiatrist");
    navigate("/find-therapist");
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.18_30)]/8 via-background to-background pointer-events-none" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[oklch(0.55_0.18_30)]/10 text-[oklch(0.45_0.18_30)] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Stethoscope className="w-4 h-4" />
              {(categoryCounts?.psychiatrists ?? 9400).toLocaleString()}+ Verified Psychiatrists · All 50 States
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Find a <span className="text-[oklch(0.45_0.18_30)]">Psychiatrist</span> near you
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Psychiatrists are medical doctors (MD/DO) and advanced practice nurses (PMHNP/APRN/NP) who specialize in diagnosing and treating mental health conditions — including prescribing medication. Browse verified psychiatrists in every state and city.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/find-therapist?category=Psychiatrist"
                className="flex items-center justify-center gap-2 bg-[oklch(0.55_0.18_30)] text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
                Search Psychiatrists
              </Link>
              <Link
                href="/directory"
                className="flex items-center justify-center gap-2 bg-card border-2 border-[oklch(0.55_0.18_30)]/30 text-foreground font-semibold rounded-xl px-8 py-4 text-lg hover:border-[oklch(0.55_0.18_30)]/60 active:scale-95 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Browse by State
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Psychiatrist */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">What is a Psychiatrist?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A psychiatrist is a licensed medical professional who specializes in mental health. Unlike therapists and psychologists, psychiatrists can <strong className="text-foreground">prescribe and manage psychiatric medications</strong> such as antidepressants, mood stabilizers, antipsychotics, and anti-anxiety medications.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Psychiatrists complete medical school (MD or DO) followed by a 4-year psychiatric residency. Psychiatric nurse practitioners (PMHNP/APRN/NP) also have prescribing authority and are included in our directory.
            </p>
            <div className="space-y-3">
              {[
                "Diagnose mental health conditions (DSM-5)",
                "Prescribe and manage psychiatric medications",
                "Provide medication management follow-ups",
                "Treat complex or treatment-resistant cases",
                "Coordinate care with therapists and primary care",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[oklch(0.55_0.18_30)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">Conditions commonly treated</h3>
            {[
              { condition: "Depression", detail: "Major depressive disorder, persistent depressive disorder, postpartum depression" },
              { condition: "Bipolar Disorder", detail: "Bipolar I, bipolar II, cyclothymia — mood stabilizer management" },
              { condition: "Schizophrenia & Psychosis", detail: "Antipsychotic medication management, symptom monitoring" },
              { condition: "ADHD", detail: "Stimulant and non-stimulant medication evaluation and management" },
              { condition: "Anxiety Disorders", detail: "Generalized anxiety, panic disorder, social anxiety, OCD" },
              { condition: "PTSD", detail: "Trauma-focused medication support alongside therapy" },
            ].map(({ condition, detail }) => (
              <div key={condition} className="bg-card border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{condition}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* License types */}
      <section className="bg-[oklch(0.55_0.18_30)]/5 py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">License types in our directory</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
            {[
              { type: "MD", label: "Medical Doctor", note: "Psychiatry specialty" },
              { type: "DO", label: "Doctor of Osteopathic Medicine", note: "Psychiatry specialty" },
              { type: "PMHNP", label: "Psychiatric Mental Health NP", note: "Full prescribing authority" },
              { type: "APRN", label: "Advanced Practice RN", note: "Psychiatric specialty" },
              { type: "NP", label: "Nurse Practitioner", note: "Mental health focus" },
            ].map(({ type, label, note }) => (
              <div key={type} className="bg-card border-2 border-[oklch(0.55_0.18_30)]/20 rounded-xl p-4 text-center hover:border-[oklch(0.55_0.18_30)]/50 transition-colors">
                <p className="text-2xl font-extrabold text-[oklch(0.45_0.18_30)] mb-1">{type}</p>
                <p className="text-xs font-medium text-foreground mb-1">{label}</p>
                <p className="text-[10px] text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Psychiatrist vs Therapist vs Psychologist */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-foreground mb-3">Psychiatrist vs. Therapist vs. Psychologist</h2>
        <p className="text-muted-foreground mb-8">Understanding which type of provider is right for your needs.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-6 py-3 font-semibold text-foreground">Feature</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_30)]">Psychiatrist</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_200)]">Therapist</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_280)]">Psychologist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Can prescribe medication", "✓", "✗", "✗ (most states)"],
                ["Provides talk therapy", "Some", "✓", "✓"],
                ["Psychological testing", "✗", "✗", "✓"],
                ["Medical degree required", "✓", "✗", "✗"],
                ["Doctoral degree required", "✓", "✗", "✓"],
                ["Typical session focus", "Medication & diagnosis", "Therapy & coping", "Assessment & therapy"],
              ].map(([feature, psych, therapist, psychologist]) => (
                <tr key={feature} className="hover:bg-muted/20">
                  <td className="px-6 py-3 font-medium text-foreground">{feature}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{psych}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{therapist}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{psychologist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/therapists" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Browse Therapists <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/psychologists" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Browse Psychologists <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* State directory */}
      <section className="bg-muted/40 py-16">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Find Psychiatrists by State</h2>
              <p className="text-muted-foreground text-sm">
                {(categoryCounts?.psychiatrists ?? 9400).toLocaleString()}+ psychiatrists across all 50 states
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search state..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[oklch(0.55_0.18_30)] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredStates.map((state) => {
                const count = stateMap.get(state.code) ?? 0;
                return (
                  <button
                    key={state.code}
                    onClick={() => goSearch(state.code)}
                    className="group bg-card border border-border rounded-xl p-4 text-left hover:border-[oklch(0.55_0.18_30)]/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[oklch(0.55_0.18_30)]/10 text-[oklch(0.45_0.18_30)]">
                        {state.code}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[oklch(0.55_0.18_30)] transition-colors" />
                    </div>
                    <p className="font-medium text-foreground text-sm leading-tight mb-1">{state.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {count > 0 ? `${count.toLocaleString()} psychiatrists` : "Browse psychiatrists"}
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
              q: "Do I need a referral to see a psychiatrist?",
              a: "In most cases, no. You can contact a psychiatrist directly. However, some insurance plans may require a referral from your primary care physician. Check with your insurance before scheduling.",
            },
            {
              q: "How is a psychiatrist different from a therapist?",
              a: "Psychiatrists are medical doctors who can prescribe medication. Therapists provide talk therapy but cannot prescribe. Many people benefit from seeing both — a psychiatrist for medication management and a therapist for ongoing counseling.",
            },
            {
              q: "Does insurance cover psychiatry visits?",
              a: "Most major insurance plans cover psychiatric services, including Aetna, Blue Cross, Cigna, Humana, Medicaid, Medicare, and United. Use the insurance filter in our search to find psychiatrists who accept your plan.",
            },
            {
              q: "Can I see a psychiatrist via telehealth?",
              a: "Yes. Many psychiatrists in our directory offer telehealth appointments. Use the 'Telehealth only' filter in the search to find providers available online in your state.",
            },
            {
              q: "What is a PMHNP and can they prescribe medication?",
              a: "A Psychiatric Mental Health Nurse Practitioner (PMHNP) is an advanced practice nurse with specialized training in psychiatric care. In most states, PMHNPs have full prescribing authority for psychiatric medications.",
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
      <section className="bg-[oklch(0.55_0.18_30)]/8 py-16">
        <div className="container text-center max-w-xl mx-auto">
          <Stethoscope className="w-12 h-12 text-[oklch(0.55_0.18_30)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to find a psychiatrist?</h2>
          <p className="text-muted-foreground mb-6">
            Search {(categoryCounts?.psychiatrists ?? 9400).toLocaleString()}+ verified psychiatrists across all 50 states. Filter by insurance, telehealth, and availability.
          </p>
          <Link
            href="/find-therapist?category=Psychiatrist"
            className="inline-flex items-center gap-2 bg-[oklch(0.55_0.18_30)] text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
            Search Psychiatrists Now
          </Link>
          <p className="text-xs text-muted-foreground mt-4">Free to use · No account required · All 50 states</p>
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
