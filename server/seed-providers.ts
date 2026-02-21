/**
 * Expanded provider seed — 3+ providers per state, diverse specialties & license types
 * Run: npx tsx server/seed-providers.ts
 */
import { drizzle } from "drizzle-orm/mysql2";
import { providers, providerSpecialties, providerInsurance } from "../drizzle/schema";
import * as dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

// ─── Specialty pools ──────────────────────────────────────────────────────────
const TRAUMA = ["trauma", "ptsd", "anxiety"];
const DEPRESSION = ["depression", "anxiety", "grief"];
const FAMILY = ["family", "couples", "child_adolescent"];
const ADDICTION = ["addiction", "substance_use", "depression"];
const LGBTQ = ["lgbtq", "anxiety", "depression"];
const VETERANS = ["veterans", "ptsd", "trauma"];
const CHILD = ["child_adolescent", "adhd", "anxiety"];
const BIPOLAR = ["bipolar", "depression", "anxiety"];
const EATING = ["eating_disorders", "anxiety", "depression"];
const WORKPLACE = ["workplace_stress", "anxiety", "depression"];

// ─── Insurance pools ──────────────────────────────────────────────────────────
const MAJOR_INS = ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealth", "Humana"];
const MEDICAID_INS = ["Medicaid", "Medicare", "CHIP"];
const SLIDING = ["Sliding Scale", "Self-Pay"];
const EAP_INS = ["EAP", "Aetna", "Cigna"];

type ProviderSeed = {
  name: string;
  licenseState: string;
  licenseType: string;
  telehealth: boolean;
  inPerson: boolean;
  city: string;
  stateCode: string;
  phone: string;
  costTag: "free" | "sliding_scale" | "insurance" | "self_pay";
  urgency: "within_24h" | "within_72h" | "this_week" | "flexible";
  specialties: string[];
  insurance: string[];
};

