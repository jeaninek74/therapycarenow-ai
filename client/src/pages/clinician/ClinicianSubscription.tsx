import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock, CreditCard, ExternalLink, Lock, Shield, Sparkles, Zap } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

const PLAN_FEATURES = [
  "AI-assisted SOAP/DAP note generation",
  "Smart treatment planning with intervention suggestions",
  "Automated risk detection across notes and check-ins",
  "Client engagement: daily check-ins and homework",
  "Adaptive intake questionnaires",
  "HIPAA compliance auto-checker",
  "Revenue optimization and CPT code suggestions",
  "Practice analytics and burnout indicators",
  "Encrypted HIPAA-compliant client messaging",
  "All 50-state compliance data",
];

export default function ClinicianSubscription() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: statusData, refetch } = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const startTrial = trpc.subscription.startTrial.useMutation({
    onSuccess: () => refetch(),
  });

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const createPortal = trpc.subscription.createPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  // Auto-start trial for new clinicians
  useEffect(() => {
    if (user && statusData && !statusData.subscription) {
      startTrial.mutate();
    }
  }, [user, statusData]);

  const access = statusData?.access;
  const sub = statusData?.subscription;

  const handleSubscribe = () => {
    createCheckout.mutate({ returnUrl: window.location.origin });
  };

  const handleManageBilling = () => {
    createPortal.mutate({ returnUrl: window.location.origin + "/clinician/subscribe" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Clinician Portal
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Elevate Your Practice
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered tools for mental health professionals — from note generation to practice analytics.
            Start free for 14 days.
          </p>
        </div>

        {/* Status Banner */}
        {access && (
          <div
            className={`rounded-xl p-4 mb-8 flex items-center gap-3 ${
              access.hasAccess
                ? access.isTrialing
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {access.hasAccess ? (
              access.isTrialing ? (
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              )
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  access.hasAccess
                    ? access.isTrialing
                      ? "text-blue-800"
                      : "text-green-800"
                    : "text-red-800"
                }`}
              >
                {access.message}
              </p>
              {access.isTrialing && access.trialEndAt && (
                <p className="text-sm text-blue-600 mt-0.5">
                  Trial ends {new Date(access.trialEndAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {access.hasAccess && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/clinician/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Card */}
          <Card className="border-2 border-teal-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              MOST POPULAR
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-xl">Clinician Pro</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$49</span>
                <span className="text-slate-500">/month</span>
              </div>
              <CardDescription className="text-base">
                Everything you need to run a modern, AI-assisted practice.
              </CardDescription>
              {(!sub || access?.status === "trial_expired" || access?.status === "canceled") && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-teal-800 font-medium">
                    ✓ 14-day free trial included — no credit card required to start
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5">
                {PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-2">
                {!sub && (
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => startTrial.mutate()}
                    disabled={startTrial.isPending}
                  >
                    {startTrial.isPending ? "Starting trial..." : "Start 14-Day Free Trial"}
                  </Button>
                )}

                {sub && (access?.status === "trial_expired" || access?.status === "canceled" || access?.status === "unpaid") && (
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handleSubscribe}
                    disabled={createCheckout.isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {createCheckout.isPending ? "Redirecting..." : "Subscribe Now — $49/month"}
                  </Button>
                )}

                {sub && access?.isTrialing && (
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={handleSubscribe}
                    disabled={createCheckout.isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {createCheckout.isPending ? "Redirecting..." : "Add Payment Method"}
                  </Button>
                )}

                {sub && access?.isPastDue && (
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    onClick={handleManageBilling}
                    disabled={createPortal.isPending}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {createPortal.isPending ? "Opening portal..." : "Update Payment Method"}
                  </Button>
                )}

                {sub && access?.status === "active" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageBilling}
                    disabled={createPortal.isPending}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {createPortal.isPending ? "Opening portal..." : "Manage Billing"}
                  </Button>
                )}
              </div>

              {sub && (
                <p className="text-xs text-center text-slate-500">
                  {sub.status === "active" && sub.currentPeriodEnd
                    ? `Next billing date: ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                    : sub.status === "trialing"
                    ? `Trial ends: ${new Date(sub.trialEndAt).toLocaleDateString()}`
                    : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Trust & Security */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <CardTitle className="text-base">HIPAA Compliant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <p>All data is encrypted at rest and in transit. Client messages use AES-256-GCM encryption. Audit logs contain no PHI.</p>
                <p>Automatic 90-day message retention policy with configurable purge schedules.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-teal-600" />
                  <CardTitle className="text-base">NPI-Verified Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                <p>Access is restricted to licensed mental health professionals verified through the NPPES National Provider Registry. Your NPI number is validated before portal access is granted.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {[
                  {
                    q: "What happens after my trial ends?",
                    a: "You'll be prompted to add a payment method. If no payment is added, portal access is paused until you subscribe.",
                  },
                  {
                    q: "Can I cancel anytime?",
                    a: "Yes. Cancel through the billing portal at any time. You'll retain access until the end of your billing period.",
                  },
                  {
                    q: "Is client data stored securely?",
                    a: "All client messages are encrypted with AES-256-GCM. Notes and clinical data are stored in HIPAA-compliant infrastructure.",
                  },
                  {
                    q: "Does the AI make clinical decisions?",
                    a: "No. The AI generates suggestions that you review and approve. All clinical decisions remain with the licensed clinician.",
                  },
                ].map(({ q, a }) => (
                  <div key={q}>
                    <p className="font-medium text-slate-800">{q}</p>
                    <p className="text-slate-600 mt-1">{a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-center">
              <Badge variant="outline" className="text-xs text-slate-500">
                Powered by Stripe — PCI DSS Level 1 Certified
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
