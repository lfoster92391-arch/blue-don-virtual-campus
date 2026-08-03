/**
 * Opportunity Center — real-world experience catalog (config-driven MVP).
 *
 * These are actionable opportunities Madonna students can pursue *right now* —
 * internships, jobs, volunteer gigs, job shadows, and summer programs across the
 * Ohio Valley (Weirton, WV 26062 · Steubenville, OH 43952 and surrounding towns).
 *
 * IMPORTANT: This is seed/config content that stands in for a partner- and
 * counselor-managed source. When clean slate is on the Opportunity Center shows
 * this list as a clearly-marked SAMPLE preview so staff can review the structure
 * and replace entries with the school's real opportunities. See
 * `src/services/opportunity-service.ts`.
 */

export type OpportunityType =
  | "internship"
  | "job"
  | "volunteer"
  | "shadowing"
  | "summer"
  | "fellowship";

export type OpportunityPay = "paid" | "stipend" | "unpaid";

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  /** Human location label, e.g. "Weirton, WV". */
  location: string;
  /** Short pay label shown on the card, e.g. "$14/hr" or "Volunteer". */
  pay: OpportunityPay;
  payLabel: string;
  /** ISO date (YYYY-MM-DD). Use "rolling" when there is no fixed deadline. */
  deadline: string;
  /** Time commitment summary, e.g. "Summer · 20 hrs/week". */
  commitment: string;
  /** Earliest grade appropriate for the opportunity. */
  gradeMin: number;
  description: string;
  /** What the student would actually do. */
  responsibilities: string[];
  /** What's expected / needed to be eligible. */
  requirements: string[];
  /** Plain-language next steps to pursue it. */
  howToApply: string;
  /** Future Center / partner contact for follow-up. */
  contact?: { name: string; email?: string };
  /** External application or info link (optional). */
  externalUrl?: string;
  /** Free-form tags for search + related pathways. */
  tags: string[];
};

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  internship: "Internship",
  job: "Job",
  volunteer: "Volunteer",
  shadowing: "Job Shadow",
  summer: "Summer Program",
  fellowship: "Program / Fellowship",
};

export const OPPORTUNITY_TYPE_ORDER: OpportunityType[] = [
  "internship",
  "job",
  "volunteer",
  "shadowing",
  "summer",
  "fellowship",
];

export const OPPORTUNITY_PAY_LABELS: Record<OpportunityPay, string> = {
  paid: "Paid",
  stipend: "Stipend",
  unpaid: "Volunteer / Unpaid",
};

