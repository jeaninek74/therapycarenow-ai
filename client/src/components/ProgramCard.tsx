import { Phone, Globe, MapPin, DollarSign, ShieldCheck } from "lucide-react";
import type { Program } from "@shared/socalPrograms";

export default function ProgramCard({ program }: { program: Program }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-all">
      <h3 className="font-semibold text-foreground mb-1">{program.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{program.description}</p>
      <dl className="grid gap-1.5 text-sm mb-3">
        {program.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <dd className="text-foreground">{program.address}</dd>
          </div>
        )}
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <dd className="text-foreground"><span className="font-medium">Cost:</span> {program.cost}</dd>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <dd className="text-foreground"><span className="font-medium">Insurance:</span> {program.insurance}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-4">
        {program.phone && (
          <a href={`tel:${program.phone}`} className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            <Phone className="w-4 h-4" />
            {program.phone}
          </a>
        )}
        <a href={program.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          <Globe className="w-4 h-4" />
          Visit website
        </a>
      </div>
    </div>
  );
}
