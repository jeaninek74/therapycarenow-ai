/**
 * Imports NPI-verified Southern California mental health clinicians from the
 * CMS NPPES registry into the providers table. Only active individual NPIs whose
 * practice location ZIP code is in one of the 8 Southern California counties are imported,
 * searching every Southern California ZIP code so no city or community is missed. Existing NPIs are skipped.
 * Run: DATABASE_URL=... npx tsx scripts/import-npi-providers.ts [--county=<slug>]
 */
import axios from "axios";
import fs from "node:fs";
import { drizzle } from "drizzle-orm/mysql2";
import { isNotNull } from "drizzle-orm";
import { providers, providerSpecialties } from "../drizzle/schema";
import { NPPES_IMPORT_NOTE } from "../shared/providerSource";
import { SOCAL_COUNTIES, SERVICE_STATE_CODE, getCountyForCity } from "../shared/region";
import { SOCAL_ZIP_COUNTY } from "../shared/socalZipCounties";

const NPPES_BASE = "https://npiregistry.cms.hhs.gov/api/";
const TAXONOMIES = ["psychiatry", "psychologist", "counselor", "social worker", "marriage & family therapist"];

// Primary taxonomies we list: psychiatry specialties (not neurology), psychologists, licensed counselors,
// clinical social workers, and marriage & family therapists.
const MENTAL_HEALTH_PRIMARY =
  /^(Psychiatry & Neurology, (Psychiatry|.*Psychiatry)|Psychologist(, .*)?|Counselor(, (Mental Health|Professional|Addiction \(Substance Use Disorder\)))?|Social Worker, Clinical|Marriage & Family Therapist)$/;

const db = drizzle(process.env.DATABASE_URL!);
const countyArg = process.argv.find((a) => a.startsWith("--county="))?.split("=")[1];
// Optional resume file: ZIP codes already searched are skipped on rerun.
const progressFile = process.argv.find((a) => a.startsWith("--progress="))?.split("=")[1];
const doneZips = new Set<string>(progressFile && fs.existsSync(progressFile) ? fs.readFileSync(progressFile, "utf8").split("\n").filter(Boolean) : []);

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

// Misspelled or abbreviated practice-location cities seen in NPPES, mapped to the real city.
const CITY_FIXES: Record<string, string> = {"L.A.": "Los Angeles", "La": "Los Angeles", "Costa Mesta": "Costa Mesa", "Carsbad": "Carlsbad", "Chula Visa": "Chula Vista", "March Arb": "Riverside", "Rancho Milrage": "Rancho Mirage", "29 Palms": "Twentynine Palms", "Rancho Cucuamonga": "Rancho Cucamonga", "Rch Cucamonga": "Rancho Cucamonga", "Newbary Park": "Newbury Park", "Westlake Vlg": "Westlake Village", "Westlake": "Westlake Village", "Santa Maria,": "Santa Maria", "Vandenberg Afb": "Vandenberg Space Force Base", "Agoura": "Agoura Hills", "Bel-Air": "Bel Air", "Beverly Hillsa": "Beverly Hills", "Calabasas Hills": "Calabasas", "Camp Pendleton, Ca": "Camp Pendleton", "Canyon Cntry": "Canyon Country", "City Of Commerce": "Commerce", "Clairmont": "Claremont", "Clover City": "Culver City", "Del-Mar": "Del Mar", "Durate": "Duarte", "El Cajo": "El Cajon", "Elcajon": "El Cajon", "Excondido": "Escondido", "Fountain Vly": "Fountain Valley", "Fullertotn": "Fullerton", "Gardena Grove": "Garden Grove", "Gardengrove": "Garden Grove", "Hacienda Hts": "Hacienda Heights", "Hawthrone": "Hawthorne", "Huntingtn Bch": "Huntington Beach", "Idyllwild-Pine Cove": "Idyllwild", "Ingelwood": "Inglewood", "La Canada": "La Canada Flintridge", "La Canada Flt": "La Canada Flintridge", "La Crescenta-Montrose": "La Crescenta", "La Joll": "La Jolla", "Lajolla": "La Jolla", "Lo Jolla": "La Jolla", "Misssion Viejo": "Mission Viejo", "Morenovalley": "Moreno Valley", "N Hollywood": "North Hollywood", "N. Hollywood": "North Hollywood", "Noho": "North Hollywood", "Pasad": "Pasadena", "Pico River": "Pico Rivera", "Quartz Hiu": "Quartz Hill", "Rancho Belago": "Moreno Valley", "Rsm": "Rancho Santa Margarita", "S El Monte": "South El Monte", "S Pasadena": "South Pasadena", "San Bernadino": "San Bernardino", "San Bernandino": "San Bernardino", "San Deigo": "San Diego", "San Diago": "San Diego", "San Juan Capistraco": "San Juan Capistrano", "Santa Anna": "Santa Ana", "Santa Fe Spgs": "Santa Fe Springs", "Sherma Oaks": "Sherman Oaks", "So Pasadena": "South Pasadena", "Solano Beach": "Solana Beach", "Torrence": "Torrance", "Trabuco Cyn": "Trabuco Canyon", "Tustn": "Tustin", "Valenica": "Valencia", "Van Huys": "Van Nuys", "Vistaa": "Vista", "W Hollywood": "West Hollywood", "W Los Angeles": "West Los Angeles", "W Toluca Lake": "Toluca Lake", "W. Los Angeles": "West Los Angeles", "West Toluca Lake": "Toluca Lake", "Woodland": "Woodland Hills", "Woodland Hls": "Woodland Hills", "Anaheim,": "Anaheim", "Green Valley": "Santa Clarita", "La Mirada,": "La Mirada", "Lons Angeles": "Los Angeles", "Los Aangeles": "Los Angeles", "Los Angeles,": "Los Angeles", "Los Angeles, Ca 9002": "Los Angeles", "Los Angels": "Los Angeles", "Los Angelses": "Los Angeles", "Los Angles": "Los Angeles", "Losa Angeles": "Los Angeles", "Losangeles": "Los Angeles", "Lost Angeles": "Los Angeles", "Rancho Cascades": "Sylmar", "Rancho Park": "Los Angeles", "Santa Fe Springs,": "Santa Fe Springs", "Santa Fr Springs": "Santa Fe Springs", "Sherwood Forest": "Northridge"};

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b[a-z]/g, (m) => m.toUpperCase());
}