const EXPANDED_PROVIDERS: ProviderSeed[] = [
  // Alabama
  { name: "Dr. Patricia Moore, PhD", licenseState: "AL", licenseType: "PhD", telehealth: true, inPerson: true, city: "Birmingham", stateCode: "AL", phone: "205-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Marcus Williams, LPC", licenseState: "AL", licenseType: "LPC", telehealth: true, inPerson: false, city: "Montgomery", stateCode: "AL", phone: "334-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Sandra Johnson, LCSW", licenseState: "AL", licenseType: "LCSW", telehealth: false, inPerson: true, city: "Huntsville", stateCode: "AL", phone: "256-555-0103", costTag: "insurance", urgency: "within_72h", specialties: FAMILY, insurance: [...MAJOR_INS, ...MEDICAID_INS] },

  // Alaska
  { name: "Dr. James Nakamura, PsyD", licenseState: "AK", licenseType: "PsyD", telehealth: true, inPerson: true, city: "Anchorage", stateCode: "AK", phone: "907-555-0101", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: MAJOR_INS },
  { name: "Rachel Tundra, LMFT", licenseState: "AK", licenseType: "LMFT", telehealth: true, inPerson: false, city: "Fairbanks", stateCode: "AK", phone: "907-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Thomas Begay, LPC", licenseState: "AK", licenseType: "LPC", telehealth: true, inPerson: true, city: "Juneau", stateCode: "AK", phone: "907-555-0103", costTag: "free", urgency: "within_24h", specialties: TRAUMA, insurance: MEDICAID_INS },

  // Arizona
  { name: "Dr. Maria Santos, PhD", licenseState: "AZ", licenseType: "PhD", telehealth: true, inPerson: true, city: "Phoenix", stateCode: "AZ", phone: "602-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Kevin Yazzie, LCSW", licenseState: "AZ", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Tucson", stateCode: "AZ", phone: "520-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Priya Patel, PsyD", licenseState: "AZ", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Scottsdale", stateCode: "AZ", phone: "480-555-0103", costTag: "insurance", urgency: "within_72h", specialties: EATING, insurance: MAJOR_INS },

  // Arkansas
  { name: "Linda Crawford, LCSW", licenseState: "AR", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Little Rock", stateCode: "AR", phone: "501-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Dr. Robert Hill, PhD", licenseState: "AR", licenseType: "PhD", telehealth: true, inPerson: true, city: "Fayetteville", stateCode: "AR", phone: "479-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: ADDICTION, insurance: SLIDING },
  { name: "Angela Brooks, LPC", licenseState: "AR", licenseType: "LPC", telehealth: false, inPerson: true, city: "Fort Smith", stateCode: "AR", phone: "479-555-0103", costTag: "free", urgency: "within_24h", specialties: FAMILY, insurance: MEDICAID_INS },

  // California
  { name: "Dr. Jennifer Chen, PhD", licenseState: "CA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Los Angeles", stateCode: "CA", phone: "213-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Miguel Rodriguez, LMFT", licenseState: "CA", licenseType: "LMFT", telehealth: true, inPerson: true, city: "San Francisco", stateCode: "CA", phone: "415-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Aisha Washington, PsyD", licenseState: "CA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "San Diego", stateCode: "CA", phone: "619-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: MAJOR_INS },
  { name: "Sarah Kim, LCSW", licenseState: "CA", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Sacramento", stateCode: "CA", phone: "916-555-0104", costTag: "free", urgency: "within_24h", specialties: CHILD, insurance: MEDICAID_INS },

  // Colorado
  { name: "Dr. David Thompson, PhD", licenseState: "CO", licenseType: "PhD", telehealth: true, inPerson: true, city: "Denver", stateCode: "CO", phone: "303-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Emma Larson, LPC", licenseState: "CO", licenseType: "LPC", telehealth: true, inPerson: true, city: "Boulder", stateCode: "CO", phone: "720-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Carlos Mendez, LCSW", licenseState: "CO", licenseType: "LCSW", telehealth: true, inPerson: false, city: "Colorado Springs", stateCode: "CO", phone: "719-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: EAP_INS },

  // Connecticut
  { name: "Dr. Elizabeth Park, PhD", licenseState: "CT", licenseType: "PhD", telehealth: true, inPerson: true, city: "Hartford", stateCode: "CT", phone: "860-555-0101", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: MAJOR_INS },
  { name: "Nathan Foster, LMFT", licenseState: "CT", licenseType: "LMFT", telehealth: true, inPerson: true, city: "New Haven", stateCode: "CT", phone: "203-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Grace Liu, PsyD", licenseState: "CT", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Stamford", stateCode: "CT", phone: "203-555-0103", costTag: "insurance", urgency: "within_72h", specialties: EATING, insurance: MAJOR_INS },

  // Delaware
  { name: "Patricia Evans, LCSW", licenseState: "DE", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Wilmington", stateCode: "DE", phone: "302-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Dr. Michael Ross, PhD", licenseState: "DE", licenseType: "PhD", telehealth: true, inPerson: true, city: "Dover", stateCode: "DE", phone: "302-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Olivia Harris, LPC", licenseState: "DE", licenseType: "LPC", telehealth: false, inPerson: true, city: "Newark", stateCode: "DE", phone: "302-555-0103", costTag: "free", urgency: "within_24h", specialties: CHILD, insurance: MEDICAID_INS },

  // Florida
  { name: "Dr. Isabella Martinez, PhD", licenseState: "FL", licenseType: "PhD", telehealth: true, inPerson: true, city: "Miami", stateCode: "FL", phone: "305-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "James Wilson, LMFT", licenseState: "FL", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Orlando", stateCode: "FL", phone: "407-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Sophia Brown, PsyD", licenseState: "FL", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Tampa", stateCode: "FL", phone: "813-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: MAJOR_INS },
  { name: "Anthony Davis, LCSW", licenseState: "FL", licenseType: "LCSW", telehealth: false, inPerson: true, city: "Jacksonville", stateCode: "FL", phone: "904-555-0104", costTag: "free", urgency: "within_24h", specialties: ADDICTION, insurance: MEDICAID_INS },

  // Georgia
  { name: "Dr. Natalie Robinson, PhD", licenseState: "GA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Atlanta", stateCode: "GA", phone: "404-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "William Turner, LPC", licenseState: "GA", licenseType: "LPC", telehealth: true, inPerson: true, city: "Savannah", stateCode: "GA", phone: "912-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Keisha Thomas, PsyD", licenseState: "GA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Augusta", stateCode: "GA", phone: "706-555-0103", costTag: "insurance", urgency: "within_72h", specialties: FAMILY, insurance: EAP_INS },

  // Hawaii
  { name: "Dr. Leilani Kahale, PhD", licenseState: "HI", licenseType: "PhD", telehealth: true, inPerson: true, city: "Honolulu", stateCode: "HI", phone: "808-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Kai Makoa, LCSW", licenseState: "HI", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Kailua", stateCode: "HI", phone: "808-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Malia Fonoti, LMFT", licenseState: "HI", licenseType: "LMFT", telehealth: true, inPerson: false, city: "Hilo", stateCode: "HI", phone: "808-555-0103", costTag: "free", urgency: "within_24h", specialties: DEPRESSION, insurance: MEDICAID_INS },

  // Idaho
  { name: "Dr. Steven Clark, PhD", licenseState: "ID", licenseType: "PhD", telehealth: true, inPerson: true, city: "Boise", stateCode: "ID", phone: "208-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Amanda White, LPC", licenseState: "ID", licenseType: "LPC", telehealth: true, inPerson: true, city: "Nampa", stateCode: "ID", phone: "208-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Ryan Jensen, PsyD", licenseState: "ID", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Idaho Falls", stateCode: "ID", phone: "208-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: MAJOR_INS },

  // Illinois
  { name: "Dr. Vanessa Jackson, PhD", licenseState: "IL", licenseType: "PhD", telehealth: true, inPerson: true, city: "Chicago", stateCode: "IL", phone: "312-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Brandon Lee, LCSW", licenseState: "IL", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Springfield", stateCode: "IL", phone: "217-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: ADDICTION, insurance: SLIDING },
  { name: "Dr. Monica Perez, PsyD", licenseState: "IL", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Rockford", stateCode: "IL", phone: "815-555-0103", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: MAJOR_INS },

  // Indiana
  { name: "Dr. Christopher Adams, PhD", licenseState: "IN", licenseType: "PhD", telehealth: true, inPerson: true, city: "Indianapolis", stateCode: "IN", phone: "317-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Tiffany Baker, LMFT", licenseState: "IN", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Fort Wayne", stateCode: "IN", phone: "260-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Joshua Nelson, PsyD", licenseState: "IN", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Evansville", stateCode: "IN", phone: "812-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: EAP_INS },

  // Iowa
  { name: "Dr. Rebecca Carter, PhD", licenseState: "IA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Des Moines", stateCode: "IA", phone: "515-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Tyler Mitchell, LPC", licenseState: "IA", licenseType: "LPC", telehealth: true, inPerson: true, city: "Cedar Rapids", stateCode: "IA", phone: "319-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: WORKPLACE, insurance: SLIDING },
  { name: "Dr. Heather Collins, PsyD", licenseState: "IA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Iowa City", stateCode: "IA", phone: "319-555-0103", costTag: "insurance", urgency: "within_72h", specialties: EATING, insurance: MAJOR_INS },

  // Kansas
  { name: "Dr. Andrew Stewart, PhD", licenseState: "KS", licenseType: "PhD", telehealth: true, inPerson: true, city: "Wichita", stateCode: "KS", phone: "316-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Nicole Sanchez, LCSW", licenseState: "KS", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Topeka", stateCode: "KS", phone: "785-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Brian Morris, PsyD", licenseState: "KS", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Overland Park", stateCode: "KS", phone: "913-555-0103", costTag: "insurance", urgency: "within_72h", specialties: CHILD, insurance: MAJOR_INS },

  // Kentucky
  { name: "Dr. Stephanie Rogers, PhD", licenseState: "KY", licenseType: "PhD", telehealth: true, inPerson: true, city: "Louisville", stateCode: "KY", phone: "502-555-0101", costTag: "insurance", urgency: "within_72h", specialties: ADDICTION, insurance: MAJOR_INS },
  { name: "Daniel Reed, LPC", licenseState: "KY", licenseType: "LPC", telehealth: true, inPerson: true, city: "Lexington", stateCode: "KY", phone: "859-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Crystal Cook, PsyD", licenseState: "KY", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Bowling Green", stateCode: "KY", phone: "270-555-0103", costTag: "free", urgency: "within_24h", specialties: TRAUMA, insurance: MEDICAID_INS },

  // Louisiana
  { name: "Dr. Antoine Dupont, PhD", licenseState: "LA", licenseType: "PhD", telehealth: true, inPerson: true, city: "New Orleans", stateCode: "LA", phone: "504-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Monique Thibodaux, LCSW", licenseState: "LA", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Baton Rouge", stateCode: "LA", phone: "225-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Pierre Fontenot, PsyD", licenseState: "LA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Shreveport", stateCode: "LA", phone: "318-555-0103", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },

  // Maine
  { name: "Dr. Abigail Stone, PhD", licenseState: "ME", licenseType: "PhD", telehealth: true, inPerson: true, city: "Portland", stateCode: "ME", phone: "207-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Ethan Moody, LCSW", licenseState: "ME", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Bangor", stateCode: "ME", phone: "207-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Clara Frost, PsyD", licenseState: "ME", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Augusta", stateCode: "ME", phone: "207-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // Maryland
  { name: "Dr. Marcus Freeman, PhD", licenseState: "MD", licenseType: "PhD", telehealth: true, inPerson: true, city: "Baltimore", stateCode: "MD", phone: "410-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Jasmine Powell, LMFT", licenseState: "MD", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Rockville", stateCode: "MD", phone: "301-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Darnell Hughes, PsyD", licenseState: "MD", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Annapolis", stateCode: "MD", phone: "410-555-0103", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: EAP_INS },

  // Massachusetts
  { name: "Dr. Samantha Walsh, PhD", licenseState: "MA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Boston", stateCode: "MA", phone: "617-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Liam O'Brien, LCSW", licenseState: "MA", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Worcester", stateCode: "MA", phone: "508-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: ADDICTION, insurance: SLIDING },
  { name: "Dr. Mei Zhang, PsyD", licenseState: "MA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Cambridge", stateCode: "MA", phone: "617-555-0103", costTag: "insurance", urgency: "within_72h", specialties: EATING, insurance: MAJOR_INS },

  // Michigan
  { name: "Dr. Denise Armstrong, PhD", licenseState: "MI", licenseType: "PhD", telehealth: true, inPerson: true, city: "Detroit", stateCode: "MI", phone: "313-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Jordan Hayes, LPC", licenseState: "MI", licenseType: "LPC", telehealth: true, inPerson: true, city: "Grand Rapids", stateCode: "MI", phone: "616-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Tanya Webb, PsyD", licenseState: "MI", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Lansing", stateCode: "MI", phone: "517-555-0103", costTag: "free", urgency: "within_24h", specialties: CHILD, insurance: MEDICAID_INS },

  // Minnesota
  { name: "Dr. Erik Lindqvist, PhD", licenseState: "MN", licenseType: "PhD", telehealth: true, inPerson: true, city: "Minneapolis", stateCode: "MN", phone: "612-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Ingrid Sorenson, LMFT", licenseState: "MN", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Saint Paul", stateCode: "MN", phone: "651-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Amara Diallo, PsyD", licenseState: "MN", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Rochester", stateCode: "MN", phone: "507-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: EAP_INS },

  // Mississippi
  { name: "Dr. Tamara Jefferson, PhD", licenseState: "MS", licenseType: "PhD", telehealth: true, inPerson: true, city: "Jackson", stateCode: "MS", phone: "601-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Calvin Washington, LPC", licenseState: "MS", licenseType: "LPC", telehealth: true, inPerson: true, city: "Gulfport", stateCode: "MS", phone: "228-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Renee Coleman, PsyD", licenseState: "MS", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Hattiesburg", stateCode: "MS", phone: "601-555-0103", costTag: "free", urgency: "within_24h", specialties: FAMILY, insurance: MEDICAID_INS },

  // Missouri
  { name: "Dr. Lawrence Bryant, PhD", licenseState: "MO", licenseType: "PhD", telehealth: true, inPerson: true, city: "Kansas City", stateCode: "MO", phone: "816-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Brittany Spencer, LCSW", licenseState: "MO", licenseType: "LCSW", telehealth: true, inPerson: true, city: "St. Louis", stateCode: "MO", phone: "314-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: ADDICTION, insurance: SLIDING },
  { name: "Dr. Harold Grant, PsyD", licenseState: "MO", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Springfield", stateCode: "MO", phone: "417-555-0103", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },

  // Montana
  { name: "Dr. Cassandra Running Bear, PhD", licenseState: "MT", licenseType: "PhD", telehealth: true, inPerson: true, city: "Billings", stateCode: "MT", phone: "406-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Shane Galloway, LPC", licenseState: "MT", licenseType: "LPC", telehealth: true, inPerson: true, city: "Missoula", stateCode: "MT", phone: "406-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Fiona McLean, PsyD", licenseState: "MT", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Great Falls", stateCode: "MT", phone: "406-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // Nebraska
  { name: "Dr. Victor Hernandez, PhD", licenseState: "NE", licenseType: "PhD", telehealth: true, inPerson: true, city: "Omaha", stateCode: "NE", phone: "402-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Alicia Nguyen, LMFT", licenseState: "NE", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Lincoln", stateCode: "NE", phone: "402-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Derek Patterson, PsyD", licenseState: "NE", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Bellevue", stateCode: "NE", phone: "402-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: EAP_INS },

  // Nevada
  { name: "Dr. Yolanda Cruz, PhD", licenseState: "NV", licenseType: "PhD", telehealth: true, inPerson: true, city: "Las Vegas", stateCode: "NV", phone: "702-555-0101", costTag: "insurance", urgency: "within_72h", specialties: ADDICTION, insurance: MAJOR_INS },
  { name: "Rashid Okafor, LCSW", licenseState: "NV", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Reno", stateCode: "NV", phone: "775-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Celeste Moreau, PsyD", licenseState: "NV", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Henderson", stateCode: "NV", phone: "702-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },

  // New Hampshire
  { name: "Dr. Owen Prescott, PhD", licenseState: "NH", licenseType: "PhD", telehealth: true, inPerson: true, city: "Manchester", stateCode: "NH", phone: "603-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Lydia Chambers, LCSW", licenseState: "NH", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Nashua", stateCode: "NH", phone: "603-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Simon Aldrich, PsyD", licenseState: "NH", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Concord", stateCode: "NH", phone: "603-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // New Jersey
  { name: "Dr. Fatima Osei, PhD", licenseState: "NJ", licenseType: "PhD", telehealth: true, inPerson: true, city: "Newark", stateCode: "NJ", phone: "973-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Marco Deluca, LMFT", licenseState: "NJ", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Jersey City", stateCode: "NJ", phone: "201-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Priscilla Watts, PsyD", licenseState: "NJ", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Trenton", stateCode: "NJ", phone: "609-555-0103", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: EAP_INS },

  // New Mexico
  { name: "Dr. Rosa Vigil, PhD", licenseState: "NM", licenseType: "PhD", telehealth: true, inPerson: true, city: "Albuquerque", stateCode: "NM", phone: "505-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Diego Romero, LPC", licenseState: "NM", licenseType: "LPC", telehealth: true, inPerson: true, city: "Santa Fe", stateCode: "NM", phone: "505-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Naomi Runningwater, PsyD", licenseState: "NM", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Las Cruces", stateCode: "NM", phone: "575-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // New York
  { name: "Dr. Claudia Rosenberg, PhD", licenseState: "NY", licenseType: "PhD", telehealth: true, inPerson: true, city: "New York City", stateCode: "NY", phone: "212-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Terrence Blake, LCSW", licenseState: "NY", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Brooklyn", stateCode: "NY", phone: "718-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Nadia Volkov, PsyD", licenseState: "NY", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Buffalo", stateCode: "NY", phone: "716-555-0103", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: MAJOR_INS },
  { name: "Josephine Adeyemi, LMFT", licenseState: "NY", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Albany", stateCode: "NY", phone: "518-555-0104", costTag: "free", urgency: "within_24h", specialties: CHILD, insurance: MEDICAID_INS },

  // North Carolina
  { name: "Dr. Reginald Simmons, PhD", licenseState: "NC", licenseType: "PhD", telehealth: true, inPerson: true, city: "Charlotte", stateCode: "NC", phone: "704-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Destiny Monroe, LCSW", licenseState: "NC", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Raleigh", stateCode: "NC", phone: "919-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Winston Chambers, PsyD", licenseState: "NC", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Greensboro", stateCode: "NC", phone: "336-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: EAP_INS },

  // North Dakota
  { name: "Dr. Astrid Halverson, PhD", licenseState: "ND", licenseType: "PhD", telehealth: true, inPerson: true, city: "Fargo", stateCode: "ND", phone: "701-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Cole Bjornson, LPC", licenseState: "ND", licenseType: "LPC", telehealth: true, inPerson: true, city: "Bismarck", stateCode: "ND", phone: "701-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Wren Thunderbird, PsyD", licenseState: "ND", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Grand Forks", stateCode: "ND", phone: "701-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // Ohio
  { name: "Dr. Irene Kowalski, PhD", licenseState: "OH", licenseType: "PhD", telehealth: true, inPerson: true, city: "Columbus", stateCode: "OH", phone: "614-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Damon Fletcher, LCSW", licenseState: "OH", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Cleveland", stateCode: "OH", phone: "216-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: ADDICTION, insurance: SLIDING },
  { name: "Dr. Miriam Goldstein, PsyD", licenseState: "OH", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Cincinnati", stateCode: "OH", phone: "513-555-0103", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: MAJOR_INS },

  // Oklahoma
  { name: "Dr. Geronimo Redcloud, PhD", licenseState: "OK", licenseType: "PhD", telehealth: true, inPerson: true, city: "Oklahoma City", stateCode: "OK", phone: "405-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Shawna Littlecrow, LMFT", licenseState: "OK", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Tulsa", stateCode: "OK", phone: "918-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Preston Hawkins, PsyD", licenseState: "OK", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Norman", stateCode: "OK", phone: "405-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // Oregon
  { name: "Dr. Aurora Blackwood, PhD", licenseState: "OR", licenseType: "PhD", telehealth: true, inPerson: true, city: "Portland", stateCode: "OR", phone: "503-555-0101", costTag: "insurance", urgency: "within_72h", specialties: LGBTQ, insurance: MAJOR_INS },
  { name: "Finn O'Sullivan, LCSW", licenseState: "OR", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Eugene", stateCode: "OR", phone: "541-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Jade Nakamura, PsyD", licenseState: "OR", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Salem", stateCode: "OR", phone: "503-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: EAP_INS },

  // Pennsylvania
  { name: "Dr. Howard Bernstein, PhD", licenseState: "PA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Philadelphia", stateCode: "PA", phone: "215-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Camille Dupree, LMFT", licenseState: "PA", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Pittsburgh", stateCode: "PA", phone: "412-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Nikolai Petrov, PsyD", licenseState: "PA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Allentown", stateCode: "PA", phone: "610-555-0103", costTag: "insurance", urgency: "within_72h", specialties: BIPOLAR, insurance: MAJOR_INS },

  // Rhode Island
  { name: "Dr. Colette Marchand, PhD", licenseState: "RI", licenseType: "PhD", telehealth: true, inPerson: true, city: "Providence", stateCode: "RI", phone: "401-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Ivan Sousa, LCSW", licenseState: "RI", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Cranston", stateCode: "RI", phone: "401-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Penelope Whitfield, PsyD", licenseState: "RI", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Warwick", stateCode: "RI", phone: "401-555-0103", costTag: "free", urgency: "within_24h", specialties: EATING, insurance: MEDICAID_INS },

  // South Carolina
  { name: "Dr. Cornelius Smalls, PhD", licenseState: "SC", licenseType: "PhD", telehealth: true, inPerson: true, city: "Columbia", stateCode: "SC", phone: "803-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Latoya Middleton, LCSW", licenseState: "SC", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Charleston", stateCode: "SC", phone: "843-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Beau Tanner, PsyD", licenseState: "SC", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Greenville", stateCode: "SC", phone: "864-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: EAP_INS },

  // South Dakota
  { name: "Dr. Winona Eagleheart, PhD", licenseState: "SD", licenseType: "PhD", telehealth: true, inPerson: true, city: "Sioux Falls", stateCode: "SD", phone: "605-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Lars Christiansen, LPC", licenseState: "SD", licenseType: "LPC", telehealth: true, inPerson: true, city: "Rapid City", stateCode: "SD", phone: "605-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Sage Whitehorse, PsyD", licenseState: "SD", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Aberdeen", stateCode: "SD", phone: "605-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // Tennessee
  { name: "Dr. Rhonda Caldwell, PhD", licenseState: "TN", licenseType: "PhD", telehealth: true, inPerson: true, city: "Nashville", stateCode: "TN", phone: "615-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Elijah Booker, LCSW", licenseState: "TN", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Memphis", stateCode: "TN", phone: "901-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: ADDICTION, insurance: SLIDING },
  { name: "Dr. Vivian Sutton, PsyD", licenseState: "TN", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Knoxville", stateCode: "TN", phone: "865-555-0103", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },

  // Texas
  { name: "Dr. Alejandro Vega, PhD", licenseState: "TX", licenseType: "PhD", telehealth: true, inPerson: true, city: "Houston", stateCode: "TX", phone: "713-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Brianna Castillo, LMFT", licenseState: "TX", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Dallas", stateCode: "TX", phone: "214-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Quinton Okafor, PsyD", licenseState: "TX", licenseType: "PsyD", telehealth: true, inPerson: false, city: "San Antonio", stateCode: "TX", phone: "210-555-0103", costTag: "insurance", urgency: "within_72h", specialties: VETERANS, insurance: MAJOR_INS },
  { name: "Marisol Reyes, LCSW", licenseState: "TX", licenseType: "LCSW", telehealth: false, inPerson: true, city: "Austin", stateCode: "TX", phone: "512-555-0104", costTag: "free", urgency: "within_24h", specialties: CHILD, insurance: MEDICAID_INS },

  // Utah
  { name: "Dr. Brigham Young, PhD", licenseState: "UT", licenseType: "PhD", telehealth: true, inPerson: true, city: "Salt Lake City", stateCode: "UT", phone: "801-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Hailey Sorensen, LCSW", licenseState: "UT", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Provo", stateCode: "UT", phone: "801-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Caleb Christensen, PsyD", licenseState: "UT", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Ogden", stateCode: "UT", phone: "801-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: EAP_INS },

  // Vermont
  { name: "Dr. Maple Whitmore, PhD", licenseState: "VT", licenseType: "PhD", telehealth: true, inPerson: true, city: "Burlington", stateCode: "VT", phone: "802-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Cedar Rousseau, LCSW", licenseState: "VT", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Montpelier", stateCode: "VT", phone: "802-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: TRAUMA, insurance: SLIDING },
  { name: "Dr. Birch Harrington, PsyD", licenseState: "VT", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Rutland", stateCode: "VT", phone: "802-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },

  // Virginia
  { name: "Dr. Constance Holloway, PhD", licenseState: "VA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Richmond", stateCode: "VA", phone: "804-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Tobias Mercer, LMFT", licenseState: "VA", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Virginia Beach", stateCode: "VA", phone: "757-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: VETERANS, insurance: SLIDING },
  { name: "Dr. Imani Okonkwo, PsyD", licenseState: "VA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Arlington", stateCode: "VA", phone: "703-555-0103", costTag: "insurance", urgency: "within_72h", specialties: LGBTQ, insurance: EAP_INS },

  // Washington
  { name: "Dr. Sakura Tanaka, PhD", licenseState: "WA", licenseType: "PhD", telehealth: true, inPerson: true, city: "Seattle", stateCode: "WA", phone: "206-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Rowan Greenfield, LCSW", licenseState: "WA", licenseType: "LCSW", telehealth: true, inPerson: true, city: "Spokane", stateCode: "WA", phone: "509-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: LGBTQ, insurance: SLIDING },
  { name: "Dr. Hana Yamamoto, PsyD", licenseState: "WA", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Tacoma", stateCode: "WA", phone: "253-555-0103", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },

  // West Virginia
  { name: "Dr. Dolores Hatfield, PhD", licenseState: "WV", licenseType: "PhD", telehealth: true, inPerson: true, city: "Charleston", stateCode: "WV", phone: "304-555-0101", costTag: "insurance", urgency: "within_72h", specialties: ADDICTION, insurance: MAJOR_INS },
  { name: "Floyd McCoy, LPC", licenseState: "WV", licenseType: "LPC", telehealth: true, inPerson: true, city: "Huntington", stateCode: "WV", phone: "304-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Loretta Boggs, PsyD", licenseState: "WV", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Morgantown", stateCode: "WV", phone: "304-555-0103", costTag: "free", urgency: "within_24h", specialties: TRAUMA, insurance: MEDICAID_INS },

  // Wisconsin
  { name: "Dr. Gunnar Olsen, PhD", licenseState: "WI", licenseType: "PhD", telehealth: true, inPerson: true, city: "Milwaukee", stateCode: "WI", phone: "414-555-0101", costTag: "insurance", urgency: "within_72h", specialties: DEPRESSION, insurance: MAJOR_INS },
  { name: "Freya Andersen, LMFT", licenseState: "WI", licenseType: "LMFT", telehealth: true, inPerson: true, city: "Madison", stateCode: "WI", phone: "608-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: FAMILY, insurance: SLIDING },
  { name: "Dr. Otto Bergmann, PsyD", licenseState: "WI", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Green Bay", stateCode: "WI", phone: "920-555-0103", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: EAP_INS },

  // Wyoming
  { name: "Dr. Cheyenne Ironhorse, PhD", licenseState: "WY", licenseType: "PhD", telehealth: true, inPerson: true, city: "Cheyenne", stateCode: "WY", phone: "307-555-0101", costTag: "insurance", urgency: "within_72h", specialties: TRAUMA, insurance: MAJOR_INS },
  { name: "Buck Sheridan, LPC", licenseState: "WY", licenseType: "LPC", telehealth: true, inPerson: true, city: "Casper", stateCode: "WY", phone: "307-555-0102", costTag: "sliding_scale", urgency: "this_week", specialties: DEPRESSION, insurance: SLIDING },
  { name: "Dr. Prairie Whitman, PsyD", licenseState: "WY", licenseType: "PsyD", telehealth: true, inPerson: false, city: "Laramie", stateCode: "WY", phone: "307-555-0103", costTag: "free", urgency: "within_24h", specialties: VETERANS, insurance: MEDICAID_INS },
];

async function seedProviders() {
  console.log(`Seeding ${EXPANDED_PROVIDERS.length} providers across all 50 states...`);
  let imported = 0;
  let errors = 0;

  for (const p of EXPANDED_PROVIDERS) {
    try {
      const [result] = await db.insert(providers).values({
        name: p.name,
        licenseState: p.licenseState,
        licenseType: p.licenseType,
        telehealthAvailable: p.telehealth,
        inPersonAvailable: p.inPerson,
        city: p.city,
        stateCode: p.stateCode,
        phone: p.phone,
        costTag: p.costTag,
        urgencyAvailability: p.urgency,
        acceptsNewPatients: true,
      }).onDuplicateKeyUpdate({ set: { isActive: true } });

      const providerId = (result as any).insertId;
      if (providerId) {
        for (const specialty of p.specialties) {
          await db.insert(providerSpecialties).values({ providerId, specialty })
            .onDuplicateKeyUpdate({ set: { specialty } });
        }
        for (const ins of p.insurance) {
          await db.insert(providerInsurance).values({ providerId, insuranceName: ins })
            .onDuplicateKeyUpdate({ set: { insuranceName: ins } });
        }
        imported++;
      }
    } catch (err) {
      console.error(`Failed to seed ${p.name}:`, err);
      errors++;
    }
  }

  console.log(`✅ Provider seed complete: ${imported} imported, ${errors} errors`);
  process.exit(0);
}

seedProviders().catch((err) => {
  console.error("Provider seed failed:", err);
  process.exit(1);
});
