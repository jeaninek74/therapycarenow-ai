import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import { US_STATES, getStateName } from "@shared/states";
import { MapPin, Users, ChevronRight, Search, ArrowLeft, Loader2 } from "lucide-react";

// Approximate population-based tier for display
const STATE_TIERS: Record<string, string> = {
  CA: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  TX: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  FL: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  NY: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  PA: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  IL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  OH: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  GA: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  NC: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  MI: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function TherapistDirectory() {
  const [, navigate] = useLocation();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateSearch, setStateSearch] = useState("");

  const { data: stateDirectory, isLoading: dirLoading } = trpc.providers.getStateDirectory.useQuery();
  const { data: cities, isLoading: citiesLoading } = trpc.providers.getCitiesForState.useQuery(
    { stateCode: selectedState! },
    { enabled: !!selectedState }
  );

  // Build a map of stateCode -> count
  const stateCountMap = new Map<string, number>();
  (stateDirectory ?? []).forEach((s) => stateCountMap.set(s.stateCode, s.count));

  const filteredStates = US_STATES.filter((s) =>
    stateSearch === "" ||
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const totalProviders = (stateDirectory ?? []).reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          {!selectedState ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Therapist Directory</h1>
                <p className="text-muted-foreground">
                  Browse {totalProviders.toLocaleString()}+ verified mental health providers across all 50 states.
                  Select a state to explore providers by city.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search state..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="w-full pl-9 pr-4 h-10 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* States grid */}
              {dirLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredStates.map((state) => {
                    const count = stateCountMap.get(state.code) ?? 0;
                    const tierClass = STATE_TIERS[state.code] ?? "bg-secondary text-secondary-foreground";
                    return (
                      <button
                        key={state.code}
                        onClick={() => setSelectedState(state.code)}
                        className="group bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierClass}`}>
                            {state.code}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-medium text-foreground text-sm leading-tight mb-1">{state.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {count > 0 ? `${count.toLocaleString()} providers` : "Browse providers"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick search CTA */}
              <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Looking for something specific?</h3>
                  <p className="text-sm text-muted-foreground">Use our advanced search to filter by specialty, insurance, telehealth, and more.</p>
                </div>
                <Link
                  href="/find-therapist"
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Advanced Search →
                </Link>
              </div>
            </>
          ) : (
            /* State detail view */
            <>
              <button
                onClick={() => setSelectedState(null)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All States
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{getStateName(selectedState)}</h1>
                  <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {(stateCountMap.get(selectedState) ?? 0).toLocaleString()} providers
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Browse mental health providers in {getStateName(selectedState)} by city, or search all providers in this state.
                </p>
              </div>

              {/* Search all in state CTA */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href={`/find-therapist?state=${selectedState}`}
                  onClick={() => navigate(`/find-therapist`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search all {getStateName(selectedState)} providers
                </Link>
                <Link
                  href={`/find-therapist`}
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
                  <h2 className="text-lg font-semibold text-foreground mb-4">Cities in {getStateName(selectedState)}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                    {cities.map((city) => (
                      <Link
                        key={city.city}
                        href="/find-therapist"
                        onClick={() => {
                          // Navigate to find-therapist with state + city pre-filled
                          navigate("/find-therapist");
                          // Store in sessionStorage for FindTherapist to pick up
                          sessionStorage.setItem("tcn_state", selectedState);
                          sessionStorage.setItem("tcn_city", city.city);
                        }}
                        className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <MapPin className="w-4 h-4 text-primary mt-0.5" />
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-medium text-foreground text-sm">{city.city}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {city.count.toLocaleString()} provider{city.count !== 1 ? "s" : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">City data loading...</p>
                </div>
              )}

              {/* Telehealth note */}
              <div className="p-5 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Many providers in {getStateName(selectedState)} also offer telehealth services,
                  meaning you can connect with providers licensed in other states. Use the{" "}
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
