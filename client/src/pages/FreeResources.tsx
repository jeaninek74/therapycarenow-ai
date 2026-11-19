import { STATE_FUNDED_PROGRAMS, GROUP_THERAPY_PROGRAMS, VETERAN_PROGRAMS } from "@shared/socalPrograms";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BookOpen, Phone, Globe, MapPin, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import CountyPicker from "@/components/CountyPicker";
import { SERVICE_REGION_NAME, SOCAL_COUNTIES, getCountyForCity, getSoCalCounty } from "@shared/region";
import { milesBetweenZips } from "@shared/socalZips";

const PROGRAM_COUNTIES = new Map(
  [...STATE_FUNDED_PROGRAMS, ...GROUP_THERAPY_PROGRAMS, ...VETERAN_PROGRAMS].map((p) => [p.name, p.counties]),
);

const CATEGORY_ORDER = ["hotline", "county_resource", "community_clinic", "sliding_scale", "support_group", "national_program", "other"];

/** County and ZIP for a resource, from its address ("Street, City, CA 90000") or a county name in its title. */
function locate(r: { name: string; address?: string | null }) {
  const zip = r.address?.match(/\b(9\d{4})\b/)?.[1];
  const parts = (r.address ?? "").split(",").map((s) => s.trim());
  const cityCounty = parts.length >= 2 ? getCountyForCity(parts[parts.length - 2]) : undefined;
  const nameCounties = SOCAL_COUNTIES.filter(
    (c) => r.name.includes(c.name.replace(" County", "")) || (c.slug === "los-angeles" && /\bLA\b/.test(r.name)),
  );
  const counties = cityCounty ? [cityCounty] : nameCounties;
  const programCounties = PROGRAM_COUNTIES.get(r.name);
  return { zip, countySlugs: programCounties ?? counties.map((c) => c.slug) };
}

const CATEGORY_LABELS: Record<string, string> = {
  hotline: "Crisis Hotlines",
  sliding_scale: "Sliding Scale Therapy",
  community_clinic: "Community Clinics",
  national_program: "State, Federal & Veterans Programs",
  support_group: "Support Groups",
  county_resource: "County Resources",
  other: "Other Resources",
};

const CATEGORY_COLORS: Record<string, string> = {
  hotline: "bg-destructive/10 text-destructive",
  sliding_scale: "bg-primary/10 text-primary",
  community_clinic: "bg-secondary text-secondary-foreground",
  national_program: "bg-accent text-accent-foreground",
  support_group: "bg-muted text-muted-foreground",
  county_resource: "bg-muted text-muted-foreground",
  other: "bg-muted text-muted-foreground",
};

export default function FreeResources() {
  const [countySlug, setCountySlug] = useState<string | undefined>(undefined);
  const [zip, setZip] = useState("");
  const userZip = /^\d{5}$/.test(zip) ? zip : undefined;
  const county = getSoCalCounty(countySlug);
  const { data: resources, isLoading } = trpc.freeResources.getResources.useQuery({ stateCode: "CA" });

  const located = (resources ?? [])
    .map((r) => {
      const loc = locate(r);
      return { ...r, zip: loc.zip, countySlugs: loc.countySlugs, milesAway: userZip ? milesBetweenZips(userZip, loc.zip) : null };
    })
    .filter((r) => !countySlug || r.countySlugs.length === 0 || r.countySlugs.includes(countySlug))
    .sort((a, b) => (a.milesAway ?? 1e9) - (b.milesAway ?? 1e9));
  const grouped = located.reduce((acc, r) => {
    const cat = r.category ?? "other";
    (acc[cat] ??= []).push(r);
    return acc;
  }, {} as Record<string, typeof located>);
  const orderedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Free and Low-Cost Help</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Community clinics, hotlines, and sliding scale providers across {SERVICE_REGION_NAME}.
        </p>

        {/* Crisis disclaimer */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-8 flex gap-3">
          <span className="text-destructive text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-destructive mb-1">If you are in immediate danger or crisis</p>
            <p className="text-sm text-foreground">
              Call <a href="tel:911" className="font-bold underline">911</a> or the{" "}
              <a href="tel:988" className="font-bold underline">988 Suicide &amp; Crisis Lifeline</a> (call or text 988).
              These resources are for informational purposes only and are not a substitute for emergency services.
            </p>
          </div>
        </div>

        {/* County picker */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Your county
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <CountyPicker value={countySlug} onChange={setCountySlug} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Your ZIP code (to sort by distance)"
              aria-label="Your ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              className="sm:w-64 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          {zip.length === 5 && milesBetweenZips(zip, zip) === null && (
            <p className="text-xs text-destructive mt-2">That ZIP code isn't in Southern California.</p>
          )}
          {county && (
            <div className="mt-4 bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{county.name} 24/7 behavioral health line</p>
              <a
                href={`tel:${county.crisisLine.phone}`}
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                <Phone className="w-4 h-4" />
                {county.crisisLine.name}: {county.crisisLine.phone}
              </a>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {orderedGroups.map(([category, items]) => (
              <section key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground"}`}>
                    {CATEGORY_LABELS[category] ?? category}
                  </span>
                  <span className="text-sm text-muted-foreground">{items.length} resource{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((r) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              </section>
            ))}

            {resources && located.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground text-sm">Check back soon — we are adding more Southern California resources.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{resource.name}</h3>
          {resource.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{resource.description}</p>
          )}
          {resource.address ? (
            <p className="text-sm text-foreground mb-3 flex items-start gap-1">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span>
                {resource.address}
                {resource.milesAway != null && (
                  <span className="ml-2 font-semibold text-primary">{resource.milesAway.toFixed(1)} mi away</span>
                )}
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">
              {resource.countySlugs?.length ? `Serves ${resource.countySlugs.map((s: string) => getSoCalCounty(s)?.name).join(" and ")}` : "Phone or online, available anywhere in Southern California"}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {resource.phone && (
              <a
                href={`tel:${resource.phone}`}
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                <Phone className="w-4 h-4" />
                {resource.phone}
              </a>
            )}
            {resource.smsNumber && (
              <a
                href={`sms:${resource.smsNumber}`}
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                <Phone className="w-4 h-4" />
                Text {resource.smsNumber}
              </a>
            )}
            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                <Globe className="w-4 h-4" />
                Visit website
              </a>
            )}
          </div>
        </div>
        {resource.isNational && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex-shrink-0">
            National
          </span>
        )}
      </div>
    </div>
  );
}
