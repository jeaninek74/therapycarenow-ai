import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BookOpen, Phone, Globe, MapPin, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";

const CATEGORY_LABELS: Record<string, string> = {
  hotline: "Crisis Hotlines",
  sliding_scale: "Sliding Scale Therapy",
  community_clinic: "Community Clinics",
  national_program: "National Programs",
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
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const { data: resources, isLoading } = trpc.freeResources.getResources.useQuery({ stateCode });

  const grouped = resources
    ? resources.reduce((acc, r) => {
        const cat = r.category ?? "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(r);
        return acc;
      }, {} as Record<string, typeof resources>)
    : {};

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Free & Low-Cost Resources</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Community clinics, hotlines, and sliding scale providers — available in all 50 states.
        </p>

        {/* State picker */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Filter by state (or view national resources)
          </label>
          <StatePicker value={stateCode} onChange={setStateCode} placeholder="All states (national resources)" />
          {stateCode && (
            <button
              onClick={() => setStateCode(undefined)}
              className="text-xs text-primary mt-2 hover:underline"
            >
              Clear state filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([category, items]) => (
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

            {resources && resources.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground text-sm">Try selecting a different state or clearing the filter.</p>
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
        {resource.stateCode && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <MapPin className="w-3 h-3" />
            {resource.stateCode}
          </span>
        )}
        {resource.isNational && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex-shrink-0">
            National
          </span>
        )}
      </div>
    </div>
  );
}
