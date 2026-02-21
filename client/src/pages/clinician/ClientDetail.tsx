import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, FileText, Brain, Activity, ClipboardList,
  Plus, CheckCircle2, AlertTriangle, Loader2, Wand2
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-100 text-slate-600",
  discharged: "bg-blue-100 text-blue-800",
  on_hold: "bg-amber-100 text-amber-800",
};

const RISK_COLORS: Record<string, string> = {
  crisis: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  moderate: "bg-amber-100 text-amber-800",
  low: "bg-emerald-100 text-emerald-800",
};

export default function ClientDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);
  const { user, loading, isAuthenticated } = useAuth();

  const [treatmentGoals, setTreatmentGoals] = useState("");
  const [interventions, setInterventions] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: client, isLoading: clientLoading } = trpc.clinician.getClient.useQuery(
    { clientId },
    { enabled: !!clientId && isAuthenticated }
  );

  const { data: notes, isLoading: notesLoading } = trpc.clinician.getNotes.useQuery(
    { clientId },
    { enabled: !!clientId && isAuthenticated }
  );

  const { data: treatmentPlan, isLoading: planLoading } = trpc.clinician.getTreatmentPlan.useQuery(
    { clientId },
    { enabled: !!clientId && isAuthenticated }
  );

  const { data: checkIns } = trpc.clinician.getCheckins.useQuery(
    { clientId },
    { enabled: !!clientId && isAuthenticated }
  );

  const { data: riskFlags } = trpc.clinician.getRiskFlags.useQuery(
    { clientId },
    { enabled: !!clientId && isAuthenticated }
  );

  const generateTreatmentPlan = trpc.clinician.generateTreatmentPlan.useMutation({
    onSuccess: (data) => {
      setTreatmentGoals(data.goalRefinements.join("\n"));
      setInterventions(data.interventions.join("\n"));
      toast.success("Treatment plan suggestions generated");
    },
    onError: (err) => toast.error(err.message),
  });

  const saveTreatmentPlan = trpc.clinician.saveTreatmentPlan.useMutation({
    onSuccess: () => {
      setSavingPlan(false);
      toast.success("Treatment plan saved");
    },
    onError: (err) => {
      setSavingPlan(false);
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (treatmentPlan) {
      const rawGoals = (treatmentPlan as unknown as Record<string, unknown>).goals;
      const rawInterventions = (treatmentPlan as unknown as Record<string, unknown>).interventions;
      const planGoals = Array.isArray(rawGoals) ? (rawGoals as string[]) : [];
      const planInterventions = Array.isArray(rawInterventions) ? (rawInterventions as string[]) : [];
      setTreatmentGoals(planGoals.length > 0 ? planGoals.join("\n") : "");
      setInterventions(planInterventions.length > 0 ? planInterventions.join("\n") : "");
    }
  }, [treatmentPlan]);

  if (loading || clientLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Client not found</p>
          <Button onClick={() => navigate("/clinician/clients")}>Back to Roster</Button>
        </div>
      </div>
    );
  }

  const activeFlags = (riskFlags ?? []).filter((f) => !f.resolvedAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/clinician/clients")} className="text-slate-600">
              <ArrowLeft className="w-4 h-4 mr-1" /> Roster
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {client.firstName} {client.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={`text-xs ${STATUS_COLORS[client.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {client.status}
                </Badge>
                {client.riskLevel && (
                  <Badge className={`text-xs ${RISK_COLORS[client.riskLevel] ?? "bg-gray-100 text-gray-600"}`}>
                    {client.riskLevel} risk
                  </Badge>
                )}
                {activeFlags.length > 0 && (
                  <Badge className="text-xs bg-red-100 text-red-800">
                    {activeFlags.length} active flag{activeFlags.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => navigate("/clinician/notes/new")}
          >
            <Plus className="w-4 h-4 mr-2" /> New Note
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="notes">
          <TabsList className="mb-6">
            <TabsTrigger value="notes" className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Notes
              {(notes ?? []).length > 0 && (
                <Badge className="bg-teal-100 text-teal-800 text-xs ml-1">{(notes ?? []).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Treatment Plan
            </TabsTrigger>
            <TabsTrigger value="checkins" className="flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Check-ins
              {(checkIns ?? []).length > 0 && (
                <Badge className="bg-teal-100 text-teal-800 text-xs ml-1">{(checkIns ?? []).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="intake" className="flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4" /> Intake
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes">
            {notesLoading ? (
              <div className="text-center py-8 text-gray-400">Loading notes...</div>
            ) : (notes ?? []).length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No session notes yet</p>
                <Button
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => navigate("/clinician/notes/new")}
                >
                  Create First Note
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(notes ?? []).map((note) => (
                  <Card key={note.id} className="bg-white border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-teal-100 text-teal-800 text-xs">{note.noteType}</Badge>
                          {note.cptCode && (
                            <Badge className="bg-slate-100 text-slate-700 text-xs font-mono">{note.cptCode}</Badge>
                          )}
                          <Badge className={`text-xs ${note.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {note.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(note.sessionDate).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {note.approvedNote ?? note.generatedNote ?? ""}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Treatment Plan Tab */}
          <TabsContent value="treatment">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-teal-600" />
                    Treatment Plan
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateTreatmentPlan.mutate({
                      clientId,
                      diagnosisCodes: client.diagnosisCodes ? String(client.diagnosisCodes).split(",") : [],
                      presentingProblems: [],
                      goals: client.goals ? String(client.goals).split(",") : [],
                    })}
                    disabled={generateTreatmentPlan.isPending}
                    className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    {generateTreatmentPlan.isPending ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5 mr-1.5" /> AI Suggest</>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {planLoading ? (
                  <div className="text-center py-6 text-gray-400">Loading treatment plan...</div>
                ) : (
                  <>
                    <div>
                      <Label>Treatment Goals (one per line)</Label>
                      <Textarea
                        value={treatmentGoals}
                        onChange={(e) => setTreatmentGoals(e.target.value)}
                        placeholder="Reduce depressive symptoms&#10;Improve daily functioning&#10;Develop coping strategies"
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Interventions (one per line)</Label>
                      <Textarea
                        value={interventions}
                        onChange={(e) => setInterventions(e.target.value)}
                        placeholder="CBT techniques for negative thought patterns&#10;Behavioral activation scheduling&#10;Mindfulness-based stress reduction"
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => {
                        setSavingPlan(true);
                        saveTreatmentPlan.mutate({
                          clientId,
                          diagnosisCodes: client.diagnosisCodes ? String(client.diagnosisCodes).split(",") : [],
                          goals: treatmentGoals.split("\n").filter(Boolean),
                          interventions: interventions.split("\n").filter(Boolean),
                        });
                      }}
                      disabled={savingPlan || saveTreatmentPlan.isPending}
                    >
                      {savingPlan ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Treatment Plan</>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="checkins">
            {(checkIns ?? []).length === 0 ? (
              <div className="text-center py-16">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No check-ins recorded yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Check-ins are submitted by clients between sessions
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(checkIns ?? []).map((ci) => (
                  <Card key={ci.id} className="bg-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            (ci.mood ?? 5) >= 7 ? "bg-emerald-100 text-emerald-700" :
                            (ci.mood ?? 5) >= 4 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {ci.mood ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              Mood: {ci.mood}/10
                              {ci.anxiety !== null && ` · Anxiety: ${ci.anxiety}/10`}
                              {ci.energy !== null && ` · Energy: ${ci.energy}/10`}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(ci.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {false && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Crisis Flag</Badge>
                        )}
                      </div>
                      {ci.notes && (
                        <p className="text-sm text-slate-600 mt-2 pl-13">{ci.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Intake Tab */}
          <TabsContent value="intake">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-teal-600" />
                  Adaptive Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => navigate(`/clinician/intake/${clientId}`)}
                >
                  Start Intake Assessment
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Dynamic questionnaire that adapts based on client responses. Results are stored and inform treatment planning.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
