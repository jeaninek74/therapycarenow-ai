import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, MessageSquare, Search, BookOpen, Heart, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

type Step = "urgency" | "type" | "insurance" | "result";

interface TriageState {
  urgency: string;
  providerType: string;
  hasInsurance: string;
}

const URGENCY_OPTIONS = [
  {
    id: "crisis",
    label: "I'm in crisis right now",
    description: "Thoughts of self-harm, suicide, or immediate danger",
    color: "bg-red-50 border-red-300 hover:border-red-500",
    badge: "bg-red-100 text-red-700",
    icon: AlertTriangle,
    iconColor: "text-red-500",
  },
  {
    id: "urgent",
    label: "I need help soon",
    description: "Struggling significantly — within the next few days",
    color: "bg-orange-50 border-orange-300 hover:border-orange-500",
    badge: "bg-orange-100 text-orange-700",
    icon: Phone,
    iconColor: "text-orange-500",
  },
  {
    id: "routine",
    label: "I want to start therapy",
    description: "Looking for ongoing support or a new provider",
    color: "bg-green-50 border-green-300 hover:border-green-500",
    badge: "bg-green-100 text-green-700",
    icon: Heart,
    iconColor: "text-green-500",
  },
  {
    id: "explore",
    label: "Just exploring options",
    description: "Curious about mental health resources available to me",
    color: "bg-blue-50 border-blue-300 hover:border-blue-500",
    badge: "bg-blue-100 text-blue-700",
    icon: BookOpen,
    iconColor: "text-blue-500",
  },
];

const PROVIDER_TYPES = [
  {
    id: "therapist",
    label: "Therapist / Counselor",
    description: "Talk therapy, CBT, DBT, EMDR, and more",
    icon: "🧠",
  },
  {
    id: "psychiatrist",
    label: "Psychiatrist",
    description: "Medication management and psychiatric evaluation",
    icon: "💊",
  },
  {
    id: "psychologist",
    label: "Psychologist",
    description: "Psychological testing and evidence-based therapy",
    icon: "📋",
  },
  {
    id: "unsure",
    label: "I'm not sure",
    description: "Help me figure out what I need",
    icon: "❓",
  },
];

const INSURANCE_OPTIONS = [
  { id: "yes", label: "Yes, I have insurance", description: "I want to use my health insurance" },
  { id: "no", label: "No insurance", description: "I need low-cost or free options" },
  { id: "eap", label: "I have an EAP benefit", description: "Through my employer" },
  { id: "unsure", label: "Not sure", description: "I'll figure it out" },
];

function getRecommendation(state: TriageState) {
  if (state.urgency === "crisis") {
    return {
      title: "Please reach out for immediate support",
      description: "You don't have to face this alone. Crisis counselors are available 24/7 — free and confidential.",
      actions: [
        {
          label: "Call or Text 988",
          description: "Suicide & Crisis Lifeline — 24/7 free support",
          href: "tel:988",
          variant: "destructive" as const,
          icon: Phone,
          external: false,
        },
        {
          label: "Text HOME to 741741",
          description: "Crisis Text Line — text-based support",
          href: "sms:741741",
          variant: "outline" as const,
          icon: MessageSquare,
          external: false,
        },
        {
          label: "Find a Therapist",
          description: "Search providers accepting new patients",
          href: "/find-therapist",
          variant: "outline" as const,
          icon: Search,
          external: false,
        },
      ],
      urgencyLevel: "crisis",
    };
  }

  if (state.urgency === "urgent") {
    const category =
      state.providerType === "psychiatrist"
        ? "Psychiatrist"
        : state.providerType === "psychologist"
        ? "Psychologist"
        : "Therapist";
    return {
      title: "Let's find you someone quickly",
      description: "We'll search for providers with availability within 24–72 hours.",
      actions: [
        {
          label: `Find a ${category}`,
          description: "Filtered for urgent availability",
          href: `/find-therapist?category=${category}&urgency=within_72h`,
          variant: "default" as const,
          icon: Search,
          external: false,
        },
        {
          label: "Free Resources",
          description: "Crisis hotlines and immediate support",
          href: "/free-resources",
          variant: "outline" as const,
          icon: BookOpen,
          external: false,
        },
      ],
      urgencyLevel: "urgent",
    };
  }

  if (state.urgency === "routine") {
    const category =
      state.providerType === "psychiatrist"
        ? "Psychiatrist"
        : state.providerType === "psychologist"
        ? "Psychologist"
        : "Therapist";
    const insuranceFilter =
      state.hasInsurance === "no" ? "&cost=sliding_scale" : state.hasInsurance === "eap" ? "&cost=eap" : "";
    return {
      title: "Great — let's find your match",
      description: "Browse providers filtered to your needs. You can refine by location, specialty, and insurance.",
      actions: [
        {
          label: `Search ${category}s`,
          description: "Full directory with filters",
          href: `/find-therapist?category=${category}${insuranceFilter}`,
          variant: "default" as const,
          icon: Search,
          external: false,
        },
        {
          label: "Ask the Assistant",
          description: "Get personalized guidance",
          href: "/ai-assistant",
          variant: "outline" as const,
          icon: MessageSquare,
          external: false,
        },
      ],
      urgencyLevel: "routine",
    };
  }

  // explore
  return {
    title: "Here's where to start",
    description: "Explore our resources to learn about your options — no commitment needed.",
    actions: [
      {
        label: "Browse Providers",
        description: "Search therapists, psychiatrists, psychologists",
        href: "/find-therapist",
        variant: "default" as const,
        icon: Search,
        external: false,
      },
      {
        label: "Free Resources",
        description: "Community clinics, hotlines, and more",
        href: "/free-resources",
        variant: "outline" as const,
        icon: BookOpen,
        external: false,
      },
      {
        label: "Ask the Assistant",
        description: "Get answers to your questions",
        href: "/ai-assistant",
        variant: "outline" as const,
        icon: MessageSquare,
        external: false,
      },
    ],
    urgencyLevel: "explore",
  };
}

