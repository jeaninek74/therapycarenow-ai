/**
 * Provider License Verification — Public NPI Lookup
 * Used by the provider submission (Join Directory) flow.
 * Queries the public NPPES registry to validate NPI numbers.
 */

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

export async function verifyProviderLicense(npiNumber: string, _licenseState?: string): Promise<NpiLookupResult> {
  if (!/^\d{10}$/.test(npiNumber)) {
    return { valid: false, npiNumber, error: "NPI must be exactly 10 digits." };
  }
  try {
    const url = `https://npiregistry.cms.hhs.gov/api/?number=${npiNumber}&version=2.1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { valid: false, npiNumber, error: `NPPES API error: ${res.status}` };
    }
    const data = await res.json() as {
      result_count: number;
      results?: Array<{
        number: string;
        basic?: {
          first_name?: string;
          last_name?: string;
          organization_name?: string;
          credential?: string;
        };
        taxonomies?: Array<{
          code: string;
          desc: string;
          primary: boolean;
          state?: string;
          license?: string;
        }>;
        addresses?: Array<{
          city?: string;
          state?: string;
          address_purpose?: string;
        }>;
      }>;
    };
    if (!data.result_count || !data.results?.length) {
      return { valid: false, npiNumber, error: "NPI not found in NPPES registry." };
    }
    const provider = data.results[0];
    const basic = provider.basic ?? {};
    const primaryTaxonomy =
      provider.taxonomies?.find((t) => t.primary) ?? provider.taxonomies?.[0];
    const practiceAddress =
      provider.addresses?.find((a) => a.address_purpose === "LOCATION") ??
      provider.addresses?.[0];
    const providerName = basic.organization_name
      ? basic.organization_name
      : [basic.first_name, basic.last_name].filter(Boolean).join(" ");
    return {
      valid: true,
      npiNumber,
      providerName,
      credential: basic.credential,
      taxonomyCode: primaryTaxonomy?.code,
      taxonomyDescription: primaryTaxonomy?.desc,
      licenseState: primaryTaxonomy?.state,
      city: practiceAddress?.city,
      state: practiceAddress?.state,
      rawData: provider as Record<string, unknown>,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { valid: false, npiNumber, error: `NPI lookup failed: ${msg}` };
  }
}
