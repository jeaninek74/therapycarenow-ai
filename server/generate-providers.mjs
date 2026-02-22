/**
 * National Provider Generator — TherapyCareNow
 * Generates 10,000 UNIQUE therapist providers across all 50 US states
 * No duplicate names, NPI numbers, license numbers, or phone numbers
 */

import { writeFileSync } from 'fs';

const STATES = {
  AL: { name: "Alabama", cities: ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa", "Hoover", "Dothan", "Auburn", "Decatur", "Madison", "Florence", "Gadsden", "Vestavia Hills", "Prattville", "Phenix City", "Alabaster", "Bessemer", "Enterprise", "Opelika", "Homewood"] },
  AK: { name: "Alaska", cities: ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla", "Kenai", "Kodiak", "Bethel", "Palmer", "Homer", "Unalaska", "Barrow", "Soldotna", "Valdez", "Nome", "Kotzebue", "Seward", "Cordova", "Dillingham"] },
  AZ: { name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise", "Yuma", "Avondale", "Flagstaff", "Goodyear", "Lake Havasu City", "Buckeye", "Casa Grande", "Sierra Vista", "Maricopa", "Oro Valley", "Prescott", "Queen Creek", "Marana", "Apache Junction"] },
  AR: { name: "Arkansas", cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway", "Rogers", "Pine Bluff", "Bentonville", "Hot Springs", "Benton", "Texarkana", "Sherwood", "Jacksonville", "Russellville", "Bella Vista", "West Memphis", "Paragould", "Cabot"] },
  CA: { name: "California", cities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Stockton", "Irvine", "Chula Vista", "Fremont", "San Bernardino", "Modesto", "Fontana", "Moreno Valley", "Glendale", "Huntington Beach", "Santa Clarita", "Garden Grove", "Oceanside", "Rancho Cucamonga", "Santa Rosa", "Ontario", "Elk Grove", "Corona", "Hayward", "Pomona", "Escondido", "Torrance", "Sunnyvale", "Pasadena", "Fullerton", "Orange", "Thousand Oaks", "Visalia", "Simi Valley", "Concord", "Roseville", "Santa Clara", "Vallejo", "Berkeley", "El Monte", "Downey", "Costa Mesa", "Inglewood"] },
  CO: { name: "Colorado", cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Centennial", "Boulder", "Highlands Ranch", "Greeley", "Longmont", "Loveland", "Broomfield", "Castle Rock", "Commerce City", "Parker", "Northglenn", "Brighton", "Littleton", "Grand Junction", "Englewood"] },
  CT: { name: "Connecticut", cities: ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury", "New Britain", "Greenwich", "Meriden", "Bristol", "West Hartford", "Milford", "Middletown", "Shelton", "Torrington", "New London", "Ansonia", "Derby", "Groton"] },
  DE: { name: "Delaware", cities: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford", "Georgetown", "Elsmere", "New Castle", "Millsboro", "Laurel", "Harrington", "Camden", "Clayton", "Lewes", "Milton", "Selbyville", "Bridgeville", "Townsend"] },
  FL: { name: "Florida", cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines", "Hollywood", "Gainesville", "Miramar", "Coral Springs", "Miami Gardens", "Clearwater", "Palm Bay", "Pompano Beach", "West Palm Beach", "Lakeland", "Davie", "Miami Beach", "Sunrise", "Plantation", "Boca Raton", "Deltona", "Largo", "Deerfield Beach", "Palm Coast", "Melbourne", "Boynton Beach", "Fort Myers", "Kissimmee", "Homestead", "Daytona Beach", "Delray Beach", "Tamarac", "Ocala", "Pensacola", "Sarasota", "Naples"] },
  GA: { name: "Georgia", cities: ["Atlanta", "Columbus", "Augusta", "Savannah", "Athens", "Sandy Springs", "Roswell", "Macon", "Johns Creek", "Albany", "Warner Robins", "Alpharetta", "Marietta", "Valdosta", "Smyrna", "Brookhaven", "Dunwoody", "Peachtree City", "Gainesville", "Newnan", "Milton", "Hinesville", "Rome", "Tucker", "Stonecrest"] },
  HI: { name: "Hawaii", cities: ["Honolulu", "East Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kaneohe", "Mililani Town", "Kahului", "Ewa Gentry", "Kihei", "Makakilo", "Wahiawa", "Kapolei", "Kailua-Kona", "Wailuku", "Halawa", "Waimalu", "Nanakuli"] },
  ID: { name: "Idaho", cities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene", "Twin Falls", "Lewiston", "Post Falls", "Rexburg", "Moscow", "Eagle", "Kuna", "Ammon", "Chubbuck", "Hayden", "Mountain Home", "Blackfoot", "Garden City"] },
  IL: { name: "Illinois", cities: ["Chicago", "Aurora", "Joliet", "Naperville", "Rockford", "Springfield", "Elgin", "Peoria", "Champaign", "Waukegan", "Cicero", "Bloomington", "Arlington Heights", "Evanston", "Decatur", "Schaumburg", "Bolingbrook", "Palatine", "Skokie", "Des Plaines", "Orland Park", "Tinley Park", "Oak Lawn", "Berwyn", "Mount Prospect", "Normal", "Wheaton", "Downers Grove", "Hoffman Estates", "Oak Park"] },
  IN: { name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Lafayette", "Muncie", "Terre Haute", "Kokomo", "Anderson", "Noblesville", "Greenwood", "Elkhart", "Mishawaka", "Lawrence", "Jeffersonville"] },
  IA: { name: "Iowa", cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "Council Bluffs", "Ames", "West Des Moines", "Dubuque", "Ankeny", "Urbandale", "Cedar Falls", "Marion", "Bettendorf", "Mason City", "Marshalltown", "Clinton", "Burlington", "Ottumwa"] },
  KS: { name: "Kansas", cities: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee", "Manhattan", "Lenexa", "Salina", "Hutchinson", "Leavenworth", "Leawood", "Dodge City", "Garden City", "Emporia", "Derby", "Prairie Village", "Hays", "Liberal"] },
  KY: { name: "Kentucky", cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Hopkinsville", "Richmond", "Florence", "Georgetown", "Henderson", "Elizabethtown", "Nicholasville", "Jeffersontown", "Frankfort", "Paducah", "Ashland", "Independence", "Radcliff", "Madisonville", "Murray"] },
  LA: { name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport", "Metairie", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "New Iberia", "Laplace", "Slidell", "Prairieville", "Central", "Houma", "Marrero", "Hammond", "Mandeville", "Ruston"] },
  ME: { name: "Maine", cities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Augusta", "Saco", "Westbrook", "Waterville", "Brewer", "Presque Isle", "Bath", "Caribou", "Ellsworth", "Old Town", "Rockland", "Belfast", "Calais"] },
  MD: { name: "Maryland", cities: ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis", "College Park", "Salisbury", "Laurel", "Greenbelt", "Cumberland", "Westminster", "Hyattsville", "Takoma Park", "Easton", "Waldorf", "Germantown", "Silver Spring", "Bethesda"] },
  MA: { name: "Massachusetts", cities: ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River", "Newton", "Lawrence", "Somerville", "Framingham", "Haverhill", "Waltham", "Malden", "Brookline", "Plymouth", "Medford", "Taunton", "Chicopee", "Weymouth", "Revere", "Peabody"] },
  MI: { name: "Michigan", cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia", "Westland", "Troy", "Farmington Hills", "Kalamazoo", "Wyoming", "Southfield", "Rochester Hills", "Taylor", "Pontiac", "St. Clair Shores", "Royal Oak", "Novi", "Dearborn Heights", "Battle Creek", "Saginaw", "Kentwood"] },
  MN: { name: "Minnesota", cities: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "Saint Cloud", "Eagan", "Woodbury", "Maple Grove", "Coon Rapids", "Burnsville", "Apple Valley", "Edina", "St. Louis Park", "Mankato", "Maplewood", "Moorhead", "Shakopee"] },
  MS: { name: "Mississippi", cities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo", "Greenville", "Olive Branch", "Horn Lake", "Clinton", "Pearl", "Ridgeland", "Starkville", "Columbus", "Vicksburg", "Pascagoula", "Brandon", "Flowood", "Madison"] },
  MO: { name: "Missouri", cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "Blue Springs", "Joplin", "Chesterfield", "Jefferson City", "Cape Girardeau", "Florissant", "Wentzville", "University City", "Liberty", "Ballwin", "Raytown"] },
  MT: { name: "Montana", cities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Havre", "Anaconda", "Miles City", "Belgrade", "Livingston", "Laurel", "Whitefish", "Lewistown", "Sidney", "Glendive", "Hardin", "Polson", "Dillon"] },
  NE: { name: "Nebraska", cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "Norfolk", "Columbus", "Papillion", "La Vista", "Scottsbluff", "South Sioux City", "North Platte", "Chalco", "Lexington", "Gering", "Alliance", "Blair", "York"] },
  NV: { name: "Nevada", cities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Fernley", "Elko", "Mesquite", "Boulder City", "Fallon", "Winnemucca", "West Wendover", "Ely", "Yerington", "Carlin", "Lovelock", "Wells", "Caliente", "Tonopah"] },
  NH: { name: "New Hampshire", cities: ["Manchester", "Nashua", "Concord", "Derry", "Dover", "Rochester", "Salem", "Merrimack", "Hudson", "Londonderry", "Keene", "Bedford", "Portsmouth", "Goffstown", "Laconia", "Hampton", "Milford", "Durham", "Exeter", "Windham"] },
  NJ: { name: "New Jersey", cities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Lakewood", "Edison", "Woodbridge", "Toms River", "Hamilton", "Trenton", "Clifton", "Camden", "Brick", "Cherry Hill", "Passaic", "Middletown", "Union City", "Old Bridge", "Gloucester Township", "East Orange", "Bayonne", "Franklin", "North Bergen", "Vineland", "Union"] },
  NM: { name: "New Mexico", cities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "South Valley", "Clovis", "Hobbs", "Alamogordo", "Carlsbad", "Gallup", "Taos", "Sunland Park", "Los Lunas", "Chaparral", "Artesia", "Lovington", "Silver City", "Portales"] },
  NY: { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "White Plains", "Troy", "Niagara Falls", "Binghamton", "Freeport", "Valley Stream", "Long Beach", "Spring Valley", "Rome", "Ithaca", "Elmira", "Poughkeepsie", "North Tonawanda", "Jamestown", "Saratoga Springs", "Brooklyn", "Queens", "Manhattan", "Bronx", "Staten Island"] },
  NC: { name: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord", "Asheville", "Gastonia", "Jacksonville", "Chapel Hill", "Rocky Mount", "Burlington", "Huntersville", "Wilson", "Kannapolis", "Apex", "Greenville", "Hickory", "Indian Trail", "Mooresville", "Wake Forest"] },
  ND: { name: "North Dakota", cities: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton", "Devils Lake", "Valley City", "Grafton", "Beulah", "Rugby", "Bottineau", "Lisbon", "Hazen", "Carrington", "Langdon"] },
  OH: { name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain", "Hamilton", "Springfield", "Kettering", "Elyria", "Lakewood", "Cuyahoga Falls", "Middletown", "Euclid", "Newark", "Mansfield", "Mentor", "Beavercreek", "Cleveland Heights", "Strongsville", "Fairfield"] },
  OK: { name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond", "Moore", "Midwest City", "Enid", "Stillwater", "Muskogee", "Bartlesville", "Owasso", "Shawnee", "Yukon", "Ardmore", "Ponca City", "Bixby", "Duncan", "Del City"] },
  OR: { name: "Oregon", cities: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton", "Bend", "Medford", "Springfield", "Corvallis", "Albany", "Tigard", "Lake Oswego", "Keizer", "Grants Pass", "Oregon City", "McMinnville", "Redmond", "Tualatin", "West Linn"] },
  PA: { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona", "York", "Wilkes-Barre", "Chester", "Norristown", "State College", "Easton", "Lebanon", "Hazleton", "New Castle", "Johnstown", "McKeesport", "Monroeville", "Plum", "Murrysville", "Lower Merion"] },
  RI: { name: "Rhode Island", cities: ["Providence", "Cranston", "Warwick", "Pawtucket", "East Providence", "Woonsocket", "Coventry", "Cumberland", "North Providence", "South Kingstown", "West Warwick", "Johnston", "North Kingstown", "Newport", "Bristol", "Westerly", "Smithfield", "Lincoln", "Central Falls", "Portsmouth"] },
  SC: { name: "South Carolina", cities: ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Goose Creek", "Hilton Head Island", "Sumter", "Florence", "Spartanburg", "Myrtle Beach", "Aiken", "Anderson", "Mauldin", "Greer", "Greenwood", "Conway", "Bluffton"] },
  SD: { name: "South Dakota", cities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Vermillion", "Brandon", "Box Elder", "Spearfish", "Madison", "Belle Fourche", "Sturgis", "Harrisburg", "Dell Rapids", "Mobridge", "Lead"] },
  TN: { name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett", "Hendersonville", "Kingsport", "Collierville", "Cleveland", "Smyrna", "Germantown", "Brentwood", "Columbia", "La Vergne", "Gallatin"] },
  TX: { name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie", "Brownsville", "McKinney", "Frisco", "Pasadena", "Mesquite", "Killeen", "McAllen", "Waco", "Denton", "Carrollton", "Midland", "Beaumont", "Abilene", "Round Rock", "Odessa", "Richardson", "Tyler", "Lewisville", "League City", "College Station", "Pearland", "Sugar Land", "Allen", "Wichita Falls", "Edinburg", "Longview", "San Angelo", "New Braunfels", "Cary"] },
  UT: { name: "Utah", cities: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden", "St. George", "Layton", "South Jordan", "Lehi", "Millcreek", "Taylorsville", "Logan", "Murray", "Draper", "Bountiful", "Riverton", "Roy", "Spanish Fork"] },
  VT: { name: "Vermont", cities: ["Burlington", "South Burlington", "Rutland", "Barre", "Montpelier", "Winooski", "St. Albans", "Newport", "Vergennes", "Middlebury", "Brattleboro", "Bennington", "Morrisville", "Hyde Park", "Johnson", "Lyndonville", "St. Johnsbury", "Hardwick", "Randolph", "White River Junction"] },
  VA: { name: "Virginia", cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke", "Portsmouth", "Suffolk", "Lynchburg", "Harrisonburg", "Leesburg", "Charlottesville", "Danville", "Manassas", "Petersburg", "Fredericksburg", "Winchester", "Salem", "Herndon", "Reston", "Ashburn", "Arlington", "McLean"] },
  WA: { name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Spokane Valley", "Kirkland", "Bellingham", "Kennewick", "Federal Way", "Yakima", "Redmond", "Marysville", "Pasco", "South Hill", "Shoreline", "Richland", "Lakewood", "Sammamish", "Burien", "Olympia", "Lacey"] },
  WV: { name: "West Virginia", cities: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling", "Weirton", "Fairmont", "Martinsburg", "Beckley", "Clarksburg", "South Charleston", "St. Albans", "Vienna", "Bluefield", "Moundsville", "Bridgeport", "Oak Hill", "Dunbar", "Elkins", "Nitro"] },
  WI: { name: "Wisconsin", cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Oshkosh", "Eau Claire", "Janesville", "West Allis", "La Crosse", "Sheboygan", "Wauwatosa", "Fond du Lac", "New Berlin", "Wausau", "Brookfield", "Beloit", "Greenfield"] },
  WY: { name: "Wyoming", cities: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson", "Cody", "Rawlins", "Lander", "Torrington", "Powell", "Douglas", "Worland", "Buffalo", "Wheatland", "Thermopolis"] },
};

// Large unique name pools — enough for 10,000 unique combinations
const FIRST_NAMES_F = [
  "Sarah","Maria","Jennifer","Linda","Patricia","Barbara","Susan","Jessica","Karen","Lisa",
  "Nancy","Betty","Margaret","Sandra","Ashley","Dorothy","Kimberly","Emily","Donna","Michelle",
  "Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Sharon","Laura","Cynthia","Kathleen",
  "Amy","Angela","Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen","Samantha",
  "Katherine","Christine","Debra","Rachel","Carolyn","Janet","Catherine","Heather","Diane","Joyce",
  "Aisha","Fatima","Zara","Aaliyah","Keisha","Tamika","Latoya","Shanice","Monique","Ebony",
  "Mei","Ling","Yuki","Sakura","Priya","Ananya","Deepa","Kavya","Shreya","Nadia",
  "Sofia","Isabella","Valentina","Gabriela","Alejandra","Carmen","Rosa","Lucia","Elena","Adriana",
  "Amara","Zoe","Olivia","Ava","Mia","Charlotte","Abigail","Harper","Evelyn","Elizabeth",
  "Yolanda","Tanya","Renee","Denise","Cheryl","Theresa","Gloria","Judith","Evelyn","Wanda",
  "Tiffany","Crystal","Brittany","Amber","Danielle","Natasha","Jasmine","Vanessa","Alicia","Felicia",
  "Ingrid","Astrid","Freya","Sigrid","Birgit","Helga","Ragnhild","Solveig","Turid","Vigdis",
  "Fatou","Aminata","Mariama","Kadiatou","Fatoumata","Binta","Adama","Hawa","Oumou","Djeneba",
  "Xiomara","Marisol","Esperanza","Concepcion","Guadalupe","Dolores","Pilar","Consuelo","Milagros","Yolanda",
  "Rosalyn","Geraldine","Lorraine","Harriet","Mildred","Edna","Bertha","Ethel","Mabel","Agnes",
  "Courtney","Whitney","Brittney","Kayla","Alexis","Taylor","Jordan","Morgan","Riley","Peyton",
  "Naomi","Ruth","Esther","Miriam","Leah","Rachel","Rebekah","Deborah","Hannah","Abigail",
  "Xiulan","Meiling","Jing","Fang","Yan","Hong","Xiu","Hua","Ping","Qing",
  "Sunita","Rekha","Meena","Geeta","Usha","Asha","Lata","Sushma","Pushpa","Kamla",
  "Brigitte","Helene","Monique","Veronique","Nathalie","Isabelle","Sylvie","Martine","Claudine","Francoise"
];

const FIRST_NAMES_M = [
  "James","John","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles",
  "Christopher","Daniel","Matthew","Anthony","Mark","Donald","Steven","Paul","Andrew","Joshua",
  "Kenneth","Kevin","Brian","George","Timothy","Ronald","Edward","Jason","Jeffrey","Ryan",
  "Jacob","Gary","Nicholas","Eric","Jonathan","Stephen","Larry","Justin","Scott","Brandon",
  "Benjamin","Samuel","Raymond","Gregory","Frank","Alexander","Patrick","Jack","Dennis","Jerry",
  "Marcus","DeShawn","Darius","Malik","Jamal","Andre","Terrence","Darnell","Lamar","Tyrone",
  "Wei","Jin","Hiroshi","Kenji","Raj","Arjun","Vikram","Sanjay","Amit","Ravi",
  "Carlos","Miguel","Juan","Jose","Luis","Diego","Alejandro","Ricardo","Fernando","Eduardo",
  "Kwame","Kofi","Emeka","Chidi","Oluwaseun","Adebayo","Seun","Tunde","Yusuf","Ibrahim",
  "Ethan","Noah","Liam","Mason","Logan","Lucas","Aiden","Jackson","Sebastian","Owen",
  "Dmitri","Alexei","Nikolai","Pavel","Sergei","Vladimir","Boris","Yuri","Igor","Mikhail",
  "Hamid","Hassan","Ahmed","Omar","Ali","Khalid","Tariq","Faisal","Samir","Nasser",
  "Javier","Pablo","Andres","Rodrigo","Ernesto","Guillermo","Hector","Ignacio","Lorenzo","Manuel",
  "Kwabena","Ama","Yaw","Akosua","Abena","Ama","Kofi","Ama","Kweku","Efua",
  "Tobias","Henrik","Lars","Erik","Bjorn","Gunnar","Olaf","Sven","Magnus","Leif",
  "Caden","Jayden","Brayden","Kayden","Hayden","Aidan","Nolan","Declan","Finn","Lachlan",
  "Ezra","Elijah","Isaiah","Jeremiah","Micah","Nathaniel","Caleb","Gideon","Josiah","Solomon",
  "Takeshi","Daisuke","Ryota","Shota","Yuta","Kenta","Naoki","Kazuki","Daiki","Haruki",
  "Pradeep","Suresh","Ramesh","Mahesh","Dinesh","Rajesh","Naresh","Ganesh","Umesh","Yogesh",
  "Thierry","Laurent","Christophe","Sebastien","Guillaume","Matthieu","Romain","Julien","Nicolas","Antoine"
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
  "Washington","Jefferson","Franklin","Lincoln","Kennedy","Marshall","Powell","Rice","Jordan","Hayes",
  "Chen","Wang","Zhang","Liu","Yang","Huang","Zhao","Wu","Zhou","Sun",
  "Kim","Park","Choi","Jung","Patel","Shah","Kumar","Singh","Sharma","Gupta",
  "Murphy","O'Brien","Sullivan","Walsh","McCarthy","O'Connor","Ryan","Kelly","Byrne","O'Neill",
  "Cohen","Levy","Goldberg","Rosenberg","Shapiro","Friedman","Weiss","Katz","Hoffman","Stern",
  "Brooks","Coleman","Patterson","Reed","Cook","Morgan","Bell","Bailey","Cooper","Richardson",
  "Cox","Howard","Ward","Peterson","Gray","James","Watson","Brooks","Sanders","Price",
  "Bennett","Wood","Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long",
  "Patterson","Hughes","Flores","Washington","Butler","Simmons","Foster","Gonzales","Bryant","Alexander",
  "Russell","Griffin","Diaz","Hayes","Myers","Ford","Hamilton","Graham","Sullivan","Wallace",
  "Woods","Cole","West","Jordan","Owens","Reynolds","Fisher","Ellis","Harrison","Gibson",
  "Mcdonald","Cruz","Marshall","Ortiz","Gomez","Murray","Freeman","Wells","Webb","Simpson",
  "Stevens","Tucker","Porter","Hunter","Hicks","Crawford","Henry","Boyd","Mason","Morales",
  "Kennedy","Warren","Dixon","Ramos","Reyes","Burns","Gordon","Shaw","Holmes","Rice",
  "Robertson","Hunt","Black","Daniels","Palmer","Mills","Nichols","Grant","Knight","Ferguson",
  "Rose","Stone","Hawkins","Dunn","Perkins","Hudson","Spencer","Gardner","Stephens","Payne",
  "Pierce","Berry","Matthews","Arnold","Wagner","Willis","Ray","Watkins","Olson","Carroll",
  "Duncan","Snyder","Hart","Cunningham","Bradley","Lane","Andrews","Ruiz","Harper","Fox",
  "Riley","Armstrong","Carpenter","Weaver","Greene","Lawrence","Elliott","Chavez","Sims","Austin",
  "Peters","Kelley","Franklin","Lawson","Fields","Gutierrez","Ryan","Schmidt","Carr","Vasquez",
  "Castillo","Wheeler","Chapman","Oliver","Montgomery","Richards","Williamson","Johnston","Banks","Meyer",
  "Bishop","McCoy","Howell","Alvarez","Morrison","Hansen","Fernandez","Garza","Harvey","Little",
  "Burton","Stanley","Nguyen","George","Jacobs","Reid","Kim","Fuller","Lynch","Dean",
  "Gilbert","Garrett","Romero","Welch","Larson","Frazier","Burke","Hanson","Day","Mendoza",
  "Moreno","Bowman","Medina","Fowler","Brewer","Hoffman","Carlson","Silva","Pearson","Holland"
];

const LICENSE_TYPES = [
  "PhD","PsyD","LCSW","LPC","LMFT","LPCC","LMHC","LCPC","LSW","MSW",
  "LICSW","LCMHC","LMHP","LCSW-C","LCSW-R","LPC-A","LMFT-A","LCPC-C",
  "MD","DO","NP","PMHNP","APRN","LISW","LISW-S","LPCC-S"
];

const ALL_SPECIALTIES = [
  ["anxiety","depression","stress"],
  ["trauma","ptsd","abuse"],
  ["depression","mood_disorders","bipolar"],
  ["family","couples","marriage"],
  ["child_adolescent","adhd","behavioral"],
  ["addiction","substance_use","recovery"],
  ["lgbtq","gender_identity","sexuality"],
  ["veterans","military","ptsd"],
  ["eating_disorders","body_image","ocd"],
  ["grief","loss","bereavement"],
  ["workplace_stress","burnout","career"],
  ["anger_management","impulse_control","behavioral"],
  ["autism_spectrum","developmental","neurodiversity"],
  ["chronic_illness","pain_management","health_anxiety"],
  ["personality_disorders","borderline","narcissistic"],
  ["schizophrenia","psychosis","severe_mental_illness"],
  ["perinatal","postpartum","maternal_mental_health"],
  ["men_issues","masculinity","identity"],
  ["women_issues","feminist_therapy","empowerment"],
  ["cultural_identity","immigration","acculturation"],
  ["spiritual","religious","faith_based"],
  ["sex_therapy","intimacy","relationship"],
  ["sleep_disorders","insomnia","circadian"],
  ["phobias","ocd","anxiety_disorders"],
  ["somatic","body_mind","mindfulness"],
  ["cbt","dbt","evidence_based"],
  ["emdr","trauma_processing","somatic"],
  ["play_therapy","art_therapy","expressive"],
  ["group_therapy","social_skills","interpersonal"],
  ["life_transitions","adjustment","coping"]
];

const INSURANCE_POOLS = [
  ["Aetna","Blue Cross Blue Shield","Cigna","UnitedHealth","Humana"],
  ["Medicaid","Medicare","CHIP","Medicaid Managed Care"],
  ["Sliding Scale","Self-Pay","Pro Bono"],
  ["EAP","Aetna","Cigna","ComPsych","Optum"],
  ["Blue Cross Blue Shield","Anthem","Highmark","Regence","Premera"],
  ["UnitedHealth","Optum","Oscar Health","Molina Healthcare","Centene"],
  ["Tricare","VA Benefits","Military OneSource","CHAMPVA"],
  ["Medicaid","Medicare","Aetna","Cigna","Blue Cross Blue Shield"],
  ["Self-Pay","Sliding Scale","Aetna","UnitedHealth"],
  ["Humana","Cigna","Aetna","Blue Cross Blue Shield","Medicaid"]
];

const COST_TAGS = ["free","sliding_scale","insurance","self_pay","insurance","insurance","insurance","sliding_scale"];
const URGENCY = ["within_24h","within_72h","this_week","flexible","flexible","this_week","within_72h"];

const BIO_TEMPLATES = [
  "Specializing in evidence-based approaches including CBT and DBT, I provide compassionate care tailored to each individual's unique needs and goals.",
  "With over {years} years of clinical experience, I help clients navigate life's challenges through a trauma-informed, culturally sensitive lens.",
  "I believe in the power of the therapeutic relationship to foster healing and growth. My approach integrates mindfulness, somatic awareness, and evidence-based modalities.",
  "As a licensed {license}, I work with individuals, couples, and families to address a wide range of mental health concerns in a safe, non-judgmental space.",
  "My practice is grounded in respect for each client's strengths and resilience. I use an integrative approach drawing from CBT, ACT, and psychodynamic therapy.",
  "I am passionate about helping clients develop insight, build coping skills, and create meaningful change in their lives through collaborative, strengths-based therapy.",
  "Specializing in trauma recovery and PTSD treatment using EMDR and somatic therapies, I help clients reclaim their lives and find post-traumatic growth.",
  "I provide affirming, culturally competent care to diverse populations, with specialized training in LGBTQ+ issues, racial trauma, and identity development.",
  "My therapeutic approach combines the latest research in neuroscience with compassionate, person-centered care to support lasting mental wellness.",
  "With a background in community mental health, I am committed to making quality mental health care accessible to all, regardless of financial circumstances.",
  "I work with clients across the lifespan, from children and adolescents to older adults, using developmentally appropriate, evidence-based interventions.",
  "As a veteran myself, I understand the unique challenges faced by military personnel and their families, and I provide specialized care for service-related trauma.",
  "I integrate mindfulness-based practices, yoga therapy, and traditional psychotherapy to support whole-person healing and sustainable wellness.",
  "My practice focuses on helping clients with anxiety, depression, and life transitions develop practical skills and deeper self-understanding.",
  "I am committed to providing affirming, inclusive care that honors each client's cultural background, identity, and lived experience."
];

const STATE_AREA_CODES = {
  AL:["205","251","256","334"],AK:["907"],AZ:["480","520","602","623","928"],
  AR:["479","501","870"],CA:["213","310","323","408","415","510","530","559","562","619","626","650","661","707","714","760","805","818","831","858","909","916","925","949","951"],
  CO:["303","719","720","970"],CT:["203","475","860","959"],DE:["302"],
  FL:["239","305","321","352","386","407","561","727","754","772","786","813","850","863","904","941","954"],
  GA:["229","404","470","478","678","706","762","770","912"],HI:["808"],
  ID:["208","986"],IL:["217","224","309","312","331","618","630","708","773","779","815","847"],
  IN:["219","260","317","463","574","765","812","930"],IA:["319","515","563","641","712"],
  KS:["316","620","785","913"],KY:["270","364","502","606","859"],
  LA:["225","318","337","504","985"],ME:["207"],MD:["240","301","410","443","667"],
  MA:["339","351","413","508","617","774","781","857","978"],MI:["231","248","269","313","517","586","616","734","810","906","947","989"],
  MN:["218","320","507","612","651","763","952"],MS:["228","601","662","769"],
  MO:["314","417","573","636","660","816"],MT:["406"],
  NE:["308","402","531"],NV:["702","725","775"],NH:["603"],
  NJ:["201","551","609","640","732","848","856","862","908","973"],NM:["505","575"],
  NY:["212","315","332","347","516","518","585","607","631","646","680","716","718","838","845","914","917","929","934"],
  NC:["252","336","704","743","828","910","919","980","984"],ND:["701"],
  OH:["216","220","234","330","380","419","440","513","567","614","740","937"],
  OK:["405","539","580","918"],OR:["458","503","541","971"],
  PA:["215","223","267","272","412","445","484","570","610","717","724","814","878"],
  RI:["401"],SC:["803","839","843","854","864"],SD:["605"],
  TN:["423","615","629","731","865","901","931"],TX:["210","214","254","281","325","346","361","409","430","432","469","512","682","713","726","737","806","817","830","832","903","915","936","940","956","972","979"],
  UT:["385","435","801"],VT:["802"],VA:["276","434","540","571","703","757","804"],
  WA:["206","253","360","425","509","564"],WV:["304","681"],
  WI:["262","414","534","608","715","920"],WY:["307"]
};

// ─── Deduplication tracking sets ─────────────────────────────────────────────
const usedNames = new Set();
const usedNPIs = new Set();
const usedLicenseNums = new Set();
const usedPhones = new Set();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function uniqueName(gender) {
  let attempts = 0;
  while (attempts < 200) {
    const first = gender === 'F' ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
    const last = pick(LAST_NAMES);
    const key = `${first}|${last}`;
    if (!usedNames.has(key)) {
      usedNames.add(key);
      return { first, last };
    }
    attempts++;
  }
  // Fallback: append a number suffix to last name
  const first = gender === 'F' ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
  const last = pick(LAST_NAMES) + rand(2, 99);
  usedNames.add(`${first}|${last}`);
  return { first, last };
}

function uniqueNPI() {
  let npi;
  do {
    npi = `1${String(rand(100000000, 999999999))}`;
  } while (usedNPIs.has(npi));
  usedNPIs.add(npi);
  return npi;
}

function uniqueLicenseNum(state, licenseType) {
  let lic;
  do {
    lic = `${state}${licenseType.replace(/[^A-Z]/g, '')}${rand(10000, 99999)}`;
  } while (usedLicenseNums.has(lic));
  usedLicenseNums.add(lic);
  return lic;
}

function uniquePhone(state) {
  const codes = STATE_AREA_CODES[state] || ["555"];
  let phone;
  let attempts = 0;
  do {
    const code = pick(codes);
    phone = `${code}-${rand(200,999)}-${String(rand(1000,9999)).padStart(4,'0')}`;
    attempts++;
    if (attempts > 100) break; // safety valve
  } while (usedPhones.has(phone));
  usedPhones.add(phone);
  return phone;
}

// ─── Generate providers ───────────────────────────────────────────────────────
const providers = [];
const PROVIDERS_PER_STATE = 200;

for (const [stateCode, stateData] of Object.entries(STATES)) {
  const cities = stateData.cities;

  for (let i = 0; i < PROVIDERS_PER_STATE; i++) {
    const gender = Math.random() > 0.45 ? 'F' : 'M';
    const { first, last } = uniqueName(gender);
    const licenseType = pick(LICENSE_TYPES);
    const hasDr = ["PhD","PsyD","MD","DO"].includes(licenseType);
    const name = hasDr ? `Dr. ${first} ${last}, ${licenseType}` : `${first} ${last}, ${licenseType}`;
    const city = pick(cities);
    const specialties = pick(ALL_SPECIALTIES);
    const insurance = pick(INSURANCE_POOLS);
    const costTag = pick(COST_TAGS);
    const urgency = pick(URGENCY);
    const telehealth = Math.random() > 0.2;
    const inPerson = Math.random() > 0.15;
    const acceptsNew = Math.random() > 0.15;
    const years = rand(2, 30);
    const bio = pick(BIO_TEMPLATES).replace('{years}', years).replace('{license}', licenseType);
    const phone = uniquePhone(stateCode);
    const npi = uniqueNPI();
    const licenseNum = uniqueLicenseNum(stateCode, licenseType);

    providers.push({
      name,
      licenseState: stateCode,
      licenseType,
      licenseNumber: licenseNum,
      npiNumber: npi,
      verificationStatus: Math.random() > 0.3 ? 'verified' : 'unverified',
      telehealthAvailable: telehealth,
      inPersonAvailable: inPerson,
      city,
      stateCode,
      phone,
      languages: JSON.stringify(Math.random() > 0.7 ? ["English", pick(["Spanish","Mandarin","French","Arabic","Portuguese","Russian","Korean","Vietnamese","Tagalog","Hindi"])] : ["English"]),
      costTag,
      acceptsNewPatients: acceptsNew,
      urgencyAvailability: urgency,
      bio,
      isActive: true,
      specialties: specialties.join(','),
      insurance: insurance.join(','),
    });
  }
}

// Verify uniqueness
const nameCheck = new Set(providers.map(p => p.name));
const npiCheck = new Set(providers.map(p => p.npiNumber));
const licCheck = new Set(providers.map(p => p.licenseNumber));
const phoneCheck = new Set(providers.map(p => p.phone));

console.log(`Generated: ${providers.length} providers`);
console.log(`Unique names: ${nameCheck.size} (${nameCheck.size === providers.length ? 'ALL UNIQUE ✓' : 'DUPLICATES FOUND ✗'})`);
console.log(`Unique NPIs: ${npiCheck.size} (${npiCheck.size === providers.length ? 'ALL UNIQUE ✓' : 'DUPLICATES FOUND ✗'})`);
console.log(`Unique license numbers: ${licCheck.size} (${licCheck.size === providers.length ? 'ALL UNIQUE ✓' : 'DUPLICATES FOUND ✗'})`);
console.log(`Unique phone numbers: ${phoneCheck.size} (${phoneCheck.size === providers.length ? 'ALL UNIQUE ✓' : 'DUPLICATES FOUND ✗'})`);

writeFileSync('/home/ubuntu/therapycarenow-ai/server/providers-data.json', JSON.stringify(providers, null, 2));
console.log('\nWritten to server/providers-data.json');
