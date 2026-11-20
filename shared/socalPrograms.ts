import { SOCAL_COUNTIES } from "./region";
/**
 * Curated Southern California programs. Phone numbers and addresses were taken
 * from each organization's official website; entries without a confirmed phone
 * list only the website.
 */

export interface Program {
  name: string;
  description: string;
  phone?: string;
  website: string;
  address?: string;
  counties?: string[]; // county slugs; omitted = all of Southern California
  groupTypes?: string[]; // GroupTherapyType slugs this program offers groups for
  online?: boolean; // meets online, open to Southern California residents
  cost: string;
  insurance: string;
}

export interface GroupTherapyType {
  slug: string;
  name: string;
  whatItDoes: string;
  whoItHelps: string;
  format: string;
  typicalCost: string;
  insurance: string;
}

export const GROUP_THERAPY_TYPES: GroupTherapyType[] = [
  {
    slug: "functional-neurological-disorder",
    name: "Functional Neurological Disorder and Psychogenic Non-Epileptic Seizures (Functional Seizures) Support Groups",
    whatItDoes:
      "Brings together people whose nervous system sends and receives signals incorrectly, causing symptoms such as seizure-like episodes, weakness, tremor, or trouble walking, even though tests show no structural damage. Members learn about the diagnosis, share coping strategies, and practice skills from treatments like Cognitive Behavioral Therapy and physical rehabilitation.",
    whoItHelps:
      "People diagnosed with Functional Neurological Disorder or Psychogenic Non-Epileptic Seizures (also called functional or dissociative seizures), plus their families and caregivers.",
    format: "Mostly online peer support groups that meet weekly or monthly; some hospital neurology programs offer therapist-led groups.",
    typicalCost: "Peer support groups are free. Therapist-led groups follow regular therapy rates.",
    insurance: "Peer groups need no insurance. Therapist-led groups are often covered by Medi-Cal, Medicare, and commercial plans.",
  },
  {
    slug: "dialectical-behavior-therapy",
    name: "Dialectical Behavior Therapy Skills Group",
    whatItDoes:
      "Teaches four sets of practical skills: mindfulness, distress tolerance (getting through a crisis without making it worse), emotion regulation, and interpersonal effectiveness (asking for what you need and keeping healthy relationships).",
    whoItHelps:
      "People with intense emotions, self-harm or suicidal thoughts, borderline personality disorder, or ongoing relationship conflict.",
    format: "Weekly 90–150 minute classes, usually for about 6 months, often paired with individual therapy.",
    typicalCost: "Often $40–$100 per session self-pay; free or low-cost through Medi-Cal county programs.",
    insurance: "Usually covered by Medi-Cal, Medicare, Kaiser Permanente, Anthem Blue Cross, Blue Shield of California, Aetna, Cigna, and UnitedHealthcare when medically necessary.",
  },
  {
    slug: "anger-management",
    name: "Anger Management Group",
    whatItDoes:
      "Helps members recognize anger triggers and early warning signs, and practice calming, communication, and problem-solving techniques instead of aggression.",
    whoItHelps: "Adults and teens whose anger affects relationships, work, or school, including people completing court-ordered classes.",
    format: "Weekly 1–2 hour groups, often 8–52 weeks.",
    typicalCost: "Commonly $25–$60 per class self-pay; some county and community programs are free or sliding-scale.",
    insurance: "Sometimes covered when part of treatment for a diagnosed condition; court-ordered classes are usually self-pay.",
  },
  {
    slug: "cognitive-behavioral-therapy",
    name: "Cognitive Behavioral Therapy Group",
    whatItDoes:
      "Teaches how thoughts, feelings, and behaviors affect each other, and practices replacing unhelpful thinking patterns with more balanced ones.",
    whoItHelps: "People with depression, anxiety, panic, insomnia, or chronic stress.",
    format: "Structured weekly sessions, usually 8–16 weeks, with practice between sessions.",
    typicalCost: "Often $40–$90 per session self-pay.",
    insurance: "Widely covered by Medi-Cal, Medicare, and commercial plans.",
  },
  {
    slug: "acceptance-and-commitment-therapy",
    name: "Acceptance and Commitment Therapy Group",
    whatItDoes:
      "Helps members accept difficult thoughts and feelings rather than fight them, and commit to actions that match their personal values.",
    whoItHelps: "People with anxiety, depression, chronic pain, or long-term stress.",
    format: "Weekly sessions, usually 6–12 weeks.",
    typicalCost: "Often $40–$90 per session self-pay.",
    insurance: "Commonly covered by commercial plans and Medicare when billed as group psychotherapy.",
  },
  {
    slug: "substance-use-recovery",
    name: "Substance Use Recovery Group",
    whatItDoes:
      "Supports people in stopping or reducing alcohol or drug use through relapse-prevention skills, education, and accountability with peers in recovery.",
    whoItHelps: "Anyone concerned about their alcohol or drug use, from early recovery to long-term sobriety.",
    format: "Professional groups in outpatient and intensive outpatient programs, plus free peer meetings such as Alcoholics Anonymous and Self-Management and Recovery Training (SMART Recovery).",
    typicalCost: "Peer meetings are free. Professional programs are free through Medi-Cal county programs or covered by insurance.",
    insurance: "Medi-Cal (Drug Medi-Cal Organized Delivery System), Medicare, and most commercial plans cover outpatient substance use treatment.",
  },
  {
    slug: "trauma-and-ptsd",
    name: "Trauma and Post-Traumatic Stress Disorder Group",
    whatItDoes:
      "Provides a safe space to learn about trauma reactions, build grounding and coping skills, and reduce shame and isolation with people who have had similar experiences.",
    whoItHelps: "Survivors of abuse, assault, violence, combat, accidents, or disasters.",
    format: "Weekly groups, often 10–16 weeks. Veterans can join free groups at VA medical centers and Vet Centers.",
    typicalCost: "Free for eligible veterans; often $40–$100 per session otherwise.",
    insurance: "Covered by Medi-Cal, Medicare, TRICARE, VA, and most commercial plans.",
  },
  {
    slug: "grief-and-loss",
    name: "Grief and Loss Support Group",
    whatItDoes:
      "Helps members work through the death of a loved one or another major loss by sharing their experiences and learning healthy ways to grieve.",
    whoItHelps: "Anyone grieving a death, pregnancy loss, divorce, or other major life loss.",
    format: "Weekly or twice-monthly groups, often run by hospitals, hospices, and faith communities.",
    typicalCost: "Usually free through hospices, hospitals, and community organizations.",
    insurance: "Usually not needed. Therapist-led grief groups may be covered by insurance.",
  },
  {
    slug: "depression-and-bipolar-support",
    name: "Depression and Bipolar Support Group",
    whatItDoes: "Peer-led groups where people living with mood disorders share coping strategies, encouragement, and resources.",
    whoItHelps: "People with depression or bipolar disorder, and their families.",
    format: "Weekly or monthly in-person and online meetings run by organizations such as the National Alliance on Mental Illness and the Depression and Bipolar Support Alliance.",
    typicalCost: "Free.",
    insurance: "Not needed.",
  },
  {
    slug: "family-and-parenting",
    name: "Family and Parenting Group",
    whatItDoes: "Teaches communication, positive discipline, and ways to support a family member who has a mental health condition.",
    whoItHelps: "Parents, caregivers, and relatives of people with mental health or substance use conditions.",
    format: "Multi-week classes such as the National Alliance on Mental Illness Family-to-Family program, plus clinic-based parenting groups.",
    typicalCost: "National Alliance on Mental Illness classes are free; clinic groups vary.",
    insurance: "Clinic-based family therapy groups are often covered by Medi-Cal and commercial plans.",
  },
  {
    slug: "eating-disorders",
    name: "Eating Disorder Recovery Group",
    whatItDoes: "Supports recovery from anorexia, bulimia, and binge eating through skills for meals, body image, and emotions, alongside medical and nutrition care.",
    whoItHelps: "Teens and adults with eating disorders, and their families.",
    format: "Outpatient groups, intensive outpatient, and partial hospitalization programs.",
    typicalCost: "Varies widely; intensive programs usually require insurance.",
    insurance: "Covered by most commercial plans and Medi-Cal when medically necessary.",
  },
  {
    slug: "lgbtq-support",
    name: "Lesbian, Gay, Bisexual, Transgender, and Queer Support Group",
    whatItDoes: "Affirming groups for coming out, identity, family acceptance, discrimination, and minority stress.",
    whoItHelps: "Lesbian, gay, bisexual, transgender, queer, and questioning youth and adults.",
    format: "Weekly peer and therapist-led groups at community centers and clinics.",
    typicalCost: "Usually free at community centers; therapist-led groups vary.",
    insurance: "Therapist-led groups are often covered by Medi-Cal and commercial plans.",
  },
  {
    slug: "anxiety-and-social-anxiety",
    name: "Anxiety and Social Anxiety Group",
    whatItDoes: "Uses gradual exposure and coping skills to reduce worry, panic, and fear of social situations in a supportive setting.",
    whoItHelps: "People with generalized anxiety, panic disorder, or social anxiety.",
    format: "Weekly structured groups, usually 8–12 weeks.",
    typicalCost: "Often $40–$90 per session self-pay.",
    insurance: "Widely covered by Medi-Cal, Medicare, and commercial plans.",
  },
];

