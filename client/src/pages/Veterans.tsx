import { useState } from "react";
import { Flag } from "lucide-react";
import NavBar from "@/components/NavBar";
import CountyPicker from "@/components/CountyPicker";
import ProgramCard from "@/components/ProgramCard";
import CrisisNotice from "@/components/CrisisNotice";
import { SERVICE_REGION_NAME } from "@shared/region";
import { VETERAN_PROGRAMS, programsForCounty } from "@shared/socalPrograms";

export default function Veterans() {
  const [countySlug, setCountySlug] = useState<string | undefined>(undefined);
  const programs = programsForCounty(VETERAN_PROGRAMS, countySlug);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Flag className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Veterans &amp; Military Families</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Free and low-cost mental health care for veterans, service members, and their families in {SERVICE_REGION_NAME}:
          VA medical centers, Vet Centers, crisis support, and TRICARE coverage.
        </p>
        <CrisisNotice extra={<> Veterans: dial 988 and press 1, or text 838255.</>} />
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Your county</label>
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
