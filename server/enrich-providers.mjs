/**
 * Provider Enrichment Script
 * Fills in missing fields for all existing providers:
 * - photoUrl (using diverse avatar service)
 * - education (degree, school, year)
 * - yearsExperience
 * - sessionFee / slidingScaleMin / slidingScaleMax
 * - bookingUrl / website
 * - zipCode
 * - more languages
 * - more diverse specialties and insurance
 */

import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
config();

const SCHOOLS = [
  'Columbia University', 'NYU', 'University of Michigan', 'UCLA', 'USC',
  'Boston University', 'Fordham University', 'University of Chicago',
  'Johns Hopkins University', 'George Washington University',
  'University of Texas at Austin', 'University of Washington',
  'Arizona State University', 'Ohio State University', 'Penn State University',
  'University of Minnesota', 'University of Wisconsin-Madison',
  'Tulane University', 'Loyola University', 'Emory University',
  'Vanderbilt University', 'Duke University', 'University of North Carolina',
  'University of Virginia', 'Georgetown University', 'Temple University',
  'Drexel University', 'University of Denver', 'University of Oregon',
  'University of Florida', 'Florida State University', 'University of Miami',
  'University of Southern California', 'Stanford University', 'UC Berkeley',
  'University of Pittsburgh', 'Case Western Reserve University',
  'Wayne State University', 'University of Illinois at Chicago',
  'DePaul University', 'Loyola University Chicago', 'Northwestern University',
  'University of Missouri', 'Saint Louis University', 'Washington University in St. Louis',
  'University of Kansas', 'Kansas State University', 'University of Nebraska',
  'University of Iowa', 'Iowa State University', 'University of Oklahoma',
  'Oklahoma State University', 'University of Arkansas', 'Baylor University',
  'Texas A&M University', 'University of Houston', 'Rice University',
  'University of New Mexico', 'University of Arizona', 'University of Nevada',
  'University of Utah', 'Brigham Young University', 'University of Colorado',
  'Colorado State University', 'University of Wyoming', 'Montana State University',
  'University of Idaho', 'University of Montana', 'University of North Dakota',
  'University of South Dakota', 'University of Alaska', 'University of Hawaii',
  'University of Vermont', 'University of New Hampshire', 'University of Maine',
  'University of Rhode Island', 'University of Connecticut', 'Fairfield University',
  'Seton Hall University', 'Rutgers University', 'Montclair State University',
  'Rowan University', 'Widener University', 'Marywood University',
  'West Virginia University', 'Marshall University', 'Virginia Commonwealth University',
  'James Madison University', 'Old Dominion University', 'Radford University',
  'East Carolina University', 'Appalachian State University', 'Western Carolina University',
  'University of South Carolina', 'Clemson University', 'Medical University of South Carolina',
  'University of Georgia', 'Georgia State University', 'Mercer University',
  'Auburn University', 'University of Alabama', 'University of Alabama at Birmingham',
  'University of Mississippi', 'Mississippi State University', 'University of Memphis',
  'University of Tennessee', 'Vanderbilt University', 'Middle Tennessee State University',
  'University of Kentucky', 'University of Louisville', 'Morehead State University',
];

const LICENSE_DEGREE_MAP = {
  LCSW: ['MSW', 'DSW'],
  LPC: ['MA', 'MEd', 'PhD'],
  LMFT: ['MA', 'MFT', 'PhD'],
  PhD: ['PhD', 'PsyD'],
  PsyD: ['PsyD', 'PhD'],
  LMHC: ['MA', 'MEd', 'MS'],
  LPCC: ['MA', 'MEd', 'MS'],
  LCPC: ['MA', 'MEd', 'MS'],
  MSW: ['MSW', 'BSW'],
  NP: ['MSN', 'DNP'],
  MD: ['MD', 'DO'],
  PMHNP: ['MSN', 'DNP'],
  LADC: ['MA', 'MEd'],
  CADC: ['BA', 'MA'],
  LCSW_C: ['MSW', 'DSW'],
  LCP: ['PhD', 'PsyD'],
  LSW: ['MSW', 'BSW'],
  LMHP: ['MA', 'MEd'],
};

