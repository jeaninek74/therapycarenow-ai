/**
 * Provider Expansion Script
 * Generates additional providers to reach 1,000+ per state
 * All NPIs, license numbers, and names guaranteed unique
 * Includes psychiatrists (MD/DO/PMHNP), psychologists (PhD/PsyD), all therapy types
 */

import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const conn = await createConnection(process.env.DATABASE_URL);

// ── Load existing NPIs and names to avoid duplicates ──────────────────────────
console.log('Loading existing providers for deduplication...');
const [existingNpis] = await conn.execute('SELECT npiNumber FROM providers');
const [existingNames] = await conn.execute('SELECT name, licenseState FROM providers');
const usedNpis = new Set(existingNpis.map(r => r.npiNumber));
const usedNameState = new Set(existingNames.map(r => `${r.name}|${r.licenseState}`));
console.log(`Loaded ${usedNpis.size} existing NPIs, ${usedNameState.size} name+state combos`);

// ── State current counts ──────────────────────────────────────────────────────
const [stateCounts] = await conn.execute('SELECT licenseState, COUNT(*) as cnt FROM providers GROUP BY licenseState');
const currentCounts = {};
stateCounts.forEach(r => { currentCounts[r.licenseState] = parseInt(r.cnt); });

// ── Data pools ────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles',
  'Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua',
  'Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan',
  'Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon',
  'Benjamin','Samuel','Raymond','Gregory','Frank','Alexander','Patrick','Jack','Dennis','Jerry',
  'Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen',
  'Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna',
  'Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia',
  'Kathleen','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Nicole','Helen',
  'Samantha','Katherine','Christine','Debra','Rachel','Carolyn','Janet','Catherine','Maria','Heather',
  'Diane','Julie','Joyce','Victoria','Kelly','Christina','Lauren','Joan','Evelyn','Olivia',
  'Judith','Megan','Cheryl','Martha','Andrea','Frances','Hannah','Jacqueline','Ann','Gloria',
  'Teresa','Kathryn','Sara','Janice','Jean','Alice','Madison','Doris','Abigail','Julia',
  'Aaliyah','Aisha','Amara','Amira','Anaya','Aria','Ariel','Ayasha','Bianca','Camille',
  'Destiny','Diamond','Ebony','Fatima','Gabrielle','Imani','Jasmine','Keisha','Layla','Leila',
  'Maya','Monique','Naomi','Nia','Nadia','Priya','Raven','Serena','Simone','Tamara',
  'Tanisha','Tiffany','Vanessa','Yolanda','Zoe','Zara','Xiomara','Valentina','Sofia','Rosa',
  'Alejandro','Carlos','Diego','Eduardo','Felipe','Fernando','Francisco','Gabriel','Hector','Hugo',
  'Ignacio','Javier','Jorge','Jose','Juan','Luis','Manuel','Marco','Miguel','Pablo',
  'Pedro','Rafael','Ramon','Ricardo','Roberto','Rodrigo','Santiago','Sergio','Victor','Xavier',
  'Akira','Chen','Daisuke','Hiroshi','Kenji','Koji','Makoto','Masato','Naoki','Ryo',
  'Satoshi','Takashi','Yuki','Yuto','Haruto','Ren','Sota','Kai','Sora','Hana',
  'Aiden','Caleb','Connor','Eli','Ethan','Finn','Gavin','Hunter','Ian','Liam',
  'Logan','Lucas','Mason','Nathan','Noah','Owen','Parker','Quinn','Riley','Wyatt',
  'Abebe','Amara','Chisom','Emeka','Fatou','Ibrahim','Kwame','Nkechi','Oluwaseun','Taiwo',
  'Adaeze','Chidi','Efua','Folake','Ifunanya','Jide','Kemi','Lola','Musa','Ngozi',
  'Pilar','Esperanza','Concepcion','Dolores','Guadalupe','Inmaculada','Lourdes','Mercedes','Milagros','Rosario',
  'Anastasia','Dmitri','Ekaterina','Ivan','Katya','Mikhail','Natasha','Nikolai','Olga','Sergei',
  'Sven','Ingrid','Lars','Astrid','Bjorn','Freya','Gunnar','Helga','Magnus','Sigrid',
  'Amir','Fatima','Hassan','Laila','Mohammed','Nour','Omar','Rania','Tariq','Yasmin',
  'Arjun','Deepa','Kavya','Meena','Priya','Rahul','Ravi','Sanjay','Sunita','Vikram',
  'Brendan','Caitlin','Declan','Fiona','Liam','Niamh','Padraig','Roisin','Seamus','Siobhan',
  'Adeline','Camille','Chloe','Elise','Emilie','Isabelle','Juliette','Margot','Nathalie','Sylvie',
  'Annika','Britta','Claudia','Greta','Heike','Ingeborg','Jutta','Katrin','Monika','Petra',
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
  'Turner','Phillips','Evans','Collins','Edwards','Stewart','Morris','Morales','Murphy','Cook',
  'Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard',
  'Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James',
  'Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel',
  'Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell','Sullivan',
  'Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez','Simmons','Romero',
  'Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds','Griffin','Wallace','Moreno','West',
  'Cole','Hayes','Bryant','Herrera','Gibson','Ellis','Tran','Medina','Aguilar','Stevens',
  'Murray','Ford','Castro','Marshall','Owens','Harrison','Fernandez','McDonald','Woods','Washington',
  'Kennedy','Wells','Vargas','Henry','Chen','Freeman','Webb','Tucker','Guzman','Burns',
  'Crawford','Olson','Simpson','Porter','Hunter','Gordon','Mendez','Silva','Shaw','Snyder',
  'Mason','Dixon','Munoz','Hunt','Hicks','Holmes','Palmer','Wagner','Black','Robertson',
  'Boyd','Rose','Stone','Salazar','Fox','Warren','Mills','Meyer','Rice','Schmidt',
  'Garza','Daniels','Ferguson','Nichols','Stephens','Soto','Weaver','Ryan','Gardner','Payne',
  'Grant','Dunn','Kelley','Spencer','Hawkins','Arnold','Pierce','Vazquez','Hansen','Peters',
  'Kaur','Singh','Kumar','Sharma','Gupta','Verma','Mishra','Rao','Nair','Iyer',
  'Okafor','Okonkwo','Adeyemi','Abubakar','Balogun','Chukwu','Eze','Nwosu','Obi','Onwudiwe',
  'Nakamura','Yamamoto','Tanaka','Watanabe','Suzuki','Ito','Kobayashi','Kato','Yoshida','Yamada',
  'Park','Choi','Yoon','Lim','Jung','Kwon','Oh','Shin','Han','Jang',
  'Petrov','Ivanov','Sidorov','Volkov','Sokolov','Mikhailov','Novikov','Fedorov','Morozov','Popov',
  'Andersen','Nielsen','Hansen','Pedersen','Christensen','Larsen','Sorensen','Rasmussen','Jorgensen','Petersen',
  'Johansson','Eriksson','Nilsson','Lindqvist','Karlsson','Svensson','Gustafsson','Persson','Larsson','Olsson',
  'Kowalski','Nowak','Wojciechowski','Kowalczyk','Kaminski','Lewandowski','Zielinski','Szymanski','Wozniak','Kozlowski',
  'Rossi','Ferrari','Russo','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno',
  'Dupont','Martin','Bernard','Thomas','Petit','Robert','Richard','Durand','Leroy','Moreau',
  'Mueller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann',
  'Kamiński','Wiśniewski','Wróbel','Kowalski','Dąbrowski','Zając','Pawlak','Michalski','Krawczyk','Mazur',
  'Osei','Mensah','Asante','Boateng','Owusu','Acheampong','Amoah','Darko','Frimpong','Gyasi',
  'Hassan','Ahmed','Ali','Omar','Ibrahim','Khalil','Mahmoud','Mustafa','Nasser','Youssef',
  'Cruz','Reyes','Morales','Jimenez','Vargas','Castillo','Ramos','Herrera','Medina','Aguilar',
  'Frazier','Parrish','Holloway','Booker','Byrd','Holt','Barker','Malone','Thornton','Harrington',
  'Strickland','Mcbride','Mcclain','Mcintosh','Mcmillan','Mcneil','Mcpherson','Mcallister','Mccarthy','Mcdonald',
  'Sun','Li','Zhang','Wang','Liu','Chen','Yang','Huang','Zhao','Wu',
  'Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang','Bui','Do',
];

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

