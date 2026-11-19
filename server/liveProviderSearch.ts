/**
 * Live Therapist Search — NPPES NPI Registry
 *
 * Uses the free, public CMS NPPES NPI Registry API to fetch real licensed
 * mental health providers in Southern California. No API key required.
 * Results are normalized to match the local provider shape so the frontend
 * can render them identically.
 */

import axios from "axios";
import { safeLog } from "./_core/security";
import { SERVICE_STATE_CODE, getCountyForCity, getSoCalCounty, isSoCalCity, isSoCalZip, normalizeCity } from "@shared/region";

// NPPES only supports trailing-wildcard ZIP queries; these cover every SoCal ZIP (results are re-filtered below).
const SOCAL_POSTAL_WILDCARDS = ["90*", "91*", "92*", "93*"];

// NPPES API response types
interface NppesAddress {
  address_purpose: string;
  city?: string;
  state?: string;
  postal_code?: string;
  telephone_number?: string;
}

interface NppesTaxonomy {
  primary: boolean;
  desc?: string;
}

const NPPES_BASE = "https://npiregistry.cms.hhs.gov/api/";

// Mental health taxonomy codes and descriptions to search
const MENTAL_HEALTH_TAXONOMIES = [
  "psychologist",
  "counselor",
  "social worker",
  "marriage and family therapist",
  "psychiatrist",
  "behavioral analyst",
];

// Map taxonomy description to our specialty labels
function mapTaxonomyToSpecialty(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("psychiatr")) return "Psychiatry";
  if (d.includes("psychologist")) return "Psychology";
  if (d.includes("marriage") || d.includes("family")) return "Couples & Family";
  if (d.includes("social worker")) return "Social Work";
  if (d.includes("addiction") || d.includes("substance")) return "Addiction & Substance Use";
  if (d.includes("behavioral")) return "Behavioral Health";
  if (d.includes("counselor")) return "Counseling";
  return "Mental Health";
}

// Map credential to license type
function mapCredential(credential: string | undefined): string {
  if (!credential) return "Licensed Therapist";
  const c = credential.toUpperCase();
  if (c.includes("PHD") || c.includes("PH.D")) return "PhD";
  if (c.includes("PSYD") || c.includes("PSY.D")) return "PsyD";
  if (c.includes("MD")) return "MD";
  if (c.includes("LCSW")) return "LCSW";
  if (c.includes("LPC")) return "LPC";
  if (c.includes("LMFT")) return "LMFT";
  if (c.includes("LMHC")) return "LMHC";
  if (c.includes("MSW")) return "MSW";
  return credential;
}

export interface LiveProvider {
  id: string; // "nppes-{npi}"
  name: string;
  licenseType: string;
  city: string | null;
  stateCode: string | null;
  zipCode: string | null;
  phone: string | null;
  telehealthAvailable: boolean;
  inPersonAvailable: boolean;
  acceptsNewPatients: boolean;
  costTag: string;
  specialties: string[];
  source: "nppes"; // marks as live result
  detailsConfirmed: false; // NPPES does not record telehealth or insurance
  npiNumber: string;
  verificationStatus: "verified"; // NPPES entries are NPI-verified by CMS
}

