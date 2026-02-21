import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search, Filter, Phone, Video, MapPin, DollarSign, ChevronRight, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SPECIALTIES = [
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "trauma", label: "Trauma / PTSD" },
  { value: "ptsd", label: "PTSD" },
  { value: "grief", label: "Grief & Loss" },
  { value: "couples", label: "Couples Therapy" },
  { value: "family", label: "Family Therapy" },
  { value: "addiction", label: "Addiction" },
  { value: "bipolar", label: "Bipolar Disorder" },
  { value: "ocd", label: "OCD" },
  { value: "adhd", label: "ADHD" },
  { value: "eating_disorders", label: "Eating Disorders" },
  { value: "lgbtq", label: "LGBTQ+" },
  { value: "child_adolescent", label: "Child & Adolescent" },
  { value: "veterans", label: "Veterans" },
  { value: "workplace_stress", label: "Workplace Stress" },
];

const COST_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "sliding_scale", label: "Sliding Scale" },
  { value: "insurance", label: "Insurance Accepted" },
  { value: "self_pay", label: "Self-Pay" },
];

const INSURANCE_OPTIONS = [
  "Aetna", "Blue Cross", "Blue Shield", "Cigna", "Humana", "Medicaid",
  "Medicare", "Tricare", "United", "Anthem", "Optum", "Magellan",
];

export default function FindTherapist() {
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const [telehealth, setTelehealth] = useState<boolean | undefined>(undefined);
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);
  const [insurance, setInsurance] = useState<string | undefined>(undefined);
  const [costTag, setCostTag] = useState<"free" | "sliding_scale" | "insurance" | "self_pay" | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const { data: providers, isLoading } = trpc.providers.search.useQuery({
    stateCode,
    telehealth,
    specialty,
    insurance,
    costTag,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find a Therapist</h1>
          <p className="text-muted-foreground mb-8">Search providers by your needs, insurance, and location.</p>

          {/* Search filters */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <StatePicker value={stateCode} onChange={setStateCode} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Specialty</label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Telehealth toggle */}
            <div className="flex items-center gap-3 mb-4">
              <Switch
                id="telehealth"
                checked={telehealth === true}
                onCheckedChange={(v) => setTelehealth(v ? true : undefined)}
              />
              <Label htmlFor="telehealth" className="text-sm font-medium text-foreground">
                <Video className="w-4 h-4 inline mr-1" />
                Telehealth only
              </Label>
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide" : "Show"} more filters
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Insurance</label>
                  <Select value={insurance} onValueChange={setInsurance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_OPTIONS.map((ins) => (
                        <SelectItem key={ins} value={ins}>{ins}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cost</label>
                  <Select value={costTag} onValueChange={(v) => setCostTag(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any cost" />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : providers && providers.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">{providers.length} provider{providers.length !== 1 ? "s" : ""} found</p>
              <div className="flex flex-col gap-4">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No providers found</h3>
              <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or selecting a different state.</p>
              <Link href="/free-resources" className="text-primary font-medium hover:underline text-sm">
                View free resources instead →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: any }) {
  return (
    <Link
      href={`/provider/${provider.id}`}
      className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
              {provider.name}
            </h3>
            {provider.acceptsNewPatients && (
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                Accepting patients
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3">
            {provider.licenseType}
            {provider.city && ` · ${provider.city}`}
            {provider.stateCode && `, ${provider.stateCode}`}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {provider.telehealthAvailable && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Video className="w-3 h-3" /> Telehealth
              </span>
            )}
            {provider.inPersonAvailable && (
              <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" /> In-person
              </span>
            )}
            {provider.costTag && (
              <span className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full capitalize">
                <DollarSign className="w-3 h-3" /> {provider.costTag.replace("_", " ")}
              </span>
            )}
            {provider.urgencyAvailability === "within_24h" && (
              <span className="text-xs bg-[oklch(0.72_0.16_65)]/15 text-[oklch(0.52_0.10_65)] px-2 py-1 rounded-full font-medium">
                Available within 24h
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              <Phone className="w-4 h-4" />
              {provider.phone}
            </a>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}
