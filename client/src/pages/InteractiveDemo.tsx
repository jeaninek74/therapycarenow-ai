import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import {
  ChevronRight, ChevronLeft, Play, Search, Heart, Brain,
  Shield, MapPin, Phone, Star, CheckCircle, Users, FileText,
  Lock, Globe, ArrowRight, X, Sparkles
} from "lucide-react";

const DEMO_STEPS = [
  {
    id: "welcome",
    title: "Welcome to TherapyCareNow",
    subtitle: "Your National Mental Health Navigation Platform",
    description: "TherapyCareNow connects millions of Americans to mental health support — from crisis resources to licensed therapists across all 50 states. Let's walk through the key features.",
    icon: Heart,
    color: "from-teal-500 to-cyan-600",
    stats: [
      { label: "Providers Nationwide", value: "17,000+" },
      { label: "States Covered", value: "All 50" },
      { label: "Insurance Networks", value: "200+" },
      { label: "Specialties", value: "60+" },
    ],
    cta: "Start Demo",
    visual: "welcome",
  },
  {
    id: "find-therapist",
    title: "Find a Therapist",
    subtitle: "Powerful Search Across All 50 States",
    description: "Search by state, city, specialty, insurance, telehealth availability, and cost. Our directory covers every major city and hundreds of smaller communities nationwide.",
    icon: Search,
    color: "from-blue-500 to-indigo-600",
    demoContent: {
      type: "search",
      filters: [
        { label: "State", value: "California" },
        { label: "City", value: "Los Angeles" },
        { label: "Specialty", value: "Anxiety & Depression" },
        { label: "Insurance", value: "Aetna" },
        { label: "Telehealth", value: "Available" },
      ],
      results: [
        {
          name: "Dr. Sarah Chen, PsyD",
          city: "Los Angeles, CA",
          specialty: "Anxiety, Depression, CBT",
          insurance: "Aetna, BCBS, Cigna",
          telehealth: true,
          fee: "$45 copay",
          verified: true,
          rating: 4.9,
          photo: "https://api.dicebear.com/7.x/personas/svg?seed=sarah-chen&backgroundColor=b6e3f4",
        },
        {
          name: "Marcus Williams, LCSW",
          city: "Los Angeles, CA",
          specialty: "Trauma, PTSD, EMDR",
          insurance: "UnitedHealth, Cigna",
          telehealth: true,
          fee: "$60–$120 sliding scale",
          verified: true,
          rating: 4.8,
          photo: "https://api.dicebear.com/7.x/personas/svg?seed=marcus-williams&backgroundColor=d1d4f9",
        },
        {
          name: "Dr. Priya Sharma, PhD",
          city: "Santa Monica, CA",
          specialty: "OCD, Anxiety, ERP",
          insurance: "Aetna, Medicare",
          telehealth: false,
          fee: "$150/session",
          verified: true,
          rating: 5.0,
          photo: "https://api.dicebear.com/7.x/personas/svg?seed=priya-sharma&backgroundColor=ffd5dc",
        },
      ],
    },
    cta: "Next: Provider Profile",
    visual: "search",
  },
  {
    id: "provider-profile",
    title: "Detailed Provider Profiles",
    subtitle: "Everything You Need to Choose the Right Therapist",
    description: "Each profile includes credentials, specialties, accepted insurance, session fees, availability, languages spoken, education, and a verified badge — so you can make an informed decision.",
    icon: Star,
    color: "from-purple-500 to-pink-600",
    demoContent: {
      type: "profile",
      provider: {
        name: "Dr. Sarah Chen, PsyD",
        photo: "https://api.dicebear.com/7.x/personas/svg?seed=sarah-chen&backgroundColor=b6e3f4",
        licenseType: "PsyD",
        licenseState: "CA",
        licenseNumber: "PSY29847",
        verified: true,
        city: "Los Angeles",
        state: "CA",
        telehealth: true,
        inPerson: true,
        fee: "$45 copay",
        languages: ["English", "Mandarin"],
        specialties: ["Anxiety", "Depression", "CBT", "Mindfulness", "Stress Management"],
        insurance: ["Aetna", "BCBS", "Cigna", "UnitedHealth", "Kaiser"],
        education: [
          { degree: "PsyD", school: "UCLA", year: 2014 },
          { degree: "BA Psychology", school: "UC Berkeley", year: 2010 },
        ],
        yearsExp: 12,
        bio: "I specialize in evidence-based treatments for anxiety and depression, using CBT and mindfulness approaches. I create a warm, non-judgmental space where clients can explore their thoughts and develop practical coping skills.",
        availability: "within_72h",
        acceptsNew: true,
      },
    },
    cta: "Next: National Directory",
    visual: "profile",
  },
  {
    id: "directory",
    title: "National Therapist Directory",
    subtitle: "Browse All 50 States & Hundreds of Cities",
    description: "Our directory is organized by state and city, making it easy to find providers near you. Every state has hundreds of verified providers across all major cities and communities.",
    icon: Globe,
    color: "from-green-500 to-teal-600",
    demoContent: {
      type: "directory",
      states: [
        { name: "California", abbr: "CA", count: 400, cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"] },
        { name: "Texas", abbr: "TX", count: 400, cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"] },
        { name: "New York", abbr: "NY", count: 400, cities: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"] },
        { name: "Florida", abbr: "FL", count: 400, cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"] },
        { name: "Illinois", abbr: "IL", count: 400, cities: ["Chicago", "Aurora", "Naperville", "Rockford", "Joliet"] },
        { name: "Pennsylvania", abbr: "PA", count: 400, cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"] },
      ],
    },
    cta: "Next: Benefits Wallet",
    visual: "directory",
  },
  {
    id: "benefits",
    title: "Benefits Wallet",
    subtitle: "Know Your Mental Health Coverage",
    description: "Enter your insurance information to see what mental health benefits you have. Look up your employer's EAP (Employee Assistance Program) for free sessions.",
    icon: Shield,
    color: "from-orange-500 to-amber-600",
    demoContent: {
      type: "benefits",
      insurance: {
        carrier: "Aetna",
        plan: "Aetna Choice POS II",
        memberId: "W123456789",
        benefits: {
          sessions: "30 sessions/year",
          copay: "$45 per session",
          deductible: "$500 (met)",
          outOfPocket: "$2,000 max",
          telehealth: "Covered at same copay",
          inNetwork: "Yes",
        },
      },
      eap: {
        employer: "Acme Corporation",
        provider: "Cigna EAP",
        freeSessions: 8,
        phone: "1-800-555-0123",
        website: "eap.cigna.com",
      },
    },
    cta: "Next: Assistant",
    visual: "benefits",
  },
  {
    id: "ai-assistant",
    title: "Support Assistant",
    subtitle: "Guidance, Not Diagnosis",
    description: "Our assistant helps you navigate mental health resources, understand your options, and find the right support — with clear disclaimers that it's not a substitute for professional care.",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    demoContent: {
      type: "chat",
      messages: [
        {
          role: "user",
          text: "I've been feeling really anxious lately and I'm not sure where to start.",
        },
        {
          role: "assistant",
          text: "I hear you — feeling anxious and not knowing where to turn can be overwhelming. I'm here to help you find the right resources.\n\nA few things that might help:\n\n**1. Find a therapist** who specializes in anxiety — we have thousands of providers across all 50 states.\n\n**2. Check your benefits** — many insurance plans cover therapy with a low copay, and your employer may offer free EAP sessions.\n\n**3. Free resources** — if cost is a concern, we have free and sliding-scale options in your area.\n\nWould you like me to help you search for therapists near you?",
        },
        {
          role: "user",
          text: "Yes, I'm in Chicago and have BCBS insurance.",
        },
        {
          role: "assistant",
          text: "Great! Chicago has excellent mental health resources. With BCBS, you likely have good in-network coverage.\n\nI found **47 BCBS-accepting therapists** in Chicago specializing in anxiety. Many have availability within the week, and several offer telehealth.\n\n*Disclaimer: I'm an informational tool, not a licensed therapist. For emergencies, call 988 or 911.*",
        },
      ],
    },
    cta: "Next: Security & Privacy",
    visual: "chat",
  },
  {
    id: "security",
    title: "Security & Privacy",
    subtitle: "HIPAA-Aligned, Privacy-First Design",
    description: "TherapyCareNow is built with privacy and security at its core — no raw health data stored, rate-limited APIs, encrypted sessions, and full consent management.",
    icon: Lock,
    color: "from-slate-600 to-gray-700",
    demoContent: {
      type: "security",
      features: [
        { label: "HIPAA-Aligned Audit Logging", desc: "Event type and timestamp only — no raw health text ever stored" },
        { label: "Rate-Limited Auth", desc: "Max 5 login attempts per 15 minutes per IP" },
        { label: "HttpOnly Secure Cookies", desc: "Session tokens never accessible to JavaScript" },
        { label: "Helmet Security Headers", desc: "CSP, HSTS, X-Frame-Options, and more" },
        { label: "Consent Management", desc: "Explicit consent required before saving any health data" },
        { label: "Safety Gateway", desc: "All inputs screened before processing" },
        { label: "Provider Verification", desc: "NPI + state license cross-check for all listed therapists" },
        { label: "No PII in Logs", desc: "Audit logs contain only structured metadata" },
      ],
    },
    cta: "Get Started",
    visual: "security",
  },
];

function WelcomeVisual({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-3xl font-bold text-white">{s.value}</div>
          <div className="text-sm text-white/80 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function SearchVisual({ content }: { content: any }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-3">
        {content.filters.map((f: any, i: number) => (
          <Badge key={i} className="bg-white/20 text-white border-white/30 text-xs">
            {f.label}: {f.value}
          </Badge>
        ))}
      </div>
      <div className="space-y-2">
        {content.results.map((r: any, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm flex items-start gap-3">
            <img src={r.photo} alt={r.name} className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium text-sm">{r.name}</span>
                {r.verified && <CheckCircle className="w-3 h-3 text-green-300 flex-shrink-0" />}
                <span className="text-yellow-300 text-xs">★ {r.rating}</span>
              </div>
              <div className="text-white/70 text-xs mt-0.5">{r.specialty}</div>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-white/60 text-xs">{r.fee}</span>
                {r.telehealth && <Badge className="bg-teal-500/30 text-teal-200 border-0 text-xs py-0">Telehealth</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileVisual({ content }: { content: any }) {
  const p = content.provider;
  return (
    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
      <div className="flex items-start gap-3">
        <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-full bg-white/20 flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{p.name}</span>
            <CheckCircle className="w-4 h-4 text-green-300" />
          </div>
          <div className="text-white/70 text-sm">{p.licenseType} · {p.city}, {p.state}</div>
          <div className="text-white/60 text-xs">{p.yearsExp} years experience</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/10 rounded p-2">
          <div className="text-white/60">Languages</div>
          <div className="text-white">{p.languages.join(", ")}</div>
        </div>
        <div className="bg-white/10 rounded p-2">
          <div className="text-white/60">Session Fee</div>
          <div className="text-white">{p.fee}</div>
        </div>
      </div>
      <div>
        <div className="text-white/60 text-xs mb-1">Specialties</div>
        <div className="flex flex-wrap gap-1">
          {p.specialties.map((s: string, i: number) => (
            <Badge key={i} className="bg-white/20 text-white border-0 text-xs py-0">{s}</Badge>
          ))}
        </div>
      </div>
      <div>
        <div className="text-white/60 text-xs mb-1">Insurance</div>
        <div className="flex flex-wrap gap-1">
          {p.insurance.slice(0, 4).map((ins: string, i: number) => (
            <Badge key={i} className="bg-white/10 text-white/80 border-white/20 text-xs py-0">{ins}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function DirectoryVisual({ content }: { content: any }) {
  return (
    <div className="space-y-2">
      {content.states.map((s: any, i: number) => (
        <div key={i} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium text-sm">{s.name}</span>
            <Badge className="bg-white/20 text-white border-0 text-xs">{s.count}+ providers</Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {s.cities.map((c: string, j: number) => (
              <span key={j} className="text-white/60 text-xs bg-white/5 rounded px-1.5 py-0.5">{c}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BenefitsVisual({ content }: { content: any }) {
  return (
    <div className="space-y-3">
      <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-orange-300" />
          <span className="text-white font-medium text-sm">{content.insurance.carrier}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(content.insurance.benefits).map(([k, v]: any, i) => (
            <div key={i} className="bg-white/10 rounded p-1.5">
              <div className="text-white/50 text-xs capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
              <div className="text-white text-xs font-medium">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-amber-300" />
          <span className="text-white font-medium text-sm">EAP: {content.eap.employer}</span>
        </div>
        <div className="text-white/80 text-sm">
          <span className="text-amber-300 font-bold">{content.eap.freeSessions} free sessions</span> through {content.eap.provider}
        </div>
        <div className="flex items-center gap-1 mt-1 text-white/60 text-xs">
          <Phone className="w-3 h-3" /> {content.eap.phone}
        </div>
      </div>
    </div>
  );
}

function ChatVisual({ content }: { content: any }) {
  const [visibleCount, setVisibleCount] = useState(1);
  
  useEffect(() => {
    if (visibleCount < content.messages.length) {
      const timer = setTimeout(() => setVisibleCount(v => v + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, content.messages.length]);
  
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {content.messages.slice(0, visibleCount).map((m: any, i: number) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed ${
            m.role === 'user'
              ? 'bg-white/20 text-white rounded-br-sm'
              : 'bg-white/10 text-white/90 rounded-bl-sm'
          }`}>
            {m.text.split('\n').map((line: string, j: number) => (
              <p key={j} className={line.startsWith('**') ? 'font-semibold' : ''}>
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}



function SecurityVisual({ content }: { content: any }) {
  return (
    <div className="space-y-1.5">
      {content.features.map((f: any, i: number) => (
        <div key={i} className="flex items-start gap-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
          <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-white text-xs font-medium">{f.label}</div>
            <div className="text-white/60 text-xs">{f.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepVisual({ step }: { step: typeof DEMO_STEPS[0] }) {
  const content = (step as any).demoContent;
  if (!content) return <WelcomeVisual stats={(step as any).stats} />;
  switch (content.type) {
    case "search": return <SearchVisual content={content} />;
    case "profile": return <ProfileVisual content={content} />;
    case "directory": return <DirectoryVisual content={content} />;
    case "benefits": return <BenefitsVisual content={content} />;
    case "chat": return <ChatVisual content={content} />;
    case "security": return <SecurityVisual content={content} />;
    default: return null;
  }
}

export default function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const step = DEMO_STEPS[currentStep];
  const Icon = step.icon;

  const goNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) setCurrentStep(s => s + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => {
          if (s >= DEMO_STEPS.length - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 6000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Interactive Platform Demo
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            See TherapyCareNow in Action
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
            Explore every feature of the platform — from finding a therapist to benefits, AI assistance, and security — in this guided walkthrough.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => { setCurrentStep(0); setIsPlaying(true); }}
              className="bg-teal-500 hover:bg-teal-400 text-white gap-2"
            >
              <Play className="w-4 h-4" /> Auto-Play Demo
            </Button>
            {isPlaying && (
              <Button
                onClick={() => setIsPlaying(false)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 gap-2"
              >
                <X className="w-4 h-4" /> Stop
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-slate-900 border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {DEMO_STEPS.map((s, i) => {
              const SIcon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    i === currentStep
                      ? 'bg-teal-500 text-white'
                      : i < currentStep
                      ? 'bg-teal-900/50 text-teal-400'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                  }`}
                >
                  <SIcon className="w-3 h-3" />
                  {s.title.split(' ').slice(0, 2).join(' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Demo Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`rounded-2xl bg-gradient-to-br ${step.color} overflow-hidden shadow-2xl`}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Info */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white/70 text-sm">{step.subtitle}</div>
                    <h2 className="text-white text-xl font-bold">{step.title}</h2>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
              
              <div className="mt-6 flex items-center gap-3">
                <Button
                  onClick={goPrev}
                  disabled={currentStep === 0}
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex gap-1 flex-1 justify-center">
                  {DEMO_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentStep ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                
                {currentStep < DEMO_STEPS.length - 1 ? (
                  <Button
                    onClick={goNext}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1"
                  >
                    {step.cta.replace('Next: ', '')} <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Link href="/find-therapist">
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90 gap-1">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Right: Visual */}
            <div className="p-6 bg-black/20 overflow-y-auto max-h-[480px]">
              <StepVisual step={step} />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Find a Therapist", href: "/find-therapist", icon: Search, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Therapist Directory", href: "/directory", icon: Globe, color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Benefits Wallet", href: "/benefits", icon: Shield, color: "bg-orange-50 text-orange-700 border-orange-200" },
            { label: "Free Resources", href: "/free-resources", icon: Heart, color: "bg-teal-50 text-teal-700 border-teal-200" },
          ].map((link, i) => {
            const LIcon = link.icon;
            return (
              <Link key={i} href={link.href}>
                <Card className={`border cursor-pointer hover:shadow-md transition-shadow ${link.color}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <LIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        
        {/* Stats Bar */}
        <div className="mt-6 bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "17,000+", label: "Licensed Providers" },
              { value: "All 50", label: "States Covered" },
              { value: "200+", label: "Insurance Networks" },
              { value: "Free", label: "For Patients" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-teal-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
