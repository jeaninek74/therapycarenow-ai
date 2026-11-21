import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import { SERVICE_REGION_NAME, SOCAL_COUNTIES, getSoCalCounty } from "@shared/region";
import { useCountyDirectory } from "@/hooks/useCountyDirectory";
import {
  MapPin, Users, ChevronRight, Search, ArrowLeft, Loader2,
  Stethoscope, Brain, UserCheck,
} from "lucide-react";

type Category = "Therapist" | "Psychiatrist" | "Psychologist";

const CATEGORY_META: Record<Category, {
  label: string;
  plural: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  badge: string;
  description: string;
  licenses: string;
}> = {
  Therapist: {
    label: "Therapist",
    plural: "Therapists",
    icon: <UserCheck className="w-5 h-5" />,
    color: "text-[oklch(0.45_0.18_200)]",
    bg: "bg-[oklch(0.55_0.18_200)]/10",
    badge: "bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)] border border-[oklch(0.55_0.18_200)]/20",
    description: "Licensed counselors and therapists providing talk therapy, Cognitive Behavioral Therapy, Dialectical Behavior Therapy, Eye Movement Desensitization and Reprocessing, and more.",
    licenses: "LCSW · LPC · LMFT · LMHC · LCPC · MSW · and more",
  },
  Psychiatrist: {
    label: "Psychiatrist",
    plural: "Psychiatrists",
    icon: <Stethoscope className="w-5 h-5" />,
    color: "text-[oklch(0.45_0.18_30)]",
    bg: "bg-[oklch(0.55_0.18_30)]/10",
    badge: "bg-[oklch(0.55_0.18_30)]/10 text-[oklch(0.45_0.18_30)] border border-[oklch(0.55_0.18_30)]/20",
    description: "Medical doctors and psychiatric nurse practitioners who diagnose, treat, and prescribe medication.",
    licenses: "MD · DO · PMHNP · APRN · NP",
  },
  Psychologist: {
    label: "Psychologist",
    plural: "Psychologists",
    icon: <Brain className="w-5 h-5" />,
    color: "text-[oklch(0.45_0.18_280)]",
    bg: "bg-[oklch(0.55_0.18_280)]/10",
    badge: "bg-[oklch(0.55_0.18_280)]/10 text-[oklch(0.45_0.18_280)] border border-[oklch(0.55_0.18_280)]/20",
    description: "Doctoral-level clinicians specializing in psychological testing, assessment, and advanced psychotherapy.",
    licenses: "PhD · PsyD",
  },
};

const CATEGORIES: Category[] = ["Therapist", "Psychiatrist", "Psychologist"];

