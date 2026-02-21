import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, FileText, AlertTriangle, TrendingUp,
  Activity, Brain, DollarSign, Shield, ChevronRight,
  Plus, Stethoscope, ClipboardList
} from "lucide-react";
import { useEffect } from "react";

const BURNOUT_COLORS: Record<string, string> = {
  low: "bg-emerald-500",
  moderate: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-600",
};

const BURNOUT_BADGE: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const SEVERITY_BADGE: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function ClinicianDashboard() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = trpc.clinician.getAnalytics.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin"),
  });

  const { data: riskFlags, isLoading: flagsLoading } = trpc.clinician.getRiskFlags.useQuery(
    { clientId: undefined },
    { enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin") }
  );

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-teal-400 text-lg animate-pulse">Loading Clinician Portal...</div>
      </div>
    );
  }

  const burnout = analytics?.burnout;
  const burnoutLevel = burnout?.level ?? "low";
  const burnoutScore = burnout?.score ?? 0;
  const activeFlags = riskFlags?.filter((f) => !f.resolvedAt) ?? [];

  const quickActions = [
    { label: "New Note", icon: FileText, path: "/clinician/notes/new", color: "bg-teal-600 hover:bg-teal-700" },
    { label: "Clients", icon: Users, path: "/clinician/clients", color: "bg-slate-700 hover:bg-slate-600" },
    { label: "Analytics", icon: TrendingUp, path: "/clinician/analytics", color: "bg-slate-700 hover:bg-slate-600" },
    { label: "Compliance", icon: Shield, path: "/clinician/compliance", color: "bg-slate-700 hover:bg-slate-600" },
    { label: "Revenue", icon: DollarSign, path: "/clinician/revenue", color: "bg-slate-700 hover:bg-slate-600" },
    { label: "Risk Panel", icon: AlertTriangle, path: "/clinician/risk", color: "bg-slate-700 hover:bg-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">TherapyCareNow</h1>
              <p className="text-xs text-slate-400">Clinician Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">Welcome, {user?.name ?? "Clinician"}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => navigate("/")}
            >
              Patient Portal
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-teal-400" />
                <span className="text-2xl font-bold text-white">{analytics?.totalClients ?? 0}</span>
              </div>
              <p className="text-sm text-slate-400">Total Clients</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-white">{analytics?.pendingNotes ?? 0}</span>
                  {(analytics?.pendingNotes ?? 0) > 0 && (
                    <Badge className="bg-amber-500 text-white text-xs px-1">!</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-400">Pending Notes</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-white">{activeFlags.length}</span>
                  {activeFlags.length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1">!</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-400">Active Risk Flags</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-teal-400" />
                <span className="text-2xl font-bold text-white">{analytics?.recentNotes30Days ?? 0}</span>
              </div>
              <p className="text-sm text-slate-400">Sessions (30d)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Burnout Indicator */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-400" />
                Burnout Indicator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{burnoutScore}</span>
                <Badge className={BURNOUT_BADGE[burnoutLevel] ?? "bg-gray-100 text-gray-800"}>
                  {burnoutLevel.charAt(0).toUpperCase() + burnoutLevel.slice(1)} Risk
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Burnout Score</span>
                  <span>{burnoutScore}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${BURNOUT_COLORS[burnoutLevel] ?? "bg-gray-500"}`}
                    style={{ width: `${burnoutScore}%` }}
                  />
                </div>
              </div>
              {burnout?.indicators && burnout.indicators.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Indicators:</p>
                  <ul className="space-y-1">
                    {burnout.indicators.slice(0, 3).map((ind: string, i: number) => (
                      <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {burnout?.recommendations && burnout.recommendations.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {burnout.recommendations.slice(0, 2).map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-teal-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Risk Flags */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Active Risk Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flagsLoading ? (
                <p className="text-slate-400 text-sm">Loading...</p>
              ) : activeFlags.length === 0 ? (
                <div className="text-center py-6">
                  <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No active risk flags</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activeFlags.slice(0, 5).map((flag) => (
                    <li
                      key={flag.id}
                      className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-700 cursor-pointer hover:bg-slate-600 transition-colors"
                      onClick={() => navigate(`/clinician/clients/${flag.clientId}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          Client #{flag.clientId} — {flag.flagType.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{flag.description}</p>
                      </div>
                      <Badge className={`${SEVERITY_BADGE[flag.severity] ?? "bg-gray-100 text-gray-800"} flex-shrink-0 text-xs`}>
                        {flag.severity}
                      </Badge>
                    </li>
                  ))}
                  {activeFlags.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-teal-400 hover:text-teal-300"
                      onClick={() => navigate("/clinician/risk")}
                    >
                      View all {activeFlags.length} flags <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-colors`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