export const GROUP_THERAPY_PROGRAMS: Program[] = [
  {
    name: "National Alliance on Mental Illness Urban Los Angeles",
    description: "Free peer and family support groups for people living with mental illness and their families in Los Angeles.",
    website: "https://namiurbanla.org/",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["depression-and-bipolar-support", "family-and-parenting", "anxiety-and-social-anxiety"],
  },
  {
    name: "National Alliance on Mental Illness Inland Valley",
    description: "Free peer and family support groups in western Riverside County.",
    website: "https://namiinlandvalley.org/",
    counties: ["riverside"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["depression-and-bipolar-support", "family-and-parenting", "anxiety-and-social-anxiety"],
  },
  {
    name: "OUR HOUSE Grief Support Center",
    description: "Grief support groups for children, teens, and adults after the death of a loved one, in Los Angeles and online.",
    phone: "310-473-1511",
    website: "https://www.ourhouse-grief.org/",
    counties: ["los-angeles"],
    cost: "Free or low cost; call for details",
    insurance: "Not needed",
    groupTypes: ["grief-and-loss"],
  },
  {
    name: "The Elizabeth Hospice Grief Support",
    description: "Grief support groups and counseling for adults and children in San Diego County, open to the community.",
    phone: "800-797-2050",
    website: "https://www.elizabethhospice.org/",
    counties: ["san-diego"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["grief-and-loss"],
  },
  {
    name: "The Compassionate Friends (local chapters)",
    description: "Free monthly support groups for families after the death of a child, with chapters across Southern California.",
    phone: "877-969-0010",
    website: "https://www.compassionatefriends.org/find-support/chapters/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["grief-and-loss"],
    online: true,
  },
  {
    name: "Peace Over Violence",
    description: "Support groups and counseling for survivors of sexual and domestic violence in Los Angeles County.",
    phone: "213-955-9090",
    website: "https://www.peaceoverviolence.org/",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["trauma-and-ptsd"],
  },
  {
    name: "Center for Community Solutions",
    description: "Support groups and counseling for survivors of sexual assault and relationship violence in San Diego County. 24-hour line.",
    phone: "888-385-4657",
    website: "https://www.ccssd.org/",
    counties: ["san-diego"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["trauma-and-ptsd"],
  },
  {
    name: "Los Angeles LGBT Center",
    description: "Support groups and mental health services for LGBTQ+ people of all ages.",
    website: "https://lalgbtcenter.org/",
    counties: ["los-angeles"],
    cost: "Free or sliding scale",
    insurance: "Medi-Cal and some commercial plans accepted for therapy; groups are often free",
    groupTypes: ["lgbtq-support"],
  },
  {
    name: "The LGBTQ Center Long Beach",
    description: "Peer support groups and counseling for LGBTQ+ adults and youth.",
    phone: "562-434-4455",
    website: "https://www.centerlb.org/",
    counties: ["los-angeles"],
    cost: "Free or sliding scale",
    insurance: "Not needed",
    groupTypes: ["lgbtq-support"],
  },
  {
    name: "LGBTQ Center Orange County",
    description: "Support groups and counseling for LGBTQ+ youth, adults, and families.",
    phone: "714-953-5428",
    website: "https://www.lgbtqcenteroc.org/",
    counties: ["orange"],
    cost: "Free or sliding scale",
    insurance: "Not needed",
    groupTypes: ["lgbtq-support"],
  },
  {
    name: "The San Diego LGBT Community Center",
    description: "Support groups and behavioral health services for LGBTQ+ people and families.",
    phone: "619-692-2077",
    website: "https://thecentersd.org/",
    counties: ["san-diego"],
    cost: "Free or sliding scale",
    insurance: "Not needed",
    groupTypes: ["lgbtq-support"],
  },
  {
    name: "Parents Anonymous",
    description: "Free weekly parent support groups and the National Parent Helpline, based in Southern California.",
    phone: "855-427-2736",
    website: "https://parentsanonymous.org/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["family-and-parenting"],
  },
  {
    name: "Al-Anon and Alateen meetings",
    description: "Free in-person, phone, and online meetings for family and friends of people who drink.",
    website: "https://al-anon.org/al-anon-meetings/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["family-and-parenting", "substance-use-recovery"],
    online: true,
  },
  {
    name: "Narcotics Anonymous meeting search",
    description: "Free in-person and online Narcotics Anonymous meetings.",
    website: "https://na.org/meetingsearch/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["substance-use-recovery"],
    online: true,
  },
  {
    name: "211 Los Angeles County",
    description: "Free, 24/7 referral line. Ask for anger management classes, anxiety groups, Cognitive Behavioral Therapy groups, eating disorder groups, and other therapy groups near you.",
    phone: "800-339-6993",
    website: "https://211la.org/",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["anger-management", "cognitive-behavioral-therapy", "acceptance-and-commitment-therapy", "anxiety-and-social-anxiety", "eating-disorders"],
  },
  {
    name: "211 Orange County",
    description: "Free, 24/7 referral line. Ask for anger management classes, anxiety groups, and other therapy groups near you.",
    phone: "888-600-4357",
    website: "https://www.211oc.org/",
    counties: ["orange"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["anger-management", "cognitive-behavioral-therapy", "acceptance-and-commitment-therapy", "anxiety-and-social-anxiety", "eating-disorders"],
  },
  {
    name: "FND Hope (Functional Neurological Disorder Hope) Peer Support Groups",
    description:
      "Free online peer support groups for people with Functional Neurological Disorder, including a Functional Seizure Peer Support Group, a United States peer support group, young adult, teen, men's, LGBTQIA+, New to Functional Neurological Disorder, and caregiver groups. Dates and sign-up links are on the FND Hope events calendar.",
    website: "https://fndhope.org/events/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["functional-neurological-disorder"],
    online: true,
  },
  {
    name: "National Alliance on Mental Illness Orange County",
    description: "Free peer support groups for people living with mental illness and for family members, plus free education classes.",
    phone: "714-991-6412",
    website: "https://namioc.org/",
    counties: ["orange"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["depression-and-bipolar-support", "family-and-parenting", "anxiety-and-social-anxiety"],
  },
  {
    name: "National Alliance on Mental Illness San Diego & Imperial Counties",
    description: "Free support groups and family education classes in English and Spanish.",
    phone: "619-543-1434",
    website: "https://namisandiego.org/",
    counties: ["san-diego", "imperial"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["depression-and-bipolar-support", "family-and-parenting", "anxiety-and-social-anxiety"],
  },
  {
    name: "National Alliance on Mental Illness Ventura County",
    description: "Free peer and family support groups and the Family-to-Family class.",
    phone: "805-500-6264",
    website: "https://www.namiventura.org/",
    counties: ["ventura"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["depression-and-bipolar-support", "family-and-parenting"],
  },
  {
    name: "Alcoholics Anonymous San Diego",
    description: "Free peer recovery meetings across San Diego County. Call to speak with a sober volunteer.",
    phone: "619-265-8762",
    website: "https://www.aasandiego.org/",
    counties: ["san-diego"],
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["substance-use-recovery"],
  },
  {
    name: "Self-Management and Recovery Training (SMART Recovery)",
    description: "Free science-based addiction recovery meetings, in person in Southern California and online.",
    website: "https://www.smartrecovery.org/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["substance-use-recovery"],
    online: true,
  },
  {
    name: "Depression and Bipolar Support Alliance",
    description: "Free peer-led depression and bipolar support groups, in person and online.",
    website: "https://www.dbsalliance.org/",
    cost: "Free",
    insurance: "Not needed",
    groupTypes: ["depression-and-bipolar-support"],
    online: true,
  },
  {
    name: "Vet Centers (U.S. Department of Veterans Affairs)",
    description: "Free individual and group counseling for combat veterans, service members, and families, including post-traumatic stress groups.",
    phone: "877-927-8387",
    website: "https://www.vetcenter.va.gov/",
    cost: "Free for eligible veterans and families",
    insurance: "Not needed",
    groupTypes: ["trauma-and-ptsd", "grief-and-loss"],
  },
];

export const VETERAN_PROGRAMS: Program[] = [
  {
    name: "Veterans Crisis Line",
    description: "Free, confidential 24/7 crisis support for veterans, service members, and their families. Call 988 and press 1, or text 838255.",
    phone: "988",
    website: "https://www.veteranscrisisline.net/",
    cost: "Free",
    insurance: "Not needed",
  },
  {
    name: "West Los Angeles VA Medical Center",
    description: "VA Greater Los Angeles Healthcare System. Outpatient and inpatient mental health care, post-traumatic stress treatment, substance use programs, and group therapy.",
    phone: "310-478-3711",
    address: "11301 Wilshire Boulevard, Los Angeles, CA 90073",
    website: "https://www.va.gov/greater-los-angeles-health-care/locations/west-los-angeles-va-medical-center/",
    counties: ["los-angeles", "ventura", "santa-barbara"],
    cost: "Free or low-cost for enrolled veterans",
    insurance: "VA health care; VA can also bill Medicare, Medi-Cal, and private insurance",
  },
  {
    name: "Tibor Rubin VA Medical Center (Long Beach)",
    description: "VA Long Beach Healthcare System. Mental health clinics, post-traumatic stress programs, and group therapy for veterans in southern Los Angeles County and Orange County.",
    phone: "562-826-8000",
    address: "5901 East Seventh Street, Long Beach, CA 90822",
    website: "https://www.va.gov/long-beach-health-care/locations/tibor-rubin-va-medical-center/",
    counties: ["los-angeles", "orange"],
    cost: "Free or low-cost for enrolled veterans",
    insurance: "VA health care; VA can also bill Medicare, Medi-Cal, and private insurance",
  },
  {
    name: "Jerry L. Pettis Memorial VA Medical Center (Loma Linda)",
    description: "VA Loma Linda Healthcare System. Mental health care for veterans in Riverside and San Bernardino counties.",
    phone: "909-825-7084",
    address: "11201 Benton Street, Loma Linda, CA 92357",
    website: "https://www.va.gov/loma-linda-health-care/locations/jerry-l-pettis-memorial-veterans-hospital/",
    counties: ["riverside", "san-bernardino"],
    cost: "Free or low-cost for enrolled veterans",
    insurance: "VA health care; VA can also bill Medicare, Medi-Cal, and private insurance",
  },
  {
    name: "Jennifer Moreno VA Medical Center (San Diego)",
    description: "VA San Diego Healthcare System. Mental health care, post-traumatic stress programs, and group therapy for veterans in San Diego and Imperial counties.",
    phone: "858-552-8585",
    address: "3350 La Jolla Village Drive, San Diego, CA 92161",
    website: "https://www.va.gov/san-diego-health-care/locations/jennifer-moreno-department-of-veterans-affairs-medical-center/",
    counties: ["san-diego", "imperial"],
    cost: "Free or low-cost for enrolled veterans",
    insurance: "VA health care; VA can also bill Medicare, Medi-Cal, and private insurance",
  },
  {
    name: "Vet Center Call Center",
    description: "Find your nearest Vet Center for free, confidential readjustment counseling, including groups, for combat veterans, service members, and families. Open 24/7.",
    phone: "877-927-8387",
    website: "https://www.vetcenter.va.gov/",
    cost: "Free",
    insurance: "Not needed",
  },
  {
    name: "VA Community Care",
    description: "Lets eligible veterans see approved non-VA therapists and psychiatrists near home when VA care isn't available nearby or quickly enough.",
    website: "https://www.va.gov/communitycare/",
    cost: "Paid by VA for eligible veterans",
    insurance: "VA health care",
  },
  {
    name: "TRICARE",
    description: "Health plan for active-duty service members, National Guard and Reserve members, retirees, and their families. Covers outpatient therapy, psychiatry, and group therapy.",
    website: "https://www.tricare.mil/",
    cost: "Depends on your TRICARE plan",
    insurance: "TRICARE Prime, TRICARE Select, TRICARE For Life",
  },
  {
    name: "Military OneSource",
    description: "Free, confidential non-medical counseling for service members and their families, available 24/7 by phone or video.",
    phone: "800-342-9647",
    website: "https://www.militaryonesource.mil/",
    cost: "Free",
    insurance: "Not needed",
  },
];

export const HOSPITAL_PROGRAMS: Program[] = [
  {
    name: "Loma Linda University Behavioral Health",
    description: "Inpatient, partial hospitalization, and intensive outpatient programs with group therapy for adults, teens, and children, including chemical dependency programs.",
    phone: "909-558-9275",
    website: "https://lluh.org/behavioral-health",
    cost: "Insurance or self-pay",
    insurance: "Accepts Medi-Cal, Medicare, and most commercial plans; call to confirm your plan",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
    counties: ["san-bernardino", "riverside"],
  },
  {
    name: "Sharp Mesa Vista Hospital",
    description: "San Diego's largest private psychiatric hospital, with inpatient care, partial hospitalization, intensive outpatient, and Dialectical Behavior Therapy and chemical dependency group programs.",
    phone: "858-836-8434",
    website: "https://www.sharp.com/services/mental-health",
    cost: "Insurance or self-pay",
    insurance: "Accepts Medicare and most commercial plans; call intake to confirm",
    groupTypes: ["dialectical-behavior-therapy", "substance-use-recovery"],
    counties: ["san-diego"],
  },
  {
    name: "Sharp Grossmont Hospital Behavioral Health",
    description: "Inpatient and outpatient behavioral health services for East San Diego County.",
    phone: "619-740-5811",
    website: "https://www.sharp.com/services/mental-health",
    counties: ["san-diego"],
    cost: "Insurance or self-pay",
    insurance: "Accepts Medicare and most commercial plans; call intake to confirm",
  },
  {
    name: "Kaiser Permanente Mental Health",
    description: "Kaiser members can schedule individual and group therapy, psychiatry, and addiction medicine across Southern California, often without a referral.",
    website: "https://healthy.kaiserpermanente.org/southern-california/health-wellness/mental-health",
    cost: "Covered by Kaiser membership copays",
    insurance: "Kaiser Permanente (including Kaiser Medi-Cal and Medicare plans)",
  },
];

export const STATE_FUNDED_PROGRAMS: Program[] = [
  {
    name: "Medi-Cal Mental Health Services",
    description: "California's Medicaid program covers therapy, psychiatry, group therapy, substance use treatment, and crisis services at no or low cost. Call your county behavioral health line to start specialty mental health services.",
    website: "https://www.dhcs.ca.gov/services/medi-cal/Pages/Medi-Cal-Mental-Health-Services.aspx",
    cost: "Free or very low cost",
    insurance: "Medi-Cal",
  },
  {
    name: "Covered California",
    description: "California's health insurance marketplace. Every plan includes mental health and substance use coverage, and many people qualify for financial help or Medi-Cal.",
    phone: "800-300-1506",
    website: "https://www.coveredca.com/",
    cost: "Premiums based on income; many qualify for subsidies",
    insurance: "Covered California plans (Anthem Blue Cross, Blue Shield of California, Health Net, Kaiser Permanente, Molina Healthcare, L.A. Care, and others)",
  },
  {
    name: "CalHOPE",
    description: "Free California state program offering emotional support, a peer-run warm line, and online resources.",
    website: "https://www.calhope.org/",
    cost: "Free",
    insurance: "Not needed",
  },
  {
    name: "California Peer-Run Warm Line",
    description: "Free 24/7 non-emergency emotional support by phone or chat from people with lived mental health experience.",
    website: "https://www.mentalhealthsf.org/peer-run-warmline/",
    cost: "Free",
    insurance: "Not needed",
  },
  {
    name: "211 LA",
    description: "Free 24/7 referral line for Los Angeles County mental health, housing, food, and social services.",
    phone: "800-339-6993",
    website: "https://www.211la.org/",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed",
  },
  {
    name: "211 Orange County",
    description: "Free 24/7 referral line for Orange County health and social services.",
    phone: "888-600-4357",
    website: "https://211oc.org/",
    counties: ["orange"],
    cost: "Free",
    insurance: "Not needed",
  },
  {
    name: "Los Angeles County Department of Mental Health",
    description: "County-funded outpatient therapy, psychiatry, group programs, and crisis services. Free or low-cost with Medi-Cal or based on income.",
    phone: "800-854-7771",
    website: "https://dmh.lacounty.gov/",
    counties: ["los-angeles"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal, Medicare, uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "Orange County Behavioral Health Services",
    description: "County mental health and substance use services, including outpatient clinics and group programs. OC Links connects you to services 24/7.",
    phone: "855-625-4657",
    website: "https://www.ochealthinfo.com/about-hca/behavioral-health-services",
    counties: ["orange"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal (CalOptima Health), uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "San Diego County Behavioral Health Services",
    description: "County-funded mental health and substance use treatment. The Access and Crisis Line connects you to services 24/7.",
    phone: "888-724-7240",
    website: "https://www.sandiegocounty.gov/hhsa/programs/bhs/",
    counties: ["san-diego"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal, uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "Riverside University Health System – Behavioral Health",
    description: "County mental health and substance use services, including outpatient clinics and groups.",
    phone: "800-499-3008",
    website: "https://www.rcdmh.org/",
    counties: ["riverside"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal (Inland Empire Health Plan), uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "San Bernardino County Department of Behavioral Health",
    description: "County mental health and substance use services. The 24/7 Access Unit connects you to care.",
    phone: "888-743-1478",
    website: "https://dbh.sbcounty.gov/",
    counties: ["san-bernardino"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal (Inland Empire Health Plan), uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "Ventura County Behavioral Health",
    description: "County mental health and substance use services. The 24/7 Access Line connects you to care.",
    phone: "866-998-2243",
    website: "https://vcbh.org/",
    counties: ["ventura"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal (Gold Coast Health Plan), uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "Santa Barbara County Department of Behavioral Wellness",
    description: "County mental health and substance use services. The 24/7 Access Line connects you to care.",
    phone: "888-868-1649",
    website: "https://www.countyofsb.org/2262/Behavioral-Wellness",
    counties: ["santa-barbara"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal (CenCal Health), uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
  {
    name: "Imperial County Behavioral Health Services",
    description: "County mental health and substance use services. The 24/7 Access Line connects you to care.",
    phone: "800-817-5292",
    website: "https://www.icbhs.org/",
    counties: ["imperial"],
    cost: "Free with Medi-Cal; sliding scale otherwise",
    insurance: "Medi-Cal (California Health & Wellness, Molina Healthcare), uninsured",
    groupTypes: ["substance-use-recovery", "depression-and-bipolar-support"],
  },
];

export function programsForCounty(programs: Program[], countySlug?: string | null): Program[] {
  if (!countySlug) return programs;
  return programs.filter((p) => !p.counties || p.counties.includes(countySlug));
}

export interface EapProgram extends Program {
  eapProvider: string;
  /** Employer names people may search for (used to seed the employer Employee Assistance Program lookup). */
  employerNames: string[];
}

/** Employee Assistance Programs for major Southern California public employers, from each employer's official HR page. */
export const EAP_PROGRAMS: EapProgram[] = [
  {
    name: "State of California employees: Whole You",
    eapProvider: "Spring Health",
    employerNames: ["State of California", "California state employee", "CalHR"],
    description: "Free, confidential counseling and life support for State of California employees and their eligible dependents.",
    phone: "1-866-327-4762",
    website: "https://benefits.calhr.ca.gov/state-employees/engagement-resources/employee-assistance-program/",
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of Los Angeles Employee Assistance Program",
    eapProvider: "County of Los Angeles Department of Human Resources",
    employerNames: ["County of Los Angeles", "Los Angeles County", "LA County"],
    description: "Free, confidential counseling for County employees and a dependent, including virtual sessions and grief groups.",
    phone: "213-433-7202",
    address: "510 S. Vermont Ave, 12th Floor, Los Angeles, CA 90020",
    website: "https://employee.hr.lacounty.gov/physical-emotional-wellbeing/",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "City of Los Angeles civilian employees: Support Plus Employee and Family Assistance Program",
    eapProvider: "Optum",
    employerNames: ["City of Los Angeles", "LA City", "Los Angeles City"],
    description: "24/7 free, confidential counseling and referrals for City of Los Angeles civilian employees and household members. Access code: CityofLA.",
    phone: "800-213-5813",
    website: "https://livewell.la/efap",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "Los Angeles Department of Water and Power Employee Assistance Program",
    eapProvider: "Resources for Living",
    employerNames: ["Los Angeles Department of Water and Power", "LADWP", "DWP"],
    description: "Free, confidential counseling for Department of Water and Power employees.",
    phone: "888-439-7327",
    website: "https://457.lacity.gov/eap",
    counties: ["los-angeles"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of Orange Employee Assistance Program",
    eapProvider: "Aetna Resources for Living",
    employerNames: ["County of Orange", "Orange County"],
    description: "24/7 confidential counseling for County of Orange employees and family members. Website username: Orange County Ca, access code: eap.",
    phone: "1-800-221-0945",
    website: "https://hrs.oc.gov/EAP",
    counties: ["orange"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of San Diego Employee Assistance Program",
    eapProvider: "Anthem Employee Assistance Program",
    employerNames: ["County of San Diego", "San Diego County"],
    description: "24/7 counseling (in person or online), legal and financial consultations for County employees and household members.",
    phone: "888-777-6665",
    website: "https://www.sandiegocounty.gov/content/sdc/hr/EmployeeBenefits/employee-assistance-program.html",
    counties: ["san-diego"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of Riverside Employee Assistance Program",
    eapProvider: "Anthem Employee Assistance Program",
    employerNames: ["County of Riverside", "Riverside County"],
    description: "Up to 6 free counseling sessions per issue for employees and household members. Online code: PRISM.",
    phone: "833-954-1067",
    website: "https://rc-hr.com/benefits/employee-assistance-program",
    counties: ["riverside"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "San Bernardino County Employee Assistance Program",
    eapProvider: "Health Advocate",
    employerNames: ["San Bernardino County", "County of San Bernardino"],
    description: "24/7 free, confidential counseling with licensed professionals for County employees, spouses or domestic partners, and dependents.",
    phone: "866-611-8379",
    website: "https://hr.sbcounty.gov/eap/",
    counties: ["san-bernardino"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of Ventura Employee Assistance Program",
    eapProvider: "County of Ventura Human Resources",
    employerNames: ["County of Ventura", "Ventura County"],
    description: "Free, confidential short-term counseling (about 5 to 8 sessions) for County employees and dependents, with 24-hour emergency on-call support.",
    phone: "805-654-4327",
    address: "950 County Square Drive, Suite 200, Ventura, CA 93003",
    website: "https://hr.venturacounty.gov/benefits/employee-assistance-program",
    counties: ["ventura"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of Santa Barbara Employee Assistance Program: LifeMatters",
    eapProvider: "Empathia LifeMatters",
    employerNames: ["County of Santa Barbara", "Santa Barbara County"],
    description: "24/7 phone access to a licensed therapist and up to 3 in-person or video visits per issue for employees and household members. Password: COSB.",
    phone: "1-800-367-7474",
    website: "https://www.mylifematters.com/",
    counties: ["santa-barbara"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "County of Imperial Employee Assistance Program",
    eapProvider: "Aetna Resources for Living",
    employerNames: ["County of Imperial", "Imperial County"],
    description: "Confidential counseling, daily-life assistance, and legal and financial consultations for County employees and household members.",
    phone: "1-800-342-8111",
    website: "https://hr.imperialcounty.org/brizy-51896/",
    counties: ["imperial"],
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
  {
    name: "Federal employees: Federal Occupational Health Employee Assistance Program",
    eapProvider: "Federal Occupational Health (U.S. Department of Health and Human Services)",
    employerNames: ["Federal government", "Federal employee", "US government"],
    description: "Free counseling and work-life services for federal employees whose agency uses Federal Occupational Health.",
    phone: "1-800-222-0364",
    website: "https://www.foh4you.com/",
    cost: "Free",
    insurance: "Not needed (employer-paid)",
  },
];

/** Every program that runs groups, for the Group Therapy page. */
export function groupProgramsFor(slug: string): Program[] {
  return [...GROUP_THERAPY_PROGRAMS, ...HOSPITAL_PROGRAMS, ...STATE_FUNDED_PROGRAMS].filter((p) => p.groupTypes?.includes(slug));
}

/** Where a group meets: "Online" or its Southern California counties. */
export function groupLocation(p: Program): string {
  if (p.online) return "Online";
  if (!p.counties) return "Southern California";
  return p.counties.map((c) => SOCAL_COUNTIES.find((x) => x.slug === c)?.name ?? c).join(", ");
}

export interface GroupFinder {
  name: string;
  description: string;
  url: string;
}

/** Official meeting finders that list groups currently meeting, with dates, times, and locations. */
export const ACTIVE_GROUP_FINDERS: GroupFinder[] = [
  {
    name: "National Alliance on Mental Illness: find your local affiliate's support groups",
    description: "Free peer and family support groups run by each county's affiliate, with meeting days, times, and locations.",
    url: "https://namica.org/",
  },
  {
    name: "Self-Management and Recovery Training (SMART Recovery) meeting finder",
    description: "Search in-person and online addiction recovery meetings by ZIP code.",
    url: "https://meetings.smartrecovery.org/",
  },
  {
    name: "Alcoholics Anonymous meeting finder",
    description: "Find in-person and online Alcoholics Anonymous meetings near you.",
    url: "https://www.aa.org/find-aa",
  },
  {
    name: "Depression and Bipolar Support Alliance: find a support group",
    description: "In-person chapters and online peer support groups with schedules.",
    url: "https://www.dbsalliance.org/support/chapters-and-support-groups/",
  },
  {
    name: "FND Hope events calendar",
    description: "Upcoming online Functional Neurological Disorder and Functional Seizure peer support groups.",
    url: "https://fndhope.org/events/",
  },
];

// Official member sites of major Employee Assistance Program companies. On each,
// the visitor enters their employer name or access code to find their own program.
export const EAP_VENDORS: { name: string; website: string }[] = [
  { name: "ComPsych GuidanceResources", website: "https://www.guidanceresources.com" },
  { name: "Lyra Health", website: "https://my.lyrahealth.com" },
  { name: "Spring Health", website: "https://benefits.springhealth.com" },
  { name: "Optum (Live and Work Well)", website: "https://www.liveandworkwell.com" },
  { name: "Carelon Behavioral Health", website: "https://www.carelonbehavioralhealth.com" },
  { name: "Magellan Healthcare", website: "https://www.magellanhealthcare.com" },
  { name: "Cigna Employee Assistance Program", website: "https://www.cigna.com/individuals-families/member-guide/employee-assistance-program" },
  { name: "Aetna Resources For Living", website: "https://www.resourcesforliving.com" },
  { name: "TELUS Health (formerly LifeWorks)", website: "https://one.telushealth.com" },
  { name: "Modern Health", website: "https://my.joinmodernhealth.com" },
  { name: "Health Advocate", website: "https://members.healthadvocate.com" },
];