/**
 * Ohio Valley opportunity catalog. Employers, nonprofits, hospitals, city
 * programs, and colleges local to Madonna High School students. Sized and
 * described for high-school-age participation.
 */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "weirton-medical-health-shadow",
    title: "Health Careers Job Shadow",
    organization: "Weirton Medical Center",
    type: "shadowing",
    location: "Weirton, WV",
    pay: "unpaid",
    payLabel: "Volunteer",
    deadline: "rolling",
    commitment: "1–2 half-days · scheduled",
    gradeMin: 10,
    description:
      "Spend a day alongside nurses, techs, and allied health staff to see what a career in medicine really looks like. Great first step for future nurses, CNAs, and health-science students.",
    responsibilities: [
      "Shadow staff on a hospital unit (non-clinical observation)",
      "Ask questions about training, certifications, and day-to-day work",
      "Complete a short reflection for your Career Portfolio",
    ],
    requirements: [
      "Grade 10+ in good standing",
      "Signed parent/guardian and school permission form",
      "Professional dress and punctuality",
    ],
    howToApply:
      "Ask the Future Center to arrange a shadow date. Health-science pathway students get priority scheduling.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["healthcare", "nursing", "medical", "science", "shadow"],
  },
  {
    id: "cleveland-cliffs-manufacturing-intern",
    title: "Manufacturing & Engineering Summer Intern",
    organization: "Cleveland-Cliffs Weirton",
    type: "internship",
    location: "Weirton, WV",
    pay: "paid",
    payLabel: "$15–$18/hr",
    deadline: "2026-04-01",
    commitment: "Summer · up to 30 hrs/week",
    gradeMin: 11,
    description:
      "Paid summer internship exploring modern steel and advanced manufacturing — safety, quality, maintenance, and engineering support. Built for juniors and seniors curious about the trades and engineering.",
    responsibilities: [
      "Rotate through operations, safety, and engineering support teams",
      "Learn industrial safety and quality basics",
      "Complete a capstone project presented to the site team",
    ],
    requirements: [
      "Grade 11+ (16 or older by start date)",
      "Interest in manufacturing, engineering, or skilled trades",
      "Reliable transportation and steel-toe boots (provided if needed)",
    ],
    howToApply:
      "Apply through the Future Center by the spring deadline. A resume from your Career Portfolio is required.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["manufacturing", "engineering", "trades", "steel", "stem", "paid"],
  },
  {
    id: "trinity-health-patient-volunteer",
    title: "Patient Care Volunteer",
    organization: "Trinity Health System",
    type: "volunteer",
    location: "Steubenville, OH",
    pay: "unpaid",
    payLabel: "Volunteer",
    deadline: "rolling",
    commitment: "3–4 hrs/week · school year or summer",
    gradeMin: 10,
    description:
      "Support patients and families at the front desk, gift shop, and visitor services. Earn verified service hours while exploring a hospital environment.",
    responsibilities: [
      "Greet and guide visitors",
      "Deliver flowers, mail, and comfort items to rooms",
      "Assist staff with non-clinical tasks",
    ],
    requirements: [
      "Grade 10+",
      "Complete volunteer orientation and health screening",
      "Dependable weekly schedule",
    ],
    howToApply:
      "Sign up through the Service Center; hours count toward your Madonna service record.",
    contact: { name: "Service Center", email: "ministry@madonnahs.org" },
    tags: ["healthcare", "service", "volunteer", "hospital"],
  },
  {
    id: "franciscan-precollege-summer",
    title: "Pre-College Summer Institute",
    organization: "Franciscan University of Steubenville",
    type: "summer",
    location: "Steubenville, OH",
    pay: "unpaid",
    payLabel: "Tuition (aid available)",
    deadline: "2026-05-15",
    commitment: "1–2 week residential session",
    gradeMin: 11,
    description:
      "Experience college life on a Catholic campus — take real coursework, live in a dorm, and earn a taste of credit. Strong fit for students discerning college and faith.",
    responsibilities: [
      "Attend college-level sessions in a chosen track",
      "Participate in campus and faith-life activities",
      "Build a college-ready sample of your work",
    ],
    requirements: [
      "Grade 11+ with solid academic standing",
      "Application and short essay",
      "Financial aid available — ask the Future Center",
    ],
    howToApply:
      "Apply on the university site, then log it in your College Passport so counselors can support you.",
    externalUrl: "https://franciscan.edu",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["college", "summer", "faith", "academic", "residential"],
  },
  {
    id: "weirton-parks-rec-camp-counselor",
    title: "Summer Camp Counselor",
    organization: "City of Weirton Parks & Recreation",
    type: "job",
    location: "Weirton, WV",
    pay: "paid",
    payLabel: "$11–$13/hr",
    deadline: "2026-04-30",
    commitment: "Summer · Mon–Fri daytime",
    gradeMin: 11,
    description:
      "Lead games, crafts, and activities for elementary campers at city parks. A paid summer job that builds leadership, patience, and responsibility.",
    responsibilities: [
      "Supervise and encourage groups of young campers",
      "Run daily activities and field trips",
      "Model safety and good sportsmanship",
    ],
    requirements: [
      "Grade 11+ (must be 16+)",
      "Comfortable working with children",
      "Background check (handled by the city)",
    ],
    howToApply:
      "Apply at the Weirton Parks & Rec office in the spring. Bring a resume from your Career Portfolio.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["job", "leadership", "children", "recreation", "paid", "summer"],
  },
  {
    id: "jdrcc-trades-exploration",
    title: "Skilled Trades Exploration Day",
    organization: "John D. Rockefeller IV Career Center",
    type: "shadowing",
    location: "New Cumberland, WV",
    pay: "unpaid",
    payLabel: "Free",
    deadline: "rolling",
    commitment: "1 day · hands-on",
    gradeMin: 9,
    description:
      "Try welding, HVAC, cosmetology, culinary, automotive, and more in real career-center labs. See which trades spark your interest before committing to a pathway.",
    responsibilities: [
      "Rotate through hands-on trade stations",
      "Talk with instructors and current students",
      "Reflect on which pathways fit you",
    ],
    requirements: ["Grade 9+", "Closed-toe shoes", "Permission form on file"],
    howToApply: "Reserve a spot through the Future Center on the next exploration day.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["trades", "welding", "hvac", "culinary", "automotive", "hands-on"],
  },
  {
    id: "kroger-part-time-associate",
    title: "Part-Time Store Associate",
    organization: "Kroger — Weirton",
    type: "job",
    location: "Weirton, WV",
    pay: "paid",
    payLabel: "$12+/hr",
    deadline: "rolling",
    commitment: "After school & weekends · 10–20 hrs/week",
    gradeMin: 10,
    description:
      "A dependable first job — cashier, bagging, stocking, and customer service. Flexible hours that work around school and activities.",
    responsibilities: [
      "Help customers and run a register",
      "Stock shelves and keep the store tidy",
      "Learn workplace basics: reliability, teamwork, service",
    ],
    requirements: [
      "Grade 10+ (must be 16+ for most roles; 14–15 with work permit)",
      "Friendly, dependable attitude",
      "Work permit if under 16 (Future Center helps)",
    ],
    howToApply:
      "Apply online, then ask the Future Center about a work permit and interview prep.",
    externalUrl: "https://jobs.kroger.com",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["job", "retail", "customer-service", "first-job", "paid"],
  },
  {
    id: "steubenville-library-teen-volunteer",
    title: "Teen Library Volunteer",
    organization: "Public Library of Steubenville & Jefferson County",
    type: "volunteer",
    location: "Steubenville, OH",
    pay: "unpaid",
    payLabel: "Volunteer",
    deadline: "rolling",
    commitment: "2–3 hrs/week",
    gradeMin: 9,
    description:
      "Help run summer reading, shelve books, and assist with kids' programs. Easy, flexible service hours close to home.",
    responsibilities: [
      "Assist with children's and teen programs",
      "Shelve and organize materials",
      "Help patrons find resources",
    ],
    requirements: ["Grade 9+", "Reliable and organized", "Brief volunteer application"],
    howToApply: "Sign up at the library or through the Service Center.",
    contact: { name: "Service Center", email: "ministry@madonnahs.org" },
    tags: ["volunteer", "library", "literacy", "service"],
  },
  {
    id: "wvncc-stem-summer-camp",
    title: "STEM & Robotics Summer Camp",
    organization: "West Virginia Northern Community College",
    type: "summer",
    location: "Weirton, WV",
    pay: "unpaid",
    payLabel: "Low-cost (aid available)",
    deadline: "2026-06-01",
    commitment: "1 week · daytime",
    gradeMin: 9,
    description:
      "Build robots, code, and explore engineering and cybersecurity on a real college campus. A fun, low-pressure way to test-drive a STEM future.",
    responsibilities: [
      "Complete hands-on STEM projects",
      "Work in teams on a build challenge",
      "Meet college instructors and tour labs",
    ],
    requirements: ["Grade 9+", "Interest in tech, science, or building things", "Registration form"],
    howToApply:
      "Register through WVNCC and note it in your College Passport. Ask about fee waivers.",
    externalUrl: "https://www.wvncc.edu",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["stem", "robotics", "coding", "cybersecurity", "college", "summer"],
  },
  {
    id: "chamber-marketing-intern",
    title: "Marketing & Events Intern",
    organization: "Weirton Area Chamber of Commerce",
    type: "internship",
    location: "Weirton, WV",
    pay: "stipend",
    payLabel: "Stipend",
    deadline: "2026-05-01",
    commitment: "Summer · 10–15 hrs/week",
    gradeMin: 11,
    description:
      "Help promote local businesses and community events — social media, flyers, and event support. Perfect for students exploring business, marketing, or communications.",
    responsibilities: [
      "Draft social posts and simple graphics",
      "Support setup and check-in at community events",
      "Help with light office and outreach tasks",
    ],
    requirements: [
      "Grade 11+",
      "Comfortable with social media and basic design tools",
      "Sample of creative work (from Portfolio) a plus",
    ],
    howToApply: "Submit interest through the Future Center with a link to your Portfolio.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["business", "marketing", "communications", "events", "internship"],
  },
  {
    id: "mountaineer-food-pantry-volunteer",
    title: "Community Food Pantry Volunteer",
    organization: "Weirton Christian Center Food Pantry",
    type: "volunteer",
    location: "Weirton, WV",
    pay: "unpaid",
    payLabel: "Volunteer",
    deadline: "rolling",
    commitment: "Flexible · weekends & drives",
    gradeMin: 9,
    description:
      "Sort, pack, and distribute food to neighbors in need. A hands-on way to live Madonna's mission of service — great for groups and clubs, too.",
    responsibilities: [
      "Sort and pack food donations",
      "Help distribute to families",
      "Support seasonal food drives",
    ],
    requirements: ["Grade 9+", "Willing to lift light boxes", "Team-friendly attitude"],
    howToApply: "Join a service day through the Service Center or Campus Ministry.",
    contact: { name: "Campus Ministry", email: "ministry@madonnahs.org" },
    tags: ["volunteer", "service", "faith", "community", "hunger"],
  },
  {
    id: "hancock-sheriff-explorer",
    title: "Law Enforcement Explorer Program",
    organization: "Hancock County Sheriff's Office",
    type: "fellowship",
    location: "New Cumberland, WV",
    pay: "unpaid",
    payLabel: "Free program",
    deadline: "rolling",
    commitment: "Monthly meetings · school year",
    gradeMin: 10,
    description:
      "Explore careers in law enforcement, criminal justice, and public safety through ride-alongs, training demos, and mentorship from real deputies.",
    responsibilities: [
      "Attend Explorer meetings and demos",
      "Learn about public safety careers and training",
      "Participate in community-safety events",
    ],
    requirements: [
      "Grade 10+ in good standing",
      "Clean disciplinary record",
      "Parent/guardian permission",
    ],
    howToApply: "Express interest through the Future Center to be connected with the program lead.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["law-enforcement", "criminal-justice", "public-safety", "mentorship"],
  },
  {
    id: "wvu-medicine-cna-pathway",
    title: "CNA Certification Pathway (Info Session)",
    organization: "WVU Medicine — Reynolds Memorial",
    type: "fellowship",
    location: "Glen Dale, WV",
    pay: "unpaid",
    payLabel: "Free info session",
    deadline: "rolling",
    commitment: "Info session + pathway planning",
    gradeMin: 11,
    description:
      "Learn how to become a Certified Nursing Assistant while still in high school — a real, paid healthcare credential and a launchpad toward nursing.",
    responsibilities: [
      "Attend an info session on CNA training",
      "Map prerequisites with a counselor",
      "Plan a route to certification after graduation",
    ],
    requirements: ["Grade 11+", "Interest in healthcare", "Health-science coursework a plus"],
    howToApply: "Ask the Future Center to add you to the next CNA pathway info session.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["healthcare", "nursing", "cna", "certification", "pathway"],
  },
  {
    id: "undos-restaurant-host",
    title: "Host / Server Assistant",
    organization: "Undo's Restaurant",
    type: "job",
    location: "Weirton, WV",
    pay: "paid",
    payLabel: "$10/hr + tips",
    deadline: "rolling",
    commitment: "Evenings & weekends · 10–15 hrs/week",
    gradeMin: 10,
    description:
      "A friendly local first job in hospitality — greet guests, seat tables, and support servers. Build customer-service skills and earn tips.",
    responsibilities: [
      "Welcome and seat guests",
      "Reset tables and support servers",
      "Keep the front of house tidy and welcoming",
    ],
    requirements: [
      "Grade 10+ (14+ with work permit)",
      "Friendly, upbeat attitude",
      "Weekend availability",
    ],
    howToApply: "Apply in person; the Future Center can help with a work permit and interview prep.",
    contact: { name: "Future Center", email: "guidance@madonnahs.org" },
    tags: ["job", "hospitality", "customer-service", "first-job", "paid"],
  },
];

export function getOpportunityById(id: string): Opportunity | undefined {
  return OPPORTUNITIES.find((opportunity) => opportunity.id === id);
}

export function isOpportunityDeadlinePassed(deadline: string): boolean {
  if (deadline === "rolling") {
    return false;
  }
  const date = new Date(`${deadline}T23:59:59`);
  return Number.isFinite(date.getTime()) && date.getTime() < Date.now();
}

export function formatOpportunityDeadline(deadline: string): string {
  if (deadline === "rolling") {
    return "Rolling — apply anytime";
  }
  const date = new Date(`${deadline}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
