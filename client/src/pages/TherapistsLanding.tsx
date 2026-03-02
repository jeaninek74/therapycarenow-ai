import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import {
  UserCheck, Search, MapPin, ChevronRight, Check, Users,
  ArrowRight, Loader2, Heart, MessageCircle, Shield,
} from "lucide-react";
import { US_STATES } from "@shared/states";

const LICENSE_TYPES = [
  { code: "LCSW", label: "Licensed Clinical Social Worker", detail: "Master's-level clinician trained in therapy, case management, and social systems. One of the most common therapy licenses." },
  { code: "LPC", label: "Licensed Professional Counselor", detail: "Provides individual, group, and family counseling. License name varies by state (LPC, LPCC, LCPC, LPCA)." },
  { code: "LMFT", label: "Licensed Marriage & Family Therapist", detail: "Specializes in relationship dynamics, couples therapy, and family systems. Trained in systemic and relational approaches." },
  { code: "LMHC", label: "Licensed Mental Health Counselor", detail: "Provides mental health counseling for individuals and groups. Common in New York, Florida, and other states." },
  { code: "LCPC", label: "Licensed Clinical Professional Counselor", detail: "Clinical counseling license used in Illinois, Montana, and several other states. Equivalent to LPC in most respects." },
  { code: "LAC", label: "Licensed Addiction Counselor", detail: "Specializes in substance use disorders, co-occurring conditions, and recovery support." },
];

const SPECIALTIES = [
  "Anxiety & Panic Disorders",
  "Depression & Mood Disorders",
  "Trauma & PTSD",
  "Relationship & Couples Issues",
  "Grief & Loss",
  "Life Transitions",
  "Eating Disorders",
  "OCD & Intrusive Thoughts",
  "ADHD (Adults)",
  "Substance Use & Recovery",
  "LGBTQ+ Affirming Care",
  "Perinatal & Postpartum",
  "Chronic Illness & Pain",
  "Work Stress & Burnout",
  "Self-Esteem & Identity",
  "Family Conflict",
];