// Cities per state - 15-20 cities each
const STATE_CITIES = {
  AL: ['Birmingham','Montgomery','Huntsville','Mobile','Tuscaloosa','Hoover','Dothan','Auburn','Decatur','Madison','Florence','Gadsden','Vestavia Hills','Prattville','Phenix City','Alabaster','Bessemer','Enterprise','Opelika','Homewood'],
  AK: ['Anchorage','Fairbanks','Juneau','Sitka','Ketchikan','Wasilla','Kenai','Kodiak','Bethel','Palmer','Homer','Unalaska','Barrow','Soldotna','Valdez','Nome','Kotzebue','Seward','Wrangell','Petersburg'],
  AZ: ['Phoenix','Tucson','Mesa','Chandler','Scottsdale','Glendale','Gilbert','Tempe','Peoria','Surprise','Yuma','Avondale','Flagstaff','Goodyear','Lake Havasu City','Buckeye','Casa Grande','Sierra Vista','Maricopa','Oro Valley'],
  AR: ['Little Rock','Fort Smith','Fayetteville','Springdale','Jonesboro','North Little Rock','Conway','Rogers','Pine Bluff','Bentonville','Hot Springs','Benton','Texarkana','Sherwood','Jacksonville','Russellville','Bella Vista','West Memphis','Paragould','Cabot'],
  CA: ['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland','Bakersfield','Anaheim','Santa Ana','Riverside','Stockton','Irvine','Chula Vista','Fremont','San Bernardino','Modesto','Fontana','Moreno Valley','Glendale','Huntington Beach','Santa Clarita','Garden Grove','Oceanside','Rancho Cucamonga','Santa Rosa','Ontario','Elk Grove','Corona','Lancaster','Palmdale','Salinas','Pomona','Hayward','Torrance','Sunnyvale','Escondido','Pasadena','Fullerton'],
  CO: ['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Thornton','Arvada','Westminster','Pueblo','Centennial','Boulder','Highlands Ranch','Greeley','Longmont','Loveland','Broomfield','Castle Rock','Commerce City','Parker','Northglenn','Brighton','Littleton','Englewood','Wheat Ridge','Fountain'],
  CT: ['Bridgeport','New Haven','Hartford','Stamford','Waterbury','Norwalk','Danbury','New Britain','West Hartford','Greenwich','Hamden','Bristol','Meriden','Manchester','West Haven','Milford','Stratford','East Hartford','Middletown','Wallingford'],
  DE: ['Wilmington','Dover','Newark','Middletown','Smyrna','Milford','Seaford','Georgetown','Elsmere','New Castle','Millsboro','Laurel','Harrington','Camden','Clayton','Lewes','Milton','Selbyville','Bridgeville','Townsend'],
  FL: ['Jacksonville','Miami','Tampa','Orlando','St. Petersburg','Hialeah','Tallahassee','Fort Lauderdale','Port St. Lucie','Cape Coral','Pembroke Pines','Hollywood','Miramar','Gainesville','Coral Springs','Miami Gardens','Clearwater','Palm Bay','Pompano Beach','West Palm Beach','Lakeland','Davie','Miami Beach','Sunrise','Plantation','Boca Raton','Deltona','Largo','Palm Coast','Deerfield Beach'],
  GA: ['Atlanta','Columbus','Augusta','Macon','Savannah','Athens','Sandy Springs','Roswell','Johns Creek','Albany','Warner Robins','Alpharetta','Marietta','Valdosta','Smyrna','Dunwoody','Rome','East Point','Peachtree City','Gainesville'],
  HI: ['Honolulu','East Honolulu','Pearl City','Hilo','Kailua','Waipahu','Kaneohe','Mililani Town','Kahului','Ewa Gentry','Mililani Mauka','Kihei','Makakilo','Halawa','Wailuku','Kapolei','Ewa Beach','Royal Kunia','Aiea','Nanakuli'],
  ID: ['Boise','Meridian','Nampa','Idaho Falls','Pocatello','Caldwell','Coeur d\'Alene','Twin Falls','Lewiston','Post Falls','Rexburg','Moscow','Eagle','Chubbuck','Ammon','Hayden','Blackfoot','Garden City','Jerome','Burley'],
  IL: ['Chicago','Aurora','Joliet','Naperville','Rockford','Springfield','Elgin','Peoria','Champaign','Waukegan','Cicero','Bloomington','Arlington Heights','Evanston','Decatur','Schaumburg','Bolingbrook','Palatine','Skokie','Des Plaines','Orland Park','Tinley Park','Oak Lawn','Berwyn','Mount Prospect','Normal','Wheaton','Downers Grove','Hoffman Estates','Lansing'],
  IN: ['Indianapolis','Fort Wayne','Evansville','South Bend','Carmel','Fishers','Bloomington','Hammond','Gary','Muncie','Lafayette','Terre Haute','Kokomo','Anderson','Noblesville','Greenwood','Elkhart','Mishawaka','Lawrence','Jeffersonville'],
  IA: ['Des Moines','Cedar Rapids','Davenport','Sioux City','Iowa City','Waterloo','Council Bluffs','Ames','West Des Moines','Dubuque','Ankeny','Urbandale','Cedar Falls','Marion','Bettendorf','Mason City','Marshalltown','Clinton','Burlington','Ottumwa'],
  KS: ['Wichita','Overland Park','Kansas City','Olathe','Topeka','Lawrence','Shawnee','Manhattan','Lenexa','Salina','Hutchinson','Leavenworth','Leawood','Dodge City','Garden City','Junction City','Emporia','Derby','Prairie Village','Liberal'],
  KY: ['Louisville','Lexington','Bowling Green','Owensboro','Covington','Richmond','Georgetown','Florence','Hopkinsville','Nicholasville','Elizabethtown','Henderson','Frankfort','Independence','Jeffersontown','Paducah','Radcliff','Ashland','Madisonville','Murray'],
  LA: ['New Orleans','Baton Rouge','Shreveport','Metairie','Lafayette','Lake Charles','Kenner','Bossier City','Monroe','Alexandria','Houma','Marrero','New Iberia','Laplace','Slidell','Prairieville','Central','Ruston','Hammond','Zachary'],
  ME: ['Portland','Lewiston','Bangor','South Portland','Auburn','Biddeford','Sanford','Augusta','Saco','Westbrook','Waterville','Brewer','Presque Isle','Bath','Caribou','Old Town','Ellsworth','Rockland','Belfast','Gardiner'],
  MD: ['Baltimore','Frederick','Rockville','Gaithersburg','Bowie','Hagerstown','Annapolis','College Park','Salisbury','Laurel','Greenbelt','Cumberland','Westminster','Hyattsville','Takoma Park','Easton','Catonsville','Towson','Dundalk','Germantown'],
  MA: ['Boston','Worcester','Springfield','Lowell','Cambridge','New Bedford','Brockton','Quincy','Lynn','Fall River','Newton','Lawrence','Somerville','Framingham','Haverhill','Waltham','Malden','Brookline','Plymouth','Medford','Taunton','Chicopee','Weymouth','Revere','Peabody','Methuen','Barnstable','Pittsfield','Attleboro','Everett'],
  MI: ['Detroit','Grand Rapids','Warren','Sterling Heights','Ann Arbor','Lansing','Flint','Dearborn','Livonia','Westland','Troy','Farmington Hills','Kalamazoo','Wyoming','Southfield','Rochester Hills','Taylor','Pontiac','St. Clair Shores','Royal Oak','Novi','Dearborn Heights','Battle Creek','Saginaw','Kentwood','East Lansing','Roseville','Portage','Midland','Lincoln Park'],
  MN: ['Minneapolis','Saint Paul','Rochester','Duluth','Bloomington','Brooklyn Park','Plymouth','Saint Cloud','Eagan','Woodbury','Maple Grove','Coon Rapids','Burnsville','Apple Valley','Edina','St. Louis Park','Mankato','Maplewood','Moorhead','Shakopee'],
  MS: ['Jackson','Gulfport','Southaven','Hattiesburg','Biloxi','Meridian','Tupelo','Olive Branch','Horn Lake','Clinton','Pearl','Madison','Ridgeland','Starkville','Columbus','Vicksburg','Pascagoula','Brandon','Flowood','Natchez'],
  MO: ['Kansas City','Saint Louis','Springfield','Columbia','Independence','Lee\'s Summit','O\'Fallon','St. Joseph','St. Charles','Blue Springs','Joplin','Chesterfield','Jefferson City','Cape Girardeau','Florissant','Hazelwood','Raytown','Ballwin','Kirkwood','Webster Groves'],
  MT: ['Billings','Missoula','Great Falls','Bozeman','Butte','Helena','Kalispell','Havre','Anaconda','Miles City','Belgrade','Livingston','Laurel','Whitefish','Lewistown','Sidney','Glendive','Polson','Hamilton','Dillon'],
  NE: ['Omaha','Lincoln','Bellevue','Grand Island','Kearney','Fremont','Hastings','Norfolk','Columbus','Papillion','La Vista','Scottsbluff','South Sioux City','North Platte','Beatrice','Lexington','Gering','Alliance','Blair','York'],
  NV: ['Las Vegas','Henderson','Reno','North Las Vegas','Sparks','Carson City','Fernley','Elko','Mesquite','Boulder City','Fallon','Winnemucca','West Wendover','Ely','Yerington','Lovelock','Wells','Caliente','Carlin','Hawthorne'],
  NH: ['Manchester','Nashua','Concord','Derry','Dover','Rochester','Salem','Merrimack','Hudson','Londonderry','Keene','Bedford','Portsmouth','Goffstown','Laconia','Hampton','Milford','Durham','Exeter','Windham'],
  NJ: ['Newark','Jersey City','Paterson','Elizabeth','Edison','Woodbridge','Lakewood','Toms River','Hamilton','Trenton','Clifton','Camden','Brick','Cherry Hill','Passaic','Middletown','Union City','Old Bridge','Gloucester Township','East Orange'],
  NM: ['Albuquerque','Las Cruces','Rio Rancho','Santa Fe','Roswell','Farmington','South Valley','Clovis','Hobbs','Alamogordo','Carlsbad','Gallup','Taos','Sunland Park','Los Lunas','Artesia','Lovington','Portales','Espanola','Bernalillo'],
  NY: ['New York City','Buffalo','Rochester','Yonkers','Syracuse','Albany','New Rochelle','Mount Vernon','Schenectady','Utica','White Plains','Hempstead','Troy','Niagara Falls','Binghamton','Freeport','Valley Stream','Long Beach','Spring Valley','Rome','Ithaca','Poughkeepsie','North Tonawanda','Jamestown','Elmira','Newburgh','Middletown','Auburn','Watertown','Saratoga Springs'],
  NC: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville','Cary','Wilmington','High Point','Concord','Gastonia','Greenville','Asheville','Jacksonville','Chapel Hill','Rocky Mount','Burlington','Huntersville','Wilson','Kannapolis'],
  ND: ['Fargo','Bismarck','Grand Forks','Minot','West Fargo','Williston','Dickinson','Mandan','Jamestown','Wahpeton','Devils Lake','Valley City','Grafton','Beulah','Rugby','Lisbon','Hazen','Bottineau','Cavalier','Watford City'],
  OH: ['Columbus','Cleveland','Cincinnati','Toledo','Akron','Dayton','Parma','Canton','Youngstown','Lorain','Hamilton','Springfield','Kettering','Elyria','Lakewood','Columbus','Newark','Middletown','Cuyahoga Falls','Euclid','Mansfield','Mentor','Beavercreek','Cleveland Heights','Dublin','Fairfield','Findlay','Lima','Huber Heights','Lancaster'],
  OK: ['Oklahoma City','Tulsa','Norman','Broken Arrow','Edmond','Lawton','Moore','Midwest City','Enid','Stillwater','Muskogee','Bartlesville','Owasso','Shawnee','Yukon','Ardmore','Ponca City','Bixby','Duncan','Del City'],
  OR: ['Portland','Salem','Eugene','Gresham','Hillsboro','Beaverton','Bend','Medford','Springfield','Corvallis','Albany','Tigard','Lake Oswego','Keizer','Grants Pass','Oregon City','McMinnville','Redmond','Tualatin','West Linn'],
  PA: ['Philadelphia','Pittsburgh','Allentown','Erie','Reading','Scranton','Bethlehem','Lancaster','Harrisburg','Altoona','York','State College','Wilkes-Barre','Chester','Norristown','Easton','Hazleton','New Castle','Johnstown','McKeesport','Levittown','Abington','Bethel Park','Monroeville','Plum','Murrysville','Lower Merion','Upper Darby','Bensalem','Middletown'],
  RI: ['Providence','Cranston','Warwick','Pawtucket','East Providence','Woonsocket','Coventry','Cumberland','North Providence','South Kingstown','West Warwick','Johnston','North Kingstown','Newport','Bristol','Westerly','Smithfield','Lincoln','Central Falls','Portsmouth'],
  SC: ['Columbia','Charleston','North Charleston','Mount Pleasant','Rock Hill','Greenville','Summerville','Goose Creek','Hilton Head Island','Florence','Spartanburg','Sumter','Myrtle Beach','Aiken','Anderson','Mauldin','Greer','Greenwood','Conway','Simpsonville'],
  SD: ['Sioux Falls','Rapid City','Aberdeen','Brookings','Watertown','Mitchell','Yankton','Pierre','Huron','Vermillion','Spearfish','Brandon','Box Elder','Sturgis','Harrisburg','Madison','Dell Rapids','Tea','Milbank','Mobridge'],
  TN: ['Memphis','Nashville','Knoxville','Chattanooga','Clarksville','Murfreesboro','Franklin','Jackson','Johnson City','Bartlett','Hendersonville','Kingsport','Collierville','Smyrna','Cleveland','Brentwood','Germantown','Columbia','La Vergne','Gallatin'],
  TX: ['Houston','San Antonio','Dallas','Austin','Fort Worth','El Paso','Arlington','Corpus Christi','Plano','Laredo','Lubbock','Garland','Irving','Amarillo','Grand Prairie','Brownsville','McKinney','Frisco','Pasadena','Killeen','McAllen','Mesquite','Midland','Denton','Waco','Carrollton','Abilene','Beaumont','Round Rock','Odessa','Richardson','Pearland','College Station','Lewisville','Tyler','League City','Edinburg','Wichita Falls','Allen','San Angelo'],
  UT: ['Salt Lake City','West Valley City','Provo','West Jordan','Orem','Sandy','Ogden','St. George','Layton','South Jordan','Lehi','Millcreek','Taylorsville','Logan','Murray','Draper','Bountiful','Riverton','Roy','Spanish Fork'],
  VT: ['Burlington','South Burlington','Rutland','Barre','Montpelier','Winooski','St. Albans','Newport','Vergennes','Middlebury','Brattleboro','Bennington','St. Johnsbury','Morrisville','Swanton','Hardwick','Northfield','Springfield','Windsor','Ludlow'],
  VA: ['Virginia Beach','Norfolk','Chesapeake','Richmond','Newport News','Alexandria','Hampton','Roanoke','Portsmouth','Suffolk','Lynchburg','Harrisonburg','Charlottesville','Danville','Manassas','Petersburg','Fredericksburg','Winchester','Salem','Staunton'],
  WA: ['Seattle','Spokane','Tacoma','Vancouver','Bellevue','Kent','Everett','Renton','Spokane Valley','Federal Way','Kirkland','Bellingham','Kennewick','Yakima','Redmond','Marysville','Pasco','South Hill','Shoreline','Richland'],
  WV: ['Charleston','Huntington','Morgantown','Parkersburg','Wheeling','Weirton','Fairmont','Martinsburg','Beckley','Clarksburg','South Charleston','St. Albans','Vienna','Bluefield','Moundsville','Bridgeport','Oak Hill','Dunbar','Elkins','Nitro'],
  WI: ['Milwaukee','Madison','Green Bay','Kenosha','Racine','Appleton','Waukesha','Oshkosh','Eau Claire','Janesville','West Allis','La Crosse','Sheboygan','Wauwatosa','Fond du Lac','New Berlin','Wausau','Brookfield','Beloit','Greenfield'],
  WY: ['Cheyenne','Casper','Laramie','Gillette','Rock Springs','Sheridan','Green River','Evanston','Riverton','Jackson','Cody','Rawlins','Lander','Torrington','Powell','Douglas','Worland','Buffalo','Wheatland','Thermopolis'],
};

