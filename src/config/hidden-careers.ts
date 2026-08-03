/**
 * Hidden Careers of the Ohio Valley — lesser-known local careers for Madonna students.
 * Focused on zip codes 26062 (Weirton, WV) and 43952 (East Liverpool, OH).
 */

export type HiddenCareerCategory =
  | "healthcare"
  | "skilled-trades"
  | "technology"
  | "public-service"
  | "environment"
  | "logistics";

export type HiddenCareerCategoryFilter = HiddenCareerCategory | "all";

export const HIDDEN_CAREER_CATEGORY_ORDER: HiddenCareerCategoryFilter[] = [
  "all",
  "healthcare",
  "skilled-trades",
  "technology",
  "public-service",
  "environment",
  "logistics",
];

export const HIDDEN_CAREER_CATEGORY_LABELS: Record<HiddenCareerCategoryFilter, string> = {
  all: "All careers",
  healthcare: "Healthcare",
  "skilled-trades": "Skilled Trades",
  technology: "Technology",
  "public-service": "Public Service",
  environment: "Environment",
  logistics: "Logistics",
};

export const HIDDEN_CAREERS_SECTION = {
  title: "Hidden Careers of the Ohio Valley",
  subtitle: "Careers You Didn't Know Existed",
  description:
    "Real jobs hiring right now in the Weirton–East Liverpool–Upper Ohio Valley region. These careers rarely show up in a typical high school career fair — but local hospitals, mills, rivers, and utilities depend on them every day.",
  zipCodes: ["26062 (Weirton, WV)", "43952 (East Liverpool, OH)"],
};

export type LocalProgram = {
  school: string;
  program: string;
};

export type HiddenCareerLink = {
  label: string;
  href: string;
};

export type HiddenCareer = {
  id: string;
  title: string;
  hook: string;
  category: HiddenCareerCategory;
  isHiddenGem: boolean;
  whatTheyDo: string;
  localDemand: string;
  educationRequired: string;
  localPrograms: LocalProgram[];
  internshipPath: string[];
  salaryNote?: string;
  relatedLinks?: HiddenCareerLink[];
};

