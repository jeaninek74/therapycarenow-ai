import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import NavBar from "@/components/NavBar";
import { CheckCircle2, XCircle, Clock, Shield, Loader2, Eye, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Submission = {
  id: number;
  name: string;
  npiNumber: string;
  licenseType: string;
  licenseState: string;
  licenseNumber?: string | null;
  specialty?: string | null;
  phone?: string | null;
  bio?: string | null;
  city?: string | null;
  stateCode?: string | null;
  status: string;
  npiValid?: boolean | null;
  adminNotes?: string | null;
  createdAt: Date;
};

export default function AdminVerificationQueue() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: allSubmissions, isLoading, refetch } = trpc.verification.getSubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Client-side filter by status
  const submissions = statusFilter === "all"
    ? (allSubmissions ?? [])
    : (allSubmissions ?? []).filter((s) => s.status === statusFilter);

  const reviewSubmission = trpc.verification.reviewSubmission.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(variables.action === "approve" ? "Provider approved and added to directory" : "Submission rejected");
      setDialogOpen(false);
      refetch();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const openDialog = (sub: Submission) => {
    setSelectedSubmission(sub);
    setAdminNotes(sub.adminNotes ?? "");
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const pendingCount = (submissions ?? []).filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-600" />
              Provider Verification Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and approve provider submissions. All licenses are verified against NPPES and state boards.
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1">
              {pendingCount} pending review
            </Badge>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal-400"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : (submissions ?? []).length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No submissions in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(submissions ?? []).map((sub) => (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{sub.name}</h3>
                        <Badge className={
                          sub.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                          sub.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>NPI: <span className="font-mono text-slate-700">{sub.npiNumber}</span></span>
                        <span>{sub.licenseType} — {sub.licenseState}</span>
                        {sub.city && <span>{sub.city}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`flex items-center gap-1 text-xs ${sub.npiValid ? "text-emerald-600" : "text-red-500"}`}>
                          {sub.npiValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          NPI {sub.npiValid ? "Verified" : "Unverified"}
                        </div>
                        {!sub.npiValid && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Needs manual review
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        title="Refresh"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(sub)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Review
                      </Button>
                      {sub.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => reviewSubmission.mutate({ submissionId: sub.id, action: "approve", adminNotes: "" })}
                            disabled={reviewSubmission.isPending}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => reviewSubmission.mutate({ submissionId: sub.id, action: "reject", adminNotes: "Does not meet requirements" })}
                            disabled={reviewSubmission.isPending}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Submission — {selectedSubmission?.name}</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["NPI Number", selectedSubmission.npiNumber],
                  ["License Type", selectedSubmission.licenseType],
                  ["License State", selectedSubmission.licenseState],
                  ["License Number", selectedSubmission.licenseNumber ?? "Not provided"],
                  ["Specialty", selectedSubmission.specialty ?? "Not specified"],
                  ["Phone", selectedSubmission.phone ?? "Not provided"],
                  ["Location", [selectedSubmission.city, selectedSubmission.stateCode].filter(Boolean).join(", ") || "Not provided"],
                  ["Submitted", new Date(selectedSubmission.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="text-slate-800 font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {selectedSubmission.bio && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Bio</p>
                  <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg">{selectedSubmission.bio}</p>
                </div>
              )}
              <div className="flex gap-3">
                <div className={`flex-1 p-3 rounded-lg border text-sm ${selectedSubmission.npiValid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                  <strong>NPI:</strong> {selectedSubmission.npiValid ? "Verified via NPPES" : "Could not verify — manual review required"}
                </div>
                <div className="flex-1 p-3 rounded-lg border text-sm bg-amber-50 border-amber-200 text-amber-700">
                  <strong>License:</strong> Verify manually via state licensing board
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this submission..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            {selectedSubmission?.status === "pending" && (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => reviewSubmission.mutate({ submissionId: selectedSubmission.id, action: "approve", adminNotes })}
                  disabled={reviewSubmission.isPending}
                >
                  {reviewSubmission.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  Approve & Publish
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => reviewSubmission.mutate({ submissionId: selectedSubmission.id, action: "reject", adminNotes: adminNotes || "Does not meet requirements" })}
                  disabled={reviewSubmission.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
