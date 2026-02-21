import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Shield, AlertTriangle, Users, Activity, MapPin, FileText,
  TrendingUp, Clock, Database, Upload, CheckCircle2, XCircle,
  Loader2, Lock
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { toast } from "sonner";

const RISK_COLORS: Record<string, string> = {
  EMERGENCY: "#ef4444",
  URGENT: "#f97316",
  ROUTINE: "#22c55e",
};

const EVENT_COLORS = [
  "#6366f1", "#22c55e", "#f97316", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f59e0b", "#14b8a6",
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function BulkImportPanel() {
  const [jsonText, setJsonText] = useState("");
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);

  const importMutation = trpc.admin.bulkImportProviders.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setJsonText("");
      toast.success(`Imported ${data.imported} providers (${data.errors} errors)`);
    },
    onError: (err) => {
      toast.error(`Import failed: ${err.message}`);
    },
  });

  function handleImport() {
    try {
      const parsed = JSON.parse(jsonText);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      importMutation.mutate({ providers: list });
    } catch {
      toast.error("Invalid JSON. Please check your input.");
    }
  }

  const sampleProvider = {
    name: "Dr. Jane Smith, LCSW",
    licenseState: "CA",
    licenseType: "LCSW",
    telehealth: true,
    inPerson: true,
    city: "Los Angeles",
    stateCode: "CA",
    phone: "555-123-4567",
    website: "https://example.com",
    bio: "Specializing in trauma and anxiety.",
    costTag: "insurance",
    urgency: "within_72h",
    specialties: ["trauma", "anxiety", "depression"],
    insurance: ["Aetna", "Blue Cross", "Cigna"],
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Bulk Provider Import</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Paste a JSON array of provider objects to bulk-import into the directory. Up to 500 providers per batch.
      </p>

      <div className="bg-muted/50 rounded-lg p-3 mb-4 text-xs font-mono overflow-x-auto">
        <div className="text-muted-foreground mb-1">// Sample format (array of objects):</div>
        <pre className="text-foreground whitespace-pre-wrap break-all">
          {JSON.stringify([sampleProvider], null, 2)}
        </pre>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder='Paste JSON array here, e.g. [{"name": "Dr. Smith", ...}]'
        className="w-full h-40 bg-background border border-border rounded-lg p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
      />

      <button
        onClick={handleImport}
        disabled={!jsonText.trim() || importMutation.isPending}
        className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {importMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Import Providers
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            {result.imported} imported
          </span>
          {result.errors > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="w-4 h-4" />
              {result.errors} errors
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "triage" | "providers" | "import">("overview");

  const { data: stats, isLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 30000, // refresh every 30s
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container py-20 max-w-md mx-auto text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            This area is restricted to platform administrators. Please sign in with an admin account.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const { auditStats, triageStats, providerStats } = stats ?? {
    auditStats: { total: 0, byType: [], byRiskLevel: [], recentEvents: [] },
    triageStats: { total: 0, emergency: 0, urgent: 0, routine: 0, byState: [] },
    providerStats: { total: 0, byState: [], byLicenseType: [] },
  };

  const riskPieData = [
    { name: "Emergency", value: triageStats.emergency, color: RISK_COLORS.EMERGENCY },
    { name: "Urgent", value: triageStats.urgent, color: RISK_COLORS.URGENT },
    { name: "Routine", value: triageStats.routine, color: RISK_COLORS.ROUTINE },
  ].filter((d) => d.value > 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "triage", label: "Triage Analytics", icon: Shield },
    { id: "providers", label: "Provider Directory", icon: Users },
    { id: "import", label: "Bulk Import", icon: Upload },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="container py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Platform analytics — HIPAA-safe: no raw user text stored
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 text-sm text-green-700 dark:text-green-400">
            <Shield className="w-4 h-4" />
            HIPAA Compliant
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Activity} label="Total Events" value={auditStats.total} sub="All time" />
              <StatCard icon={Shield} label="Triage Sessions" value={triageStats.total} sub="All time" />
              <StatCard
                icon={AlertTriangle}
                label="Crisis Activations"
                value={triageStats.emergency}
                sub="EMERGENCY risk level"
                color="text-destructive"
              />
              <StatCard icon={Users} label="Active Providers" value={providerStats.total} sub="In directory" color="text-green-600" />
            </div>

            {/* Event type breakdown */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Event Type Breakdown
              </h3>
              {auditStats.byType.length === 0 ? (
                <p className="text-muted-foreground text-sm">No events recorded yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={auditStats.byType} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="eventType"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {auditStats.byType.map((_, i) => (
                        <Cell key={i} fill={EVENT_COLORS[i % EVENT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent events */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Audit Events
                <span className="ml-auto text-xs text-muted-foreground font-normal">No raw text stored</span>
              </h3>
              {auditStats.recentEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">No events yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {auditStats.recentEvents.map((evt: any) => (
                    <div
                      key={evt.id}
                      className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0 text-sm"
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          evt.riskLevel === "EMERGENCY"
                            ? "bg-destructive"
                            : evt.riskLevel === "URGENT"
                            ? "bg-orange-500"
                            : evt.riskLevel === "ROUTINE"
                            ? "bg-green-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span className="font-medium text-foreground">{evt.eventType}</span>
                      {evt.riskLevel && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            evt.riskLevel === "EMERGENCY"
                              ? "bg-destructive/10 text-destructive"
                              : evt.riskLevel === "URGENT"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                              : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          }`}
                        >
                          {evt.riskLevel}
                        </span>
                      )}
                      {evt.stateCode && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {evt.stateCode}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Triage Analytics Tab ── */}
        {activeTab === "triage" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Shield} label="Total Triages" value={triageStats.total} />
              <StatCard icon={AlertTriangle} label="Emergency" value={triageStats.emergency} color="text-destructive" />
              <StatCard icon={Activity} label="Urgent" value={triageStats.urgent} color="text-orange-500" />
              <StatCard icon={CheckCircle2} label="Routine" value={triageStats.routine} color="text-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk level pie */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Risk Level Distribution</h3>
                {riskPieData.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No triage data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {riskPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top states */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Top States by Triage Volume
                </h3>
                {triageStats.byState.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No state data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {triageStats.byState.map((s: any, i: number) => (
                      <div key={s.stateCode} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <span className="font-medium text-foreground w-8">{s.stateCode}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(s.count / (triageStats.byState[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground w-8 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Provider Directory Tab ── */}
        {activeTab === "providers" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Users} label="Total Providers" value={providerStats.total} sub="Active in directory" color="text-primary" />
              <StatCard icon={MapPin} label="States Covered" value={providerStats.byState.length} sub="With at least 1 provider" color="text-green-600" />
              <StatCard icon={Database} label="License Types" value={providerStats.byLicenseType.length} sub="Distinct credentials" color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Providers by state */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Top States by Provider Count</h3>
                {providerStats.byState.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No provider data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={providerStats.byState.slice(0, 10)}
                      margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="stateCode" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* License types */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Providers by License Type
                </h3>
                {providerStats.byLicenseType.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {providerStats.byLicenseType.map((lt: any, i: number) => (
                      <div key={lt.licenseType} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <span className="font-medium text-foreground flex-1">{lt.licenseType}</span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(lt.count / (providerStats.byLicenseType[0]?.count || 1)) * 100}%`,
                              background: EVENT_COLORS[i % EVENT_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground w-8 text-right">{lt.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk Import Tab ── */}
        {activeTab === "import" && (
          <div className="max-w-2xl">
            <BulkImportPanel />
            <div className="mt-6 bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Required fields:</strong> name, licenseState (2-letter), licenseType, telehealth (bool), inPerson (bool), city, stateCode (2-letter), costTag (free/sliding_scale/insurance/self_pay), urgency (within_24h/within_72h/this_week/flexible), specialties (array), insurance (array).<br />
              <strong className="text-foreground">Optional:</strong> phone, website, bio.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
