import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Stethoscope, ShieldCheck, Search, CheckCircle2, AlertCircle,
  Brain, FileText, TrendingUp, Users, Lock,
} from "lucide-react";
import { US_STATES } from "@shared/states";

const LICENSE_TYPES = [
  { value: "therapist", label: "Licensed Therapist (LMFT, LPC, LPCC)" },
  { value: "social_worker", label: "Licensed Social Worker (LCSW, LMSW)" },
  { value: "psychiatrist", label: "Psychiatrist (MD/DO)" },
  { value: "psychologist", label: "Psychologist (PhD, PsyD)" },
  { value: "counselor", label: "Licensed Counselor (LPC, LCPC)" },
  { value: "other", label: "Other Mental Health Clinician" },
];

const PRACTICE_TYPES = [
  { value: "solo", label: "Solo Practice" },
  { value: "group", label: "Group Practice" },
  { value: "hospital", label: "Hospital / Inpatient" },
  { value: "community", label: "Community Mental Health" },
  { value: "telehealth_only", label: "Telehealth Only" },
];

export default function ClinicianLogin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"intro" | "npi-lookup" | "register" | "success">("intro");
  const [npiInput, setNpiInput] = useState("");
  const [npiResult, setNpiResult] = useState<{
    valid: boolean;
    providerName?: string;
    taxonomyDescription?: string;
    licenseState?: string;
    error?: string;
  } | null>(null);
  const [licenseType, setLicenseType] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [practiceType, setPracticeType] = useState("solo");

  const lookupNpi = trpc.clinician.lookupNpi.useQuery(
    { npiNumber: npiInput },
    { enabled: false }
  );

  const registerMutation = trpc.clinician.register.useMutation({
    onSuccess: () => {
      setStep("success");
      setTimeout(() => navigate("/clinician/dashboard"), 2000);
    },
    onError: (err) => toast.error(err.message),
  });

  const getProfile = trpc.clinician.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Already registered clinician
  if (!loading && isAuthenticated && getProfile.data?.npiVerified) {
    navigate("/clinician/dashboard");
    return null;
  }

  const handleNpiLookup = async () => {
    if (!/^\d{10}$/.test(npiInput)) {
      toast.error("NPI must be exactly 10 digits.");
      return;
    }
    const result = await lookupNpi.refetch();
    if (result.data) {
      setNpiResult(result.data);
      if (result.data.valid) {
        if (result.data.licenseState) setLicenseState(result.data.licenseState);
        setStep("register");
      }
    }
  };

  const handleRegister = () => {
    if (!licenseType || !licenseState) {
      toast.error("Please complete all required fields.");
      return;
    }
    registerMutation.mutate({
      npiNumber: npiInput,
      licenseType: licenseType as "therapist" | "social_worker" | "psychiatrist" | "psychologist" | "counselor" | "other",
      licenseState,
      licenseNumber: licenseNumber || undefined,
      specialty: specialty || undefined,
      practiceType: practiceType as "solo" | "group" | "hospital" | "community" | "telehealth_only",
    });
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-xl">
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">NPI Verified!</h2>
            <p className="text-gray-600">Welcome to the TherapyCareNow Clinician Portal. Redirecting to your dashboard…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">TherapyCareNow</span>
              <Badge variant="secondary" className="ml-2 text-xs bg-teal-500/20 text-teal-300 border-teal-500/30">
                Clinician Portal
              </Badge>
            </div>
          </div>
          <a href="/" className="text-teal-300 hover:text-white text-sm transition-colors">
            ← Back to main site
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {step === "intro" && (
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero */}
            <div>
              <Badge className="mb-6 bg-teal-500/20 text-teal-300 border-teal-500/30 text-sm px-3 py-1">
                <Lock className="w-3 h-3 mr-1" />
                NPI-Verified Clinicians Only
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Your AI-Powered
                <span className="text-teal-400 block">Clinical Workspace</span>
              </h1>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Designed exclusively for licensed therapists, social workers, and psychiatrists.
                Verify your NPI to access AI-assisted documentation, smart treatment planning,
                and practice analytics — all HIPAA-compliant.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { icon: FileText, label: "AI SOAP/DAP Notes", desc: "Auto-generate from transcripts" },
                  { icon: Brain, label: "Treatment Planning", desc: "Evidence-based AI suggestions" },
                  { icon: ShieldCheck, label: "Risk Detection", desc: "Automated crisis signal alerts" },
                  { icon: TrendingUp, label: "Revenue Optimizer", desc: "CPT code suggestions" },
                  { icon: Users, label: "Client Engagement", desc: "Check-ins & homework" },
                  { icon: FileText, label: "Compliance Checker", desc: "HIPAA documentation scoring" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-slate-400 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login / NPI entry */}
            <div>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl">Clinician Access</CardTitle>
                  <CardDescription className="text-slate-300">
                    Verify your NPI number to access the portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isAuthenticated ? (
                    <>
                      <p className="text-slate-300 text-sm text-center">
                        First, sign in with your Manus account. Then verify your NPI.
                      </p>
                      <a href={getLoginUrl()} className="block">
                        <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12 text-base">
                          Sign In to Continue
                        </Button>
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span className="text-teal-300 text-sm">Signed in as {user?.name ?? user?.email}</span>
                      </div>
                      <Button
                        onClick={() => setStep("npi-lookup")}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12 text-base"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Verify My NPI Number
                      </Button>
                    </>
                  )}
                  <p className="text-slate-400 text-xs text-center">
                    NPI verification uses the NPPES public registry. Only licensed mental health clinicians may access this portal.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === "npi-lookup" && (
          <div className="max-w-lg mx-auto">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Search className="w-5 h-5 text-teal-400" />
                  NPI Verification
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Enter your 10-digit National Provider Identifier (NPI)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200 text-sm mb-1.5 block">NPI Number</Label>
                  <Input
                    value={npiInput}
                    onChange={(e) => setNpiInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="1234567890"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-12 text-lg tracking-widest"
                    maxLength={10}
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    Your NPI is verified against the NPPES public registry in real time.
                  </p>
                </div>

                {npiResult && !npiResult.valid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{npiResult.error}</p>
                  </div>
                )}

                <Button
                  onClick={handleNpiLookup}
                  disabled={npiInput.length !== 10 || lookupNpi.isFetching}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white h-11"
                >
                  {lookupNpi.isFetching ? "Verifying…" : "Verify NPI"}
                </Button>

                <button
                  onClick={() => setStep("intro")}
                  className="w-full text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ← Back
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "register" && npiResult?.valid && (
          <div className="max-w-lg mx-auto">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div>
                    <p className="text-teal-300 text-sm font-medium">NPI Verified: {npiInput}</p>
                    {npiResult.providerName && (
                      <p className="text-slate-300 text-xs">{npiResult.providerName} · {npiResult.taxonomyDescription}</p>
                    )}
                  </div>
                </div>
                <CardTitle className="text-white text-xl">Complete Your Profile</CardTitle>
                <CardDescription className="text-slate-300">
                  A few more details to set up your clinician workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200 text-sm mb-1.5 block">License Type *</Label>
                  <Select value={licenseType} onValueChange={setLicenseType}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-11">
                      <SelectValue placeholder="Select your license type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-200 text-sm mb-1.5 block">License State *</Label>
                  <Select value={licenseState} onValueChange={setLicenseState}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-11">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-200 text-sm mb-1.5 block">License Number (optional)</Label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g., LCSW-12345"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-11"
                  />
                </div>

                <div>
                  <Label className="text-slate-200 text-sm mb-1.5 block">Primary Specialty (optional)</Label>
                  <Input
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g., Trauma, Anxiety, CBT"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-11"
                  />
                </div>

                <div>
                  <Label className="text-slate-200 text-sm mb-1.5 block">Practice Type</Label>
                  <Select value={practiceType} onValueChange={setPracticeType}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRACTICE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending || !licenseType || !licenseState}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white h-11"
                >
                  {registerMutation.isPending ? "Setting up workspace…" : "Access Clinician Portal"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