export const HIDDEN_CAREERS: HiddenCareer[] = [
  {
    id: "medical-laboratory-scientist",
    title: "Medical Laboratory Scientist",
    hook: "Did you know doctors rely on lab scientists — not just nurses — to diagnose cancer, infections, and blood disorders?",
    category: "healthcare",
    isHiddenGem: true,
    whatTheyDo:
      "Run the tests behind the scenes: blood counts, cultures, DNA panels, and chemistry panels. You work in hospital labs at Weirton Medical Center, Trinity, and Heritage Valley — patients never see you, but your results guide every treatment plan.",
    localDemand:
      "Every hospital in the tri-state needs certified MLS professionals. The Ohio Valley's aging population and chronic-disease care keep lab volumes high year-round.",
    educationRequired:
      "Bachelor's degree (B.S.) in Medical Laboratory Science, plus a national certification exam (ASCP).",
    localPrograms: [
      { school: "West Liberty University", program: "Medical Laboratory Science (B.S.)" },
      { school: "Belmont College", program: "Laboratory Technician (A.A.S.) — stepping stone toward MLS" },
    ],
    internshipPath: [
      "Take honors biology and chemistry at Madonna; strong math helps.",
      "Ask the Future Center about shadowing a hospital lab (Weirton Medical or Trinity).",
      "Explore JDRCC Health Occupations for a healthcare foundation.",
      "Apply for West Liberty's pre-MLS track; clinical rotations happen at local hospitals.",
    ],
    salaryNote: "Often $55,000–$75,000+ regionally, with strong demand and shift differentials.",
    relatedLinks: [
      { label: "College Passport", href: "/college-passport" },
      { label: "Mentor Network", href: "/mentors" },
    ],
  },
  {
    id: "sterile-processing-technician",
    title: "Central Service / Sterile Processing Technician",
    hook: "Did you know someone has to sterilize every surgical instrument before an operation can start?",
    category: "healthcare",
    isHiddenGem: true,
    whatTheyDo:
      "Decontaminate, assemble, sterilize, and track every surgical tray, scope, and instrument. You're the last line of defense against infection in the OR — without you, surgery stops.",
    localDemand:
      "Weirton Medical Center, East Liverpool City Hospital, and Trinity all run busy surgical suites. Sterile processing is a constant need, not a seasonal job.",
    educationRequired:
      "Certificate program (often 6–12 months) leading to CRCST certification.",
    localPrograms: [
      { school: "Choffin Career & Technical Center (Youngstown)", program: "Central Service Technician certificate" },
      { school: "Belmont College", program: "Medical Assisting — related clinical foundation" },
    ],
    internshipPath: [
      "Volunteer or job-shadow through a Future Center hospital contact.",
      "Take JDRCC Health Occupations in junior or senior year.",
      "Earn a CPR/First Aid certification to strengthen your application.",
      "Apply to Choffin's adult education program after graduation (financial aid may apply).",
    ],
    salaryNote: "Entry-level often $35,000–$45,000; experienced certified techs can reach $50,000+.",
    relatedLinks: [{ label: "Trade Passport", href: "/trade-passport" }],
  },
  {
    id: "surgical-technologist",
    title: "Surgical Technologist",
    hook: "Did you know there's a career where you stand in the operating room handing surgeons their instruments?",
    category: "healthcare",
    isHiddenGem: true,
    whatTheyDo:
      "Prepare the OR, set up sterile fields, pass instruments during surgery, and manage supplies. You're part of the surgical team for everything from joint replacements to emergency trauma cases.",
    localDemand:
      "Regional hospitals perform thousands of surgeries annually. Surgical techs are in short supply across the upper Ohio Valley.",
    educationRequired:
      "Associate degree or accredited certificate in Surgical Technology, plus CST certification.",
    localPrograms: [
      { school: "Choffin Career & Technical Center (Youngstown)", program: "Surgical Technology" },
      { school: "Franciscan University of Steubenville", program: "Biology/Pre-health sciences — foundation for allied health" },
    ],
    internshipPath: [
      "Shadow a surgical team through Future Center hospital partnerships.",
      "Complete JDRCC Health Occupations and maintain a strong science GPA.",
      "Take anatomy seriously — surgical tech programs are competitive.",
      "Request mentor connections through Madonna's Mentor Network for healthcare pros.",
    ],
    salaryNote: "Typically $45,000–$60,000+ with overtime opportunities in busy hospitals.",
    relatedLinks: [
      { label: "Mentor Network", href: "/mentors" },
      { label: "College Passport", href: "/college-passport" },
    ],
  },
  {
    id: "diagnostic-sonographer",
    title: "Diagnostic Medical Sonographer",
    hook: "Did you know the person taking ultrasound images of a baby isn't always a nurse?",
    category: "healthcare",
    isHiddenGem: false,
    whatTheyDo:
      "Use ultrasound equipment to capture images of organs, blood vessels, and pregnancies. You work directly with patients, explain procedures, and deliver images radiologists and OB/GYNs use for diagnosis.",
    localDemand:
      "WVU Medicine, Trinity, and regional clinics need sonographers for women's health, cardiac, and vascular imaging.",
    educationRequired:
      "Associate degree in Radiologic Technology plus ultrasound specialty, or an accredited 18-month sonography certificate.",
    localPrograms: [
      { school: "Belmont College", program: "Radiologic Technology (A.A.S.) — imaging foundation" },
      { school: "WVU Hospitals (Morgantown)", program: "Diagnostic Medical Sonography certificate" },
    ],
    internshipPath: [
      "Build a science and patient-care foundation at Madonna.",
      "Shadow in a hospital imaging department through the Future Center.",
      "Start with Belmont's radiologic technology program, then specialize in ultrasound.",
      "Network through Madonna's healthcare mentors for clinical placement tips.",
    ],
    salaryNote: "Often $65,000–$85,000+ — one of the higher-paying allied health careers.",
    relatedLinks: [{ label: "College Passport", href: "/college-passport" }],
  },
  {
    id: "water-quality-operator",
    title: "Water & Wastewater Treatment Operator",
    hook: "Did you know every glass of tap water and every flushed toilet depends on a certified operator most people never meet?",
    category: "environment",
    isHiddenGem: true,
    whatTheyDo:
      "Test water samples, run treatment plants, monitor chemical levels, and keep drinking water safe and wastewater clean. You work at municipal plants along the Ohio River and at industrial facilities.",
    localDemand:
      "Aging infrastructure and retiring operators create steady openings in Weirton, East Liverpool, Steubenville, and across the tri-state.",
    educationRequired:
      "Associate degree in Water Quality Technology, plus state operator certification (Ohio Class IV or West Virginia equivalent).",
    localPrograms: [
      { school: "Belmont College", program: "Water Quality Technician (A.A.S.)" },
    ],
    internshipPath: [
      "Take chemistry and environmental science seriously at Madonna.",
      "Ask the Future Center about touring a local water treatment plant.",
      "Volunteer for community creek or river cleanup projects — shows environmental interest.",
      "Apply to Belmont's program; graduates can test for Ohio operator certification.",
    ],
    salaryNote: "Often $40,000–$65,000+; municipal jobs usually include strong benefits and pensions.",
    relatedLinks: [
      { label: "Trade Passport", href: "/trade-passport" },
      { label: "Community Impact", href: "/community-impact" },
    ],
  },
  {
    id: "industrial-maintenance-tech",
    title: "Industrial Maintenance / Mechatronics Technician",
    hook: "Did you know factories need technicians who fix both the robot AND the conveyor belt?",
    category: "skilled-trades",
    isHiddenGem: true,
    whatTheyDo:
      "Keep manufacturing lines running: troubleshoot PLCs, repair motors, weld fixtures, and maintain hydraulic and pneumatic systems. You're the person called when production stops.",
    localDemand:
      "The Ohio Valley's manufacturing legacy — steel, petrochemical, and advanced fabrication — still needs skilled maintenance techs who understand both mechanical and electrical systems.",
    educationRequired:
      "Associate degree or diploma in Industrial Maintenance, Electro-Mechanical Technology, or Mechatronics.",
    localPrograms: [
      { school: "New Castle School of Trades (East Liverpool)", program: "Electrical & Industrial Maintenance" },
      { school: "New Castle School of Trades (New Castle, PA)", program: "Industrial Electro-Mechanical Technology" },
      { school: "Belmont College", program: "Engineering Technology" },
    ],
    internshipPath: [
      "Enroll in JDRCC Welding or Diesel Mechanics for hands-on shop experience.",
      "Complete OSHA 10 through Madonna's Trade Passport.",
      "Job-shadow at a local manufacturer through Future Center employer contacts.",
      "Apply to NCST's East Liverpool campus — it's minutes from 43952.",
    ],
    salaryNote: "Often $45,000–$70,000+ with overtime; experienced techs at mills can earn more.",
    relatedLinks: [
      { label: "Trade Passport", href: "/trade-passport" },
      { label: "Academies", href: "/academies" },
    ],
  },
  {
    id: "hvac-refrigeration-tech",
    title: "HVAC/R & Commercial Refrigeration Technician",
    hook: "Did you know hospitals, grocery stores, and steel mills all need specialists who keep their climate systems running?",
    category: "skilled-trades",
    isHiddenGem: false,
    whatTheyDo:
      "Install and repair heating, air conditioning, ventilation, and commercial refrigeration systems. You work in homes, hospitals, restaurants, and industrial plants — every building needs you eventually.",
    localDemand:
      "Extreme Ohio Valley summers and winters, plus aging commercial buildings, keep HVAC/R techs busy year-round.",
    educationRequired:
      "Diploma or associate degree in HVAC/R; EPA Section 608 certification required for refrigerants.",
    localPrograms: [
      { school: "New Castle School of Trades (East Liverpool)", program: "Refrigeration & Climate Control" },
      { school: "Belmont College", program: "Industrial Trades — HVAC pathway" },
    ],
    internshipPath: [
      "Start with JDRCC Carpentry or a construction-related CTE course.",
      "Earn OSHA 10 and explore EPA 608 prep through Trade Passport.",
      "Ask the Future Center to connect you with a local HVAC employer for summer shadowing.",
      "Registered apprenticeships are available through some regional contractors.",
    ],
    salaryNote: "Often $40,000–$65,000+; commercial/industrial specialists earn toward the higher end.",
    relatedLinks: [{ label: "Trade Passport", href: "/trade-passport" }],
  },
  {
    id: "ndt-technician",
    title: "Nondestructive Testing (NDT) Technician",
    hook: "Did you know someone uses ultrasound and X-rays to inspect pipelines and bridges — without cutting them open?",
    category: "skilled-trades",
    isHiddenGem: true,
    whatTheyDo:
      "Inspect welds, pipelines, bridges, and pressure vessels using ultrasonic, radiographic, and magnetic testing. You find cracks and defects before they cause failures — critical for steel, energy, and infrastructure.",
    localDemand:
      "Regional mills, river terminals, and petrochemical facilities rely on NDT to meet safety codes. It's specialized work with few trained people locally.",
    educationRequired:
      "Certificate or associate degree in NDT; ASNT Level I/II certifications earned on the job.",
    localPrograms: [
      { school: "New Castle School of Trades (New Castle, PA)", program: "Combination Welding — common entry path into NDT inspection" },
      { school: "Pennsylvania College of Technology", program: "Nondestructive Testing (A.A.S.) — regional option" },
    ],
    internshipPath: [
      "Take welding at JDRCC — many NDT techs start as welders who learn inspection.",
      "Ask the Future Center about manufacturers who employ NDT contractors.",
      "Pursue OSHA 10 and basic blueprint reading through Trade Passport.",
      "Some employers sponsor NDT certification training after hire.",
    ],
    salaryNote: "Often $50,000–$80,000+ with certifications; travel assignments can pay more.",
    relatedLinks: [{ label: "Trade Passport", href: "/trade-passport" }],
  },
  {
    id: "electric-lineworker",
    title: "Electric Utility Lineworker",
    hook: "Did you know the people who restore power after storms train on a special 'pole farm' — not at a regular college?",
    category: "skilled-trades",
    isHiddenGem: true,
    whatTheyDo:
      "Install and repair power lines, transformers, and substations — often at heights. You keep electricity flowing to homes, hospitals, and factories across the Ohio Valley.",
    localDemand:
      "FirstEnergy, American Electric Power, and rural electric cooperatives serving WV and OH constantly hire lineworkers as veterans retire.",
    educationRequired:
      "Lineworker training program (1–2 years) or registered apprenticeship; CDL often required.",
    localPrograms: [
      { school: "Ohio's Electric Cooperatives", program: "Lineworker Training Program (Mt. Gilead, OH)" },
      { school: "John D. Rockefeller IV Career Center", program: "CDL Truck Driving — useful for utility fleet work" },
    ],
    internshipPath: [
      "Stay physically fit — linework is demanding and safety-focused.",
      "Earn your CDL through JDRCC's 7-week program after age 18.",
      "Contact local electric cooperatives about pre-apprenticeship opportunities.",
      "Ask the Future Center about utility career days and ride-along programs.",
    ],
    salaryNote: "Often $60,000–$90,000+ after apprenticeship; overtime during outages adds significantly.",
    relatedLinks: [{ label: "Trade Passport", href: "/trade-passport" }],
  },
  {
    id: "wind-solar-tech",
    title: "Wind & Solar Energy Technician",
    hook: "Did you know renewable energy technicians work on rooftops, hillsides, AND industrial sites — not just in deserts?",
    category: "environment",
    isHiddenGem: true,
    whatTheyDo:
      "Install, inspect, and maintain solar panels and wind turbine components. You also troubleshoot electrical systems and perform safety checks at height.",
    localDemand:
      "Solar installations are growing across WV and OH rooftops and brownfield sites. Industrial sites add wind and solar to cut energy costs.",
    educationRequired:
      "Associate degree or certificate in renewable energy technology; OSHA 10 and electrical safety training.",
    localPrograms: [
      { school: "New Castle School of Trades (New Castle, PA)", program: "Industrial Maintenance with Wind & Solar Technology" },
      { school: "Belmont College", program: "Engineering Technology — electrical foundation" },
    ],
    internshipPath: [
      "Join Madonna's Engineering Academy for electrical and robotics basics.",
      "Volunteer for school or parish energy-efficiency projects.",
      "Shadow a local solar installer through Future Center employer outreach.",
      "NCST's wind & solar track combines electrical skills with renewable systems.",
    ],
    salaryNote: "Often $45,000–$65,000+; commercial-scale projects and travel work pay more.",
    relatedLinks: [{ label: "Academies", href: "/academies" }],
  },
  {
    id: "gis-technician",
    title: "GIS / Geospatial Mapping Technician",
    hook: "Did you know counties hire people to map flood zones, property lines, and emergency routes using satellite data?",
    category: "technology",
    isHiddenGem: true,
    whatTheyDo:
      "Build digital maps using GIS software, GPS, and drone imagery. You support 911 dispatch, flood planning, utility routing, and environmental monitoring for local government and industry.",
    localDemand:
      "Hancock, Brooke, Jefferson, and Columbiana counties all use GIS for planning, emergency management, and infrastructure projects along the Ohio River.",
    educationRequired:
      "Associate or bachelor's degree in GIS, geography, or geospatial technology; GISP certification optional.",
    localPrograms: [
      { school: "West Liberty University", program: "Geography / Environmental Science — GIS coursework" },
      { school: "Youngstown State University", program: "Geography with GIS concentration" },
    ],
    internshipPath: [
      "Take computer science, geography, and math at Madonna.",
      "Explore free GIS tutorials (QGIS) through Madonna's IT Academy.",
      "Ask the Future Center about interning with a county GIS or planning department.",
      "Join a community mapping or trail-mapping service project.",
    ],
    salaryNote: "Often $40,000–$60,000+ in government; private-sector utility and engineering firms pay more.",
    relatedLinks: [
      { label: "Academies", href: "/academies" },
      { label: "College Passport", href: "/college-passport" },
    ],
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst (Critical Infrastructure)",
    hook: "Did you know hospitals and water plants need cybersecurity teams — not just IT help desks?",
    category: "technology",
    isHiddenGem: true,
    whatTheyDo:
      "Protect networks, medical devices, SCADA systems, and patient data from cyberattacks. You monitor threats, respond to incidents, and keep essential services running safely.",
    localDemand:
      "Weirton Medical, Trinity, regional manufacturers, and municipal utilities all need security-aware technologists as attacks on critical infrastructure rise.",
    educationRequired:
      "Associate or bachelor's in Cybersecurity or IT; CompTIA Security+ and related certifications.",
    localPrograms: [
      { school: "Belmont College", program: "Information Technologies" },
      { school: "West Liberty University", program: "Computer Information Systems" },
      { school: "Franciscan University of Steubenville", program: "Computer Science" },
    ],
    internshipPath: [
      "Join Madonna's IT Academy and pursue CompTIA IT Fundamentals.",
      "Compete in CyberPatriot or school cybersecurity challenges.",
      "Ask the Future Center about IT shadowing at a local hospital or manufacturer.",
      "Build a home lab project for your Career Portfolio.",
    ],
    salaryNote: "Often $55,000–$85,000+ regionally; remote work expands options.",
    relatedLinks: [
      { label: "Academies", href: "/academies" },
      { label: "Career Portfolio", href: "/career-portfolio" },
    ],
  },
  {
    id: "building-preservation-specialist",
    title: "Building Preservation & Restoration Specialist",
    hook: "Did you know there's a college program near you that teaches how to restore historic brick, stone, and timber buildings?",
    category: "skilled-trades",
    isHiddenGem: true,
    whatTheyDo:
      "Repair and restore historic structures using traditional materials and techniques — masonry, carpentry, plaster, and window restoration. You bring Ohio Valley landmarks back to life.",
    localDemand:
      "East Liverpool's pottery-era architecture, downtown Weirton, and Steubenville's historic districts need skilled craftspeople as preservation funding grows.",
    educationRequired:
      "Associate degree in Building Preservation/Restoration; apprenticeships with historic contractors.",
    localPrograms: [
      { school: "Belmont College", program: "Building Preservation/Restoration (A.A.S.) — one of few programs of its kind nationally" },
      { school: "John D. Rockefeller IV Career Center", program: "Carpentry — related construction foundation" },
    ],
    internshipPath: [
      "Take JDRCC Carpentry for hands-on building skills.",
      "Volunteer on a church, school, or community historic preservation project.",
      "Tour restored buildings in East Liverpool and Steubenville for inspiration.",
      "Apply to Belmont's unique preservation program — students come from across the country.",
    ],
    salaryNote: "Often $40,000–$60,000+; specialized historic work commands premium rates.",
    relatedLinks: [
      { label: "Trade Passport", href: "/trade-passport" },
      { label: "Community Impact", href: "/community-impact" },
    ],
  },
  {
    id: "cdl-logistics-coordinator",
    title: "Commercial Driver & Logistics Coordinator",
    hook: "Did you know the Ohio River moves more freight than most highways — and someone has to coordinate every load?",
    category: "logistics",
    isHiddenGem: false,
    whatTheyDo:
      "Drive tractor-trailers or coordinate freight movement between river ports, rail yards, and warehouses. Logistics coordinators schedule routes, track shipments, and keep supply chains moving.",
    localDemand:
      "The upper Ohio Valley is a freight crossroads. Weirton, East Liverpool, and Chester/WV river terminals depend on CDL drivers and logistics staff.",
    educationRequired:
      "CDL Class A license (7-week training) for driving; associate degree in supply chain for coordination roles.",
    localPrograms: [
      { school: "John D. Rockefeller IV Career Center", program: "CDL Truck Driving (7-week program)" },
      { school: "Belmont College", program: "Commercial Driver's License (CDL) via Truck Driving Academy" },
    ],
    internshipPath: [
      "Explore JDRCC CDL program after turning 18 — classes start every 4 weeks.",
      "Ride along with a local driver through a Future Center employer connection.",
      "Take business or computer courses if interested in the coordination side.",
      "Document logistics projects in your Career Portfolio.",
    ],
    salaryNote: "CDL drivers often $45,000–$70,000+; experienced regional drivers can exceed $80,000.",
    relatedLinks: [
      { label: "Trade Passport", href: "/trade-passport" },
      { label: "Business Partners", href: "/business-partners" },
    ],
  },
  {
    id: "river-marine-deckhand",
    title: "River Marine Deckhand & Towboat Crew",
    hook: "Did you know towboats pushing barges on the Ohio River are staffed by crews who didn't go to a four-year college?",
    category: "logistics",
    isHiddenGem: true,
    whatTheyDo:
      "Work on towboats and barges moving coal, steel, chemicals, and grain along the Ohio River. Deckhands handle lines, secure cargo, and maintain vessels; pilots navigate the river.",
    localDemand:
      "River freight is the backbone of Ohio Valley industry. Companies operating out of Chester, Wellsburg, and East Liverpool hire entry-level deckhands regularly.",
    educationRequired:
      "Merchant Mariner Credential (MMC) and towing endorsements; USCG-approved training. No college required to start as a deckhand.",
    localPrograms: [
      { school: "Seaman's Church Institute", program: "Towboat training programs (regional)" },
      { school: "John D. Rockefeller IV Career Center", program: "CDL — useful for port and yard logistics" },
    ],
    internshipPath: [
      "Talk to the Future Center about river industry career days.",
      "Visit the Ohio River near East Liverpool or Weirton and research local towing companies.",
      "Stay fit and earn safety certifications (CPR, first aid).",
      "Some companies hire entry-level deckhands at 18 and provide on-the-job USCG training.",
    ],
    salaryNote: "Deckhands often start $40,000–$50,000 with housing on board; licensed pilots earn significantly more.",
    relatedLinks: [
      { label: "Trade Passport", href: "/trade-passport" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    id: "phlebotomy-technician",
    title: "Phlebotomy Technician",
    hook: "Did you know the person drawing your blood at a lab is a certified specialist — not a nurse?",
    category: "healthcare",
    isHiddenGem: false,
    whatTheyDo:
      "Draw blood samples for lab testing, label specimens, and comfort anxious patients. You work in hospitals, outpatient labs, blood drives, and physician offices.",
    localDemand:
      "Every hospital lab and outpatient clinic in the tri-state needs phlebotomists. It's one of the fastest healthcare credentials to earn.",
    educationRequired:
      "Certificate program (often 1 semester) plus national certification (CPT).",
    localPrograms: [
      { school: "Belmont College", program: "Phlebotomy Technician certificate" },
      { school: "John D. Rockefeller IV Career Center", program: "Health Occupations — high school foundation" },
    ],
    internshipPath: [
      "Enroll in JDRCC Health Occupations during high school.",
      "Volunteer at a blood drive to observe phlebotomy in action.",
      "Apply to Belmont's phlebotomy certificate after graduation — some students start while in college.",
      "Add this credential to your Career Portfolio and Trade or College Passport.",
    ],
    salaryNote: "Often $30,000–$40,000 entry; experienced hospital phlebotomists reach $45,000+.",
    relatedLinks: [
      { label: "Trade Passport", href: "/trade-passport" },
      { label: "College Passport", href: "/college-passport" },
    ],
  },
  {
    id: "emt-paramedic",
    title: "Emergency Medical Technician (EMT)",
    hook: "Did you know EMTs are often the first healthcare professional a patient sees — and you can be certified before college?",
    category: "public-service",
    isHiddenGem: false,
    whatTheyDo:
      "Respond to 911 calls, stabilize patients, administer oxygen and basic medications, and transport people to hospitals. You work with fire departments, ambulance services, and hospitals.",
    localDemand:
      "Weirton, East Liverpool, and Steubenville ambulance services and volunteer fire departments constantly recruit EMTs and paramedics.",
    educationRequired:
      "EMT-Basic certificate (~1 semester); Paramedic associate degree for advanced practice.",
    localPrograms: [
      { school: "Belmont College", program: "Emergency Medical Services — EMT Basic and Advanced" },
      { school: "John D. Rockefeller IV Career Center", program: "Health Occupations — pre-EMS foundation" },
    ],
    internshipPath: [
      "Join a volunteer fire department or EMS squad if eligible in your community.",
      "Take JDRCC Health Occupations and maintain CPR certification.",
      "Apply to Belmont's EMT program after age 18.",
      "Use Madonna's Community Impact hours to volunteer with local emergency services.",
    ],
    salaryNote: "EMTs often $30,000–$40,000; paramedics $45,000–$60,000+ with experience.",
    relatedLinks: [
      { label: "Community Impact", href: "/community-impact" },
      { label: "Trade Passport", href: "/trade-passport" },
    ],
  },
  {
    id: "computed-tomography-tech",
    title: "Computed Tomography (CT) Technologist",
    hook: "Did you know CT techs create the 3D scans that help surgeons plan operations — and it's a specialty you add after radiology?",
    category: "healthcare",
    isHiddenGem: true,
    whatTheyDo:
      "Operate CT scanners that produce cross-sectional images of the body. You position patients, select imaging protocols, and work with radiologists to capture diagnostic-quality scans.",
    localDemand:
      "Regional hospitals invest in advanced imaging. CT techs are needed for trauma, cancer staging, and emergency diagnosis.",
    educationRequired:
      "ARRT-registered radiographer plus CT certificate (often 6–12 months).",
    localPrograms: [
      { school: "Belmont College", program: "Computed Tomography certificate (post-radiography)" },
      { school: "Belmont College", program: "Radiologic Technology (A.A.S.) — prerequisite pathway" },
    ],
    internshipPath: [
      "Start with Belmont's radiologic technology associate degree.",
      "Shadow in a hospital imaging department through the Future Center.",
      "After ARRT registration, add the CT certificate — much of Belmont's CT curriculum is online.",
      "Network with radiology mentors through Madonna's Mentor Network.",
    ],
    salaryNote: "Often $55,000–$75,000+ with radiography + CT credentials.",
    relatedLinks: [{ label: "College Passport", href: "/college-passport" }],
  },
];