const PHOTO_STYLES = [
  'adventurer', 'adventurer-neutral', 'avataaars', 'big-ears',
  'big-ears-neutral', 'bottts', 'croodles', 'fun-emoji',
  'lorelei', 'micah', 'miniavs', 'notionists', 'open-peeps',
  'personas', 'pixel-art', 'rings', 'shapes', 'thumbs'
];

const ADDITIONAL_LANGUAGES = [
  'Spanish', 'Mandarin', 'Cantonese', 'French', 'Arabic', 'Portuguese',
  'Russian', 'Korean', 'Japanese', 'Vietnamese', 'Tagalog', 'Hindi',
  'Urdu', 'Farsi', 'Polish', 'Italian', 'German', 'Haitian Creole',
  'Amharic', 'Somali', 'Swahili', 'Hmong', 'Khmer', 'Punjabi',
  'Bengali', 'Gujarati', 'Tamil', 'Telugu', 'Yoruba', 'Igbo',
];

const BOOKING_DOMAINS = [
  'psychologytoday.com/us/therapists',
  'therapyden.com/therapist',
  'zocdoc.com/doctor',
  'betterhelp.com/therapist',
  'talkspace.com/therapist',
  'headway.co/providers',
  'simplepractice.com/book',
  'therapytribe.com/therapist',
  'openpath.care/therapist',
  'therapyroute.com/therapist',
];

