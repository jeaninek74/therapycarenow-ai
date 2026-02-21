import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Shield, ChevronLeft, Loader2, AlertTriangle, MapPin, X, CheckCircle2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";

const QUESTIONS = [
  { id: "immediateDanger", text: "Are you in immediate danger right now?", warning: true },
  { id: "harmSelf", text: "Are you thinking about harming yourself right now?", warning: true },
  { id: "harmOthers", text: "Are you thinking about harming someone else right now?", warning: true },
  { id: "needHelpSoon", text: "Do you need to talk to someone within the next hour?", warning: false },
  { id: "needHelpToday", text: "Do you need help today?", warning: false },
] as const;

type QuestionId = (typeof QUESTIONS)[number]["id"];
type Answers = Partial<Record<QuestionId, boolean>>;

export default function Triage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"start" | number | "submitting">("start");
  const [answers, setAnswers] = useState<Answers>({});
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const geo = useGeolocation();

  // Auto-detect location when start screen mounts
  useEffect(() => {
    if (step === "start" && geo.status === "idle") {
      geo.detect();
    }
  }, [step]);

  // When geolocation succeeds, auto-set state
  useEffect(() => {
    if (geo.status === "success" && geo.stateCode) {
      setStateCode(geo.stateCode);
    }
  }, [geo.status, geo.stateCode]);

  const submitTriage = trpc.triage.submit.useMutation({
    onSuccess: (result) => {
      if (result.crisisMode || result.riskLevel === "EMERGENCY") {
        navigate("/crisis");
      } else if (result.riskLevel === "URGENT") {
        navigate("/urgent");
      } else {
        navigate("/routine");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
      setStep(0);
    },
  });

  const currentQuestion = typeof step === "number" ? QUESTIONS[step] : null;
  const progress = typeof step === "number" ? (step / QUESTIONS.length) * 100 : 0;

  function handleAnswer(answer: boolean) {
    if (typeof step !== "number") return;
    const questionId = QUESTIONS[step].id;
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Early exit: emergency trigger → crisis immediately
    if (answer && (questionId === "immediateDanger" || questionId === "harmSelf" || questionId === "harmOthers")) {
      submitTriage.mutate({
        immediateDanger: newAnswers.immediateDanger ?? false,
        harmSelf: newAnswers.harmSelf ?? false,
        harmOthers: newAnswers.harmOthers ?? false,
        needHelpSoon: false,
        needHelpToday: false,
        stateCode,
      });
      setStep("submitting");
      return;
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep("submitting");
      submitTriage.mutate({
        immediateDanger: newAnswers.immediateDanger ?? false,
        harmSelf: newAnswers.harmSelf ?? false,
        harmOthers: newAnswers.harmOthers ?? false,
        needHelpSoon: newAnswers.needHelpSoon ?? false,
        needHelpToday: newAnswers.needHelpToday ?? false,
        stateCode,
      });
    }
  }

  function handleBack() {
    if (step === 0) setStep("start");
    else if (typeof step === "number" && step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <div className="container py-12 max-w-xl mx-auto">
        {/* ── Start Screen ── */}
        {step === "start" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Let's get you to the right support.</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We'll ask you 5 quick questions to understand your situation. Your answers are private and help us route you to the right resources.
            </p>

            {/* Geolocation state detection */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Your state
                </span>
                {stateCode && (
                  <button
                    onClick={() => setShowStatePicker(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Change
                  </button>
                )}
              </div>

              {geo.status === "detecting" && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Detecting your location...
                </div>
              )}

              {geo.status === "success" && stateCode && !showStatePicker && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-foreground">
                    Detected: <strong>{geo.stateName}</strong>
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Used for local resources
                  </span>
                </div>
              )}

              {(geo.status === "denied" || geo.status === "unavailable" || geo.status === "error" || showStatePicker) && (
                <div>
                  {geo.error && !showStatePicker && (
                    <p className="text-xs text-muted-foreground mb-2">{geo.error}</p>
                  )}
                  <StatePicker
                    value={stateCode}
                    onChange={(val) => {
                      setStateCode(val);
                      setShowStatePicker(false);
                    }}
                    placeholder="Select your state (optional)"
                  />
                </div>
              )}

              {geo.status === "idle" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Checking location...</span>
                </div>
              )}

              {!stateCode && geo.status !== "detecting" && geo.status !== "idle" && (
                <p className="text-xs text-muted-foreground mt-1">
                  State is optional — we'll show national resources if not set.
                </p>
              )}
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> This is not a clinical assessment. If you are in immediate danger, call 911 now.
            </div>

            <button
              onClick={() => setStep(0)}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-4 text-lg hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Start
            </button>
            <a href="tel:988" className="block mt-4 text-destructive font-medium hover:underline text-sm">
              Skip and call 988 now
            </a>
          </div>
        )}

        {/* ── Submitting ── */}
        {step === "submitting" && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Finding the right resources for you...</p>
          </div>
        )}

        {/* ── Question ── */}
        {typeof step === "number" && currentQuestion && (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Question {step + 1} of {QUESTIONS.length}</span>
                <button onClick={handleBack} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {stateCode && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                <MapPin className="w-3 h-3" />
                Showing resources for {stateCode}
              </div>
            )}

            <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-sm">
              {currentQuestion.warning && (
                <div className="flex items-center gap-2 text-destructive text-sm mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  <span>If yes, we'll connect you to immediate help.</span>
                </div>
              )}
              <h2 className="text-2xl font-semibold text-foreground mb-8 leading-snug">
                {currentQuestion.text}
              </h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={submitTriage.isPending}
                  className="w-full py-4 rounded-xl border-2 border-destructive/30 text-destructive font-semibold text-lg hover:bg-destructive/5 hover:border-destructive active:scale-95 transition-all disabled:opacity-50"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={submitTriage.isPending}
                  className="w-full py-4 rounded-xl border-2 border-primary/30 text-primary font-semibold text-lg hover:bg-primary/5 hover:border-primary active:scale-95 transition-all disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Your answers are not stored as text. Only your risk level is recorded for safety.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
