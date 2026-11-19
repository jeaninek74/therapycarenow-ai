/**
 * Links NPI-verified clinicians to the insurance plans whose public directories list them.
 * Sources are insurers' CMS-mandated public FHIR provider directories (looked up by NPI)
 * and the State of California's list of enrolled Medi-Cal providers. No clinician input.
 *
 *   DATABASE_URL=... npx tsx scripts/import-insurance-networks.ts [--only=kaiser,medi-cal]
 */
import "dotenv/config";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { drizzle } from "drizzle-orm/mysql2";
import { and, inArray, isNotNull, like } from "drizzle-orm";
import { providerInsurance, providers } from "../drizzle/schema";

const NPI_SYSTEM = "http://hl7.org/fhir/sid/us-npi";
const SOURCE_PREFIX = "Source: ";

type FhirSource = { key: string; insuranceName: string; label: string; base: string };
const FHIR_SOURCES: FhirSource[] = [
  { key: "kaiser", insuranceName: "Kaiser Permanente", label: "Kaiser Permanente public provider directory", base: "https://kpx-service-bus.kp.org/service/hp/mhpo/healthplanproviderv1rc" },
  { key: "la-care", insuranceName: "L.A. Care Health Plan", label: "L.A. Care public provider directory", base: "https://us107.ir4.edifecscloud.com/lac/fhir/pd/R4" },
  { key: "iehp", insuranceName: "Inland Empire Health Plan (IEHP)", label: "IEHP public provider directory", base: "https://fhir.iehp.org/provider-directory" },
  { key: "cigna", insuranceName: "Cigna", label: "Cigna public provider directory", base: "https://fhir.cigna.com/ProviderDirectory/v1" },
  { key: "blue-shield", insuranceName: "Blue Shield of California", label: "Blue Shield of California public provider directory", base: "https://api.blueshieldca.com/bsc/fhir/fhir-server/api/v4/cloud/provider-directory" },
];
const MEDI_CAL_CSV =
  "https://data.chhs.ca.gov/dataset/514c5381-f3dc-4c4a-a9de-a4df9405f046/resource/d652b210-ec3d-4a92-b7e0-e55c3dcbc7dc/download/medi-cal-ffs-provider-listing_11_16_26.csv";

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const enabled = (key: string) => !only || only.includes(key);

/** true = listed, false = not listed, null = request failed */
async function listedInFhir(base: string, npi: string): Promise<boolean | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${base}/Practitioner?identifier=${encodeURIComponent(`${NPI_SYSTEM}|${npi}`)}&_count=5`, {
        headers: { Accept: "application/fhir+json" },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(String(res.status));
      const bundle: any = await res.json();
      // Only count an exact NPI match, in case a server ignores the identifier filter.
      return (bundle.entry ?? []).some((e: any) =>
        (e.resource?.identifier ?? []).some((i: any) => i.value === npi && (i.system ?? "").toLowerCase().includes("npi")),
      );
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return null;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

async function mediCalNpis(): Promise<Set<string>> {
  const res = await fetch(MEDI_CAL_CSV);
  if (!res.ok || !res.body) throw new Error(`Medi-Cal list download failed: ${res.status}`);
  const lines = createInterface({ input: Readable.fromWeb(res.body as any) });
  const npis = new Set<string>();
  let npiCol = -1;
  for await (const line of lines) {
    const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    if (npiCol < 0) {
      npiCol = cols.findIndex((c) => c.toUpperCase() === "NPI");
      if (npiCol < 0) throw new Error("NPI column not found in Medi-Cal list");
      continue;
    }
    if (/^\d{10}$/.test(cols[npiCol] ?? "")) npis.add(cols[npiCol]);
  }
  return npis;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const db = drizzle(process.env.DATABASE_URL);
  const rows = await db.select({ id: providers.id, npi: providers.npiNumber }).from(providers).where(isNotNull(providers.npiNumber));
  const clinicians = rows.filter((r): r is { id: number; npi: string } => !!r.npi);
  console.log(`${clinicians.length} NPI-verified clinicians`);

  /** Replaces this source's matches for the clinicians that were checked (all of them when `checked` is omitted). */
  const save = async (insuranceName: string, label: string, ids: number[], checked?: number[]) => {
    const sourceTag = like(providerInsurance.planName, `${SOURCE_PREFIX}${label}`);
    if (!checked) await db.delete(providerInsurance).where(sourceTag);
    for (let i = 0; checked && i < checked.length; i += 500) {
      await db.delete(providerInsurance).where(and(sourceTag, inArray(providerInsurance.providerId, checked.slice(i, i + 500))));
    }
    for (let i = 0; i < ids.length; i += 500) {
      await db.insert(providerInsurance).values(
        ids.slice(i, i + 500).map((providerId) => ({ providerId, insuranceName, planName: `${SOURCE_PREFIX}${label}` })),
      );
    }
    console.log(`${insuranceName}: ${ids.length} clinicians listed`);
  };

  let incomplete = false;

  if (enabled("medi-cal")) {
    const label = "California DHCS enrolled Medi-Cal provider list";
    const npis = await mediCalNpis();
    await save("Medi-Cal", label, clinicians.filter((c) => npis.has(c.npi)).map((c) => c.id));
  }

  for (const src of FHIR_SOURCES.filter((s) => enabled(s.key))) {
    const results = await mapLimit(clinicians, 8, (c) => listedInFhir(src.base, c.npi));
    const failed = results.filter((r) => r === null).length;
    if (failed > clinicians.length * 0.2) {
      console.warn(`${src.insuranceName}: ${failed} lookups failed; keeping existing data. Rerun with --only=${src.key}.`);
      incomplete = true;
      continue;
    }
    if (failed) {
      console.warn(`${src.insuranceName}: ${failed} lookups failed; rerun with --only=${src.key} to fill them.`);
      incomplete = true;
    }
    await save(
      src.insuranceName,
      src.label,
      clinicians.filter((_, i) => results[i] === true).map((c) => c.id),
      clinicians.filter((_, i) => results[i] !== null).map((c) => c.id),
    );
  }

  process.exit(incomplete ? 2 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
