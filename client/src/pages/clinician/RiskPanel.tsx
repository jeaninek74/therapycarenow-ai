import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, ArrowLeft, Shield, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  moderate: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const SEVERITY_BORDER: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  moderate: "border-l-amber-500",
  low: "border-l-blue-500",
};

export default function RiskPanel() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedFlagId, setSelectedFlagId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: flags, isLoading, refetch } = trpc.clinician.getRiskFlags.useQuery(
    { clientId: undefined },
    { enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin") }
  );

  const resolveFlag = trpc.clinician.resolveRiskFlag.useMutation({
    onSuccess: () => {
      toast.success("Risk flag resolved");
      setResolveDialogOpen(false);
      setResolutionNotes("");
      setSelectedFlagId(null);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  const activeFlags = (flags ?? []).filter((f) => !f.resolvedAt);
  const resolvedFlags = (flags ?? []).filter((f) => f.resolvedAt);
  const displayedFlags = showResolved ? resolvedFlags : activeFlags;

  const criticalCount = activeFlags.filter((f) => f.severity === "critical").length;
  const highCount = activeFlags.filter((f) => f.severity === "high").length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => navigate("/clinician/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <div className="h-5 w-px bg-slate-600" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h1 className="text-lg font-semibold">Risk Detection Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-600 text-white">{criticalCount} Critical</Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-500 text-white">{highCount} High</Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Flags", value: activeFlags.length, color: "text-red-400" },
            { label: "Critical", value: criticalCount, color: "text-red-400" },
            { label: "High", value: highCount, color: "text-orange-400" },
            { label: "Resolved", value: resolvedFlags.length, color: "text-emerald-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowResolved(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showResolved ? "bg-teal-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Active ({activeFlags.length})
          </button>
          <button
            onClick={() => setShowResolved(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showResolved ? "bg-teal-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Resolved ({resolvedFlags.length})
          </button>
        </div>

        {/* Flags List */}
        {displayedFlags.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">
              {showResolved ? "No resolved flags" : "No active risk flags"}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {!showResolved && "Risk signals from session notes and check-ins will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedFlags.map((flag) => (
              <Card
                key={flag.id}
                className={`bg-slate-800 border-slate-700 border-l-4 ${SEVERITY_BORDER[flag.severity] ?? "border-l-slate-500"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${SEVERITY_COLORS[flag.severity] ?? "bg-gray-100 text-gray-800"}`}>
                          {flag.severity}
                        </Badge>
                        <span className="text-sm font-medium text-white">
                          {flag.flagType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <span className="text-xs text-slate-500">
                          Client #{flag.clientId}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{flag.description}</p>
                      {flag.resolvedAt && (
                        <p className="text-xs text-emerald-400 mt-1">
                          Resolved {new Date(flag.resolvedAt).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Flagged {new Date(flag.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                        onClick={() => navigate(`/clinician/clients/${flag.clientId}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!flag.resolvedAt && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => {
                            setSelectedFlagId(flag.id);
                            setResolveDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Risk Flag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Resolution Notes</label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how this risk was addressed (safety plan created, referral made, etc.)..."
                rows={4}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (!selectedFlagId) return;
                resolveFlag.mutate({
                  flagId: selectedFlagId,
                });
              }}
              disabled={resolveFlag.isPending}
            >
              {resolveFlag.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resolving...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
