import { useState } from "react";
import { Users, Clock, DollarSign, ShieldCheck, HeartHandshake, CalendarSearch, ExternalLink } from "lucide-react";
import NavBar from "@/components/NavBar";
import CountyPicker from "@/components/CountyPicker";
import ProgramCard from "@/components/ProgramCard";
import CrisisNotice from "@/components/CrisisNotice";
import { SERVICE_REGION_NAME } from "@shared/region";
import { GROUP_THERAPY_TYPES, GROUP_THERAPY_PROGRAMS, ACTIVE_GROUP_FINDERS, programsForCounty } from "@shared/socalPrograms";

export default function GroupTherapy() {
  const [countySlug, setCountySlug] = useState<string | undefined>(undefined);
  const programs = programsForCounty(GROUP_THERAPY_PROGRAMS, countySlug);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Group Therapy</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          In group therapy, a small group of people meets regularly with a trained leader to learn skills and support each other.
          Groups often cost less than individual therapy and remind you that you're not alone. Here's what each type of group does,
          and where to find groups in {SERVICE_REGION_NAME}.
        </p>
        <CrisisNotice />

        <section id="active-groups" className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <CalendarSearch className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Find an active group</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            These official finders list groups that are meeting now, with days, times, locations, and how to join.
            You can also scroll down to see local organizations by county.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {ACTIVE_GROUP_FINDERS.map((f) => (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-foreground text-sm flex items-start gap-1">
                  {f.name} <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
              </a>
            ))}
          </div>
        </section>

        <h2 className="text-2xl font-semibold text-foreground mb-4">Types of group therapy</h2>
        <div className="grid gap-4 mb-12">
          {GROUP_THERAPY_TYPES.map((t) => (
            <section key={t.slug} id={t.slug} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-2">{t.name}</h3>
              <p className="text-sm text-foreground leading-relaxed mb-2">
                <span className="font-medium">What it does:</span> {t.whatItDoes}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                <span className="font-medium text-foreground">Who it helps:</span> {t.whoItHelps}
              </p>
              <dl className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <dd className="text-muted-foreground">{t.format}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <dd className="text-muted-foreground">{t.typicalCost}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <dd className="text-muted-foreground">{t.insurance}</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <HeartHandshake className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Local group organizations by county</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Pick your county to see local options. Your county behavioral health line and the hospital programs on the
          Medi-Cal (Medicaid) and Hospital Programs page also offer group therapy.
        </p>
        <div className="mb-6">
          <CountyPicker value={countySlug} onChange={setCountySlug} />
        </div>
        <div className="grid gap-4">
          {programs.map((p) => (
            <ProgramCard key={p.name} program={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
