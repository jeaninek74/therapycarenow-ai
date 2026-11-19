import { useState, useEffect } from "react";
import { milesBetweenZips } from "@shared/socalZips";
import { INSURER_DIRECTORIES } from "@shared/insurerDirectories";
import { Link } from "wouter";
import { INSURANCE_OPTIONS } from "@shared/insurances";
import { trpc } from "@/lib/trpc";
import {
  Search, Filter, Phone, Video, MapPin, DollarSign, ChevronRight,
  Loader2, Globe, Stethoscope, Brain, UserCheck, X,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import CountyPicker from "@/components/CountyPicker";
import { SERVICE_REGION_NAME, SOCAL_COUNTIES, getSoCalCounty } from "@shared/region";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Category = "Therapist" | "Psychiatrist" | "Psychologist";

const CATEGORY_META: Record<Category, {
  label: string;
  plural: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  badge: string;
  description: string;
}> = {
  Therapist: {
    label: "Therapist",
    plural: "Therapists",
    icon: <UserCheck className="w-4 h-4" />,
    color: "text-[oklch(0.45_0.18_200)]",
    bg: "bg-[oklch(0.55_0.18_200)]/10",
    badge: "bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)]",
    description: "Licensed counselors providing talk therapy, Cognitive Behavioral Therapy, Dialectical Behavior Therapy, Eye Movement Desensitization and Reprocessing, and more. Cannot prescribe medication.",
  },
  Psychiatrist: {
    label: "Psychiatrist",
    plural: "Psychiatrists",
    icon: <Stethoscope className="w-4 h-4" />,
    color: "text-[oklch(0.45_0.18_30)]",
    bg: "bg-[oklch(0.55_0.18_30)]/10",
    badge: "bg-[oklch(0.55_0.18_30)]/10 text-[oklch(0.45_0.18_30)]",
    description: "Medical doctors and psychiatric nurse practitioners (MD/DO/PMHNP/APRN/NP) who diagnose, treat, and prescribe medication.",
  },
  Psychologist: {
    label: "Psychologist",
    plural: "Psychologists",
    icon: <Brain className="w-4 h-4" />,
    color: "text-[oklch(0.45_0.18_280)]",
    bg: "bg-[oklch(0.55_0.18_280)]/10",
    badge: "bg-[oklch(0.55_0.18_280)]/10 text-[oklch(0.45_0.18_280)]",
    description: "Doctoral-level clinicians (PhD/PsyD) specializing in psychological testing, assessment, and advanced psychotherapy.",
  },
};

const CATEGORIES: Category[] = ["Therapist", "Psychiatrist", "Psychologist"];

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

export default function FindTherapist() {
  const [activeCategory, setActiveCategory] = useState<Category>("Therapist");
  const [county, setCounty] = useState<string | undefined>(undefined);
  const [cityInput, setCityInput] = useState<string>("");
  const [zip, setZip] = useState("");
  const userZip = /^\d{5}$/.test(zip) ? zip : undefined;
  const [city, setCity] = useState<string | undefined>(undefined);
  const [telehealth, setTelehealth] = useState<boolean | undefined>(undefined);
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);
  const [insurance, setInsurance] = useState<string | undefined>(undefined);
  const [costTag, setCostTag] = useState<"free" | "sliding_scale" | "insurance" | "self_pay" | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(50);

  // Pre-fill from directory navigation
  useEffect(() => {
    const preCounty = sessionStorage.getItem("tcn_county");
    const preCity = sessionStorage.getItem("tcn_city");
    const preCat = sessionStorage.getItem("tcn_category") as Category | null;
    if (preCounty) { setCounty(preCounty); sessionStorage.removeItem("tcn_county"); }
    if (preCity) { setCityInput(preCity); setCity(preCity); sessionStorage.removeItem("tcn_city"); }
    if (preCat && CATEGORIES.includes(preCat)) { setActiveCategory(preCat); sessionStorage.removeItem("tcn_category"); }

    // Also support ?category= URL param
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("category") as Category | null;
    if (catParam && CATEGORIES.includes(catParam)) setActiveCategory(catParam);
    const countyParam = params.get("county");
    if (countyParam && getSoCalCounty(countyParam)) setCounty(countyParam);
    const insuranceParam = params.get("insurance");
    if (insuranceParam && INSURANCE_OPTIONS.includes(insuranceParam)) setInsurance(insuranceParam);
  }, []);

  const { data: searchData, isLoading } = trpc.providers.searchByCategory.useQuery({
    category: activeCategory,
    county,
    city,
    telehealth,
    specialty,
    insurance,
    costTag,
    zip: userZip,
    limit,
  });

  const results = (searchData ?? [])
    .map((p: any) => ({ ...p, milesAway: userZip ? milesBetweenZips(userZip, p.zipCode) : null }))
    .sort((a: any, b: any) => (userZip ? (a.milesAway ?? 1e9) - (b.milesAway ?? 1e9) : 0));
  const meta = CATEGORY_META[activeCategory];

  function clearFilters() {
    setCounty(undefined);
    setCityInput("");
    setCity(undefined);
    setZip("");
    setTelehealth(undefined);
    setSpecialty(undefined);
    setInsurance(undefined);
    setCostTag(undefined);
    setLimit(50);
  }

  const hasFilters = !!(county || city || zip || telehealth || specialty || insurance || costTag);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Category Tabs ─────────────────────────────────────────────── */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Find a Provider</h1>
            <p className="text-muted-foreground mb-5">
              Search therapists, psychiatrists, and psychologists by location, specialty, and insurance.
            </p>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const m = CATEGORY_META[cat];
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setLimit(50); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                      isActive
                        ? `${m.bg} ${m.color} border-current`
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {m.icon}
                    {m.plural}
                  </button>
                );
              })}
            </div>

            {/* Category description */}
            <p className={`mt-3 text-sm ${meta.color} font-medium`}>
              {meta.description}
            </p>
          </div>

          {/* ── Search Filters ─────────────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">County</label>
                <CountyPicker value={county} onChange={setCounty} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Pasadena"
                    list="socal-cities"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") setCity(cityInput || undefined); }}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <datalist id="socal-cities">
                    {(getSoCalCounty(county) ? [getSoCalCounty(county)!] : SOCAL_COUNTIES)
                      .flatMap((c) => c.cities)
                      .map((c) => <option key={c} value={c} />)}
                  </datalist>
                  <button
                    onClick={() => setCity(cityInput || undefined)}
                    className="h-10 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                  >
                    Go
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your ZIP code (sort by distance)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 91101"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {zip.length === 5 && milesBetweenZips(zip, zip) === null && (
                  <p className="text-xs text-destructive mt-1">That ZIP code isn't in Southern California.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Specialty</label>
                <Select value={specialty ?? ""} onValueChange={(v) => setSpecialty(v || undefined)}>
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
              <Label htmlFor="telehealth" className="text-sm font-medium text-foreground cursor-pointer">
                <Video className="w-4 h-4 inline mr-1" />
                Telehealth only
              </Label>
            </div>

            {/* Advanced filters toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide" : "Show"} more filters
              </button>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Insurance</label>
                  <Select value={insurance ?? ""} onValueChange={(v) => setInsurance(v || undefined)}>
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
                  <Select value={costTag ?? ""} onValueChange={(v) => setCostTag((v || undefined) as any)}>
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

          {/* ── Results ────────────────────────────────────────────────────── */}
          {insurance && INSURER_DIRECTORIES[insurance] && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-sm">
              <p className="text-foreground">
                This list shows clinicians that public directories list under {insurance}. To see the plan's full network,{" "}
                <a
                  href={INSURER_DIRECTORIES[insurance].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline"
                >
                  search {INSURER_DIRECTORIES[insurance].label}'s own directory
                </a>
                .
              </p>
              {INSURER_DIRECTORIES[insurance].note && (
                <p className="text-muted-foreground mt-1">{INSURER_DIRECTORIES[insurance].note}</p>
              )}
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Showing <strong className="text-foreground">{results.length}</strong> {meta.plural.toLowerCase()}
                {` in ${getSoCalCounty(county)?.name ?? SERVICE_REGION_NAME}`}
                {city && ` · ${city}`}
                {userZip && ` · nearest to ${userZip} first`}
              </p>
              <div className="flex flex-col gap-4">
                {results.map((p: any) => (
                  <ProviderCard key={p.id ?? p.npiNumber} provider={p} category={activeCategory} />
                ))}
              </div>
              {results.length >= limit && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setLimit((l) => l + 50)}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Load more {meta.plural.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No {meta.plural.toLowerCase()} found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try adjusting your filters or selecting a different county.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Clear all filters
                </button>
                <Link href="/free-resources" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  View free resources →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider, category }: { provider: any; category: Category }) {
  const meta = CATEGORY_META[category];
  const isLive = !!provider.npiNumber && !provider.id;

  return (
    <Link
      href={provider.id ? `/provider/${provider.id}` : "#"}
      className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
              {provider.name}
            </h3>
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
              {meta.icon}
              {meta.label}
            </span>
            {provider.acceptsNewPatients && (
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                Accepting patients
              </span>
            )}
            {isLive && (
              <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" /> NPI Verified
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3">
            <span className="font-medium">{provider.licenseType}</span>
            {provider.city && ` · ${provider.city}`}
            {provider.stateCode && `, ${provider.stateCode}`}
            {provider.zipCode && ` ${String(provider.zipCode).slice(0, 5)}`}
            {provider.milesAway != null && (
              <span className="ml-2 font-semibold text-primary">{provider.milesAway.toFixed(1)} mi away</span>
            )}
          </p>
          {provider.detailsConfirmed === false ? (
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground">Insurance:</span>{" "}
              {(provider.insuranceAccepted ?? []).length > 0
                ? `${(provider.insuranceAccepted as string[]).join(", ")} (from insurer and Medi-Cal public directories)`
                : "Not listed in the public insurer directories we check. Call to ask."}
              {" · "}
              <span className="font-medium text-foreground">Telehealth:</span> not confirmed, call to ask
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground">Telehealth:</span> {provider.telehealthAvailable ? "Yes" : "No"}
              {" · "}
              <span className="font-medium text-foreground">Insurance:</span>{" "}
              {(provider.insuranceAccepted ?? []).length > 0 ? (provider.insuranceAccepted as string[]).join(", ") : "Not listed"}
            </p>
          )}
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
            {(provider.specialties ?? []).slice(0, 3).map((s: string) => (
              <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
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
          {provider.website && (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              <Globe className="w-4 h-4" />
              Visit website
            </a>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
}
