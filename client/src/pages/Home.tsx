import { Link } from "wouter";
import { Heart, Phone, Search, Briefcase, BookOpen, Shield, ChevronRight } from "lucide-react";
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
              TherapyCareNow helps you quickly find crisis resources, therapists, insurance coverage, and free support — without providing clinical advice. Your safety comes first, always.
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
                Find a Therapist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick access cards */}
      <section className="container py-16">
        <h2 className="text-2xl font-semibold text-foreground mb-8">What do you need?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard
            href="/triage"
            icon={<Phone className="w-6 h-6 text-destructive" />}
            title="Get Help Now"
            description="Answer 5 quick questions to find the right support level for your situation."
            color="destructive"
          />
          <QuickCard
            href="/find-therapist"
            icon={<Search className="w-6 h-6 text-primary" />}
            title="Find a Therapist"
            description="Search providers by insurance, specialty, telehealth, and availability."
            color="primary"
          />
          <QuickCard
            href="/benefits"
            icon={<Briefcase className="w-6 h-6 text-[oklch(0.58_0.12_155)]" />}
            title="Benefits Wallet"
            description="Save your insurance and employer EAP info to speed up matching."
            color="secondary"
          />
          <QuickCard
            href="/free-resources"
            icon={<BookOpen className="w-6 h-6 text-[oklch(0.68_0.10_280)]" />}
            title="Free & Low-Cost Help"
            description="Community clinics, hotlines, and sliding scale providers near you."
            color="accent"
          />
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

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold text-foreground mb-10 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Tell us your situation"
              description="Answer 5 simple yes/no questions. Our system — not AI — determines your urgency level."
            />
            <Step
              number="2"
              title="Get routed to the right help"
              description="Crisis resources, urgent support, or therapist search — based on your answers."
            />
            <Step
              number="3"
              title="Connect with real support"
              description="Call, text, or book directly with providers. We never replace professional care."
            />
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
            <span>TherapyCareNow AI · All 50 states</span>
          </div>
          <div className="flex gap-6">
            <Link href="/settings" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/settings" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
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
