/**
 * Imports NPI-verified Southern California mental health clinicians from the
 * CMS NPPES registry into the providers table. Only active individual NPIs whose
 * practice location ZIP code is in one of the 8 Southern California counties are imported,
 * searching every Southern California ZIP code so no city or community is missed. Existing NPIs are skipped.
 * Run: DATABASE_URL=... npx tsx scripts/import-npi-providers.ts [--county=<slug>]
 */
import axios from "axios";
import { drizzle } from "drizzle-orm/mysql2";
import { isNotNull } from "drizzle-orm";
import { providers, providerSpecialties } from "../drizzle/schema";
import { NPPES_IMPORT_NOTE } from "../shared/providerSource";
import { SOCAL_COUNTIES, SERVICE_STATE_CODE } from "../shared/region";
import { SOCAL_ZIP_COUNTY } from "../shared/socalZipCounties";

const NPPES_BASE = "https://npiregistry.cms.hhs.gov/api/";
const TAXONOMIES = ["psychiatry", "psychologist", "counselor", "social worker", "marriage & family therapist"];

// Primary taxonomies we list: psychiatry specialties (not neurology), psychologists, licensed counselors,
// clinical social workers, and marriage & family therapists.
const MENTAL_HEALTH_PRIMARY =
  /^(Psychiatry & Neurology, (Psychiatry|.*Psychiatry)|Psychologist(, .*)?|Counselor(, (Mental Health|Professional|Addiction \(Substance Use Disorder\)))?|Social Worker, Clinical|Marriage & Family Therapist)$/;

const db = drizzle(process.env.DATABASE_URL!);
const countyArg = process.argv.find((a) => a.startsWith("--county="))?.split("=")[1];

function licenseTypeFor(credential: string, taxonomy: string): string {
  const c = credential.toUpperCase().replace(/[.\s]/g, "");
  const t = taxonomy.toLowerCase();
  if (t.includes("psychiatr")) {
    if (/PMHNP|NP|APRN|CNS/.test(c)) return "PMHNP";
    return /DO\b|^DO/.test(c) ? "DO" : "MD";
  }
  if (t.includes("psycholog")) return c.includes("PSYD") ? "PsyD" : "PhD";
  for (const k of ["LCSW", "LMFT", "LPCC", "LPC", "MSW", "ASW", "AMFT", "APCC"]) if (c.includes(k)) return k;
  if (t.includes("marriage")) return "LMFT";
  if (t.includes("social worker, clinical")) return "LCSW";
  if (t.includes("addiction")) return "Addiction Counselor";
  if (t.includes("professional") || t.includes("mental health")) return "LPCC";
  return "Licensed Therapist";
}

function specialtiesFor(taxonomy: string): string[] {
  const t = taxonomy.toLowerCase();
  const s: string[] = [];
  if (t.includes("addiction") || t.includes("substance")) s.push("addiction", "substance_use");
  if (t.includes("marriage") || t.includes("family")) s.push("family", "couples");
  if (t.includes("child") || t.includes("adolescent")) s.push("child_adolescent");
  if (t.includes("geriatric")) s.push("geriatric");
  return s;
}

function formatPhone(p?: string | null): string | null {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : null;
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b[a-z]/g, (m) => m.toUpperCase());
}

async function fetchPage(zip: string, taxonomy: string, skip: number): Promise<any[] | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await axios.get(NPPES_BASE, {
        params: { version: "2.1", enumeration_type: "NPI-1", taxonomy_description: taxonomy, state: SERVICE_STATE_CODE, postal_code: zip, limit: "200", skip: String(skip) },
        timeout: 20000,
      });
      return res.data?.results ?? [];
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return null;
}

// NPPES returns at most 200 results per request and allows skip up to 1000.
let failedPages = 0;

async function fetchZip(zip: string, taxonomy: string): Promise<any[]> {
  const all: any[] = [];
  for (let skip = 0; skip <= 1000; skip += 200) {
    const page = await fetchPage(zip, taxonomy, skip);
    if (page === null) {
      failedPages++;
      console.warn(`NPPES request failed: ${zip} / ${taxonomy} / skip=${skip}. Rerun to fill the gap.`);
      break;
    }
    all.push(...page);
    if (page.length < 200) break;
    if (skip === 1000) console.warn(`ZIP ${zip} / ${taxonomy} hit the NPPES 1,200-result cap.`);
  }
  return all;
}

async function main() {
  const existing = new Set(
    (await db.select({ npi: providers.npiNumber }).from(providers).where(isNotNull(providers.npiNumber))).map((r) => r.npi!)
  );
  const counties = countyArg ? SOCAL_COUNTIES.filter((c) => c.slug === countyArg) : SOCAL_COUNTIES;
  let imported = 0;
  for (const county of counties) {
    const zips = Object.keys(SOCAL_ZIP_COUNTY).filter((z) => SOCAL_ZIP_COUNTY[z] === county.slug);
    for (const zip of zips) {
      const rows = (await Promise.all(TAXONOMIES.map((t) => fetchZip(zip, t)))).flat();
      for (const r of rows) {
        const npi: string = r.number;
        const basic = r.basic ?? {};
        if (!npi || existing.has(npi) || basic.status !== "A") continue;
        const loc = (r.addresses ?? []).find((a: any) => a.address_purpose === "LOCATION");
        if (!loc || loc.state !== SERVICE_STATE_CODE || (loc.postal_code ?? "").slice(0, 5) !== zip || !loc.city) continue;
        const tax = (r.taxonomies ?? []).find((t: any) => t.primary) ?? r.taxonomies?.[0] ?? {};
        const desc: string = tax.desc ?? "";
        if (!MENTAL_HEALTH_PRIMARY.test(desc)) continue;
        // Require an active California license on the primary taxonomy.
        if (tax.state !== SERVICE_STATE_CODE || !tax.license) continue;
        const credential: string = basic.credential ?? "";
        const name = [basic.first_name, basic.last_name].filter(Boolean).map((n: string) => titleCase(n)).join(" ");
        if (!name) continue;
        existing.add(npi);
        const [result] = await db.insert(providers).values({
          name: credential ? `${name}, ${credential}` : name,
          licenseState: SERVICE_STATE_CODE,
          licenseNumber: tax.license,
          licenseType: licenseTypeFor(credential, desc),
          npiNumber: npi,
          verificationStatus: "verified",
          npiVerifiedAt: new Date(),
          verificationNotes: NPPES_IMPORT_NOTE,
          npiData: JSON.stringify({ taxonomy: desc, taxonomyCode: tax.code, address: loc.address_1, enumerationDate: basic.enumeration_date }),
          telehealthAvailable: false,
          inPersonAvailable: true,
          city: titleCase(loc.city),
          stateCode: SERVICE_STATE_CODE,
          zipCode: (loc.postal_code ?? "").slice(0, 5) || null,
          phone: formatPhone(loc.telephone_number),
          costTag: "insurance",
          acceptsNewPatients: true,
        });
        const providerId = (result as any).insertId;
        for (const specialty of specialtiesFor(desc)) {
          await db.insert(providerSpecialties).values({ providerId, specialty });
        }
        imported++;
      }
    }
    console.log(`${county.name}: ${imported} imported so far`);
  }
  console.log(`Done. Imported ${imported} NPI-verified providers.`);
  if (failedPages > 0) {
    console.error(`${failedPages} NPPES page(s) failed; rerun the import (existing NPIs are skipped).`);
    process.exit(2);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
