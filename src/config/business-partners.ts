/**
 * W13 · Business Partners — local employer profiles for the Ohio Valley.
 */

export type BusinessPartnerEmployee = {
  name: string;
  title: string;
};

export type BusinessPartnerAlumni = {
  alumniName: string;
  graduationYear?: number;
  role?: string;
};

export type BusinessPartnerOpportunitySeed = {
  type: "INTERNSHIP" | "JOB_SHADOW" | "HIRING" | "CAREER_INFO";
  title: string;
  description: string;
  isActive?: boolean;
};

export type BusinessPartnerSeed = {
  slug: string;
  name: string;
  description: string;
  logoUrl?: string;
  website?: string;
  industry: string;
  address?: string;
  status: "PENDING" | "APPROVED";
  careerInfo?: string;
  employees?: BusinessPartnerEmployee[];
  alumni?: BusinessPartnerAlumni[];
  opportunities: BusinessPartnerOpportunitySeed[];
};

export const BUSINESS_PARTNER_SEEDS: BusinessPartnerSeed[] = [
  {
    slug: "dans-plumbing",
    name: "Dan's Plumbing",
    description:
      "Family-owned plumbing and HVAC company serving Weirton, Steubenville, and the Northern Panhandle since 1987. Madonna students have interned here for over a decade.",
    industry: "Plumbing & HVAC",
    address: "412 Main Street, Weirton, WV 26062",
    website: "https://example.com/dans-plumbing",
    status: "APPROVED",
    careerInfo:
      "Licensed plumbers and HVAC technicians are in high demand across the Ohio Valley. Entry paths include apprenticeship programs, trade school certifications, and on-the-job training. Dan's Plumbing sponsors Journeyman exam prep and offers tuition reimbursement for related coursework.",
    employees: [
      { name: "Dan Marovich", title: "Owner & Master Plumber" },
      { name: "Mike Torres", title: "Lead HVAC Technician" },
      { name: "Sarah Kline", title: "Office Manager & Dispatcher" },
      { name: "Jake Harmon", title: "Apprentice Plumber" },
    ],
    alumni: [
      { alumniName: "Chris Benedetti", graduationYear: 2019, role: "Journeyman Plumber" },
      { alumniName: "Maria Lopez", graduationYear: 2021, role: "HVAC Installer" },
      { alumniName: "Tyler Dunn", graduationYear: 2023, role: "Apprentice" },
    ],
    opportunities: [
      {
        type: "INTERNSHIP",
        title: "Summer Plumbing Internship",
        description:
          "Paid summer position for juniors and seniors. Shadow crews on residential and commercial jobs, learn tool safety, and assist with inventory.",
      },
      {
        type: "JOB_SHADOW",
        title: "Day on the Job — Plumbing & HVAC",
        description:
          "Half-day shadow experience available monthly. Ride along with a technician, tour the shop, and meet the team.",
      },
      {
        type: "HIRING",
        title: "Apprentice Plumber — Fall 2026",
        description:
          "Entry-level apprentice opening. Must be 18+ or turning 18 during senior year. Valid driver's license preferred.",
      },
      {
        type: "CAREER_INFO",
        title: "Trade Careers in the Trades",
        description:
          "Annual classroom visit each March covering licensing, wages, benefits, and apprenticeship pathways in plumbing and HVAC.",
      },
    ],
  },
  {
    slug: "hancock-regional-medical",
    name: "Hancock Regional Medical Center",
    description:
      "Regional hospital in Weirton providing acute care, imaging, and outpatient services. Strong partner for health sciences academy students.",
    industry: "Healthcare",
    address: "651 Colliers Way, Weirton, WV 26062",
    website: "https://example.com/hancock-regional",
    status: "APPROVED",
    careerInfo:
      "Healthcare careers span clinical roles (nursing, radiology, lab tech), support services, and administration. Most clinical paths require certifications or degrees; HRMC offers shadowing to help students choose the right track.",
    employees: [
      { name: "Dr. Patricia Nguyen", title: "Chief of Staff" },
      { name: "Rachel Morris, RN", title: "Nurse Manager — Med/Surg" },
      { name: "James Okafor", title: "Radiology Technologist" },
    ],
    alumni: [
      { alumniName: "Emily Carter", graduationYear: 2018, role: "Registered Nurse" },
      { alumniName: "David Wu", graduationYear: 2020, role: "Phlebotomist" },
    ],
    opportunities: [
      {
        type: "INTERNSHIP",
        title: "Health Sciences Summer Intern",
        description: "Rotate through nursing, lab, and patient services. Open to seniors in the Health Sciences pathway.",
      },
      {
        type: "JOB_SHADOW",
        title: "Clinical Shadow Day",
        description: "Observe nurses, therapists, or imaging staff for a 4-hour block. Parent permission required.",
      },
      {
        type: "HIRING",
        title: "Patient Transport Aide (Part-Time)",
        description: "Evening and weekend shifts for students 17+. Great first healthcare job.",
      },
      {
        type: "CAREER_INFO",
        title: "Healthcare Career Panel",
        description: "Quarterly panel with clinicians on education paths, scholarships, and day-in-the-life stories.",
      },
    ],
  },
  {
    slug: "tri-state-manufacturing",
    name: "Tri-State Manufacturing Co.",
    description:
      "Precision metal fabrication and CNC machining for automotive and energy clients along the Ohio River corridor.",
    industry: "Manufacturing",
    address: "1800 Industrial Park Drive, Weirton, WV 26062",
    status: "APPROVED",
    careerInfo:
      "Modern manufacturing blends skilled trades with robotics and CAD. Machinists, welders, quality inspectors, and production planners are all in demand. Tri-State partners with local career centers for co-op credit.",
    employees: [
      { name: "Robert Haines", title: "Plant Manager" },
      { name: "Linda Petrov", title: "CNC Programmer" },
      { name: "Marcus Bell", title: "Quality Control Lead" },
    ],
    alumni: [
      { alumniName: "Anthony Russo", graduationYear: 2017, role: "CNC Operator" },
    ],
    opportunities: [
      {
        type: "INTERNSHIP",
        title: "Manufacturing Co-op",
        description: "Semester-long co-op for seniors. Learn CNC basics, safety protocols, and lean production.",
      },
      {
        type: "JOB_SHADOW",
        title: "Factory Floor Tour",
        description: "Guided tour of machining, welding, and assembly lines. Available for academy field trips.",
      },
      {
        type: "HIRING",
        title: "Machine Shop Helper",
        description: "Part-time helper role — material handling and cleanup. Training provided.",
      },
      {
        type: "CAREER_INFO",
        title: "Skilled Trades in Manufacturing",
        description: "Presentation on wages, union pathways, and certifications available through WV workforce programs.",
      },
    ],
  },
  {
    slug: "ohio-valley-bank",
    name: "Ohio Valley Bank",
    description:
      "Community bank with branches in Weirton, Follansbee, and Wellsburg. Supports financial literacy programs at local schools.",
    industry: "Finance & Banking",
    address: "345 Three Springs Drive, Weirton, WV 26062",
    website: "https://example.com/ohio-valley-bank",
    status: "APPROVED",
    careerInfo:
      "Banking careers include tellers, loan officers, financial advisors, IT, and compliance. Many entry roles require a high school diploma and on-the-job training; business and finance coursework is a plus.",
    employees: [
      { name: "Susan Whitfield", title: "Branch Manager" },
      { name: "Kevin Patel", title: "Commercial Loan Officer" },
      { name: "Grace Kim", title: "Personal Banker" },
    ],
    alumni: [
      { alumniName: "Jordan Ellis", graduationYear: 2022, role: "Teller" },
    ],
    opportunities: [
      {
        type: "INTERNSHIP",
        title: "Summer Banking Intern",
        description: "Rotate through teller line, lending, and marketing. Business academy students preferred.",
      },
      {
        type: "JOB_SHADOW",
        title: "A Day in Community Banking",
        description: "Shadow a personal banker or loan officer. Includes a mock budgeting workshop.",
      },
      {
        type: "CAREER_INFO",
        title: "Financial Literacy Workshop",
        description: "Free workshops for Madonna students on budgeting, credit, and career paths in finance.",
      },
    ],
  },
  {
    slug: "franks-auto-diesel",
    name: "Frank's Auto & Diesel",
    description:
      "Full-service auto repair and diesel truck maintenance serving the tri-state area. Known for hiring motivated student techs.",
    industry: "Automotive",
    address: "2299 Pennsylvania Avenue, Weirton, WV 26062",
    status: "APPROVED",
    careerInfo:
      "Automotive technicians diagnose and repair vehicles using computerized equipment. ASE certifications, trade school, and dealership training programs are common pathways. Diesel specialists earn premium wages.",
    employees: [
      { name: "Frank DiMarco", title: "Owner & Master Technician" },
      { name: "Devon Price", title: "Diesel Specialist" },
      { name: "Alyssa Grant", title: "Service Advisor" },
    ],
    alumni: [
      { alumniName: "Nick Santoro", graduationYear: 2016, role: "Lead Technician" },
      { alumniName: "Hannah Reed", graduationYear: 2024, role: "Lube Tech" },
    ],
    opportunities: [
      {
        type: "INTERNSHIP",
        title: "Auto Tech Internship",
        description: "Assist technicians with oil changes, tire service, and diagnostics. Safety gear provided.",
      },
      {
        type: "JOB_SHADOW",
        title: "Shop Shadow Experience",
        description: "Spend a morning in the service bay learning tool use and shop safety.",
      },
      {
        type: "HIRING",
        title: "Lube Technician — Immediate",
        description: "Entry-level lube tech. Will train. Flexible hours for students.",
      },
    ],
  },
  {
    slug: "valley-creative-agency",
    name: "Valley Creative Agency",
    description:
      "Digital marketing and design studio working with local businesses across the Northern Panhandle.",
    industry: "Marketing & Design",
    address: "88 Market Street, Steubenville, OH 43952",
    website: "https://example.com/valley-creative",
    status: "PENDING",
    careerInfo:
      "Creative careers in graphic design, social media, web development, and content strategy. Portfolio and internship experience matter more than a four-year degree for many entry roles.",
    employees: [
      { name: "Megan Foster", title: "Creative Director" },
      { name: "Isaiah Brooks", title: "Web Developer" },
    ],
    opportunities: [
      {
        type: "INTERNSHIP",
        title: "Social Media Intern",
        description: "Help manage client accounts and create content. Business & Marketing academy students welcome.",
      },
      {
        type: "CAREER_INFO",
        title: "Creative Careers Info Session",
        description: "Pending approval — info session on freelancing, agency life, and building a portfolio.",
      },
    ],
  },
];

export const OPPORTUNITY_TYPE_LABELS: Record<
  BusinessPartnerOpportunitySeed["type"],
  string
> = {
  INTERNSHIP: "Internships",
  JOB_SHADOW: "Job Shadowing",
  HIRING: "Hiring Needs",
  CAREER_INFO: "Career Information",
};
