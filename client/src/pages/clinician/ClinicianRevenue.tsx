import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function ClinicianRevenue() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [currentCode, setCurrentCode] = useState("");
  const [sessionDuration, setSessionDuration] = useState("50");
  const [sessionType, setSessionType] = useState("individual");
  const [optimizationResult, setOptimizationResult] = useState<{
    currentCode: string;
    suggestedCode: string;
    reasoning: string;
    potentialIncrease: string;
    warnings: string[];
    additionalCodes: string[];
  } | null>(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: billingRecords, isLoading: billingLoading } = trpc.clinician.getBillingRecords.useQuery(
    undefined,
    { enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin") }
  );

  const [optimizing, setOptimizing] = useState(false);

  const CPT_MAP: Record<string, { suggested: string; reasoning: string; increase: string }> = {
    "90832": { suggested: "90834", reasoning: "30-min code — if session was 45 min, 90834 is more accurate", increase: "~$20-40" },
    "90834": { suggested: "90837", reasoning: "45-min code — if session exceeded 53 min, 90837 applies", increase: "~$30-60" },
    "90837": { suggested: "90837", reasoning: "90837 is the highest standard individual therapy code — correctly used for 53+ min sessions", increase: "Already optimal" },
    "90846": { suggested: "90847", reasoning: "If client was present during family session, 90847 (with client) is more appropriate", increase: "~$10-20" },
    "90853": { suggested: "90853", reasoning: "Group therapy code — correctly applied", increase: "Already optimal" },
    "90791": { suggested: "90792", reasoning: "If prescribing medications or medical evaluation was included, 90792 applies", increase: "~$50-100" },
  };

  const handleOptimize = () => {
    if (!currentCode.trim()) {
      toast.error("Please enter a CPT code");
      return;
    }
    setOptimizing(true);
    setTimeout(() => {
      const dur = parseInt(sessionDuration);
      const lookup = CPT_MAP[currentCode];
      const warnings: string[] = [];
      const additionalCodes: string[] = [];

      if (dur >= 53 && currentCode !== "90837" && sessionType === "individual") {
        warnings.push("Session duration suggests 90837 may be more accurate");
      }
      if (sessionType === "crisis") additionalCodes.push("90839", "90840");
      if (sessionType === "assessment") additionalCodes.push("96130", "96131");

      setOptimizationResult({
        currentCode,
        suggestedCode: lookup?.suggested ?? currentCode,
        reasoning: lookup?.reasoning ?? "No specific optimization found — code appears correctly applied for the described session",
        potentialIncrease: lookup?.increase ?? "N/A",
        warnings,
        additionalCodes,
      });
      setOptimizing(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  const totalRevenue = (billingRecords ?? []).length;
  const pendingCount = (billingRecords ?? []).filter((r) => r.status === "pending" || r.status === "submitted").length;
  const paidCount = (billingRecords ?? []).filter((r) => r.status === "approved").length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => navigate("/clinician/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div className="h-5 w-px bg-slate-600" />
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Revenue Optimization</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Records", value: totalRevenue, icon: DollarSign, color: "text-teal-400" },
            { label: "Pending Claims", value: pendingCount, icon: AlertCircle, color: "text-amber-400" },
            { label: "Paid Claims", value: paidCount, icon: CheckCircle2, color: "text-emerald-400" },
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
          {/* CPT Code Optimizer */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-teal-400" />
                CPT Code Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Current CPT Code</label>
                <Input
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  placeholder="e.g. 90837"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Session Duration (minutes)</label>
                <Select value={sessionDuration} onValueChange={setSessionDuration}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="50">50 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Session Type</label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Therapy</SelectItem>
                    <SelectItem value="group">Group Therapy</SelectItem>
                    <SelectItem value="family">Family Therapy</SelectItem>
                    <SelectItem value="couples">Couples Therapy</SelectItem>
                    <SelectItem value="crisis">Crisis Intervention</SelectItem>
                    <SelectItem value="assessment">Psychological Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleOptimize}
                disabled={optimizing}
              >
                {optimizing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><TrendingUp className="w-4 h-4 mr-2" /> Optimize Billing</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Optimization Result */}
          <div>
            {optimizationResult ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Optimization Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center p-3 bg-slate-700 rounded-lg flex-1">
                      <p className="text-xs text-slate-400 mb-1">Current Code</p>
                      <p className="text-xl font-bold text-white font-mono">{optimizationResult.currentCode}</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    <div className="text-center p-3 bg-teal-900/40 border border-teal-700/50 rounded-lg flex-1">
                      <p className="text-xs text-teal-400 mb-1">Suggested Code</p>
                      <p className="text-xl font-bold text-teal-300 font-mono">{optimizationResult.suggestedCode}</p>
                    </div>
                  </div>

                  {optimizationResult.potentialIncrease && (
                    <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                      <p className="text-sm text-emerald-300">
                        <strong>Potential increase:</strong> {optimizationResult.potentialIncrease}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-400 mb-1 font-medium">Reasoning</p>
                    <p className="text-sm text-slate-300">{optimizationResult.reasoning}</p>
                  </div>

                  {optimizationResult.warnings.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-amber-400 font-medium">Compliance Warnings</p>
                      {optimizationResult.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {optimizationResult.additionalCodes.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-medium">Additional Billable Codes</p>
                      <div className="flex flex-wrap gap-2">
                        {optimizationResult.additionalCodes.map((code) => (
                          <Badge key={code} className="bg-slate-700 text-slate-200 font-mono">{code}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center py-20">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">Enter a CPT code to see optimization suggestions</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Records */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Recent Billing Records</CardTitle>
          </CardHeader>
          <CardContent>
            {billingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
              </div>
            ) : (billingRecords ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No billing records yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Client</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">CPT Code</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Duration</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(billingRecords ?? []).map((record) => (
                      <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 px-3 text-slate-300">Client #{record.clientId}</td>
                        <td className="py-2 px-3 font-mono text-teal-300">{record.cptCode}</td>
                        <td className="py-2 px-3 text-slate-300">{record.sessionDurationMin ? `${record.sessionDurationMin}min` : "—"}</td>
                        <td className="py-2 px-3">
                          <Badge className={
                            record.status === "approved" ? "bg-emerald-900 text-emerald-300" :
                            record.status === "pending" ? "bg-amber-900 text-amber-300" :
                            record.status === "denied" ? "bg-red-900 text-red-300" :
                            "bg-slate-700 text-slate-300"
                          }>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{new Date(record.sessionDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
