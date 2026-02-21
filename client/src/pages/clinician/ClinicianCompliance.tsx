import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

const ISSUE_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function ClinicianCompliance() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<"SOAP" | "DAP">("SOAP");
  const [complianceResult, setComplianceResult] = useState<{
    isCompliant: boolean;
    score: number;
    issues: Array<{ type: string; message: string; field?: string }>;
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note to check");
      return;
    }
    setChecking(true);
    try {
      // Client-side heuristic compliance check (no PHI stored)
      const issues: Array<{ type: string; message: string; field?: string }> = [];
      const suggestions: string[] = [];
      const text = noteText.toLowerCase();

      // Check for required SOAP/DAP sections
      if (noteType === "SOAP") {
        if (!text.includes("subjective") && !text.includes("s:")) issues.push({ type: "warning", message: "Missing Subjective section", field: "SOAP" });
        if (!text.includes("objective") && !text.includes("o:")) issues.push({ type: "warning", message: "Missing Objective section", field: "SOAP" });
        if (!text.includes("assessment") && !text.includes("a:")) issues.push({ type: "warning", message: "Missing Assessment section", field: "SOAP" });
        if (!text.includes("plan") && !text.includes("p:")) issues.push({ type: "warning", message: "Missing Plan section", field: "SOAP" });
      } else {
        if (!text.includes("data") && !text.includes("d:")) issues.push({ type: "warning", message: "Missing Data section", field: "DAP" });
        if (!text.includes("assessment") && !text.includes("a:")) issues.push({ type: "warning", message: "Missing Assessment section", field: "DAP" });
        if (!text.includes("plan") && !text.includes("p:")) issues.push({ type: "warning", message: "Missing Plan section", field: "DAP" });
      }

      // Check for potential PHI exposure
      const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
      const phonePattern = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/;
      if (ssnPattern.test(noteText)) issues.push({ type: "critical", message: "Potential SSN detected — remove before storing", field: "PHI" });
      if (phonePattern.test(noteText)) issues.push({ type: "warning", message: "Phone number detected — verify this is necessary", field: "PHI" });

      // Length check
      if (noteText.length < 200) issues.push({ type: "info", message: "Note is very short — consider adding more clinical detail" });

      // Suggestions
      if (!text.includes("risk") && !text.includes("safety")) suggestions.push("Add a brief risk/safety assessment statement");
      if (!text.includes("next session") && !text.includes("follow-up")) suggestions.push("Include next session plan or follow-up timeline");
      if (!text.includes("client") && !text.includes("patient")) suggestions.push("Reference the client's response to interventions");

      const criticalCount = issues.filter((i) => i.type === "critical").length;
      const warningCount = issues.filter((i) => i.type === "warning").length;
      const score = Math.max(0, 100 - criticalCount * 25 - warningCount * 10 - (suggestions.length * 5));

      setComplianceResult({
        isCompliant: criticalCount === 0 && warningCount === 0,
        score,
        issues,
        suggestions,
      });
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => navigate("/clinician/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div className="h-5 w-px bg-slate-600" />
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Compliance Automation</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-teal-900/30 border border-teal-700/50 rounded-xl">
          <p className="text-sm text-teal-300">
            <strong>HIPAA Compliance Checker</strong> — Paste any clinical note to auto-check for HIPAA compliance issues,
            documentation completeness, and PHI exposure risks. No note content is stored.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                Note to Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Note Type</label>
                <Select value={noteType} onValueChange={(v) => setNoteType(v as "SOAP" | "DAP")}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOAP">SOAP Note</SelectItem>
                    <SelectItem value="DAP">DAP Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Note Content</label>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Paste your clinical note here for compliance checking..."
                  rows={12}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 font-mono text-sm"
                />
              </div>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleCheck}
                disabled={checking}
              >
                {checking ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                ) : (
                  <><Shield className="w-4 h-4 mr-2" /> Check Compliance</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-4">
            {complianceResult ? (
              <>
                {/* Score */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-sm font-medium">Compliance Score</span>
                      {complianceResult.isCompliant ? (
                        <Badge className="bg-emerald-900 text-emerald-300 border-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Compliant
                        </Badge>
                      ) : (
                        <Badge className="bg-red-900 text-red-300 border-red-700">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Issues Found
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-white">{complianceResult.score}</span>
                      <span className="text-slate-400 text-sm mb-1">/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${complianceResult.score}%`,
                          backgroundColor: complianceResult.score >= 80 ? "#10b981" : complianceResult.score >= 60 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Issues */}
                {complianceResult.issues.length > 0 && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">Issues Found ({complianceResult.issues.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {complianceResult.issues.map((issue, i) => (
                        <div key={i} className={`p-3 rounded-lg border text-sm ${ISSUE_COLORS[issue.type] ?? "bg-gray-100 text-gray-800"}`}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              {issue.field && <span className="font-medium">[{issue.field}] </span>}
                              {issue.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {complianceResult.suggestions.length > 0 && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">Improvement Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {complianceResult.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                          {s}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center py-20">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">Compliance results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HIPAA Quick Reference */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">HIPAA Documentation Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {[
                {
                  title: "Required PHI Identifiers to Protect",
                  items: ["Full name", "Geographic data", "Dates (except year)", "Phone/fax numbers", "Email addresses", "SSN, MRN, account numbers"],
                },
                {
                  title: "SOAP Note Required Elements",
                  items: ["Subjective: client's reported symptoms", "Objective: observable behaviors", "Assessment: clinical impression", "Plan: treatment interventions", "Session date & duration", "Clinician signature"],
                },
                {
                  title: "DAP Note Required Elements",
                  items: ["Data: client statements & behaviors", "Assessment: clinical interpretation", "Plan: next steps & interventions", "Session date & duration", "Risk assessment if applicable", "Clinician signature"],
                },
              ].map((section) => (
                <div key={section.title}>
                  <p className="font-medium text-teal-400 mb-2">{section.title}</p>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item} className="text-slate-400 flex items-start gap-1.5">
                        <span className="text-teal-500 mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
