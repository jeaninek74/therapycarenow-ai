/**
 * Service region — TherapyCareNow serves Southern California only.
 * Eight-county definition: Los Angeles, Orange, San Diego, Riverside,
 * San Bernardino, Ventura, Santa Barbara, Imperial.
 */

export const SERVICE_REGION_NAME = "Southern California";
export const SERVICE_STATE_CODE = "CA";
export const SERVICE_STATE_NAME = "California";

export interface SoCalCounty {
  slug: string;
  name: string;
  crisisLine: { name: string; phone: string };
  cities: string[];
}

export const SOCAL_COUNTIES: SoCalCounty[] = [
  {
    slug: "los-angeles",
    name: "Los Angeles County",
    crisisLine: { name: "LA County Dept. of Mental Health 24/7 Help Line", phone: "1-800-854-7771" },
    cities: [
      "Los Angeles", "Long Beach", "Glendale", "Santa Clarita", "Lancaster", "Palmdale", "Pomona", "Torrance",
      "Pasadena", "El Monte", "Downey", "Inglewood", "West Covina", "Norwalk", "Burbank", "Compton",
      "South Gate", "Carson", "Santa Monica", "Hawthorne", "Whittier", "Alhambra", "Lakewood", "Bellflower",
      "Baldwin Park", "Lynwood", "Redondo Beach", "Pico Rivera", "Montebello", "Monterey Park", "Gardena",
      "Huntington Park", "Arcadia", "Diamond Bar", "Paramount", "Rosemead", "Glendora", "Cerritos",
      "Covina", "Azusa", "La Mirada", "Rancho Palos Verdes", "Culver City", "Bell Gardens", "Claremont",
      "Monrovia", "La Puente", "Temple City", "Manhattan Beach", "West Hollywood", "Beverly Hills",
      "Calabasas", "San Dimas", "La Verne", "Lawndale", "Walnut", "San Gabriel", "Maywood", "Bell",
      "South Pasadena", "Duarte", "Agoura Hills", "Hermosa Beach", "El Segundo", "San Fernando",
      "Cudahy", "Lomita", "La Canada Flintridge", "South El Monte", "Malibu", "Artesia", "Signal Hill",
      "Santa Fe Springs", "Sierra Madre", "Westlake Village", "Hawaiian Gardens", "Palos Verdes Estates",
      "San Marino", "Rolling Hills Estates", "Commerce", "La Habra Heights", "Avalon", "Irwindale",
      "Rolling Hills", "Bradbury", "Hidden Hills", "Industry", "Vernon",
      // Common postal names for LA communities and neighborhoods
      "Hollywood", "North Hollywood", "Studio City", "Sherman Oaks", "Encino", "Van Nuys", "Woodland Hills",
      "Tarzana", "Reseda", "Northridge", "Chatsworth", "Canoga Park", "West Hills", "Winnetka",
      "Granada Hills", "Porter Ranch", "Mission Hills", "North Hills", "Sylmar", "Pacoima", "Arleta",
      "Sun Valley", "Panorama City", "Valley Village", "Toluca Lake", "Lake Balboa", "Tujunga", "Sunland",
      "Venice", "Marina del Rey", "Playa Vista", "Playa del Rey", "Pacific Palisades", "San Pedro",
      "Wilmington", "Harbor City", "Valencia", "Newhall", "Canyon Country", "Stevenson Ranch", "Castaic",
      "Altadena", "La Crescenta", "Montrose", "Topanga", "Hacienda Heights", "Rowland Heights",
      "East Los Angeles", "Marina Del Rey",
      // Added from NPI registry practice-location cities, county by ZIP code
      "View Park", "Watts",
    ],
  },
  {
    slug: "orange",
    name: "Orange County",
    crisisLine: { name: "OC Links Behavioral Health Line", phone: "1-855-625-4657" },
    cities: [
      "Anaheim", "Santa Ana", "Irvine", "Huntington Beach", "Garden Grove", "Fullerton", "Orange",
      "Costa Mesa", "Mission Viejo", "Westminster", "Newport Beach", "Buena Park", "Lake Forest", "Tustin",
      "Yorba Linda", "San Clemente", "Laguna Niguel", "La Habra", "Fountain Valley", "Placentia",
      "Rancho Santa Margarita", "Aliso Viejo", "Cypress", "Brea", "Stanton", "San Juan Capistrano",
      "Dana Point", "Laguna Hills", "Seal Beach", "Laguna Beach", "Laguna Woods", "La Palma",
      "Los Alamitos", "Villa Park", "Ladera Ranch", "Foothill Ranch", "Corona del Mar", "Newport Coast",
      "Trabuco Canyon", "Rossmoor", "Midway City", "Capistrano Beach",
      // Added from NPI registry practice-location cities, county by ZIP code
      "Sunset Beach",
    ],
  },
  {
    slug: "san-diego",
    name: "San Diego County",
    crisisLine: { name: "San Diego Access & Crisis Line", phone: "1-888-724-7240" },
    cities: [
      "San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad", "El Cajon", "Vista", "San Marcos",
      "Encinitas", "National City", "La Mesa", "Santee", "Poway", "Imperial Beach", "Lemon Grove",
      "Coronado", "Solana Beach", "Del Mar", "La Jolla", "Rancho Santa Fe", "Spring Valley", "Lakeside",
      "Ramona", "Bonita", "Fallbrook", "Alpine", "Valley Center", "Cardiff", "Cardiff by the Sea",
      "Julian", "Borrego Springs", "Jamul", "Pine Valley", "Descanso", "Campo", "Pauma Valley", "Warner Springs",
      "San Ysidro", "Jamul",
      // Added from NPI registry practice-location cities, county by ZIP code
      "Bonsall", "Boulevard", "Dulzura", "Mount Laguna", "Tecate",
    ],
  },
  {
    slug: "riverside",
    name: "Riverside County",
    crisisLine: { name: "RUHS Behavioral Health Crisis Help NOW", phone: "951-686-4357" },
    cities: [
      "Riverside", "Moreno Valley", "Corona", "Murrieta", "Temecula", "Jurupa Valley", "Menifee", "Indio",
      "Hemet", "Perris", "Eastvale", "Lake Elsinore", "Palm Desert", "Cathedral City", "San Jacinto",
      "Palm Springs", "La Quinta", "Beaumont", "Wildomar", "Coachella", "Desert Hot Springs", "Norco",
      "Banning", "Rancho Mirage", "Blythe", "Calimesa", "Canyon Lake", "Indian Wells", "Thousand Palms",
      "Mecca", "Winchester", "French Valley", "Sun City", "Idyllwild",
      // Added from NPI registry practice-location cities, county by ZIP code
      "Bermuda Dunes", "Cherry Valley", "Mira Loma", "Thermal",
    ],
  },
  {
    slug: "san-bernardino",
    name: "San Bernardino County",
    crisisLine: { name: "San Bernardino County DBH Access Unit (Behavioral Health Helpline)", phone: "1-888-743-1478" },
    cities: [
      "San Bernardino", "Fontana", "Rancho Cucamonga", "Ontario", "Victorville", "Rialto", "Hesperia",
      "Chino", "Chino Hills", "Upland", "Apple Valley", "Redlands", "Highland", "Colton", "Yucaipa",
      "Adelanto", "Montclair", "Loma Linda", "Barstow", "Grand Terrace", "Twentynine Palms",
      "Yucca Valley", "Big Bear Lake", "Needles", "Big Bear City", "Lake Arrowhead", "Running Springs",
      "Bloomington", "Phelan", "Joshua Tree", "Crestline", "Mentone",
      // Added from NPI registry practice-location cities, county by ZIP code
      "Alta Loma", "Angelus Oaks", "Blue Jay", "Etiwanda", "Fort Irwin", "Landers", "Morongo Valley",
    ],
  },
  {
    slug: "ventura",
    name: "Ventura County",
    crisisLine: { name: "Ventura County Crisis Team", phone: "1-866-998-2243" },
    cities: [
      "Oxnard", "Thousand Oaks", "Simi Valley", "Ventura", "San Buenaventura", "Camarillo", "Moorpark",
      "Santa Paula", "Port Hueneme", "Fillmore", "Ojai", "Newbury Park", "Oak Park",
      // Added from NPI registry practice-location cities, county by ZIP code
      "Lake Sherwood", "Oak View", "Santa Rosa Valley",
    ],
  },
  {
    slug: "santa-barbara",
    name: "Santa Barbara County",
    crisisLine: { name: "Santa Barbara County Behavioral Wellness Access Line", phone: "1-888-868-1649" },
    cities: [
      "Santa Maria", "Santa Barbara", "Lompoc", "Goleta", "Carpinteria", "Guadalupe", "Solvang",
      "Buellton", "Montecito", "Isla Vista", "Orcutt", "Los Olivos", "Summerland", "Santa Ynez", "Los Alamos", "Vandenberg Village", "Ballard",
      // Added from NPI registry practice-location cities, county by ZIP code
      "Gaviota", "Vandenberg Space Force Base",
    ],
  },
  {
    slug: "imperial",
    name: "Imperial County",
    crisisLine: { name: "Imperial County Behavioral Health 24-Hour Crisis Line", phone: "1-800-817-5292" },
    cities: ["El Centro", "Calexico", "Brawley", "Imperial", "Holtville", "Calipatria", "Westmorland", "Seeley", "Heber"],
  },
];