export default function TherapistDirectory() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<Category>("Therapist");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateSearch, setStateSearch] = useState("");

  const { cities: allCities, countyMap, isLoading: dirLoading } = useCountyDirectory();
  const citiesLoading = dirLoading;
  const cities = allCities.filter((c) => c.county === selectedState);
  const countyName = getSoCalCounty(selectedState ?? undefined)?.name ?? SERVICE_REGION_NAME;
  const { data: categoryCounts } = trpc.providers.getCategoryCounts.useQuery();

  const filteredStates = SOCAL_COUNTIES.filter((c) =>
    stateSearch === "" ||
    c.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    c.cities.some((city) => city.toLowerCase().includes(stateSearch.toLowerCase()))
  );

  function getCountForCategory(countySlug: string, cat: Category): number {
    const entry = countyMap.get(countySlug);
    if (!entry) return 0;
    if (cat === "Therapist") return entry.therapists;
    if (cat === "Psychiatrist") return entry.psychiatrists;
    return entry.psychologists;
  }

  function getCityCountForCategory(city: { city: string; therapists: number; psychiatrists: number; psychologists: number; total: number }, cat: Category): number {
    if (cat === "Therapist") return city.therapists;
    if (cat === "Psychiatrist") return city.psychiatrists;
    return city.psychologists;
  }

  const meta = CATEGORY_META[activeCategory];

  const totalForCategory =
    activeCategory === "Therapist" ? (categoryCounts?.therapists ?? 0) :
    activeCategory === "Psychiatrist" ? (categoryCounts?.psychiatrists ?? 0) :
    (categoryCounts?.psychologists ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto">

          {/* ── Category Tabs ─────────────────────────────────────────────── */}
          {!selectedState && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Provider Directory</h1>
              <p className="text-muted-foreground mb-6">
                Browse therapists, psychiatrists, and psychologists across Southern California — by county and city.
              </p>

              {/* Tab switcher */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => {
                  const m = CATEGORY_META[cat];
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                        isActive
                          ? `${m.bg} ${m.color} border-current`
                          : "bg-card text-muted-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      {m.icon}
                      {m.plural}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? m.badge : "bg-muted text-muted-foreground"}`}>
                        {cat === "Therapist" ? (categoryCounts?.therapists ?? "—") :
                         cat === "Psychiatrist" ? (categoryCounts?.psychiatrists ?? "—") :
                         (categoryCounts?.psychologists ?? "—")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category description banner */}
              <div className={`flex items-start gap-4 p-4 rounded-xl mb-6 ${meta.bg}`}>
                <div className={`flex-shrink-0 ${meta.color}`}>{meta.icon}</div>
                <div>
                  <p className={`font-semibold ${meta.color} mb-0.5`}>{meta.plural}</p>
                  <p className="text-sm text-muted-foreground">{meta.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">License types: <span className="font-medium">{meta.licenses}</span></p>
                </div>
                <div className="ml-auto flex-shrink-0 text-right">
                  <p className="text-2xl font-extrabold text-foreground">{totalForCategory.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">in Southern California</p>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search county or city..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="w-full pl-9 pr-4 h-10 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Counties grid */}
              {dirLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredStates.map((county) => {
                    const count = getCountForCategory(county.slug, activeCategory);
                    return (
                      <button
                        key={county.slug}
                        onClick={() => setSelectedState(county.slug)}
                        className="group bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-foreground text-sm leading-tight">{county.name}</p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Browse {meta.plural.toLowerCase()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Advanced search CTA */}
              <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Looking for something specific?</h3>
                  <p className="text-sm text-muted-foreground">Use advanced search to filter by specialty, insurance, telehealth, and more.</p>
                </div>
                <Link
                  href={`/find-therapist?category=${activeCategory}`}
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Search {meta.plural} →
                </Link>
              </div>
            </div>
          )}

          {/* ── County Detail View ──────────────────────────────────────────── */}
          {selectedState && (
            <>
              <button
                onClick={() => setSelectedState(null)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All Counties
              </button>

              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{countyName}</h1>
                </div>

                {/* Per-category counts for this county */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {CATEGORIES.map((cat) => {
                    const m = CATEGORY_META[cat];
                    const cnt = getCountForCategory(selectedState, cat);
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                          isActive
                            ? `${m.bg} ${m.color} border-current`
                            : "bg-card text-muted-foreground border-border hover:border-primary/30"
                        }`}
                      >
                        {m.icon}
                        <span>{cnt.toLocaleString()} {m.plural}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-muted-foreground text-sm">
                  Browse {meta.plural.toLowerCase()} in {countyName} by city, or search all {meta.plural.toLowerCase()} in this county.
                </p>
              </div>

              {/* Search CTAs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href={`/find-therapist?county=${selectedState}&category=${activeCategory}`}
                  onClick={() => {
                    sessionStorage.setItem("tcn_county", selectedState);
                    sessionStorage.setItem("tcn_category", activeCategory);
                    navigate("/find-therapist");
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search all {countyName} {meta.plural.toLowerCase()}
                </Link>
                <Link
                  href="/find-therapist"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  Filter by specialty / insurance
                </Link>
              </div>

              {/* Cities grid */}
              {citiesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : cities && cities.length > 0 ? (
                <>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Cities in {countyName} — {meta.plural}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                    {cities
                      .filter(city => getCityCountForCategory(city, activeCategory) > 0)
                      .map((city) => {
                        const cityCount = getCityCountForCategory(city, activeCategory);
                        return (
                          <Link
                            key={city.city}
                            href="/find-therapist"
                            onClick={() => {
                              sessionStorage.setItem("tcn_county", selectedState);
                              sessionStorage.setItem("tcn_city", city.city);
                              sessionStorage.setItem("tcn_category", activeCategory);
                              navigate("/find-therapist");
                            }}
                            className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <MapPin className={`w-4 h-4 mt-0.5 ${meta.color}`} />
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="font-medium text-foreground text-sm">{city.city}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {cityCount.toLocaleString()} {meta.plural.toLowerCase()}
                            </p>
                            {/* Mini breakdown */}
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {city.therapists > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(0.55_0.18_200)]/10 text-[oklch(0.45_0.18_200)]">
                                  {city.therapists} therapists
                                </span>
                              )}
                              {city.psychiatrists > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(0.55_0.18_30)]/10 text-[oklch(0.45_0.18_30)]">
                                  {city.psychiatrists} psychiatrists
                                </span>
                              )}
                              {city.psychologists > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(0.55_0.18_280)]/10 text-[oklch(0.45_0.18_280)]">
                                  {city.psychologists} psychologists
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No listed cities yet — use search to find providers in this county.</p>
                </div>
              )}

              {/* Telehealth note */}
              <div className="p-5 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Many {meta.plural.toLowerCase()} in {countyName} also offer telehealth services.
                  Use the{" "}
                  <Link href="/find-therapist" className="text-primary hover:underline">advanced search</Link>{" "}
                  and enable the "Telehealth only" filter to see all available options.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
