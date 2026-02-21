import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  ArrowLeft, TrendingUp, Users, FileText, DollarSign,
  Brain, Activity, AlertTriangle, Loader2
} from "lucide-react";

const COLORS = ["#14b8a6", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981"];

const BURNOUT_COLOR: Record<string, string> = {
  low: "#10b981",
  moderate: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export default function PracticeAnalytics() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: analytics, isLoading } = trpc.clinician.getAnalytics.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin"),
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  const burnout = analytics?.burnout;
  const burnoutLevel = burnout?.level ?? "low";
  const burnoutScore = burnout?.score ?? 0;

  // Build chart data from available analytics fields
  const statusPieData = [
    { name: "Active", value: analytics?.activeClients ?? 0 },
    { name: "Other", value: Math.max(0, (analytics?.totalClients ?? 0) - (analytics?.activeClients ?? 0)) },
  ].filter((d) => d.value > 0);

  const notesPieData = [
    { name: "Total Notes", value: analytics?.totalNotes ?? 0 },
    { name: "Pending", value: analytics?.pendingNotes ?? 0 },
  ].filter((d) => d.value > 0);

  const sessionsByMonth: Array<{ month: string; count: number }> = [];
  const outcomeData: Array<{ week: string; avgMood: number; avgAnxiety: number }> = [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => navigate("/clinician/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div className="h-5 w-px bg-slate-600" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Practice Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Clients", value: analytics?.totalClients ?? 0, icon: Users, color: "text-teal-400" },
            { label: "Sessions (30d)", value: analytics?.recentNotes30Days ?? 0, icon: Activity, color: "text-blue-400" },
            { label: "Pending Notes", value: analytics?.pendingNotes ?? 0, icon: FileText, color: "text-amber-400" },
            { label: "Sessions (All Time)", value: analytics?.totalNotes ?? 0, icon: TrendingUp, color: "text-emerald-400" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  <span className="text-2xl font-bold text-white">{kpi.value}</span>
                </div>
                <p className="text-sm text-slate-400">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Burnout Indicator */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-400" />
                Burnout Indicator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-4xl font-bold text-white">{burnoutScore}</span>
                  <span className="text-slate-400 text-sm ml-1">/100</span>
                </div>
                <Badge
                  className="text-sm px-3 py-1"
                  style={{
                    backgroundColor: `${BURNOUT_COLOR[burnoutLevel]}20`,
                    color: BURNOUT_COLOR[burnoutLevel],
                    border: `1px solid ${BURNOUT_COLOR[burnoutLevel]}40`,
                  }}
                >
                  {burnoutLevel.charAt(0).toUpperCase() + burnoutLevel.slice(1)} Risk
                </Badge>
              </div>

              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${burnoutScore}%`,
                    backgroundColor: BURNOUT_COLOR[burnoutLevel],
                  }}
                />
              </div>

              {burnout?.indicators && (burnout.indicators as string[]).length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Indicators:</p>
                  <ul className="space-y-1.5">
                    {(burnout.indicators as string[]).map((ind, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {burnout?.recommendations && (burnout.recommendations as string[]).length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Recommendations:</p>
                  <ul className="space-y-1.5">
                    {(burnout.recommendations as string[]).map((rec, i) => (
                      <li key={i} className="text-sm text-teal-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Status Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                Client Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-500">
                  No client data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sessions Over Time */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Sessions Over Time (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(sessionsByMonth as Array<{ month: string; count: number }>).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sessionsByMonth as Array<{ month: string; count: number }>}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500">
                No session data yet
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Note Types */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                Note Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notesPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={notesPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {notesPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  No notes yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outcome Dashboard */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Client Outcome Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(outcomeData as Array<{ week: string; avgMood: number; avgAnxiety: number }>).length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={outcomeData as Array<{ week: string; avgMood: number; avgAnxiety: number }>}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8" }} />
                    <Line type="monotone" dataKey="avgMood" stroke="#14b8a6" name="Avg Mood" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avgAnxiety" stroke="#f59e0b" name="Avg Anxiety" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  No outcome data yet — client check-ins will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
