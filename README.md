# TherapyCareNow

TherapyCareNow ([www.therapycarenow.com](https://www.therapycarenow.com)) is a free mental health navigation tool for **Southern California**. It helps people find NPI-verified clinicians, crisis lines, group therapy, veterans services, hospital and state-funded programs, and low-cost care in eight counties: Los Angeles, Orange, San Diego, Riverside, San Bernardino, Ventura, Santa Barbara, and Imperial.

TherapyCareNow is a navigation tool, not a clinic. It does not provide therapy or diagnosis.

## Features

| Page | Path | What it does |
| --- | --- | --- |
| Home | `/` | Explains the site, the difference between therapists, psychiatrists, and psychologists, and how clinicians are verified |
| Find a Provider | `/find-therapist` | Search therapists, psychiatrists, and psychologists by county, city, specialty, and insurance |
| Directory | `/directory` | Browse providers by county and city |
| Free Help | `/free-resources` | Hotlines, community clinics, sliding-scale care, support groups, and your county's 24/7 crisis line |
| Group Therapy | `/group-therapy` | What each type of group therapy does (Dialectical Behavior Therapy, anger management, and more), cost, insurance, and where to find groups |
| Veterans | `/veterans` | VA medical centers, Vet Centers, Veterans Crisis Line, VA Community Care, TRICARE, Military OneSource |
| Programs | `/programs` | Hospital behavioral health programs, Medi-Cal, Covered California, CalHOPE, 211, and county behavioral health departments |
| Employee Assistance Program | `/eap` | Explains Employee Assistance Programs, looks up your employer's program (no sign-in needed), and lists the programs for State, county, city, and federal employees in Southern California |
| Find Care by Insurance | `/benefits` | Pick your insurance or employer to see matching clinicians and Employee Assistance Program contacts. Nothing is stored |
| Assistant | `/ai-assistant` | AI guidance on finding care, with crisis detection that routes to 988 and county crisis lines |

## Clinician verification

Every clinician shown in the directory must have an NPI number and `verificationStatus = "verified"` (enforced in `server/db.ts`). Providers are imported from the [CMS NPPES NPI Registry](https://npiregistry.cms.hhs.gov/) by `scripts/import-npi-providers.ts`: only active individual NPIs with a mental health taxonomy and a California practice location in a recognized Southern California city are imported. Live search results also come from NPPES.

The NPI registry does not record telehealth or accepted insurance. Registry-imported listings show "Telehealth and insurance not yet confirmed, call to ask" (`detailsConfirmed: false`, see `shared/providerSource.ts`). Accepted insurance is not collected from clinicians. `scripts/import-insurance-networks.ts` matches every NPI-verified clinician against public sources and writes `provider_insurance` rows tagged `Source: ...`:

| Plan | Source |
|---|---|
| Medi-Cal | California DHCS enrolled Medi-Cal provider list (data.chhs.ca.gov) |
| Kaiser Permanente | Kaiser public Plan-Net provider directory (FHIR) |
| L.A. Care Health Plan | L.A. Care public provider directory (FHIR) |
| Inland Empire Health Plan (IEHP) | IEHP public provider directory (FHIR) |
| Blue Shield of California, Cigna | Public FHIR directories (Cigna rejects NPI search; Blue Shield is slow; run with `--only=`) |

When someone filters by a plan, Find a Provider also links to that insurer's official Find a Doctor page (`shared/insurerDirectories.ts`). Rerun the importer after importing new clinicians.

## Distance by ZIP code

Find a Provider and Free and Low-Cost Help take the user's ZIP code and sort results nearest first, showing miles. Distances are straight-line between ZIP centroids from the U.S. Census Bureau 2024 ZCTA Gazetteer (`shared/socalZips.ts`). Free resources are grouped by category and filtered by the county in their address.

## Region and data sources

- `shared/region.ts`: the eight counties, their cities, and each county's 24/7 crisis line
- `shared/socalPrograms.ts`: group therapy types, group therapy programs, veterans programs, hospital programs, and state/county-funded programs. Phone numbers and addresses come from each organization's official website.
- `shared/socalPrograms.ts` (`EAP_PROGRAMS`): Employee Assistance Programs for public employers, taken from each employer's HR page; `scripts/seed-socal.ts` loads them into the employer Employee Assistance Program lookup
- `shared/insurances.ts`: insurance options, including Medi-Cal, Medicare, Kaiser Permanente, MetLife, Aetna, Anthem Blue Cross, Blue Shield of California, Cigna, UnitedHealthcare, Health Net, L.A. Care, IEHP, CalOptima Health, Molina Healthcare, TRICARE, and VA Community Care

## Tech stack

TypeScript, React, Vite, Tailwind CSS, Express, tRPC, Drizzle ORM, MySQL (TiDB Cloud), deployed on Railway (`railway.toml`).

## Development

```bash
npx pnpm@10.4.1 install --frozen-lockfile
npx pnpm@10.4.1 dev        # http://localhost:3000
npx pnpm@10.4.1 run check  # type check
npx pnpm@10.4.1 run test   # tests
npx pnpm@10.4.1 run build  # production build
```

Database-backed features require `DATABASE_URL`; the AI assistant requires `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL`.

## Database setup

```bash
DATABASE_URL=... npx drizzle-kit migrate                     # create tables
DATABASE_URL=... npx tsx scripts/seed-socal.ts               # crisis lines, free resources, compliance data
DATABASE_URL=... npx tsx scripts/import-npi-providers.ts     # NPI-verified clinicians (add --county=<slug> for one county)
```

## Deployment

The live site is the `therapycarenow-web` service in the Railway project `TherapyCareNow`. It is deployed by uploading the code with the Railway CLI (`railway up`), not automatically on merge. Build and start commands are in `railway.toml`.

## Search engine indexing

- `client/index.html` sets the search listing title ("TherapyCareNow: Southern California Mental Health Resources"), the description, Open Graph tags, and `WebSite`/`Organization` structured data (JSON-LD) so the site name shows as a resource.
- `client/public/robots.txt` blocks `/login`, `/admin`, and `/settings`, and points to the sitemap. The login page also sets `noindex, nofollow`.
- `client/public/sitemap.xml` lists the public pages. Update it when you add or remove a public route.
- After deploying, submit `https://www.therapycarenow.com/sitemap.xml` in Google Search Console and request indexing of the home page.