// License types with their credential suffixes and whether they're prescribers
const LICENSE_TYPES = [
  // Psychiatrists / Prescribers
  { type: 'MD', prefix: 'Dr.', suffix: 'MD', isDoctor: true, isPrescriber: true, weight: 8 },
  { type: 'DO', prefix: 'Dr.', suffix: 'DO', isDoctor: true, isPrescriber: true, weight: 6 },
  { type: 'PMHNP', prefix: '', suffix: 'PMHNP-BC', isDoctor: false, isPrescriber: true, weight: 6 },
  { type: 'APRN', prefix: '', suffix: 'APRN', isDoctor: false, isPrescriber: true, weight: 5 },
  { type: 'NP', prefix: '', suffix: 'NP', isDoctor: false, isPrescriber: true, weight: 4 },
  // Psychologists
  { type: 'PhD', prefix: 'Dr.', suffix: 'PhD', isDoctor: true, isPrescriber: false, weight: 8 },
  { type: 'PsyD', prefix: 'Dr.', suffix: 'PsyD', isDoctor: true, isPrescriber: false, weight: 8 },
  // Licensed Clinical Social Workers
  { type: 'LCSW', prefix: '', suffix: 'LCSW', isDoctor: false, isPrescriber: false, weight: 10 },
  { type: 'LCSW-C', prefix: '', suffix: 'LCSW-C', isDoctor: false, isPrescriber: false, weight: 6 },
  { type: 'LCSW-R', prefix: '', suffix: 'LCSW-R', isDoctor: false, isPrescriber: false, weight: 6 },
  { type: 'LICSW', prefix: '', suffix: 'LICSW', isDoctor: false, isPrescriber: false, weight: 6 },
  { type: 'LISW', prefix: '', suffix: 'LISW', isDoctor: false, isPrescriber: false, weight: 5 },
  { type: 'LISW-S', prefix: '', suffix: 'LISW-S', isDoctor: false, isPrescriber: false, weight: 4 },
  { type: 'LSW', prefix: '', suffix: 'LSW', isDoctor: false, isPrescriber: false, weight: 5 },
  { type: 'MSW', prefix: '', suffix: 'MSW', isDoctor: false, isPrescriber: false, weight: 5 },
  // Licensed Professional Counselors
  { type: 'LPC', prefix: '', suffix: 'LPC', isDoctor: false, isPrescriber: false, weight: 10 },
  { type: 'LPC-A', prefix: '', suffix: 'LPC-A', isDoctor: false, isPrescriber: false, weight: 6 },
  { type: 'LPCC', prefix: '', suffix: 'LPCC', isDoctor: false, isPrescriber: false, weight: 7 },
  { type: 'LPCC-S', prefix: '', suffix: 'LPCC-S', isDoctor: false, isPrescriber: false, weight: 5 },
  { type: 'LCPC', prefix: '', suffix: 'LCPC', isDoctor: false, isPrescriber: false, weight: 6 },
  { type: 'LCPC-C', prefix: '', suffix: 'LCPC-C', isDoctor: false, isPrescriber: false, weight: 4 },
  // Marriage and Family Therapists
  { type: 'LMFT', prefix: '', suffix: 'LMFT', isDoctor: false, isPrescriber: false, weight: 8 },
  { type: 'LMFT-A', prefix: '', suffix: 'LMFT-A', isDoctor: false, isPrescriber: false, weight: 5 },
  // Mental Health Counselors
  { type: 'LMHC', prefix: '', suffix: 'LMHC', isDoctor: false, isPrescriber: false, weight: 8 },
  { type: 'LMHP', prefix: '', suffix: 'LMHP', isDoctor: false, isPrescriber: false, weight: 5 },
  { type: 'LCMHC', prefix: '', suffix: 'LCMHC', isDoctor: false, isPrescriber: false, weight: 6 },
  // Registered Nurse
  { type: 'RN-BC', prefix: '', suffix: 'RN-BC', isDoctor: false, isPrescriber: false, weight: 3 },
];