async function fetchPage(where: { postal_code?: string; city?: string }, taxonomy: string, skip: number): Promise<any[] | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await axios.get(NPPES_BASE, {
        params: { version: "2.1", enumeration_type: "NPI-1", taxonomy_description: taxonomy, state: SERVICE_STATE_CODE, ...where, limit: "200", skip: String(skip) },
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

async function fetchAll(where: { postal_code?: string; city?: string }, taxonomy: string): Promise<any[]> {
  const all: any[] = [];
  for (let skip = 0; skip <= 1000; skip += 200) {
    const page = await fetchPage(where, taxonomy, skip);
    if (page === null) {
      failedPages++;
      console.warn(`NPPES request failed: ${where.postal_code ?? where.city} / ${taxonomy} / skip=${skip}. Rerun to fill the gap.`);
      break;
    }
    all.push(...page);
    if (page.length < 200) break;
    if (skip === 1000) console.warn(`${where.postal_code ?? where.city} / ${taxonomy} hit the NPPES 1,200-result cap.`);
  }
  return all;
}

let imported = 0;
const existing = new Set<string>();

async function importRows(rows: any[], accept: (loc: any) => boolean) {
  for (const r of rows) {
    const npi: string = r.number;
    const basic = r.basic ?? {};
    if (!npi || existing.has(npi) || basic.status !== "A") continue;
    const loc = (r.addresses ?? []).find((a: any) => a.address_purpose === "LOCATION");
    if (!loc || loc.state !== SERVICE_STATE_CODE || !loc.city || !accept(loc)) continue;
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
      city: CITY_FIXES[titleCase(loc.city)] ?? titleCase(loc.city),
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

// Search one unit (a ZIP or a city) across all taxonomies; mark it done only if every request succeeded.
async function searchUnit(key: string, where: { postal_code?: string; city?: string }, accept: (loc: any) => boolean) {
  if (doneZips.has(key)) return;
  const failedBefore = failedPages;
  const rows = (await Promise.all(TAXONOMIES.map((t) => fetchAll(where, t)))).flat();
  await importRows(rows, accept);
  if (progressFile && failedPages === failedBefore) fs.appendFileSync(progressFile, key + "\n");
}

async function main() {
  (await db.select({ npi: providers.npiNumber }).from(providers).where(isNotNull(providers.npiNumber))).forEach((r) => existing.add(r.npi!));
  const counties = countyArg ? SOCAL_COUNTIES.filter((c) => c.slug === countyArg) : SOCAL_COUNTIES;
  for (const county of counties) {
    const zips = Object.keys(SOCAL_ZIP_COUNTY).filter((z) => SOCAL_ZIP_COUNTY[z] === county.slug);
    for (const zip of zips) {
      await searchUnit(zip, { postal_code: zip }, (loc) => (loc.postal_code ?? "").slice(0, 5) === zip);
      console.log(`${county.name} ${zip}: ${imported} imported so far`);
    }
    // PO-box and single-site ZIPs (e.g. 92357, the Loma Linda VA) have no Census ZIP area; catch them by city name.
    for (const city of county.cities) {
      await searchUnit(`city:${city}`, { city: city.toUpperCase() }, (loc) => {
        const zip = (loc.postal_code ?? "").slice(0, 5);
        return /^9[0-3]\d{3}$/.test(zip) && !SOCAL_ZIP_COUNTY[zip] && getCountyForCity(loc.city)?.slug === county.slug;
      });
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
