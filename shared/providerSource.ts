/** verificationNotes value for clinicians imported from the CMS NPPES registry. */
export const NPPES_IMPORT_NOTE = "Imported from CMS NPPES registry (active individual NPI, SoCal practice location).";

/**
 * The NPI registry does not record telehealth or accepted insurance, so those details
 * are only confirmed once the clinician submits or claims their listing.
 */
export function detailsConfirmedByClinician(verificationNotes: string | null | undefined): boolean {
  return verificationNotes !== NPPES_IMPORT_NOTE;
}

/** Drops degree letters appended to a clinician's name, e.g. "Jane Doe, PhD, CGP" -> "Jane Doe". */
export function nameWithoutDegrees(name: string): string {
  return name.split(",")[0].trim();
}
