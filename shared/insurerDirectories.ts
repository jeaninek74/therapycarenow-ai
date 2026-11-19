/** Insurers' own official "Find a Doctor" pages, used to send people to the full network for their plan. */
export interface InsurerDirectory {
  label: string;
  url: string;
  note?: string;
}

const KAISER = { label: "Kaiser Permanente", url: "https://healthy.kaiserpermanente.org/southern-california/doctors-locations" };
const ANTHEM = { label: "Anthem Blue Cross", url: "https://www.anthem.com/ca/find-care/" };
const BLUE_SHIELD = { label: "Blue Shield of California", url: "https://www.blueshieldca.com/fad" };
const UHC = { label: "UnitedHealthcare", url: "https://www.uhc.com/find-a-doctor" };

export const INSURER_DIRECTORIES: Record<string, InsurerDirectory> = {
  "Kaiser Permanente": KAISER,
  "Anthem Blue Cross": ANTHEM,
  Anthem: ANTHEM,
  "Blue Cross": ANTHEM,
  "Blue Shield of California": BLUE_SHIELD,
  "Blue Shield": BLUE_SHIELD,
  Aetna: { label: "Aetna", url: "https://www.aetna.com/dsepublic/" },
  Cigna: { label: "Cigna", url: "https://hcpdirectory.cigna.com/" },
  UnitedHealthcare: UHC,
  "United Healthcare": UHC,
  UnitedHealth: UHC,
  Optum: UHC,
  "Health Net": { label: "Health Net", url: "https://findaprovider.healthnetcalifornia.com/" },
  "Molina Healthcare": { label: "Molina Healthcare", url: "https://providersearch.molinahealthcare.com/" },
  "CalOptima Health": { label: "CalOptima Health", url: "https://www.caloptima.org/en/find-a-doctor" },
  Medicare: { label: "Medicare", url: "https://www.medicare.gov/care-compare/" },
  "Covered California": { label: "Covered California", url: "https://www.coveredca.com/" },
  TRICARE: { label: "TRICARE", url: "https://tricare.mil/FindDoctor" },
  Tricare: { label: "TRICARE", url: "https://tricare.mil/FindDoctor" },
  "VA Community Care": { label: "VA", url: "https://www.va.gov/find-locations" },
  "VA / Veterans Affairs": { label: "VA", url: "https://www.va.gov/find-locations" },
  MetLife: {
    label: "MetLife",
    url: "https://www.metlife.com/",
    note: "MetLife plans in California are mainly dental, vision, and Employee Assistance Programs. Therapy is usually covered by your medical plan or your employer's EAP.",
  },
};
