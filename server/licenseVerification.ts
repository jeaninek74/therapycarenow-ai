// ─── License Verification Engine ──────────────────────────────────────────────
// Verifies therapist NPI numbers against the NPPES public registry and validates
// that the provider's taxonomy code is a recognized mental health specialty.

export interface NpiLookupResult {
  valid: boolean;
  npiNumber: string;
  providerName?: string;
  credential?: string;
  taxonomyCode?: string;
  taxonomyDescription?: string;
  licenseState?: string;
  city?: string;
  state?: string;
  rawData?: Record<string, unknown>;
  error?: string;
}

// NUCC Health Care Provider Taxonomy Code Set — Mental Health specialties
export const ALLOWED_TAXONOMY_CODES = new Set<string>([
  "2084P0800X", "2084P0804X", "2084P0805X", "2084B0002X", "2084F0202X",
  "103TC0700X", "103TC2200X", "103TB0200X", "103TP2701X", "103TP0814X", "103T00000X",
  "1041C0700X", "104100000X",
  "101YA0400X", "101YM0800X", "101YP1600X", "101YP2500X", "101Y00000X",
  "106H00000X",
  "163WP0808X", "364SP0808X",
  "103K00000X",
]);

const TAXONOMY_DESCRIPTIONS: Record<string, string> = {
  "2084P0800X": "Psychiatry",
  "2084P0804X": "Child & Adolescent Psychiatry",
  "2084P0805X": "Geriatric Psychiatry",
  "2084B0002X": "Addiction Psychiatry",
  "2084F0202X": "Forensic Psychiatry",
  "103TC0700X": "Clinical Psychology",
  "103TC2200X": "Clinical Child & Adolescent Psychology",
  "103TB0200X": "Behavioral Analysis",
  "103TP2701X": "Health Psychology",
  "103TP0814X": "Psychoanalysis",
  "103T00000X": "Psychologist",
  "1041C0700X": "Clinical Social Worker",
  "104100000X": "Social Worker",
  "101YA0400X": "Addiction Counselor",
  "101YM0800X": "Mental Health Counselor",
  "101YP1600X": "Pastoral Counselor",
  "101YP2500X": "Professional Counselor",
  "101Y00000X": "Counselor",
  "106H00000X": "Marriage & Family Therapist",
  "163WP0808X": "Psychiatric/Mental Health Nurse",
  "364SP0808X": "Psychiatric/Mental Health Nurse Practitioner",
  "103K00000X": "Behavior Analyst",
};

export function getVerificationSummary(): string[] {
  return Object.values(TAXONOMY_DESCRIPTIONS);
}

interface NppesAddress {
  address_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  address_type?: string;
}

interface NppesTaxonomy {
  code?: string;
  desc?: string;
  primary?: boolean;
  state?: string;
  license?: string;
}

interface NppesResult {
  number?: string;
  basic?: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    name?: string;
    credential?: string;
    status?: string;
  };
  addresses?: NppesAddress[];
  taxonomies?: NppesTaxonomy[];
}

interface NppesResponse {
  result_count?: number;
  results?: NppesResult[];
}

export async function verifyProviderLicense(
  npiNumber: string,
  licenseState?: string
): Promise<NpiLookupResult> {
  if (!/^\d{10}$/.test(npiNumber)) {
    return { valid: false, npiNumber, error: "NPI must be exactly 10 digits." };
  }

  try {
    const url = `https://npiregistry.cms.hhs.gov/api/?number=${npiNumber}&version=2.1`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { valid: false, npiNumber, error: `NPPES API returned status ${response.status}.` };
    }

    const data = (await response.json()) as NppesResponse;

    if (!data.result_count || data.result_count === 0 || !data.results?.length) {
      return { valid: false, npiNumber, error: "NPI number not found in the NPPES registry." };
    }

    const result = data.results[0];
    const basic = result.basic;
    const taxonomies = result.taxonomies ?? [];
    const addresses = result.addresses ?? [];

    let providerName: string | undefined;
    if (basic?.first_name && basic?.last_name) {
      providerName = [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).join(" ");
    } else if (basic?.name) {
      providerName = basic.name;
    }

    const primaryTaxonomy = taxonomies.find((t) => t.primary && t.code && ALLOWED_TAXONOMY_CODES.has(t.code));
    const anyMentalHealthTaxonomy = taxonomies.find((t) => t.code && ALLOWED_TAXONOMY_CODES.has(t.code));
    const matchedTaxonomy = primaryTaxonomy ?? anyMentalHealthTaxonomy;

    if (!matchedTaxonomy) {
      const allCodes = taxonomies.map((t) => t.code ?? "unknown").join(", ");
      return {
        valid: false,
        npiNumber,
        providerName,
        credential: basic?.credential,
        error: `Provider taxonomy (${allCodes}) is not a recognized mental health specialty. Only licensed therapists, social workers, psychologists, counselors, and psychiatrists may be listed.`,
        rawData: result as unknown as Record<string, unknown>,
      };
    }

    const practiceAddress = addresses.find((a) => a.address_type === "LOCATION") ?? addresses[0];

    return {
      valid: true,
      npiNumber,
      providerName,
      credential: basic?.credential,
      taxonomyCode: matchedTaxonomy.code,
      taxonomyDescription: matchedTaxonomy.code
        ? (TAXONOMY_DESCRIPTIONS[matchedTaxonomy.code] ?? matchedTaxonomy.desc)
        : matchedTaxonomy.desc,
      licenseState: matchedTaxonomy.state ?? licenseState,
      city: practiceAddress?.city,
      state: practiceAddress?.state,
      rawData: result as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("timeout") || message.includes("AbortError")) {
      return { valid: false, npiNumber, error: "NPPES registry lookup timed out. Please try again." };
    }
    return { valid: false, npiNumber, error: `Verification service unavailable: ${message}` };
  }
}