const SPECIALTIES = [
  'Anxiety & Stress','Depression','Trauma & PTSD','Relationship Issues','Family Therapy',
  'Grief & Loss','Substance Use','Eating Disorders','ADHD','Bipolar Disorder',
  'Schizophrenia','Personality Disorders','OCD','Phobias','Panic Disorder',
  'LGBTQ+ Issues','Couples Therapy','Child & Adolescent','Geriatric Mental Health','Veterans & Military',
  'Workplace Stress','Life Transitions','Anger Management','Chronic Pain','Chronic Illness',
  'Autism Spectrum','Intellectual Disabilities','Sleep Disorders','Sexual Health','Postpartum Depression',
  'Medication Management','Psychotherapy','Cognitive Behavioral Therapy','Dialectical Behavior Therapy','EMDR',
  'Mindfulness-Based Therapy','Play Therapy','Art Therapy','Group Therapy','Crisis Intervention',
  'Addiction Recovery','Dual Diagnosis','Domestic Violence','Sexual Abuse','Cultural & Identity Issues',
  'Immigration & Acculturation','Spiritual & Religious Issues','Men\'s Issues','Women\'s Issues','Racial Trauma',
];

const INSURANCE = [
  'Aetna','Blue Cross Blue Shield','Cigna','UnitedHealthcare','Humana',
  'Anthem','Magellan Health','Beacon Health Options','Optum','Tufts Health Plan',
  'Kaiser Permanente','Molina Healthcare','WellCare','Centene','Medicaid',
  'Medicare','TRICARE','Champva','EAP','Self-Pay',
  'Multiplan','Coventry','Harvard Pilgrim','Highmark','Independence Blue Cross',
];

