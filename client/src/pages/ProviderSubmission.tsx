import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { CheckCircle2, Loader2, Shield, AlertCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { US_STATES } from "@shared/states";

const SPECIALTIES = [
  "Anxiety & Stress", "Depression", "Trauma & PTSD", "LGBTQ+", "Couples & Relationships",
  "Child & Adolescent", "Addiction & Substance Use", "Eating Disorders", "Grief & Loss",
  "Veterans & Military", "Bipolar Disorder", "OCD", "ADHD", "Autism Spectrum",
  "Anger Management", "Life Transitions", "Career & Work Stress", "Chronic Illness",
];

const INSURANCE_OPTIONS = [
  "Aetna", "Anthem", "Blue Cross Blue Shield", "Cigna", "Humana", "Kaiser Permanente",
  "Medicaid", "Medicare", "Optum/UnitedHealthcare", "Tricare", "WellCare", "Self-Pay/Sliding Scale",
];

export default function ProviderSubmission() {
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [npiVerified, setNpiVerified] = useState(false);
  const [npiData, setNpiData] = useState<{ name?: string; credential?: string; state?: string } | null>(null);

  const [form, setForm] = useState({
    npiNumber: "",
    firstName: "",
    lastName: "",
    licenseType: "",
    licenseNumber: "",
    licenseState: "",
    specialty: [] as string[],
    insuranceAccepted: [] as string[],
    telehealth: false,
    inPerson: false,
    slidingScale: false,
    bio: "",
    phone: "",
    website: "",
    city: "",
    state: "",
    zip: "",
    sessionFeeMin: "",
    sessionFeeMax: "",
    languages: "",
  });

  const [npiQuery, setNpiQuery] = useState("");
  const { data: npiResult, isLoading: npiLoading, refetch: refetchNpi } = trpc.clinician.lookupNpi.useQuery(
    { npiNumber: npiQuery },
    { enabled: false }
  );

  const handleNpiLookup = async () => {
    setNpiQuery(form.npiNumber);
    setTimeout(async () => {
      const result = await refetchNpi();
      if (result.data?.valid) {
        setNpiVerified(true);
        setNpiData({ name: result.data.providerName, credential: result.data.credential, state: result.data.state });
        setForm((f) => ({
          ...f,
          licenseState: result.data?.state ?? f.licenseState,
        }));
        toast.success("NPI verified successfully");
      } else {
        toast.error(result.data?.error ?? "NPI verification failed");
      }
    }, 100);
  };

  const submitProvider = trpc.verification.submitProvider.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const toggleSpecialty = (s: string) => {
    setForm((f) => ({
      ...f,
      specialty: f.specialty.includes(s) ? f.specialty.filter((x) => x !== s) : [...f.specialty, s],
    }));
  };

  const toggleInsurance = (ins: string) => {
    setForm((f) => ({
      ...f,
      insuranceAccepted: f.insuranceAccepted.includes(ins)
        ? f.insuranceAccepted.filter((x) => x !== ins)
        : [...f.insuranceAccepted, ins],
    }));
  };

  const handleSubmit = () => {
    if (!npiVerified) {
      toast.error("Please verify your NPI number first");
      return;
    }
    if (!form.firstName || !form.lastName || !form.licenseType || !form.licenseState) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitProvider.mutate({
      name: `${form.firstName} ${form.lastName}`.trim(),
      npiNumber: form.npiNumber,
      licenseType: form.licenseType,
      licenseNumber: form.licenseNumber || undefined,
      licenseState: form.licenseState,
      specialty: form.specialty.join(", ") || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      telehealthAvailable: form.telehealth,
      bio: form.bio || undefined,
      city: form.city || undefined,
      stateCode: form.state || undefined,
      zipCode: form.zip || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Submission Received</h1>
          <p className="text-slate-600 mb-6">
            Your profile has been submitted for review. Our team will verify your license through state licensing boards
            and notify you within 2-3 business days. Once approved, your profile will appear in the TherapyCareNow directory.
          </p>
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700 text-left mb-6">
            <strong>What happens next:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>License verification via state licensing board database</li>
              <li>NPI cross-check with NPPES registry</li>
              <li>Admin review and profile approval</li>
              <li>Profile published to the directory</li>
            </ol>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Join the TherapyCareNow Directory</h1>
          <p className="text-slate-600">
            All providers are verified through NPI registry and state licensing boards before listing.
            This process typically takes 2-3 business days.
          </p>
        </div>

        {/* Verification Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>License Verification Required</strong> — Your NPI number will be verified against the NPPES registry
            and your state licensing board before your profile is published. Only licensed therapists, social workers,
            and psychiatrists are eligible.
          </div>
        </div>

        <div className="space-y-6">
          {/* NPI Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Step 1: NPI Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={form.npiNumber}
                  onChange={(e) => setForm((f) => ({ ...f, npiNumber: e.target.value }))}
                  placeholder="10-digit NPI number"
                  maxLength={10}
                  className="flex-1"
                />
                <Button
                  onClick={handleNpiLookup}
                  disabled={form.npiNumber.length !== 10 || npiLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {npiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify NPI"}
                </Button>
              </div>
              {npiVerified && npiData && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">
                    Verified: <strong>{npiData.name}</strong>
                    {npiData.credential && ` (${npiData.credential})`}
                    {npiData.state && ` — ${npiData.state}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Step 2: Personal & License Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>License Type *</Label>
                  <Select value={form.licenseType} onValueChange={(v) => setForm((f) => ({ ...f, licenseType: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["LCSW", "LPC", "LMFT", "PhD", "PsyD", "MD", "DO", "NP", "other"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>License State *</Label>
                  <Select value={form.licenseState} onValueChange={(v) => setForm((f) => ({ ...f, licenseState: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>License Number</Label>
                <Input value={form.licenseNumber} onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))} className="mt-1" placeholder="Optional but recommended" />
              </div>
            </CardContent>
          </Card>

          {/* Practice Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Step 3: Practice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bio / About You</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Describe your approach, experience, and who you work with..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>State</Label>
                  <Select value={form.state} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Session Fee Min ($)</Label>
                  <Input type="number" value={form.sessionFeeMin} onChange={(e) => setForm((f) => ({ ...f, sessionFeeMin: e.target.value }))} className="mt-1" placeholder="e.g. 100" />
                </div>
                <div>
                  <Label>Session Fee Max ($)</Label>
                  <Input type="number" value={form.sessionFeeMax} onChange={(e) => setForm((f) => ({ ...f, sessionFeeMax: e.target.value }))} className="mt-1" placeholder="e.g. 200" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-6">
                {[
                  { key: "telehealth", label: "Offers Telehealth" },
                  { key: "inPerson", label: "In-Person Sessions" },
                  { key: "slidingScale", label: "Sliding Scale Fees" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={form[key as keyof typeof form] as boolean}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: !!v }))}
                    />
                    <Label htmlFor={key}>{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Step 4: Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.specialty.includes(s)
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800">Step 5: Insurance Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((ins) => (
                  <button
                    key={ins}
                    type="button"
                    onClick={() => toggleInsurance(ins)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.insuranceAccepted.includes(ins)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    {ins}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          {!npiVerified && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">NPI verification required before submission</span>
            </div>
          )}

          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base"
            onClick={handleSubmit}
            disabled={!npiVerified || submitProvider.isPending}
          >
            {submitProvider.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><Shield className="w-4 h-4 mr-2" /> Submit for Verification</>
            )}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            By submitting, you confirm that all information is accurate and you consent to license verification.
            Profiles are reviewed within 2-3 business days.
          </p>
        </div>
      </main>
    </div>
  );
}