export function normalizeCity(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const CITY_TO_COUNTY = new Map<string, SoCalCounty>();
for (const county of SOCAL_COUNTIES) {
  for (const city of county.cities) {
    const key = normalizeCity(city);
    if (!CITY_TO_COUNTY.has(key)) CITY_TO_COUNTY.set(key, county);
  }
}

/** Lower-cased, accent-free names of every Southern California city we serve. */
export const SOCAL_CITY_KEYS: string[] = Array.from(CITY_TO_COUNTY.keys());

export function getSoCalCounty(slugOrName: string | null | undefined): SoCalCounty | undefined {
  if (!slugOrName) return undefined;
  const v = slugOrName.trim().toLowerCase();
  return SOCAL_COUNTIES.find((c) => c.slug === v || c.name.toLowerCase() === v);
}

export function getCountyForCity(city: string | null | undefined): SoCalCounty | undefined {
  if (!city) return undefined;
  return CITY_TO_COUNTY.get(normalizeCity(city));
}

export function isSoCalCity(city: string | null | undefined): boolean {
  return !!getCountyForCity(city);
}

/**
 * USPS 3-digit ZIP prefixes covering the eight Southern California counties.
 * 900–918 LA metro · 919–921 San Diego · 922–925 Inland Empire & Imperial ·
 * 926–928 Orange · 930–931 Ventura & Santa Barbara · 934 Santa Maria/Lompoc ·
 * 935 Antelope Valley.
 */
export function isSoCalZip(zip: string | null | undefined): boolean {
  if (!zip) return false;
  const prefix = Number(zip.slice(0, 3));
  if (!Number.isFinite(prefix)) return false;
  // 900–931 are entirely Southern California; 934/935 are shared with SLO/Kern/Inyo, so those rely on city matching.
  return prefix >= 900 && prefix <= 931;
}

/** Rough bounding box for browser geolocation checks. */
export const SOCAL_BOUNDS = { latMin: 32.5, latMax: 35.2, lonMin: -120.7, lonMax: -114.1 };

export function isInSoCal(lat: number, lon: number): boolean {
  return (
    lat >= SOCAL_BOUNDS.latMin &&
    lat <= SOCAL_BOUNDS.latMax &&
    lon >= SOCAL_BOUNDS.lonMin &&
    lon <= SOCAL_BOUNDS.lonMax
  );
}
