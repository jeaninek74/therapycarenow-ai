import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Briefcase, Search, Shield } from "lucide-react";
import NavBar from "@/components/NavBar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { INSURANCE_OPTIONS } from "@shared/insurances";
import { INSURER_DIRECTORIES } from "@shared/insurerDirectories";

export default function BenefitsWallet() {
  const [insurance, setInsurance] = useState("");
  const [eapSearch, setEapSearch] = useState("");

  const { data: eapResult } = trpc.benefits.lookupEAP.useQuery(
    { employerName: eapSearch },
    { enabled: eapSearch.length > 2 }
  );

  const knownPlan = INSURANCE_OPTIONS.find((o) => o.toLowerCase() === insurance.trim().toLowerCase());
  const directory = knownPlan ? INSURER_DIRECTORIES[knownPlan] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Find Care by Insurance</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Pick your insurance to see clinicians your plan lists, or look up your employer's Employee Assistance Program. No sign-in needed.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-foreground mb-4">Find clinicians who take your insurance</h2>
          <Label htmlFor="carrier">Your insurance</Label>
          <Input
            id="carrier"
            list="insurance-carriers"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            placeholder="e.g., Kaiser Permanente, Medi-Cal, Blue Shield of California"
            className="mt-1"
          />
          <datalist id="insurance-carriers">
            {INSURANCE_OPTIONS.map((ins) => (
              <option key={ins} value={ins} />
            ))}
          </datalist>
          {knownPlan && (
            <div className="flex flex-col gap-2 mt-4 text-sm">
              <Link
                href={`/find-therapist?insurance=${encodeURIComponent(knownPlan)}`}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold rounded-xl px-6 py-3 hover:opacity-90"
              >
                Show clinicians listed under {knownPlan}
              </Link>
              {directory && (
                <a href={directory.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Search {directory.label}'s own directory →
                </a>
              )}
              {directory?.note && <p className="text-muted-foreground">{directory.note}</p>}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4">Find your employer's Employee Assistance Program</h2>
          <Label htmlFor="eap-search">Your employer</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="eap-search"
              value={eapSearch}
              onChange={(e) => setEapSearch(e.target.value)}
              placeholder="e.g., County of Los Angeles, State of California..."
              className="pl-9"
            />
          </div>
          {eapResult && eapSearch.length > 2 && (
            <div className="bg-secondary/30 border border-secondary rounded-xl p-4 mt-4">
              <p className="font-semibold text-foreground">{eapResult.employer.name}</p>
              <p className="text-sm text-muted-foreground">Employee Assistance Program Provider: {eapResult.employer.eapProvider}</p>
              {eapResult.employer.eapPhone && (
                <a href={`tel:${eapResult.employer.eapPhone}`} className="text-primary text-sm hover:underline block mt-1">
                  {eapResult.employer.eapPhone}
                </a>
              )}
              {eapResult.employer.eapUrl && (
                <a href={eapResult.employer.eapUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline block mt-1">
                  Visit Employee Assistance Program website →
                </a>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Don't see your employer? <Link href="/eap" className="text-primary hover:underline">Learn how to find your Employee Assistance Program</Link>.
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 bg-muted/40 rounded-xl p-4">
          <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            TherapyCareNow is a search tool. Nothing you enter on this page is saved.
          </p>
        </div>
      </div>
    </div>
  );
}