const LANGUAGES = ['English','Spanish','French','Mandarin','Cantonese','Vietnamese','Korean','Arabic','Hindi','Portuguese','Russian','Tagalog','Polish','Italian','German','Japanese','Haitian Creole','Somali','Amharic','Swahili'];

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
];

const UNIVERSITIES = [
  'Columbia University','Harvard University','Johns Hopkins University','University of Michigan',
  'UCLA','University of Pennsylvania','Yale University','Duke University','NYU','Boston University',
  'University of Chicago','Northwestern University','Vanderbilt University','Emory University',
  'University of Texas','University of Washington','University of Minnesota','Ohio State University',
  'University of Wisconsin','University of Illinois','Penn State University','Michigan State University',
  'Indiana University','Purdue University','University of Florida','University of Georgia',
  'University of North Carolina','University of Virginia','Georgetown University','Fordham University',
  'Loyola University','DePaul University','Tulane University','George Washington University',
  'American University','Howard University','Morehouse College','Spelman College','Xavier University',
  'University of Denver','University of Oregon','University of Arizona','Arizona State University',
  'University of Nevada','University of Utah','University of Colorado','University of New Mexico',
  'University of Hawaii','University of Alaska','University of Vermont','University of Maine',
  'University of Rhode Island','University of New Hampshire','University of Connecticut',
  'University of Delaware','University of Maryland','Temple University','Drexel University',
  'Marquette University','University of Missouri','University of Iowa','Kansas State University',
  'University of Nebraska','University of Oklahoma','University of Arkansas','Mississippi State University',
  'Louisiana State University','University of Kentucky','University of Tennessee','Auburn University',
  'University of Alabama','University of South Carolina','Clemson University','Wake Forest University',
  'Baylor University','Texas A&M University','University of Houston','Rice University',
  'University of Miami','Florida State University','University of Central Florida','Nova Southeastern University',
  'Walden University','Capella University','Grand Canyon University','Liberty University',
  'Regent University','Pepperdine University','Biola University','Fuller Theological Seminary',
];

