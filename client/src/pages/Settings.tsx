import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Shield, MapPin, FileText, LogOut, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";
import { toast } from "sonner";

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: compliance, isLoading: complianceLoading } = trpc.compliance.getState.useQuery(
    { stateCode: selectedState! },
    { enabled: !!selectedState }
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Signed out successfully");
      window.location.href = "/";
    },
  });

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings & Information</h1>

        {/* Account */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account
          </h2>
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{user?.name ?? "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                {logoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Not signed in</p>
              <a
                href={getLoginUrl()}
                className="text-sm text-primary font-medium hover:underline"
              >
                Sign in
              </a>
            </div>
          )}
        </section>

        {/* State Compliance Info */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            State Therapy Regulations
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select your state to view telehealth laws, mandatory reporting requirements, and licensing information.
          </p>
          <StatePicker value={selectedState} onChange={setSelectedState} />

          {complianceLoading && (
            <div className="flex items-center gap-2 mt-4 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading compliance data...
            </div>
          )}

          {compliance && (
            <div className="mt-4 flex flex-col gap-3">
              <ComplianceItem
                title="Telehealth Laws"
                content={compliance.telehealthLawSummary}
                expanded={expandedSection === "telehealth"}
                onToggle={() => toggleSection("telehealth")}
              />
              <ComplianceItem
                title="Mandatory Reporting"
                content={compliance.mandatoryReportingNotes}
                expanded={expandedSection === "reporting"}
                onToggle={() => toggleSection("reporting")}
              />
              <ComplianceItem
                title="Crisis Resources"
                content={compliance.crisisLineNotes}
                expanded={expandedSection === "crisis"}
                onToggle={() => toggleSection("crisis")}
              />
              <ComplianceItem
                title="Licensure Requirements"
                content={compliance.licensureRequirements}
                expanded={expandedSection === "licensure"}
                onToggle={() => toggleSection("licensure")}
              />
              <ComplianceItem
                title="Privacy & HIPAA Notes"
                content={compliance.privacyNotes}
                expanded={expandedSection === "privacy"}
                onToggle={() => toggleSection("privacy")}
              />
            </div>
          )}
        </section>

        {/* Privacy Policy */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Privacy Policy
          </h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              <strong className="text-foreground">Data we collect:</strong> We collect only the minimum data necessary to provide navigation services. This includes your triage risk level (not your answers), resource interactions, and any benefits information you voluntarily save.
            </p>
            <p>
              <strong className="text-foreground">What we do NOT store:</strong> We never store the raw text of your triage answers or any crisis-related messages. Only event type, risk level, and timestamp are logged for safety auditing.
            </p>
            <p>
              <strong className="text-foreground">HIPAA compliance:</strong> TherapyCareNow is designed with HIPAA principles in mind. We do not store protected health information (PHI) beyond what is necessary for navigation.
            </p>
            <p>
              <strong className="text-foreground">AI moderation:</strong> All messages to the AI assistant are screened for safety before processing. If a safety concern is detected, you are routed to crisis resources and the message is not processed by AI.
            </p>
            <p>
              <strong className="text-foreground">Your rights:</strong> You can delete your saved benefits information at any time from the Benefits Wallet page. You can request account deletion by contacting us.
            </p>
          </div>
        </section>

        {/* Terms of Use */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Terms of Use
          </h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              <strong className="text-foreground">Not a healthcare provider:</strong> TherapyCareNow is a mental health navigation platform, not a healthcare provider. We do not provide therapy, diagnosis, clinical advice, or treatment.
            </p>
            <p>
              <strong className="text-foreground">Emergency situations:</strong> If you are in immediate danger, call 911. Do not rely on this platform for emergency response.
            </p>
            <p>
              <strong className="text-foreground">Provider information:</strong> Provider listings are for informational purposes only. We do not endorse specific providers. Always verify provider credentials, availability, and insurance acceptance directly.
            </p>
            <p>
              <strong className="text-foreground">AI limitations:</strong> The AI assistant provides general navigation information only. It cannot provide clinical recommendations and is not a substitute for professional mental health care.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function ComplianceItem({
  title,
  content,
  expanded,
  onToggle,
}: {
  title: string;
  content: string | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-medium text-foreground text-sm">{title}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && content && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {content}
        </div>
      )}
    </div>
  );
}