export default function Triage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("urgency");
  const [answers, setAnswers] = useState<Partial<TriageState>>({});

  const handleUrgency = (id: string) => {
    const updated = { ...answers, urgency: id };
    setAnswers(updated);
    if (id === "crisis") {
      setStep("result");
    } else {
      setStep("type");
    }
  };

  const handleType = (id: string) => {
    setAnswers((prev) => ({ ...prev, providerType: id }));
    setStep("insurance");
  };

  const handleInsurance = (id: string) => {
    setAnswers((prev) => ({ ...prev, hasInsurance: id }));
    setStep("result");
  };

  const stepNumber = step === "urgency" ? 1 : step === "type" ? 2 : step === "insurance" ? 3 : 4;
  const totalSteps = answers.urgency === "crisis" ? 1 : 3;

  const recommendation = step === "result" ? getRecommendation(answers as TriageState) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Get Help Now
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find the right support</h1>
          <p className="text-slate-500">Answer a few quick questions to get personalized recommendations.</p>
        </div>

        {/* Progress */}
        {step !== "result" && (
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i + 1 <= stepNumber ? "bg-teal-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step: Urgency */}
        {step === "urgency" && (
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">How urgent is your need?</h2>
            <div className="space-y-3">
              {URGENCY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleUrgency(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${opt.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${opt.iconColor}`} />
                      <div>
                        <div className="font-semibold text-slate-800">{opt.label}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{opt.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Provider Type */}
        {step === "type" && (
          <div>
            <button
              onClick={() => setStep("urgency")}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">What type of provider are you looking for?</h2>
            <div className="space-y-3">
              {PROVIDER_TYPES.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleType(opt.id)}
                  className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{opt.label}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{opt.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Insurance */}
        {step === "insurance" && (
          <div>
            <button
              onClick={() => setStep("type")}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Do you have insurance or benefits?</h2>
            <div className="space-y-3">
              {INSURANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleInsurance(opt.id)}
                  className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 transition-all"
                >
                  <div className="font-semibold text-slate-800">{opt.label}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && recommendation && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{recommendation.title}</h2>
                <p className="text-sm text-slate-500">{recommendation.description}</p>
              </div>
            </div>

            {recommendation.urgencyLevel === "crisis" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <strong>If you are in immediate danger, call 911.</strong> The resources below are free, confidential,
                    and available 24/7.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-8">
              {recommendation.actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} href={action.href}>
                    <div
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        action.variant === "destructive"
                          ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                          : i === 0
                          ? "bg-teal-600 border-teal-600 text-white hover:bg-teal-700"
                          : "bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{action.label}</div>
                          <div
                            className={`text-xs mt-0.5 ${
                              action.variant === "destructive" || i === 0 ? "text-white/80" : "text-slate-500"
                            }`}
                          >
                            {action.description}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => {
                setStep("urgency");
                setAnswers({});
              }}
              className="text-sm text-slate-400 hover:text-slate-600 underline"
            >
              Start over
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 text-center text-xs text-slate-400">
          TherapyCareNow is an informational platform — not a licensed healthcare provider.{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
