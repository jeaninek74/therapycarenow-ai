import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Phone, Video, MapPin, DollarSign, ChevronLeft, Loader2, Shield } from "lucide-react";
import NavBar from "@/components/NavBar";

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: provider, isLoading } = trpc.providers.getById.useQuery({ id: parseInt(id || "0") });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container py-20 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Provider not found</h2>
          <Link href="/find-therapist" className="text-primary hover:underline">← Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/find-therapist" className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to search
        </Link>

        {/* Provider header */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{provider.name}</h1>
              <p className="text-muted-foreground">{provider.licenseType} · Licensed in {provider.licenseState}</p>
              {provider.city && (
                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {provider.city}, {provider.stateCode}
                </p>
              )}
            </div>
            {provider.acceptsNewPatients && (
              <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-medium flex-shrink-0">
                Accepting patients
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {provider.telehealthAvailable && (
              <span className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                <Video className="w-4 h-4" /> Telehealth available
              </span>
            )}
            {provider.inPersonAvailable && (
              <span className="inline-flex items-center gap-1 text-sm bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" /> In-person available
              </span>
            )}
            {provider.costTag && (
              <span className="inline-flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full capitalize">
                <DollarSign className="w-4 h-4" /> {provider.costTag.replace("_", " ")}
              </span>
            )}
          </div>

          {/* Contact */}
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-4 text-lg hover:opacity-90 active:scale-95 transition-all shadow-sm w-full"
            >
              <Phone className="w-5 h-5" />
              Call {provider.phone}
            </a>
          )}
        </div>

        {/* Specialties */}
        {provider.specialties && provider.specialties.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {provider.specialties.map((s: any) => (
                <span key={s.specialty} className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full capitalize">
                  {s.specialty.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Insurance */}
        {provider.insuranceAccepted && provider.insuranceAccepted.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-3">Insurance accepted</h2>
            <div className="flex flex-wrap gap-2">
              {provider.insuranceAccepted.map((ins: string) => (
                <span key={ins} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {ins}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {provider.urgencyAvailability && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-2">Availability</h2>
            <p className="text-muted-foreground text-sm capitalize">
              {provider.urgencyAvailability.replace("_", " ")}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-muted/40 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            TherapyCareNow does not endorse specific providers. Contact the provider directly to verify availability, insurance acceptance, and licensing. Provider information may change.
          </p>
        </div>
      </div>
    </div>
  );
}