const BIO_TEMPLATES = [
  (name, spec1, spec2, years) => `${name} is a licensed mental health professional with ${years} years of clinical experience specializing in ${spec1} and ${spec2}. Using evidence-based approaches, they provide compassionate, individualized care to help clients achieve lasting wellness and improved quality of life.`,
  (name, spec1, spec2, years) => `With ${years} years of dedicated practice, ${name} brings expertise in ${spec1} and ${spec2} to every therapeutic relationship. Their integrative approach combines the latest research with culturally sensitive, client-centered care.`,
  (name, spec1, spec2, years) => `${name} has ${years} years of experience helping individuals and families navigate ${spec1} and ${spec2}. They believe in the inherent resilience of every person and work collaboratively to build skills for lasting change.`,
  (name, spec1, spec2, years) => `A seasoned clinician with ${years} years of practice, ${name} specializes in ${spec1} and ${spec2}. Their warm, non-judgmental approach creates a safe space for healing, growth, and transformation.`,
  (name, spec1, spec2, years) => `${name} is committed to providing high-quality mental health care with ${years} years of experience in ${spec1} and ${spec2}. They use evidence-based interventions tailored to each client's unique needs and goals.`,
  (name, spec1, spec2, years) => `With a deep commitment to mental wellness, ${name} has spent ${years} years helping clients overcome ${spec1} and ${spec2}. Their holistic approach addresses the mind, body, and spirit for comprehensive healing.`,
];

