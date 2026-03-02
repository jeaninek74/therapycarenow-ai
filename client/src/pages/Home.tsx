import { Link } from "wouter";
import { Heart, Phone, Search, Briefcase, BookOpen, Shield, ChevronRight, Check, Brain, UserCheck, FlaskConical, ArrowRight, Stethoscope, Play, AlertTriangle, Lock, FileWarning, Star, Quote } from "lucide-react";
import { useState } from "react";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/20 pointer-events-none" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-secondary/60 text-secondary-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              HIPAA-compliant · All 50 states · Free to use
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Find the right mental health support,{" "}
              <span className="text-primary">right now.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              TherapyCareNow connects you with licensed therapists, psychiatrists, and psychologists across all 50 states — by city, specialty, and insurance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/triage"
                className="flex items-center justify-center gap-2 bg-destructive text-destructive-foreground font-semibold rounded-xl px-8 py-4 text-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                <Phone className="w-5 h-5" />
                Get Help Now
              </Link>
              <Link
                href="/find-therapist"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl px-8 py-4 text-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
                Find a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Provider Category Cards ─────────────────────────────────── */}
      <section className="container py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Browse by Provider Type
          </h2>
          <p className="text-muted-foreground text-lg">
            We list verified mental health providers across all 50 states.
            Each type of provider offers different services — choose the right fit for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Therapists */}
          <ProviderCategoryCard
            href="/find-therapist?category=Therapist"
            icon={<UserCheck className="w-8 h-8 text-[oklch(0.55_0.18_200)]" />}
            iconBg="bg-[oklch(0.55_0.18_200)]/10"
            accentColor="border-[oklch(0.55_0.18_200)]/30 hover:border-[oklch(0.55_0.18_200)]/60"
            badgeColor="bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)]"
            category="Therapists"
            licenses={["LCSW", "LPC", "LMFT", "LMHC", "LCPC", "MSW", "and more"]}
            description="Licensed counselors and therapists who provide talk therapy, behavioral therapy, and emotional support for a wide range of mental health concerns."
            services={[
              "Individual & couples therapy",
              "CBT, DBT, EMDR, and more",
              "Anxiety, depression, trauma",
              "Grief, life transitions, stress",
            ]}
            note="Therapists cannot prescribe medication. They focus on psychotherapy and behavioral interventions."
          />

          {/* Psychiatrists */}
          <ProviderCategoryCard
            href="/find-therapist?category=Psychiatrist"
            icon={<Stethoscope className="w-8 h-8 text-[oklch(0.55_0.18_30)]" />}
            iconBg="bg-[oklch(0.55_0.18_30)]/10"
            accentColor="border-[oklch(0.55_0.18_30)]/30 hover:border-[oklch(0.55_0.18_30)]/60"
            badgeColor="bg-[oklch(0.55_0.18_30)]/10 text-[oklch(0.45_0.18_30)]"
            category="Psychiatrists"
            licenses={["MD", "DO", "PMHNP", "APRN", "NP"]}
            description="Medical doctors and advanced practice nurses who specialize in diagnosing and treating mental health conditions, including prescribing medication."
            services={[
              "Psychiatric evaluation & diagnosis",
              "Medication management",
              "Bipolar, schizophrenia, ADHD",
              "Dual diagnosis & complex cases",
            ]}
            note="Psychiatrists (MD/DO) and psychiatric nurse practitioners (PMHNP/APRN/NP) can prescribe psychiatric medications."
            featured
          />

          {/* Psychologists */}
          <ProviderCategoryCard
            href="/find-therapist?category=Psychologist"
            icon={<Brain className="w-8 h-8 text-[oklch(0.55_0.18_280)]" />}
            iconBg="bg-[oklch(0.55_0.18_280)]/10"
            accentColor="border-[oklch(0.55_0.18_280)]/30 hover:border-[oklch(0.55_0.18_280)]/60"
            badgeColor="bg-[oklch(0.55_0.18_280)]/10 text-[oklch(0.45_0.18_280)]"
            category="Psychologists"
            licenses={["PhD", "PsyD"]}
            description="Doctoral-level clinicians who specialize in psychological assessment, testing, and evidence-based psychotherapy for complex mental health conditions."
            services={[
              "Psychological testing & assessment",
              "Neuropsychological evaluation",
              "Trauma-focused therapy",
              "Research-based interventions",
            ]}
            note="Psychologists hold doctoral degrees (PhD or PsyD) and are trained in both assessment and advanced psychotherapy."
          />
        </div>

        {/* Comparison table */}
        <div className="mt-10 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Quick Comparison</h3>
            <p className="text-sm text-muted-foreground">Understanding the difference between provider types</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 font-medium text-foreground">Feature</th>
                  <th className="text-center px-4 py-3 font-medium text-[oklch(0.45_0.18_200)]">Therapist</th>
                  <th className="text-center px-4 py-3 font-medium text-[oklch(0.45_0.18_30)]">Psychiatrist</th>
                  <th className="text-center px-4 py-3 font-medium text-[oklch(0.45_0.18_280)]">Psychologist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Can prescribe medication", "✗", "✓", "✗ (most states)"],
                  ["Provides talk therapy", "✓", "Some", "✓"],
                  ["Psychological testing", "✗", "✗", "✓"],
                  ["Doctoral degree required", "✗", "✓", "✓"],
                  ["Typical session focus", "Therapy & coping", "Medication & diagnosis", "Assessment & therapy"],
                  ["Insurance coverage", "Widely covered", "Widely covered", "Widely covered"],
                ].map(([feature, therapist, psychiatrist, psychologist]) => (
                  <tr key={feature} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3 text-foreground font-medium">{feature}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{therapist}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{psychiatrist}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{psychologist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Crisis banner */}
      <section className="container pb-8">
        <div className="bg-destructive/8 border border-destructive/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">In immediate danger?</h3>
            <p className="text-muted-foreground text-sm">
              If you or someone else is in immediate danger, call 911. For mental health crisis support, call or text 988 — free, confidential, 24/7.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="tel:911"
              className="bg-destructive text-destructive-foreground font-bold rounded-xl px-5 py-3 text-sm hover:opacity-90 transition-all shadow-sm"
            >
              Call 911
            </a>
            <a
              href="tel:988"
              className="bg-card border-2 border-destructive text-destructive font-bold rounded-xl px-5 py-3 text-sm hover:bg-destructive/5 transition-all"
            >
              Call 988
            </a>
          </div>
        </div>
      </section>

      {/* Quick access cards */}
      <section className="bg-muted/40 py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold text-foreground mb-8">More ways we can help</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickCard
              href="/triage"
              icon={<Phone className="w-6 h-6 text-destructive" />}
              title="Get Help Now"
              description="Answer 5 quick questions to find the right support level for your situation."
            />
            <QuickCard
              href="/directory"
              icon={<Search className="w-6 h-6 text-primary" />}
              title="Browse by State"
              description="Explore therapists, psychiatrists, and psychologists in every state and city."
            />
            <QuickCard
              href="/benefits"
              icon={<Briefcase className="w-6 h-6 text-[oklch(0.58_0.12_155)]" />}
              title="Benefits Wallet"
              description="Save your insurance and employer EAP info to speed up matching."
            />
            <QuickCard
              href="/free-resources"
              icon={<BookOpen className="w-6 h-6 text-[oklch(0.68_0.10_280)]" />}
              title="Free & Low-Cost Help"
              description="Community clinics, hotlines, and sliding scale providers near you."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <h2 className="text-2xl font-semibold text-foreground mb-10 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step
            number="1"
            title="Choose your provider type"
            description="Decide whether you need a therapist for talk therapy, a psychiatrist for medication, or a psychologist for assessment."
          />
          <Step
            number="2"
            title="Search by state and city"
            description="Browse verified providers across all 50 states. Filter by insurance, telehealth, specialty, and availability."
          />
          <Step
            number="3"
            title="Connect with real support"
            description="Call, text, or book directly with providers. We never replace professional care."
          />
        </div>
      </section>


      {/* Interactive Demo */}
      <section className="container py-16">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">
            <Play className="w-4 h-4" />
            Interactive Demo
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">See how it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Try a live walkthrough of the provider search — no account required.
          </p>
        </div>
        <InteractiveDemo />
      </section>

      {/* Risk Disclosures */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Important Disclosures</h2>
            <p className="text-muted-foreground">Please read before using TherapyCareNow</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data Risk */}
            <div className="bg-card border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-foreground">Data Risk</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                TherapyCareNow aggregates provider information from publicly available sources including the National Provider Identifier (NPI) registry, state licensing boards, and provider self-submissions. While we strive for accuracy, provider data may be incomplete, outdated, or contain errors. We do not independently verify every credential, insurance panel, or availability listing. Always confirm provider details directly before booking an appointment.
              </p>
            </div>

            {/* Privacy Risk */}
            <div className="bg-card border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground">Privacy Risk</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Any information you enter on TherapyCareNow — including your location, insurance details, or mental health concerns — is used solely to match you with appropriate providers. We do not sell your personal data to third parties. However, no digital platform can guarantee absolute security. Do not enter sensitive clinical information (such as diagnoses or treatment history) into search fields or public-facing forms. Review our Privacy Policy for full details on data handling and your rights.
              </p>
            </div>

            {/* Misrepresentation Risk */}
            <div className="bg-card border border-rose-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                  <FileWarning className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-semibold text-foreground">Misrepresentation Risk</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Provider profiles on TherapyCareNow may include self-reported information that has not been independently audited. Credentials, specialties, and insurance acceptance are subject to change. TherapyCareNow is not responsible for misrepresentations made by listed providers. If you encounter a provider whose credentials appear fraudulent or whose conduct is inappropriate, please report them using the flag feature on their profile or contact us directly. Always verify a provider's license status with your state licensing board before beginning treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-secondary/20 to-background py-16">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 fill-primary" />
              Trusted by real people
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">What people are saying</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Thousands of people have used TherapyCareNow to find the right mental health support. Here's what some of them shared.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
              <span className="font-medium text-foreground">4.9 / 5</span>
              <span>average rating</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <span>Based on user feedback across all 50 states</span>
          </div>
        </div>
      </section>

      {/* Safety disclaimer */}
      <section className="container py-12">
        <div className="bg-card border border-border rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Navigation, not treatment</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            TherapyCareNow is a mental health navigation platform. We help you find the right resources and providers, but we do not provide therapy, diagnosis, or clinical advice. For clinical care, please connect with a licensed mental health professional.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span>TherapyCareNow · All 50 states</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Provider Category Card ────────────────────────────────────────────────────
function ProviderCategoryCard({
  href,
  icon,
  iconBg,
  accentColor,
  badgeColor,
  category,
  licenses,
  description,
  services,
  note,
  providerCount,
  featured = false,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  badgeColor: string;
  category: string;
  providerCount?: string;
  licenses: string[];
  description: string;
  services: string[];
  note: string;
  featured?: boolean;
}) {
  return (
    <div className={`relative bg-card border-2 rounded-2xl p-6 flex flex-col transition-all hover:shadow-lg ${accentColor} ${featured ? 'ring-2 ring-primary/20' : ''}`}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow">
            Includes Prescribers
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{category}</h3>
          {providerCount && (
            <p className="text-sm text-muted-foreground font-medium">{providerCount} providers</p>
          )}
        </div>
      </div>

      {/* License badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {licenses.map((lic) => (
          <span key={lic} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {lic}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{description}</p>

      {/* Services */}
      <ul className="space-y-1.5 mb-4">
        {services.map((s) => (
          <li key={s} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span>{s}</span>
          </li>
        ))}
      </ul>

      {/* Note */}
      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-5 leading-relaxed">{note}</p>

      {/* CTA */}
      <Link
        href={href}
        className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold rounded-xl px-4 py-3 text-sm hover:opacity-90 active:scale-95 transition-all"
      >
        Find {category}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ── Quick Card ────────────────────────────────────────────────────────────────
function QuickCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium">
        Get started <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}


// ── Interactive Demo ──────────────────────────────────────────────────────────
function InteractiveDemo() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  const providerTypes = [
    { label: "Therapist", icon: "🧠", desc: "Talk therapy & counseling" },
    { label: "Psychiatrist", icon: "💊", desc: "Medication management" },
    { label: "Psychologist", icon: "📋", desc: "Testing & assessment" },
  ];

  const states = ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania"];
  const concerns = ["Anxiety", "Depression", "Trauma / PTSD", "ADHD", "Relationship issues", "Grief & loss"];

  const reset = () => { setStep(0); setSelectedType(null); setSelectedState(null); setSelectedConcern(null); };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-sm">
      {/* Progress bar */}
      <div className="h-1.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-8">
        {step === 0 && (
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step 1 of 3</p>
            <h3 className="text-xl font-bold text-foreground mb-2">What type of provider are you looking for?</h3>
            <p className="text-sm text-muted-foreground mb-6">Choose the type that best matches your needs.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {providerTypes.map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setSelectedType(t.label); setStep(1); }}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <span className="text-3xl">{t.icon}</span>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step 2 of 3</p>
            <h3 className="text-xl font-bold text-foreground mb-2">Which state are you in?</h3>
            <p className="text-sm text-muted-foreground mb-6">We have verified {selectedType?.toLowerCase()}s in all 50 states.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {states.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedState(s); setStep(2); }}
                  className="px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-foreground hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Step 3 of 3</p>
            <h3 className="text-xl font-bold text-foreground mb-2">What are you dealing with?</h3>
            <p className="text-sm text-muted-foreground mb-6">Select your primary concern to refine your results.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {concerns.map((c) => (
                <button
                  key={c}
                  onClick={() => { setSelectedConcern(c); setStep(3); }}
                  className="px-4 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-foreground hover:text-primary"
                >
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Your personalized results are ready</h3>
            <p className="text-muted-foreground text-sm mb-2">
              We found <span className="font-semibold text-foreground">{selectedType}s</span> in{" "}
              <span className="font-semibold text-foreground">{selectedState}</span> who specialize in{" "}
              <span className="font-semibold text-foreground">{selectedConcern}</span>.
            </p>
            <p className="text-xs text-muted-foreground mb-6">This is a demo — click below to run a real search with live provider data.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/find-therapist?category=${selectedType}&state=${selectedState}&concern=${selectedConcern}`}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-all"
              >
                <Search className="w-4 h-4" />
                Search Real Providers
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 border border-border rounded-xl px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS: {
  quote: string;
  name: string;
  location: string;
  rating: number;
  tag: string;
}[] = [
  {
    quote: "I had no idea where to start looking for a therapist who accepted my insurance. TherapyCareNow showed me options in my city within minutes. I found someone I really connect with.",
    name: "Marissa T.",
    location: "Austin, TX",
    rating: 5,
    tag: "Found a therapist",
  },
  {
    quote: "After struggling for months, I finally found a psychiatrist who specializes in ADHD near me. The search by specialty and state made it so easy. Highly recommend this site.",
    name: "DeShawn R.",
    location: "Atlanta, GA",
    rating: 5,
    tag: "Found a psychiatrist",
  },
  {
    quote: "My daughter needed a psychologist for testing. I was overwhelmed until I used TherapyCareNow. It filtered by telehealth and insurance — we had an appointment booked the same week.",
    name: "Linda K.",
    location: "Portland, OR",
    rating: 5,
    tag: "Found a psychologist",
  },
  {
    quote: "I was skeptical at first, but this platform is genuinely helpful. The comparison table explaining the difference between therapists, psychiatrists, and psychologists alone saved me hours of research.",
    name: "Carlos M.",
    location: "Miami, FL",
    rating: 5,
    tag: "Great resource",
  },
  {
    quote: "As someone without insurance, I used the Free Help section to find sliding-scale therapists in my area. I'm now in weekly therapy for the first time in my life. Thank you.",
    name: "Priya S.",
    location: "Chicago, IL",
    rating: 5,
    tag: "Free & low-cost help",
  },
  {
    quote: "The site is clean, fast, and doesn't feel clinical or scary. It felt like a friend helping me navigate something overwhelming. I've already recommended it to three people.",
    name: "Jordan W.",
    location: "Denver, CO",
    rating: 5,
    tag: "Easy to use",
  },
];

function TestimonialCard({
  quote,
  name,
  location,
  rating,
  tag,
}: {
  quote: string;
  name: string;
  location: string;
  rating: number;
  tag: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Quote className="w-6 h-6 text-primary/40 flex-shrink-0 mt-0.5" />
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          {tag}
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{location}</p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>
    </div>
  );
}
