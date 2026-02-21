import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ClipboardList, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdaptiveIntake() {
  const [, navigate] = useLocation();
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId ?? "0");
  const { user, loading, isAuthenticated } = useAuth();

  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [sliderValue, setSliderValue] = useState<number[]>([5]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: questions, isLoading: questionsLoading, refetch } = trpc.clinician.getIntakeQuestions.useQuery(
    { clientId, answeredKeys: [], answers: {} },
    { enabled: !!clientId && isAuthenticated }
  );

  const { data: existingResponses } = trpc.clinician.getIntakeResponses.useQuery(
    { clientId },
    { enabled: !!clientId && isAuthenticated }
  );

  const saveResponse = trpc.clinician.saveIntakeResponse.useMutation({
    onSuccess: () => {
      setCurrentAnswer("");
      setSliderValue([5]);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const currentQuestion = questions?.[0];

  const handleSubmit = () => {
    if (!currentQuestion) return;
    const answer = currentQuestion.type === "scale" ? String(sliderValue[0]) : currentAnswer;
    if (!answer.trim()) {
      toast.error("Please provide an answer before continuing");
      return;
    }
                  saveResponse.mutate({
                    clientId,
                    questionKey: currentQuestion.key,
                    questionText: currentQuestion.text,
                    answer,
                  });
  };

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (completed || (!questionsLoading && (!questions || questions.length === 0))) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Intake Complete</h2>
            <p className="text-slate-400 mb-6">
              All intake questions have been answered. You can review responses in the client profile.
            </p>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => navigate(`/clinician/clients/${clientId}`)}
            >
              View Client Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredCount = existingResponses?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => navigate(`/clinician/clients/${clientId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Client
          </Button>
          <div className="h-5 w-px bg-slate-600" />
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Adaptive Intake</h1>
          </div>
          {answeredCount > 0 && (
            <Badge className="ml-auto bg-teal-900 text-teal-300 border-teal-700">
              {answeredCount} answered
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {currentQuestion ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-teal-900 text-teal-300 border-teal-700 text-xs">
                  {currentQuestion.type}
                </Badge>
              </div>
              <CardTitle className="text-white text-lg leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text answer */}
              {currentQuestion.type === "text" && (
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Enter your response..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              )}

              {/* Multiple choice / multiselect */}
              {currentQuestion.type === "multiselect" && currentQuestion.options && (
                <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                  <div className="space-y-2">
                    {(currentQuestion.options as string[]).map((opt) => (
                      <div key={opt} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 cursor-pointer">
                        <RadioGroupItem value={opt} id={opt} className="border-slate-400" />
                        <Label htmlFor={opt} className="text-slate-200 cursor-pointer flex-1">{opt}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Boolean */}
              {currentQuestion.type === "boolean" && (
                <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                  <div className="space-y-2">
                    {["Yes", "No"].map((opt) => (
                      <div key={opt} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 cursor-pointer">
                        <RadioGroupItem value={opt.toLowerCase()} id={opt} className="border-slate-400" />
                        <Label htmlFor={opt} className="text-slate-200 cursor-pointer flex-1">{opt}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Scale */}
              {currentQuestion.type === "scale" && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Not at all (0)</span>
                    <span className="text-2xl font-bold text-teal-400">{sliderValue[0]}</span>
                    <span>Extremely (10)</span>
                  </div>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    saveResponse.mutate({
                      clientId,
                      questionKey: currentQuestion.key,
                      questionText: currentQuestion.text,
                      answer: "skipped",
                    });
                  }}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleSubmit}
                  disabled={saveResponse.isPending}
                >
                  {saveResponse.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">All intake questions answered</p>
          </div>
        )}

        {/* Previous Responses */}
        {(existingResponses ?? []).length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Previous Responses</h3>
            <div className="space-y-2">
              {(existingResponses ?? []).map((resp) => (
                <div key={resp.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">{resp.questionKey}</p>
                  <p className="text-sm text-slate-300">{resp.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