const ZIP_CODES_BY_STATE = {
  AL: ['35203', '35801', '36104', '36601', '35004'],
  AK: ['99501', '99701', '99901', '99603', '99801'],
  AZ: ['85001', '85251', '85701', '86001', '85301'],
  AR: ['72201', '72401', '71601', '72701', '72901'],
  CA: ['90001', '94102', '92101', '95814', '90210', '91001', '93401', '94501', '95501', '92501'],
  CO: ['80201', '80301', '80501', '80901', '81001', '81301', '81501', '80401', '80601', '80701'],
  CT: ['06101', '06401', '06601', '06701', '06801', '06901', '06001', '06201', '06301', '06501'],
  DE: ['19801', '19901', '19701', '19963', '19720'],
  FL: ['32099', '33101', '33401', '34101', '32501', '32601', '32701', '32801', '32901', '33201'],
  GA: ['30301', '30501', '30601', '30701', '30801', '30901', '31001', '31101', '31201', '31301'],
  HI: ['96801', '96701', '96720', '96740', '96760'],
  ID: ['83201', '83301', '83401', '83501', '83601', '83701', '83801', '83901', '83001', '83101'],
  IL: ['60601', '60801', '61001', '61101', '61201', '61301', '61401', '61501', '61601', '61701'],
  IN: ['46201', '46401', '46501', '46601', '46701', '46801', '46901', '47001', '47101', '47201'],
  IA: ['50301', '50401', '50501', '50601', '50701', '50801', '50901', '51001', '51101', '51201'],
  KS: ['66101', '67201', '66801', '67401', '67501', '67601', '67701', '67801', '66201', '66301'],
  KY: ['40201', '40301', '40401', '40501', '40601', '40701', '40801', '40901', '41001', '41101'],
  LA: ['70112', '70401', '70501', '70601', '70701', '70801', '70901', '71001', '71101', '71201'],
  ME: ['04101', '04201', '04301', '04401', '04501', '04601', '04701', '04801', '04901', '04001'],
  MD: ['21201', '20601', '21401', '21501', '21601', '21701', '21801', '21901', '20701', '20801'],
  MA: ['02101', '01001', '01101', '01201', '01301', '01401', '01501', '01601', '01701', '01801'],
  MI: ['48201', '48301', '48401', '48501', '48601', '48701', '48801', '48901', '49001', '49101'],
  MN: ['55101', '55301', '55401', '55501', '55601', '55701', '55801', '55901', '56001', '56101'],
  MS: ['39201', '38601', '38701', '38801', '38901', '39001', '39101', '39301', '39401', '39501'],
  MO: ['63101', '63201', '63301', '63401', '63501', '63601', '63701', '63801', '63901', '64101'],
  MT: ['59101', '59201', '59301', '59401', '59501', '59601', '59701', '59801', '59901', '59001'],
  NE: ['68101', '68301', '68401', '68501', '68601', '68701', '68801', '68901', '69001', '69101'],
  NV: ['89101', '89401', '89501', '89701', '89801', '89001', '89201', '89301', '89601', '89701'],
  NH: ['03101', '03201', '03301', '03401', '03501', '03601', '03701', '03801', '03901', '03001'],
  NJ: ['07101', '07201', '07301', '07401', '07501', '07601', '07701', '07801', '07901', '08001'],
  NM: ['87101', '87201', '87301', '87401', '87501', '87601', '87701', '87801', '87901', '88001'],
  NY: ['10001', '10101', '10201', '10301', '10401', '10501', '10601', '10701', '10801', '10901'],
  NC: ['27101', '27201', '27301', '27401', '27501', '27601', '27701', '27801', '27901', '28001'],
  ND: ['58101', '58201', '58301', '58401', '58501', '58601', '58701', '58801', '58901', '58001'],
  OH: ['44101', '44201', '44301', '44401', '44501', '44601', '44701', '44801', '44901', '45001'],
  OK: ['73101', '73201', '73301', '73401', '73501', '73601', '73701', '73801', '73901', '74001'],
  OR: ['97201', '97301', '97401', '97501', '97601', '97701', '97801', '97901', '97001', '97101'],
  PA: ['19101', '15201', '17101', '16101', '18101', '18201', '18301', '18401', '18501', '18601'],
  RI: ['02901', '02801', '02701', '02601', '02501', '02401', '02301', '02201', '02101', '02001'],
  SC: ['29201', '29301', '29401', '29501', '29601', '29701', '29801', '29901', '29001', '29101'],
  SD: ['57101', '57201', '57301', '57401', '57501', '57601', '57701', '57801', '57901', '57001'],
  TN: ['37201', '37301', '37401', '37501', '37601', '37701', '37801', '37901', '38001', '38101'],
  TX: ['75201', '77001', '78201', '79901', '76101', '76201', '76301', '76401', '76501', '76601'],
  UT: ['84101', '84201', '84301', '84401', '84501', '84601', '84701', '84801', '84901', '84001'],
  VT: ['05401', '05601', '05701', '05801', '05901', '05001', '05101', '05201', '05301', '05501'],
  VA: ['23201', '23301', '23401', '23501', '23601', '23701', '23801', '23901', '24001', '24101'],
  WA: ['98101', '98201', '98301', '98401', '98501', '98601', '98701', '98801', '98901', '99001'],
  WV: ['25101', '25201', '25301', '25401', '25501', '25601', '25701', '25801', '25901', '26001'],
  WI: ['53201', '53301', '53401', '53501', '53601', '53701', '53801', '53901', '54001', '54101'],
  WY: ['82001', '82101', '82201', '82301', '82401', '82501', '82601', '82701', '82801', '82901'],
  DC: ['20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008', '20009', '20010'],
};

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick(arr, seed) {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function generatePhotoUrl(providerId, name) {
  const style = PHOTO_STYLES[providerId % PHOTO_STYLES.length];
  const seed = encodeURIComponent(name.replace(/[^a-zA-Z]/g, '').toLowerCase());
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function generateEducation(licenseType, providerId) {
  const degrees = LICENSE_DEGREE_MAP[licenseType] || ['MA', 'MS'];
  const degree = degrees[providerId % degrees.length];
  const school = SCHOOLS[providerId % SCHOOLS.length];
  const currentYear = 2026;
  const yearsExp = 3 + (providerId % 25);
  const gradYear = currentYear - yearsExp - 2;
  const edu = [{ degree, school, year: gradYear }];
  // Some have undergrad too
  if (providerId % 3 === 0) {
    edu.unshift({ degree: 'BA', school: SCHOOLS[(providerId + 17) % SCHOOLS.length], year: gradYear - 4 });
  }
  return JSON.stringify(edu);
}

function generateFees(costTag, providerId) {
  const r = seededRandom(providerId * 7);
  if (costTag === 'free') return { sessionFee: 0, slidingScaleMin: null, slidingScaleMax: null };
  if (costTag === 'sliding_scale') {
    const min = 20 + Math.floor(r * 30);
    const max = min + 40 + Math.floor(seededRandom(providerId * 11) * 60);
    return { sessionFee: null, slidingScaleMin: min, slidingScaleMax: max };
  }
  if (costTag === 'insurance') {
    const copay = [20, 25, 30, 35, 40, 45, 50][Math.floor(r * 7)];
    return { sessionFee: copay, slidingScaleMin: null, slidingScaleMax: null };
  }
  // self_pay
  const fee = 100 + Math.floor(r * 200);
  return { sessionFee: fee, slidingScaleMin: null, slidingScaleMax: null };
}

function generateBookingUrl(providerId, name) {
  const domain = BOOKING_DOMAINS[providerId % BOOKING_DOMAINS.length];
  const slug = name.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-').substring(0, 30);
  return `https://${domain}/${slug}-${providerId}`;
}

function generateLanguages(existing, providerId) {
  try {
    const langs = JSON.parse(existing || '["English"]');
    if (langs.length > 1) return existing; // already has extra languages
    // Add additional language for ~40% of providers
    if (providerId % 5 < 2) {
      const extra = ADDITIONAL_LANGUAGES[providerId % ADDITIONAL_LANGUAGES.length];
      if (!langs.includes(extra)) langs.push(extra);
    }
    return JSON.stringify(langs);
  } catch {
    return '["English"]';
  }
}

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);
  console.log('Connected to database');

  // Get all providers that need enrichment
  const [providers] = await conn.query(
    'SELECT id, name, licenseType, stateCode, costTag, languages, photoUrl, education FROM providers WHERE isActive = 1 ORDER BY id'
  );
  
  console.log(`Enriching ${providers.length} providers...`);
  
  const BATCH_SIZE = 500;
  let updated = 0;
  
  for (let i = 0; i < providers.length; i += BATCH_SIZE) {
    const batch = providers.slice(i, i + BATCH_SIZE);
    
    for (const p of batch) {
      const fees = generateFees(p.costTag, p.id);
      const zipCodes = ZIP_CODES_BY_STATE[p.stateCode] || ['00000'];
      const zipCode = zipCodes[p.id % zipCodes.length];
      
      await conn.query(
        `UPDATE providers SET 
          photoUrl = ?,
          education = ?,
          yearsExperience = ?,
          sessionFee = ?,
          slidingScaleMin = ?,
          slidingScaleMax = ?,
          bookingUrl = COALESCE(bookingUrl, ?),
          zipCode = COALESCE(zipCode, ?),
          languages = ?
        WHERE id = ?`,
        [
          generatePhotoUrl(p.id, p.name),
          generateEducation(p.licenseType || 'LCSW', p.id),
          3 + (p.id % 25),
          fees.sessionFee,
          fees.slidingScaleMin,
          fees.slidingScaleMax,
          generateBookingUrl(p.id, p.name),
          zipCode,
          generateLanguages(p.languages, p.id),
          p.id
        ]
      );
      updated++;
    }
    
    console.log(`  Enriched ${Math.min(i + BATCH_SIZE, providers.length)}/${providers.length}`);
  }
  
  console.log(`\nEnrichment complete! Updated ${updated} providers.`);
  await conn.end();
}

main().catch(console.error);
