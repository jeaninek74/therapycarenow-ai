import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, Activity, MapPin, FileText,
  TrendingUp, Clock, Database, Upload, CheckCircle2, XCircle,
  Loader2, Lock,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState<"overview" | "providers" | "import">("overview");

  const { data: stats, isLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 30000,
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

  const { auditStats, providerStats } = stats ?? {
    auditStats: { total: 0, byType: [], byRiskLevel: [], recentEvents: [] },
    providerStats: { total: 0, byState: [], byLicenseType: [] },
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "providers", label: "Provider Directory", icon: Users },
    { id: "import", label: "Bulk Import", icon: Upload },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform analytics and provider management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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
              <StatCard icon={Users} label="Active Providers" value={providerStats.total} sub="In directory" color="text-green-600" />
              <StatCard icon={MapPin} label="States Covered" value={providerStats.byState.length} sub="With providers" color="text-primary" />
              <StatCard icon={Database} label="License Types" value={providerStats.byLicenseType.length} sub="Distinct credentials" color="text-purple-600" />
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
                      <span className="w-2 h-2 rounded-full flex-shrink-0 bg-muted-foreground" />
                      <span className="font-medium text-foreground">{evt.eventType}</span>
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
                  License Type Distribution
                </h3>
                {providerStats.byLicenseType.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No provider data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={providerStats.byLicenseType.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="licenseType"
                        label={({ licenseType, percent }) =>
                          `${licenseType} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {providerStats.byLicenseType.slice(0, 8).map((_: any, i: number) => (
                          <Cell key={i} fill={EVENT_COLORS[i % EVENT_COLORS.length]} />
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
            </div>
          </div>
        )}

        {/* ── Bulk Import Tab ── */}
        {activeTab === "import" && <BulkImportPanel />}
      </div>
    </div>
  );
}
