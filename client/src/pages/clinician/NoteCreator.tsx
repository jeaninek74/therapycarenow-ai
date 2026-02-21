import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Wand2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Session Setup", "Transcript", "AI Generation", "Review & Approve"];

export default function NoteCreator() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [clientId, setClientId] = useState<string>("");
  const [noteType, setNoteType] = useState<"SOAP" | "DAP">("SOAP");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionDuration, setSessionDuration] = useState(50);

  // Step 2 state
  const [transcript, setTranscript] = useState("");
  const [diagnosisCodes, setDiagnosisCodes] = useState("");
  const [goals, setGoals] = useState("");

  // Step 3 state
  const [generatedNote, setGeneratedNote] = useState("");
  const [noteId, setNoteId] = useState<number | null>(null);
  const [cptCode, setCptCode] = useState("");
  const [riskSignals, setRiskSignals] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: clients } = trpc.clinician.getClients.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin"),
  });

  const selectedClient = clients?.find((c) => String(c.id) === clientId);

  // Pre-fill from client when selected
  useEffect(() => {
    if (selectedClient) {
      if (selectedClient.diagnosisCodes) {
        setDiagnosisCodes(String(selectedClient.diagnosisCodes));
      }
      if (selectedClient.goals) {
        setGoals(String(selectedClient.goals));
      }
    }
  }, [selectedClient]);

  const generateNote = trpc.clinician.generateNote.useMutation({
    onSuccess: (data) => {
      setGeneratedNote(data.note ?? "");
      setNoteId(data.noteId);
      setCptCode(data.cptCodeSuggestion ?? "");
      setRiskSignals(data.riskSignals ?? []);
      setStep(2);
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: complianceData } = trpc.clinician.checkNoteCompliance.useQuery(
    { noteId: noteId! },
    { enabled: noteId !== null && step === 3 }
  );

  const approveNote = trpc.clinician.approveNote.useMutation({
    onSuccess: () => {
      toast.success("Note approved and saved");
      navigate("/clinician/clients/" + clientId);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = () => {
    if (!clientId) { toast.error("Please select a client"); return; }
    if (!transcript.trim()) { toast.error("Please enter a session transcript"); return; }
    generateNote.mutate({
      clientId: Number(clientId),
      noteType,
      transcript,
      sessionDate,
      sessionDurationMin: sessionDuration,
      diagnosisCodes: diagnosisCodes ? diagnosisCodes.split(",").map((s) => s.trim()) : [],
      goals: goals ? goals.split(",").map((s) => s.trim()) : [],
    });
  };

  const complianceScore = complianceData?.score ?? 0;
  const complianceColor =
    complianceScore >= 80 ? "bg-emerald-500" : complianceScore >= 60 ? "bg-amber-500" : "bg-red-500";

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
            <FileText className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">AI Note Creator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? "bg-teal-500 text-white" :
                  i === step ? "bg-teal-600 text-white ring-2 ring-teal-400" :
                  "bg-slate-700 text-slate-400"
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 text-center hidden sm:block ${i === step ? "text-teal-300" : "text-slate-500"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-teal-500" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Session Setup */}
        {step === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Session Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-slate-300">Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.firstName} {c.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Note Type</Label>
                <div className="flex gap-2 mt-1">
                  {(["SOAP", "DAP"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNoteType(type)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        noteType === type
                          ? "bg-teal-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {noteType === "SOAP" ? "Subjective, Objective, Assessment, Plan" : "Data, Assessment, Plan"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Session Date</Label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Duration (minutes)</Label>
                  <input
                    type="number"
                    min={16}
                    max={90}
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => {
                  if (!clientId) { toast.error("Please select a client"); return; }
                  setStep(1);
                }}
              >
                Next: Enter Transcript <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Transcript */}
        {step === 1 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Session Transcript</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-slate-300">Session Transcript *</Label>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste or type the session transcript here. You can include therapist and client dialogue, observations, or session notes..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 mt-1 min-h-[200px]"
                  rows={10}
                />
                <p className="text-xs text-slate-500 mt-1">{transcript.length} characters</p>
              </div>

              <div>
                <Label className="text-slate-300">Diagnosis Codes (comma-separated)</Label>
                <input
                  type="text"
                  value={diagnosisCodes}
                  onChange={(e) => setDiagnosisCodes(e.target.value)}
                  placeholder="F32.1, F41.1"
                  className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-slate-300">Treatment Goals (comma-separated)</Label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Reduce anxiety, Improve coping skills"
                  className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm placeholder:text-slate-500"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleGenerate}
                  disabled={generateNote.isPending}
                >
                  {generateNote.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Note...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" /> Generate {noteType} Note</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Generated Note */}
        {step === 2 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-teal-400" />
                AI-Generated {noteType} Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {cptCode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Suggested CPT Code:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 font-mono">{cptCode}</Badge>
                </div>
              )}

              {riskSignals.length > 0 && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Risk Signals Detected</span>
                  </div>
                  <ul className="space-y-1">
                    {riskSignals.map((signal, i) => (
                      <li key={i} className="text-sm text-red-200">• {signal}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <Label className="text-slate-300">Review and Edit Note</Label>
                <Textarea
                  value={generatedNote}
                  onChange={(e) => setGeneratedNote(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white mt-1 min-h-[300px] font-mono text-sm"
                  rows={15}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => setStep(3)}
                >
                  Review Compliance <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Compliance & Approve */}
        {step === 3 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                Compliance Check & Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {complianceData ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Documentation Score</span>
                      <span className={`font-bold ${complianceScore >= 80 ? "text-emerald-400" : complianceScore >= 60 ? "text-amber-400" : "text-red-400"}`}>
                        {complianceScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${complianceColor}`}
                        style={{ width: `${complianceScore}%` }}
                      />
                    </div>
                  </div>

                  {complianceData.issues && complianceData.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Issues to address:</p>
                      <ul className="space-y-1">
                        {complianceData.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-amber-300 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            {issue.field}: {issue.issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}


                </>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running compliance check...
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    if (!noteId) return;
                    approveNote.mutate({ noteId, approvedNote: generatedNote });
                  }}
                  disabled={approveNote.isPending || !noteId}
                >
                  {approveNote.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Save Note</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