export async function searchLiveProviders(params: {
  county?: string;
  city?: string;
  specialty?: string;
  telehealth?: boolean;
  limit?: number;
}): Promise<LiveProvider[]> {
  const limit = Math.min(params.limit ?? 20, 200);
  const results: LiveProvider[] = [];
  const seen = new Set<string>();

  // Determine which taxonomies to search
  const taxonomiesToSearch = params.specialty
    ? [mapSpecialtyToTaxonomy(params.specialty)]
    : MENTAL_HEALTH_TAXONOMIES.slice(0, 3); // limit to 3 to avoid too many requests

  const county = getSoCalCounty(params.county);
  if (params.city && !isSoCalCity(params.city)) return results;
  const requestedCity = params.city ? normalizeCity(params.city) : null;

  for (const taxonomy of taxonomiesToSearch) {
    if (results.length >= limit) break;

    try {
      const baseParams: Record<string, string> = {
        version: "2.1",
        enumeration_type: "NPI-1", // individual providers only
        taxonomy_description: taxonomy,
        state: SERVICE_STATE_CODE,
        skip: "0",
      };

      const queries: Record<string, string>[] = params.city
        ? [{ ...baseParams, city: params.city.toUpperCase(), limit: String(Math.min(limit - results.length + 10, 200)) }]
        : SOCAL_POSTAL_WILDCARDS.map((postal_code) => ({
            ...baseParams,
            postal_code,
            limit: String(Math.min(Math.ceil((limit - results.length) / SOCAL_POSTAL_WILDCARDS.length) + 10, 200)),
          }));

      const responses = await Promise.allSettled(
        queries.map((queryParams) => axios.get(NPPES_BASE, { params: queryParams, timeout: 8000 }))
      );
      const nppesResults = responses.flatMap((res) =>
        res.status === "fulfilled" ? (res.value.data?.results ?? []) : []
      );

      for (const r of nppesResults) {
        if (results.length >= limit) break;

        const basic = r.basic ?? {};
        const npi: string = r.number;

        // Skip if already added (same NPI from different taxonomy search)
        if (seen.has(npi)) continue;
        seen.add(npi);

        // Skip inactive providers
        if (basic.status !== "A") continue;

        // Build name
        const firstName = basic.first_name ?? "";
        const lastName = basic.last_name ?? "";
        const credential = basic.credential ?? "";
        if (!firstName && !lastName) continue;

        const name = `${firstName} ${lastName}`.trim();

        // Get practice location address (prefer LOCATION over MAILING)
        const addresses: NppesAddress[] = r.addresses ?? [];
        const locationAddr =
          addresses.find((a) => a.address_purpose === "LOCATION") ||
          addresses[0] ||
          {};

        const city = locationAddr.city
          ? locationAddr.city.charAt(0).toUpperCase() +
            locationAddr.city.slice(1).toLowerCase()
          : null;
        const stateCode = locationAddr.state ?? SERVICE_STATE_CODE;
        const zipCode = locationAddr.postal_code?.slice(0, 5) ?? null;

        // Southern California only: practice location must be a SoCal ZIP (and in the chosen county, if any)
        if (stateCode !== SERVICE_STATE_CODE || !(isSoCalZip(zipCode) || isSoCalCity(city))) continue;
        if (county && getCountyForCity(city)?.slug !== county.slug) continue;
        // NPPES city queries can return other cities; require an exact match.
        if (requestedCity && (!city || normalizeCity(city) !== requestedCity)) continue;
        const phone = locationAddr.telephone_number ?? null;

        // Get primary taxonomy
        const taxonomies: NppesTaxonomy[] = r.taxonomies ?? [];
        const primaryTax =
          taxonomies.find((t) => t.primary) || taxonomies[0] || {};
        const specialty = mapTaxonomyToSpecialty(primaryTax.desc ?? "");

        results.push({
          id: `nppes-${npi}`,
          name,
          licenseType: mapCredential(credential),
          city,
          stateCode,
          zipCode,
          phone,
          telehealthAvailable: false,
          inPersonAvailable: true,
          acceptsNewPatients: true,
          costTag: "insurance",
          specialties: [specialty],
          source: "nppes",
          detailsConfirmed: false,
          npiNumber: npi,
          verificationStatus: "verified",
        });
      }
    } catch (err: unknown) {
      safeLog.error(`[LiveProviderSearch] NPPES query failed for taxonomy "${taxonomy}":`, err instanceof Error ? err.message : err);
      // Continue with other taxonomies
    }
  }

  return results;
}

function mapSpecialtyToTaxonomy(specialty: string): string {
  const s = specialty.toLowerCase();
  if (s.includes("anxiety") || s.includes("depression") || s.includes("trauma") || s.includes("ptsd")) return "counselor";
  if (s.includes("addiction") || s.includes("substance")) return "addiction counselor";
  if (s.includes("couples") || s.includes("family") || s.includes("marriage")) return "marriage and family therapist";
  if (s.includes("child") || s.includes("adolescent")) return "psychologist";
  if (s.includes("psychiatr") || s.includes("medication")) return "psychiatrist";
  if (s.includes("social")) return "social worker";
  return "counselor";
}