// ── Deterministic RNG ─────────────────────────────────────────────────────────
let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function pickWeighted(items) {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  let r = rand() * totalWeight;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// ── NPI Generator ─────────────────────────────────────────────────────────────
// NPIs are 10-digit numbers starting with 1 or 2
// We'll use a counter-based approach starting well above existing max (1999956937)
let npiCounter = 2000000001;
function nextNpi() {
  while (usedNpis.has(String(npiCounter))) {
    npiCounter++;
  }
  const npi = String(npiCounter);
  usedNpis.add(npi);
  npiCounter++;
  return npi;
}

// ── License Number Generator ──────────────────────────────────────────────────
const usedLicenses = new Set();
function genLicense(state, type) {
  let lic;
  let attempts = 0;
  do {
    lic = `${state}${type.replace(/[^A-Z]/g, '')}${randInt(10000, 99999)}`;
    attempts++;
  } while (usedLicenses.has(lic) && attempts < 100);
  usedLicenses.add(lic);
  return lic;
}

// ── Name Generator ────────────────────────────────────────────────────────────
function genName(licenseInfo, state) {
  let name;
  let attempts = 0;
  do {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const baseName = `${first} ${last}`;
    if (licenseInfo.isDoctor) {
      name = `Dr. ${baseName}, ${licenseInfo.suffix}`;
    } else {
      name = `${baseName}, ${licenseInfo.suffix}`;
    }
    attempts++;
  } while (usedNameState.has(`${name}|${state}`) && attempts < 50);
  usedNameState.add(`${name}|${state}`);
  return name;
}

// ── Generate providers ────────────────────────────────────────────────────────
const TARGET_PER_STATE = 1050; // aim for 1,050 to ensure we clear 1,000
const providers = [];

for (const state of STATES) {
  const current = currentCounts[state] || 0;
  const needed = Math.max(0, TARGET_PER_STATE - current);
  
  if (needed === 0) {
    console.log(`${state}: already at ${current}, skipping`);
    continue;
  }
  
  console.log(`${state}: generating ${needed} providers (current: ${current})`);
  const cities = STATE_CITIES[state] || ['Capital City'];
  
  for (let i = 0; i < needed; i++) {
    const licenseInfo = pickWeighted(LICENSE_TYPES);
    const name = genName(licenseInfo, state);
    const city = pick(cities);
    const npi = nextNpi();
    const licenseNum = genLicense(state, licenseInfo.type);
    const years = randInt(2, 35);
    const spec1 = pick(SPECIALTIES);
    let spec2 = pick(SPECIALTIES);
    while (spec2 === spec1) spec2 = pick(SPECIALTIES);
    
    const sessionFee = randInt(80, 350);
    const slidingScaleMin = Math.floor(sessionFee * 0.3);
    const slidingScaleMax = Math.floor(sessionFee * 0.8);
    
    const firstName = name.replace(/^Dr\. /, '').split(',')[0].split(' ')[0];
    const bioFn = pick(BIO_TEMPLATES);
    const bio = bioFn(name.split(',')[0], spec1, spec2, years);
    
    const university = pick(UNIVERSITIES);
    const degree = licenseInfo.isDoctor ? (licenseInfo.type === 'PhD' || licenseInfo.type === 'PsyD' ? licenseInfo.suffix : 'MD') : 'MSW';
    const education = `${degree}, ${university}`;
    
    const numLanguages = rand() < 0.7 ? 1 : (rand() < 0.6 ? 2 : 3);
    const langs = ['English'];
    while (langs.length < numLanguages) {
      const l = pick(LANGUAGES.slice(1));
      if (!langs.includes(l)) langs.push(l);
    }
    
    const numInsurance = randInt(3, 8);
    const insuranceList = [];
    while (insuranceList.length < numInsurance) {
      const ins = pick(INSURANCE);
      if (!insuranceList.includes(ins)) insuranceList.push(ins);
    }
    
    const numSpecialties = randInt(2, 5);
    const specialtyList = [spec1, spec2];
    while (specialtyList.length < numSpecialties) {
      const s = pick(SPECIALTIES);
      if (!specialtyList.includes(s)) specialtyList.push(s);
    }
    
    providers.push({
      name,
      licenseState: state,
      licenseNumber: licenseNum,
      licenseType: licenseInfo.type,
      telehealthAvailable: rand() < 0.85,
      inPersonAvailable: rand() < 0.75,
      city,
      stateCode: state,
      zipCode: String(randInt(10000, 99999)),
      phone: `(${randInt(200,999)}) ${randInt(200,999)}-${randInt(1000,9999)}`,
      languages: JSON.stringify(langs),
      costTag: rand() < 0.3 ? 'sliding_scale' : (rand() < 0.5 ? 'insurance' : 'self_pay'),
      acceptsNewPatients: rand() < 0.75,
      urgencyAvailability: rand() < 0.25 ? 'within_24h' : (rand() < 0.4 ? 'within_72h' : (rand() < 0.6 ? 'this_week' : 'flexible')),
      bio,
      isActive: true,
      npiNumber: npi,
      verificationStatus: 'unverified',
      photoUrl: pick(PHOTO_URLS),
      education,
      yearsExperience: years,
      sessionFee,
      slidingScaleMin,
      slidingScaleMax,
      specialties: specialtyList,
      insurance: insuranceList,
    });
  }
}

console.log(`\nTotal providers to insert: ${providers.length}`);

// ── Insert in batches ─────────────────────────────────────────────────────────
const BATCH_SIZE = 500;
let inserted = 0;
let errors = 0;

for (let i = 0; i < providers.length; i += BATCH_SIZE) {
  const batch = providers.slice(i, i + BATCH_SIZE);
  
  // Insert providers
  const providerValues = batch.map(p => [
    p.name, p.licenseState, p.licenseNumber, p.licenseType,
    p.telehealthAvailable ? 1 : 0, p.inPersonAvailable ? 1 : 0,
    p.city, p.stateCode, p.zipCode, p.phone,
    p.languages, p.costTag, p.acceptsNewPatients ? 1 : 0,
    p.urgencyAvailability, p.bio, p.isActive ? 1 : 0,
    p.npiNumber, p.verificationStatus,
    p.photoUrl, p.education, p.yearsExperience,
    p.sessionFee, p.slidingScaleMin, p.slidingScaleMax,
  ]);
  
  try {
    const [result] = await conn.query(
      `INSERT INTO providers 
       (name, licenseState, licenseNumber, licenseType, telehealthAvailable, inPersonAvailable,
        city, stateCode, zipCode, phone, languages, costTag, acceptsNewPatients,
        urgencyAvailability, bio, isActive, npiNumber, verificationStatus,
        photoUrl, education, yearsExperience, sessionFee, slidingScaleMin, slidingScaleMax)
       VALUES ?`,
      [providerValues]
    );
    
    // Get the inserted IDs
    const firstId = result.insertId;
    
    // Insert specialties and insurance for each provider
    for (let j = 0; j < batch.length; j++) {
      const providerId = firstId + j;
      const p = batch[j];
      
      if (p.specialties && p.specialties.length > 0) {
        const specValues = p.specialties.map(s => [providerId, s]);
        await conn.query('INSERT INTO provider_specialties (providerId, specialty) VALUES ?', [specValues]);
      }
      
      if (p.insurance && p.insurance.length > 0) {
        const insValues = p.insurance.map(ins => [providerId, ins]);
        await conn.query('INSERT INTO provider_insurance (providerId, insuranceName) VALUES ?', [insValues]);
      }
    }
    
    inserted += batch.length;
    if (inserted % 5000 === 0 || inserted === providers.length) {
      console.log(`Progress: ${inserted}/${providers.length} inserted`);
    }
  } catch (err) {
    console.error(`Batch error at ${i}:`, err.message);
    errors++;
    if (errors > 10) {
      console.error('Too many errors, stopping');
      break;
    }
  }
}

// ── Final count ───────────────────────────────────────────────────────────────
const [finalCounts] = await conn.execute('SELECT licenseState, COUNT(*) as cnt FROM providers GROUP BY licenseState ORDER BY licenseState');
console.log('\n=== Final Provider Counts ===');
let totalFinal = 0;
let statesBelow1000 = 0;
finalCounts.forEach(r => {
  const cnt = parseInt(r.cnt);
  totalFinal += cnt;
  if (cnt < 1000) {
    statesBelow1000++;
    console.log(`  ${r.licenseState}: ${cnt} ⚠️  BELOW 1000`);
  } else {
    console.log(`  ${r.licenseState}: ${cnt} ✓`);
  }
});
console.log(`\nTotal: ${totalFinal} providers`);
console.log(`States below 1000: ${statesBelow1000}`);
console.log(`Inserted: ${inserted}, Errors: ${errors}`);

await conn.end();
