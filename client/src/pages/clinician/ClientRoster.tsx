import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Search, AlertTriangle, UserCircle, ArrowLeft } from "lucide-react";
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
  none: "bg-slate-100 text-slate-600",
};

const STATUS_TABS = ["all", "active", "inactive", "discharged"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function ClientRoster() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [diagnosisCodes, setDiagnosisCodes] = useState("");
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "clinician" && user?.role !== "admin"))) {
      navigate("/clinician/login");
    }
  }, [loading, isAuthenticated, user, navigate]);

  const { data: clients, isLoading, refetch } = trpc.clinician.getClients.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "clinician" || user?.role === "admin"),
  });

  const addClient = trpc.clinician.addClient.useMutation({
    onSuccess: () => {
      toast.success("Client added successfully");
      setDialogOpen(false);
      setFirstName(""); setLastName(""); setDateOfBirth("");
      setDiagnosisCodes(""); setGoals(""); setNotes("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = (clients ?? []).filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch = search === "" || fullName.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    addClient.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      diagnosisCodes: diagnosisCodes ? diagnosisCodes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      goals: goals ? goals.split(",").map((s) => s.trim()).filter(Boolean) : [],
      notes: notes || undefined,
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-teal-600 animate-pulse">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/clinician/dashboard")} className="text-slate-600">
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <h1 className="text-lg font-semibold text-slate-900">Client Roster</h1>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
                <div>
                  <Label>Diagnosis Codes (comma-separated)</Label>
                  <Input value={diagnosisCodes} onChange={(e) => setDiagnosisCodes(e.target.value)} placeholder="F32.1, F41.1" />
                </div>
                <div>
                  <Label>Treatment Goals (comma-separated)</Label>
                  <Input value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Reduce anxiety, Improve sleep" />
                </div>
                <div>
                  <Label>Initial Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Referral source, presenting concerns..." rows={3} />
                </div>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleAddClient}
                  disabled={addClient.isPending}
                >
                  {addClient.isPending ? "Adding..." : "Add Client"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search clients by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  statusFilter === tab
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Client Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No clients found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? "Try a different search term" : "Add your first client to get started"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <div
                key={client.id}
                onClick={() => navigate(`/clinician/clients/${client.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {client.firstName} {client.lastName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Updated {new Date(client.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {(client.riskLevel === "crisis" || client.riskLevel === "high") && (
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={`text-xs ${STATUS_COLORS[client.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {client.status}
                  </Badge>
                  {client.riskLevel && (
                    <Badge className={`text-xs ${RISK_COLORS[client.riskLevel] ?? "bg-gray-100 text-gray-600"}`}>
                      {client.riskLevel} risk
                    </Badge>
                  )}
                </div>
                {client.diagnosisCodes && (
                  <p className="text-xs text-slate-400 mt-2 truncate">
                    Dx: {String(client.diagnosisCodes).split(",").slice(0, 3).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
