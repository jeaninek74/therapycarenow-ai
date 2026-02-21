import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Briefcase, Shield, CheckCircle, Loader2, Search, Trash2, Lock } from "lucide-react";
import NavBar from "@/components/NavBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BenefitsWallet() {
  const { user, isAuthenticated, loading } = useAuth();
  const [insuranceCarrier, setInsuranceCarrier] = useState("");
  const [insurancePlan, setInsurancePlan] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [eapSearch, setEapSearch] = useState("");
  const [consentGranted, setConsentGranted] = useState(false);
  const [activeTab, setActiveTab] = useState<"insurance" | "eap">("insurance");

  const { data: profile, refetch: refetchProfile } = trpc.benefits.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: eapResult } = trpc.benefits.lookupEAP.useQuery(
    { employerName: eapSearch },
    { enabled: eapSearch.length > 2 }
  );

  const saveInsurance = trpc.benefits.saveInsurance.useMutation({
    onSuccess: () => {
      toast.success("Insurance saved to your Benefits Wallet");
      refetchProfile();
      setInsuranceCarrier("");
      setInsurancePlan("");
    },
    onError: (err) => toast.error(err.message),
  });

  const saveEmployer = trpc.benefits.saveEmployer.useMutation({
    onSuccess: () => {
      toast.success("Employer EAP saved to your Benefits Wallet");
      refetchProfile();
      setEmployerName("");
    },
    onError: (err) => toast.error(err.message),
  });

  const clearBenefits = trpc.benefits.clearBenefits.useMutation({
    onSuccess: () => {
      toast.success("Benefits cleared");
      refetchProfile();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container py-20 max-w-md mx-auto text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Sign in to use Benefits Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Benefits Wallet securely stores your insurance and EAP information to speed up therapist matching. Sign in to get started.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold rounded-xl px-8 py-4 hover:opacity-90 transition-all"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Benefits Wallet</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Save your insurance and employer EAP info to speed up therapist matching. Your data is encrypted and private.
        </p>

        {/* Current saved benefits */}
        {profile && (profile.insuranceCarrier || profile.employerName) && (
          <div className="bg-secondary/30 border border-secondary rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary-foreground" />
                <span className="font-semibold text-foreground">Saved benefits</span>
              </div>
              <button
                onClick={() => clearBenefits.mutate()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            </div>
            {profile.insuranceCarrier && (
              <div className="text-sm text-foreground mb-1">
                <span className="font-medium">Insurance:</span> {profile.insuranceCarrier}
                {profile.insurancePlan && ` — ${profile.insurancePlan}`}
              </div>
            )}
            {profile.employerName && (
              <div className="text-sm text-foreground">
                <span className="font-medium">Employer:</span> {profile.employerName}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("insurance")}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === "insurance"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Insurance
          </button>
          <button
            onClick={() => setActiveTab("eap")}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === "eap"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Employer EAP
          </button>
        </div>

        {/* Insurance tab */}
        {activeTab === "insurance" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Add insurance information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="carrier">Insurance carrier *</Label>
                <Input
                  id="carrier"
                  value={insuranceCarrier}
                  onChange={(e) => setInsuranceCarrier(e.target.value)}
                  placeholder="e.g., Blue Cross Blue Shield"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="plan">Plan name (optional)</Label>
                <Input
                  id="plan"
                  value={insurancePlan}
                  onChange={(e) => setInsurancePlan(e.target.value)}
                  placeholder="e.g., PPO Gold"
                  className="mt-1"
                />
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
                <input
                  type="checkbox"
                  id="consent-ins"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="consent-ins" className="text-sm text-muted-foreground cursor-pointer">
                  I consent to TherapyCareNow storing my insurance information to help match me with providers. I can delete this data at any time.
                </label>
              </div>

              <Button
                onClick={() => saveInsurance.mutate({ insuranceCarrier, insurancePlan, consentGranted })}
                disabled={!insuranceCarrier || !consentGranted || saveInsurance.isPending}
                className="w-full"
              >
                {saveInsurance.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Insurance
              </Button>
            </div>
          </div>
        )}

        {/* EAP tab */}
        {activeTab === "eap" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-4">Find your employer's EAP</h2>

            {/* EAP search */}
            <div className="mb-4">
              <Label htmlFor="eap-search">Search your employer</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="eap-search"
                  value={eapSearch}
                  onChange={(e) => setEapSearch(e.target.value)}
                  placeholder="e.g., Amazon, Google, Walmart..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* EAP result */}
            {eapResult && eapSearch.length > 2 && (
              <div className="bg-secondary/30 border border-secondary rounded-xl p-4 mb-4">
                <p className="font-semibold text-foreground">{eapResult.employer.name}</p>
                <p className="text-sm text-muted-foreground">EAP Provider: {eapResult.employer.eapProvider}</p>
                {eapResult.employer.eapPhone && (
                  <a href={`tel:${eapResult.employer.eapPhone}`} className="text-primary text-sm hover:underline block mt-1">
                    📞 {eapResult.employer.eapPhone}
                  </a>
                )}
                {eapResult.employer.eapSessions && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {eapResult.employer.eapSessions} free sessions per year
                  </p>
                )}
                {eapResult.employer.eapUrl && (
                  <a href={eapResult.employer.eapUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline block mt-1">
                    Visit EAP portal →
                  </a>
                )}
              </div>
            )}

            {/* Save employer */}
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="employer">Employer name</Label>
                <Input
                  id="employer"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="Your employer name"
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
                <input
                  type="checkbox"
                  id="consent-eap"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="consent-eap" className="text-sm text-muted-foreground cursor-pointer">
                  I consent to TherapyCareNow storing my employer information to help find EAP benefits. I can delete this data at any time.
                </label>
              </div>

              <Button
                onClick={() => saveEmployer.mutate({ employerName, consentGranted })}
                disabled={!employerName || !consentGranted || saveEmployer.isPending}
                className="w-full"
              >
                {saveEmployer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Employer
              </Button>
            </div>
          </div>
        )}

        {/* Privacy note */}
        <div className="mt-6 flex items-start gap-3 bg-muted/40 rounded-xl p-4">
          <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your benefits information is stored securely and only used to help match you with providers. We never sell or share your data. You can delete your information at any time from this page.
          </p>
        </div>
      </div>
    </div>
  );
}
