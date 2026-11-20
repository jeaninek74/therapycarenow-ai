import { useState } from "react";
import { Link } from "wouter";
import { Briefcase, Search, Phone, Globe, Check } from "lucide-react";
import NavBar from "@/components/NavBar";
import CountyPicker from "@/components/CountyPicker";
import ProgramCard from "@/components/ProgramCard";
import CrisisNotice from "@/components/CrisisNotice";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { EAP_PROGRAMS, EAP_VENDORS, programsForCounty } from "@shared/socalPrograms";

const HOW_TO_FIND = [
  "Check your employer's HR or benefits website, or your benefits enrollment guide.",
  "Look on the back of your health insurance card or your health plan's member website.",
  "Ask HR or your manager. You don't have to say why; Employee Assistance Program use is confidential.",
  "If you're in a union, ask your union. Many unions run their own member assistance program.",
];

const WHAT_IT_COVERS = [
  "A set number of free, confidential counseling sessions (often 3 to 8 per issue), in person, by phone, or by video",
  "Help for stress, anxiety, depression, grief, relationships, parenting, and alcohol or drug use",
  "Referrals to longer-term therapists who take your insurance",
  "Free legal and financial consultations, and help finding child or elder care",
  "Coverage for your spouse or partner and household members, in most plans",
];

export default function Eap() {
  const [query, setQuery] = useState("");
  const [countySlug, setCountySlug] = useState<string | undefined>(undefined);
  const search = query.trim();
  const { data: result, isFetching } = trpc.benefits.lookupEAP.useQuery(
    { employerName: search },
    { enabled: search.length > 2 },
  );

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Employee Assistance Program</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          An Employee Assistance Program is a free, confidential mental health benefit that many employers offer.
          You can usually start counseling within days, with no insurance, copay, or referral, and your employer is not
          told who uses it.
        </p>
        <CrisisNotice />

        <section className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">Look up your employer's program</h2>
          <form
            role="search"
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              (document.activeElement as HTMLElement | null)?.blur();
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., County of Los Angeles, State of California"
                className="pl-9"
                aria-label="Employer name"
              />
            </div>
            <button
              type="submit"
              className="px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Search
            </button>
          </form>
          {search.length > 2 && !isFetching && (
            result ? (
              <div className="mt-4 bg-secondary/30 border border-secondary rounded-xl p-4">
                <p className="font-semibold text-foreground">{result.employer.name}</p>
                {result.employer.eapProvider && (
                  <p className="text-sm text-muted-foreground">Provided by {result.employer.eapProvider}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-2">
                  {result.employer.eapPhone && (
                    <a href={`tel:${result.employer.eapPhone}`} className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                      <Phone className="w-4 h-4" /> {result.employer.eapPhone}
                    </a>
                  )}
                  {result.employer.eapUrl && (
                    <a href={result.employer.eapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                      <Globe className="w-4 h-4" /> Program website
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                We don't have that employer yet. Private companies usually use one of the{" "}
                <a href="#eap-companies" className="text-primary underline">Employee Assistance Program companies below</a>; open its site and enter your employer's name or access code. Or{" "}
                <Link href="/find-therapist" className="text-primary underline">search for a therapist</Link> who takes your insurance.
              </p>
            )
          )}
        </section>

        <section id="eap-companies" className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Private employers: find your program through its Employee Assistance Program company</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Most private companies contract with one of these companies. Open its site and enter your employer's name or
            access code. If you don't know which one your employer uses, check your benefits guide or ask Human Resources.
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {EAP_VENDORS.map((v) => (
              <li key={v.name}>
                <a href={v.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
                  <Globe className="w-4 h-4" /> {v.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What an Employee Assistance Program usually covers</h2>
            <ul className="space-y-2">
              {WHAT_IT_COVERS.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">How to find your Employee Assistance Program</h2>
            <ul className="space-y-2">
              {HOW_TO_FIND.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2">Public employer programs in Southern California</h2>
        <p className="text-sm text-muted-foreground mb-4">For State, county, city, and federal employees. Pick your county to narrow the list.</p>
        <div className="mb-6">
          <CountyPicker value={countySlug} onChange={setCountySlug} />
        </div>
        <div className="grid gap-4">
          {programsForCounty(EAP_PROGRAMS, countySlug).map((p) => (
            <ProgramCard key={p.name} program={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
