import { useState } from "react";
import { Building2, Landmark } from "lucide-react";
import NavBar from "@/components/NavBar";
import CountyPicker from "@/components/CountyPicker";
import ProgramCard from "@/components/ProgramCard";
import CrisisNotice from "@/components/CrisisNotice";
import { SERVICE_REGION_NAME } from "@shared/region";
import { HOSPITAL_PROGRAMS, STATE_FUNDED_PROGRAMS, programsForCounty } from "@shared/socalPrograms";

export default function Programs() {
  const [countySlug, setCountySlug] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Hospital &amp; State-Funded Programs</h1>
        <p className="text-muted-foreground mb-6">
          Hospital behavioral health programs and California state and county programs, such as Medi-Cal and county
          behavioral health departments, across {SERVICE_REGION_NAME}.
        </p>
        <CrisisNotice />
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">Your county</label>
          <CountyPicker value={countySlug} onChange={setCountySlug} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Landmark className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">State &amp; county programs</h2>
        </div>
        <div className="grid gap-4 mb-12">
          {programsForCounty(STATE_FUNDED_PROGRAMS, countySlug).map((p) => (
            <ProgramCard key={p.name} program={p} />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Hospital &amp; healthcare facility programs</h2>
        </div>
        <div className="grid gap-4">
          {programsForCounty(HOSPITAL_PROGRAMS, countySlug).map((p) => (
            <ProgramCard key={p.name} program={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