export default function TherapistsLanding() {
  const [, navigate] = useLocation();
  const [stateSearch, setStateSearch] = useState("");

  const { data: stateDirectory, isLoading } = trpc.providers.getStateDirectoryByCategory.useQuery();
  const { data: categoryCounts } = trpc.providers.getCategoryCounts.useQuery();

  const stateMap = new Map<string, number>();
  (stateDirectory ?? []).forEach((s) => stateMap.set(s.stateCode, s.therapists));

  const filteredStates = US_STATES.filter(
    (s) =>
      stateSearch === "" ||
      s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  function goSearch(stateCode: string) {
    sessionStorage.setItem("tcn_state", stateCode);
    sessionStorage.setItem("tcn_category", "Therapist");
    navigate("/find-therapist");
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.18_200)]/8 via-background to-background pointer-events-none" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <UserCheck className="w-4 h-4" />
              {(categoryCounts?.therapists ?? 38000).toLocaleString()}+ Verified Therapists · All 50 States
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Find a <span className="text-[oklch(0.45_0.18_200)]">Therapist</span> near you
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Licensed therapists provide talk therapy, counseling, and evidence-based treatment for anxiety, depression, trauma, relationships, and more. Browse verified therapists in every state and city — searchable by specialty, insurance, and telehealth availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/find-therapist?category=Therapist"
                className="flex items-center justify-center gap-2 bg-[oklch(0.55_0.18_200)] text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
                Search Therapists
              </Link>
              <Link
                href="/directory"
                className="flex items-center justify-center gap-2 bg-card border-2 border-[oklch(0.55_0.18_200)]/30 text-foreground font-semibold rounded-xl px-8 py-4 text-lg hover:border-[oklch(0.55_0.18_200)]/60 active:scale-95 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Browse by State
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is a therapist */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">What is a Therapist?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A therapist (also called a counselor or psychotherapist) is a licensed mental health professional who provides talk therapy and counseling. Most therapists hold a master's degree (MA, MS, MSW, MEd) in a mental health field and complete 2–3 years of supervised clinical practice before licensure.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Therapists use evidence-based approaches such as <strong className="text-foreground">Cognitive Behavioral Therapy (CBT)</strong>, <strong className="text-foreground">Dialectical Behavior Therapy (DBT)</strong>, <strong className="text-foreground">EMDR</strong>, and <strong className="text-foreground">Acceptance and Commitment Therapy (ACT)</strong> to help clients build coping skills, process emotions, and make meaningful changes in their lives. Therapists cannot prescribe medication — if medication is needed, they coordinate with a psychiatrist.
            </p>
            <div className="space-y-3">
              {[
                "Individual therapy for anxiety, depression, trauma, and more",
                "Couples and marriage counseling",
                "Family therapy and conflict resolution",
                "Group therapy and support groups",
                "Evidence-based modalities: CBT, DBT, EMDR, ACT, IFS",
                "Telehealth and in-person sessions available",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[oklch(0.55_0.18_200)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Common specialties</h3>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALTIES.map((s) => (
                <div key={s} className="flex items-center gap-2 bg-[oklch(0.55_0.18_200)]/5 rounded-lg px-3 py-2 text-xs font-medium text-foreground">
                  <Heart className="w-3 h-3 text-[oklch(0.55_0.18_200)] shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* License types */}
      <section className="bg-[oklch(0.55_0.18_200)]/5 py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">License types in our directory</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">All therapists hold active state licenses. License names vary by state.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {LICENSE_TYPES.map(({ code, label, detail }) => (
              <div key={code} className="bg-card border-2 border-[oklch(0.55_0.18_200)]/20 rounded-2xl p-5 hover:border-[oklch(0.55_0.18_200)]/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-[oklch(0.45_0.18_200)]">{code}</p>
                    <p className="text-xs font-medium text-foreground leading-tight">{label}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-foreground mb-3">Therapist vs. Psychiatrist vs. Psychologist</h2>
        <p className="text-muted-foreground mb-8">Understanding which type of provider is right for your needs.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-6 py-3 font-semibold text-foreground">Feature</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_200)]">Therapist</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_30)]">Psychiatrist</th>
                <th className="text-center px-4 py-3 font-semibold text-[oklch(0.45_0.18_280)]">Psychologist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Degree required", "Master's (MSW/MA/MEd)", "Medical (MD/DO)", "Doctoral (PhD/PsyD)"],
                ["Can prescribe medication", "✗", "✓", "✗ (most states)"],
                ["Psychological testing", "✗", "✗", "✓"],
                ["Provides talk therapy", "✓", "Some", "✓"],
                ["Typical session focus", "Therapy & coping skills", "Medication & diagnosis", "Assessment & therapy"],
                ["Average session cost", "$80–$200", "$200–$500", "$150–$350"],
              ].map(([feature, therapist, psych, psychologist]) => (
                <tr key={feature} className="hover:bg-muted/20">
                  <td className="px-6 py-3 font-medium text-foreground">{feature}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{therapist}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{psych}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{psychologist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/psychiatrists" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Browse Psychiatrists <ArrowRight className="w-4 h-4" />
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
              <h2 className="text-2xl font-bold text-foreground mb-1">Find Therapists by State</h2>
              <p className="text-muted-foreground text-sm">
                {(categoryCounts?.therapists ?? 38000).toLocaleString()}+ therapists across all 50 states
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
              <Loader2 className="w-8 h-8 text-[oklch(0.55_0.18_200)] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredStates.map((state) => {
                const count = stateMap.get(state.code) ?? 0;
                return (
                  <button
                    key={state.code}
                    onClick={() => goSearch(state.code)}
                    className="group bg-card border border-border rounded-xl p-4 text-left hover:border-[oklch(0.55_0.18_200)]/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)]">
                        {state.code}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[oklch(0.55_0.18_200)] transition-colors" />
                    </div>
                    <p className="font-medium text-foreground text-sm leading-tight mb-1">{state.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {count > 0 ? `${count.toLocaleString()} therapists` : "Browse therapists"}
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
              q: "How do I find the right therapist for me?",
              a: "Start by identifying what you want to work on (anxiety, relationships, trauma, etc.), then use the specialty and insurance filters to narrow your search. Many therapists offer a free 15-minute consultation — use it to assess fit before committing to sessions.",
            },
            {
              q: "What is the difference between a therapist and a counselor?",
              a: "The terms are often used interchangeably. 'Therapist' and 'counselor' both refer to licensed mental health professionals who provide talk therapy. The specific license type (LCSW, LPC, LMFT, etc.) varies by state but all require supervised clinical training and a state exam.",
            },
            {
              q: "Does insurance cover therapy?",
              a: "Most major insurance plans cover mental health therapy under the Mental Health Parity Act. Coverage varies by plan — use the insurance filter in our search to find therapists who accept your specific plan. Many therapists also offer sliding-scale fees for uninsured clients.",
            },
            {
              q: "Can I see a therapist online (telehealth)?",
              a: "Yes. Most therapists in our directory offer telehealth sessions via secure video. Use the 'Telehealth' filter in the search to find providers who offer virtual sessions. Telehealth therapy is just as effective as in-person for most conditions.",
            },
            {
              q: "When should I see a therapist vs. a psychiatrist?",
              a: "See a therapist if you want to work through emotions, develop coping skills, or process difficult experiences. See a psychiatrist if you think you may need medication for a mental health condition. Many people see both — a therapist for ongoing counseling and a psychiatrist for medication management.",
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
      <section className="bg-[oklch(0.55_0.18_200)]/8 py-16">
        <div className="container text-center max-w-xl mx-auto">
          <MessageCircle className="w-12 h-12 text-[oklch(0.55_0.18_200)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to find a therapist?</h2>
          <p className="text-muted-foreground mb-6">
            Search {(categoryCounts?.therapists ?? 38000).toLocaleString()}+ verified therapists across all 50 states. Filter by insurance, telehealth, and specialty.
          </p>
          <Link
            href="/find-therapist?category=Therapist"
            className="inline-flex items-center gap-2 bg-[oklch(0.55_0.18_200)] text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
            Search Therapists Now
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
