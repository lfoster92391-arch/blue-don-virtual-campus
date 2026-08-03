import type { PrismaClient } from "../src/generated/prisma/client";

type SeedOpportunity = {
  id: string;
  title: string;
  description: string;
  type:
    | "VOLUNTEER"
    | "JOB_SHADOW"
    | "INTERNSHIP"
    | "CAREER_TALK"
    | "SERVICE"
    | "SCHOLARSHIP"
    | "WORKSHOP";
  gradeLevels?: string[];
  spots?: number;
};

type SeedPartner = {
  id: string;
  slug: string;
  name: string;
  description: string;
  partnerType: "BUSINESS" | "COMMUNITY";
  communityCategory?:
    | "HOSPITAL"
    | "POLICE"
    | "FIRE"
    | "BANK"
    | "CHURCH"
    | "MANUFACTURING"
    | "TECHNOLOGY"
    | "CONSTRUCTION";
  businessCategory?: "EMPLOYER" | "SPONSOR" | "EDUCATION" | "TECHNOLOGY" | "HEALTHCARE" | "OTHER";
  websiteUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  madonnaConnections?: string[];
  serviceAreas?: string[];
  sortOrder: number;
  opportunities?: SeedOpportunity[];
};

const COMMUNITY_PARTNERS: SeedPartner[] = [
  {
    id: "partner-weirton-medical",
    slug: "weirton-medical-center",
    name: "Weirton Medical Center",
    description:
      "Regional hospital offering health sciences shadowing, volunteer placements, and nursing career exploration for Madonna students.",
    partnerType: "COMMUNITY",
    communityCategory: "HOSPITAL",
    websiteUrl: "https://www.weirtonmedical.com",
    contactName: "Community Outreach Coordinator",
    contactEmail: "outreach@weirtonmedical.com",
    contactPhone: "(304) 797-6000",
    address: "651 Colliers Way, Weirton, WV 26062",
    madonnaConnections: [
      "Health Sciences Academy clinical shadowing",
      "NHS blood drive coordination",
      "Future Center nursing pathway tours",
    ],
    serviceAreas: [
      "Hospital greeter volunteer shifts",
      "Patient comfort kit assembly",
      "Health fair community outreach",
    ],
    sortOrder: 1,
    opportunities: [
      {
        id: "opp-wmc-shadow",
        title: "Summer Health Sciences Shadowing",
        description: "Observe nurses, lab techs, and allied health professionals during half-day rotations.",
        type: "JOB_SHADOW",
        gradeLevels: ["10", "11", "12"],
        spots: 12,
      },
      {
        id: "opp-wmc-volunteer",
        title: "Hospital Volunteer Corps",
        description: "Weekly volunteer shifts supporting patient services and community health events.",
        type: "VOLUNTEER",
        gradeLevels: ["9", "10", "11", "12"],
        spots: 20,
      },
    ],
  },
  {
    id: "partner-weirton-police",
    slug: "weirton-police-department",
    name: "Weirton Police Department",
    description:
      "Municipal law enforcement partnering on civic education, public safety career talks, and youth outreach.",
    partnerType: "COMMUNITY",
    communityCategory: "POLICE",
    contactName: "School Resource Officer Liaison",
    contactEmail: "community@weirtonpd.org",
    contactPhone: "(304) 797-3300",
    address: "200 Municipal Plaza, Weirton, WV 26062",
    madonnaConnections: [
      "Civics and government class guest speakers",
      "Criminal justice career exploration",
    ],
    serviceAreas: ["Community safety presentations", "Youth mentorship events"],
    sortOrder: 2,
    opportunities: [
      {
        id: "opp-wpd-talk",
        title: "Law Enforcement Career Talk",
        description: "Officers share pathways into policing, forensics, and public safety leadership.",
        type: "CAREER_TALK",
        gradeLevels: ["9", "10", "11", "12"],
      },
      {
        id: "opp-wpd-shadow",
        title: "Ride-Along Job Shadow",
        description: "Approved juniors and seniors shadow patrol and community policing units.",
        type: "JOB_SHADOW",
        gradeLevels: ["11", "12"],
        spots: 6,
      },
    ],
  },
  {
    id: "partner-weirton-fire",
    slug: "weirton-fire-department",
    name: "Weirton Fire Department",
    description:
      "Fire and rescue services supporting EMS career exploration, service learning, and safety education.",
    partnerType: "COMMUNITY",
    communityCategory: "FIRE",
    contactName: "Fire Prevention Officer",
    contactEmail: "prevention@weirtonfire.org",
    contactPhone: "(304) 797-3400",
    address: "100 Fire Station Rd, Weirton, WV 26062",
    madonnaConnections: ["STEM Academy emergency services unit", "Service Center safety week"],
    serviceAreas: ["Smoke detector install volunteer days", "Fire safety education for families"],
    sortOrder: 3,
    opportunities: [
      {
        id: "opp-wfd-service",
        title: "Fire Safety Community Service Day",
        description: "Students assist with smoke alarm checks and neighborhood safety outreach.",
        type: "SERVICE",
        gradeLevels: ["9", "10", "11", "12"],
        spots: 15,
      },
      {
        id: "opp-wfd-shadow",
        title: "Firefighter & EMS Job Shadow",
        description: "Tour the station, observe training, and learn about fire science careers.",
        type: "JOB_SHADOW",
        gradeLevels: ["10", "11", "12"],
        spots: 8,
      },
    ],
  },
  {
    id: "partner-wesbanco",
    slug: "wesbanco-weirton",
    name: "WesBanco — Weirton",
    description:
      "Regional bank supporting financial literacy, business pathways, and student banking education.",
    partnerType: "COMMUNITY",
    communityCategory: "BANK",
    websiteUrl: "https://www.wesbanco.com",
    contactName: "Community Banking Manager",
    contactEmail: "weirton.community@wesbanco.com",
    contactPhone: "(304) 797-2100",
    address: "3549 Main St, Weirton, WV 26062",
    madonnaConnections: [
      "Business & Marketing Academy finance workshops",
      "Future Center budgeting seminars",
    ],
    serviceAreas: ["Financial literacy tutoring for families"],
    sortOrder: 4,
    opportunities: [
      {
        id: "opp-wesbanco-workshop",
        title: "Personal Finance Workshop",
        description: "Bankers lead sessions on budgeting, credit, and saving for college.",
        type: "WORKSHOP",
        gradeLevels: ["9", "10", "11", "12"],
      },
      {
        id: "opp-wesbanco-intern",
        title: "Summer Banking Internship",
        description: "Paid summer internship exploring retail banking and financial services.",
        type: "INTERNSHIP",
        gradeLevels: ["11", "12"],
        spots: 4,
      },
    ],
  },
  {
    id: "partner-st-joseph",
    slug: "st-joseph-parish-weirton",
    name: "St. Joseph Parish",
    description:
      "Parish community partnering on faith formation, service retreats, and diocesan outreach.",
    partnerType: "COMMUNITY",
    communityCategory: "CHURCH",
    contactName: "Youth Ministry Director",
    contactEmail: "youth@stjosephweirton.org",
    contactPhone: "(304) 797-4200",
    address: "2275 Main St, Weirton, WV 26062",
    madonnaConnections: [
      "Campus Ministry service retreats",
      "Diocesan youth leadership programs",
    ],
    serviceAreas: [
      "Food pantry volunteer shifts",
      "Parish festival student crews",
      "Elder outreach visits",
    ],
    sortOrder: 5,
    opportunities: [
      {
        id: "opp-stj-volunteer",
        title: "Parish Service Corps",
        description: "Ongoing volunteer placements supporting parish outreach and food pantry.",
        type: "VOLUNTEER",
        gradeLevels: ["9", "10", "11", "12"],
      },
      {
        id: "opp-stj-service",
        title: "Retreat Service Team",
        description: "Students serve on setup, hospitality, and reflection teams for campus retreats.",
        type: "SERVICE",
        gradeLevels: ["10", "11", "12"],
        spots: 10,
      },
    ],
  },
  {
    id: "partner-arcelymittal",
    slug: "arcelormittal-weirton",
    name: "ArcelorMittal Weirton",
    description:
      "Regional manufacturer offering plant tours, skilled trades exploration, and engineering pathways.",
    partnerType: "COMMUNITY",
    communityCategory: "MANUFACTURING",
    contactName: "Workforce Development Lead",
    contactEmail: "workforce@arcelormittal.com",
    address: "Weirton, WV",
    madonnaConnections: [
      "Robotics & Engineering Academy industry capstone",
      "STEM career fairs",
    ],
    serviceAreas: ["Community STEM night demonstrations"],
    sortOrder: 6,
    opportunities: [
      {
        id: "opp-am-tour",
        title: "Manufacturing Plant Tour",
        description: "Guided tour of production lines, quality control, and automation systems.",
        type: "CAREER_TALK",
        gradeLevels: ["9", "10", "11", "12"],
        spots: 25,
      },
      {
        id: "opp-am-shadow",
        title: "Skilled Trades Job Shadow",
        description: "Shadow welders, machinists, and maintenance technicians on the floor.",
        type: "JOB_SHADOW",
        gradeLevels: ["11", "12"],
        spots: 8,
      },
    ],
  },
  {
    id: "partner-wv-northern",
    slug: "wv-northern-robotics",
    name: "WV Northern Robotics & Automation",
    description:
      "Local technology firm supporting IT internships, robotics mentorship, and coding workshops.",
    partnerType: "COMMUNITY",
    communityCategory: "TECHNOLOGY",
    websiteUrl: "https://www.wvnorthern.edu",
    contactName: "STEM Partnerships Coordinator",
    contactEmail: "stem@wvnorthern.edu",
    contactPhone: "(304) 797-3020",
    madonnaConnections: [
      "IT Academy certification support",
      "Robotics club competition mentoring",
    ],
    serviceAreas: ["Hour of Code community events"],
    sortOrder: 7,
    opportunities: [
      {
        id: "opp-wvn-intern",
        title: "IT Help Desk Internship",
        description: "Semester internship supporting campus technology and automation projects.",
        type: "INTERNSHIP",
        gradeLevels: ["11", "12"],
        spots: 3,
      },
      {
        id: "opp-wvn-workshop",
        title: "Robotics & Coding Workshop",
        description: "Hands-on workshop building and programming competition robots.",
        type: "WORKSHOP",
        gradeLevels: ["9", "10", "11", "12"],
      },
    ],
  },
  {
    id: "partner-dicarlo",
    slug: "dicarlo-construction",
    name: "DiCarlo Construction",
    description:
      "Regional builder offering construction trades exploration, site visits, and apprenticeship pathways.",
    partnerType: "COMMUNITY",
    communityCategory: "CONSTRUCTION",
    contactName: "Project Superintendent",
    contactEmail: "careers@dicarloconstruction.com",
    contactPhone: "(304) 797-5500",
    address: "Weirton, WV",
    madonnaConnections: ["Skilled trades Future Center pathway", "Campus improvement projects"],
    serviceAreas: ["Habitat for Humanity build days"],
    sortOrder: 8,
    opportunities: [
      {
        id: "opp-dc-shadow",
        title: "Construction Site Job Shadow",
        description: "Visit active job sites and learn about project management and trades careers.",
        type: "JOB_SHADOW",
        gradeLevels: ["10", "11", "12"],
        spots: 10,
      },
      {
        id: "opp-dc-service",
        title: "Community Build Service Day",
        description: "Students volunteer on local housing and community improvement builds.",
        type: "SERVICE",
        gradeLevels: ["9", "10", "11", "12"],
        spots: 20,
      },
    ],
  },
  {
    id: "partner-trinity-health",
    slug: "trinity-health-system",
    name: "Trinity Health System",
    description:
      "Regional health network partnering on clinical rotations, volunteer programs, and allied health careers.",
    partnerType: "COMMUNITY",
    communityCategory: "HOSPITAL",
    websiteUrl: "https://www.trinityhealth.com",
    contactName: "Student Programs Coordinator",
    contactEmail: "students@trinityhealth.com",
    address: "Steubenville, OH",
    madonnaConnections: ["Health Sciences Academy", "NHS service hours"],
    serviceAreas: ["Hospital volunteer program", "Wellness fair outreach"],
    sortOrder: 9,
    opportunities: [
      {
        id: "opp-trinity-volunteer",
        title: "Hospital Volunteer Program",
        description: "Structured volunteer placements across patient care support areas.",
        type: "VOLUNTEER",
        gradeLevels: ["10", "11", "12"],
        spots: 15,
      },
    ],
  },
  {
    id: "partner-hancock-sheriff",
    slug: "hancock-county-sheriff",
    name: "Hancock County Sheriff's Office",
    description:
      "County law enforcement supporting civic education, corrections career exploration, and community safety.",
    partnerType: "COMMUNITY",
    communityCategory: "POLICE",
    contactName: "Community Relations Officer",
    contactEmail: "community@hancocksheriff.org",
    contactPhone: "(304) 797-2600",
    address: "Hancock County, WV",
    madonnaConnections: ["Government & civics curriculum", "Criminal justice speakers bureau"],
    serviceAreas: ["Drug awareness education events"],
    sortOrder: 10,
    opportunities: [
      {
        id: "opp-hcs-talk",
        title: "Public Safety Career Panel",
        description: "Deputies discuss careers in patrol, corrections, and emergency dispatch.",
        type: "CAREER_TALK",
        gradeLevels: ["9", "10", "11", "12"],
      },
    ],
  },
  {
    id: "partner-pending-parish",
    slug: "holy-family-parish",
    name: "Holy Family Parish",
    description:
      "Pending community partner application — youth ministry and service retreat coordination.",
    partnerType: "COMMUNITY",
    communityCategory: "CHURCH",
    contactEmail: "youth@holyfamily.example",
    sortOrder: 99,
    opportunities: [],
  },
];

export async function seedPartners(prisma: PrismaClient): Promise<void> {
  for (const partner of COMMUNITY_PARTNERS) {
    const isPending = partner.id === "partner-pending-parish";

    await prisma.partner.upsert({
      where: { slug: partner.slug },
      update: {
        name: partner.name,
        description: partner.description,
        partnerType: partner.partnerType,
        communityCategory: partner.communityCategory ?? null,
        businessCategory: partner.businessCategory ?? null,
        status: isPending ? "PENDING" : "APPROVED",
        schoolApproved: !isPending,
        websiteUrl: partner.websiteUrl ?? null,
        contactName: partner.contactName ?? null,
        contactEmail: partner.contactEmail ?? null,
        contactPhone: partner.contactPhone ?? null,
        address: partner.address ?? null,
        madonnaConnections: partner.madonnaConnections ?? [],
        serviceAreas: partner.serviceAreas ?? [],
        sortOrder: partner.sortOrder,
      },
      create: {
        id: partner.id,
        slug: partner.slug,
        name: partner.name,
        description: partner.description,
        partnerType: partner.partnerType,
        communityCategory: partner.communityCategory ?? null,
        businessCategory: partner.businessCategory ?? null,
        status: isPending ? "PENDING" : "APPROVED",
        schoolApproved: !isPending,
        websiteUrl: partner.websiteUrl ?? null,
        contactName: partner.contactName ?? null,
        contactEmail: partner.contactEmail ?? null,
        contactPhone: partner.contactPhone ?? null,
        address: partner.address ?? null,
        madonnaConnections: partner.madonnaConnections ?? [],
        serviceAreas: partner.serviceAreas ?? [],
        sortOrder: partner.sortOrder,
      },
    });

    for (const opportunity of partner.opportunities ?? []) {
      await prisma.partnerOpportunity.upsert({
        where: { id: opportunity.id },
        update: {
          partnerId: partner.id,
          title: opportunity.title,
          description: opportunity.description,
          type: opportunity.type,
          status: isPending ? "PENDING" : "PUBLISHED",
          gradeLevels: opportunity.gradeLevels ?? [],
          spots: opportunity.spots ?? null,
        },
        create: {
          id: opportunity.id,
          partnerId: partner.id,
          title: opportunity.title,
          description: opportunity.description,
          type: opportunity.type,
          status: isPending ? "PENDING" : "PUBLISHED",
          gradeLevels: opportunity.gradeLevels ?? [],
          spots: opportunity.spots ?? null,
        },
      });
    }
  }

  console.log(
    `Seeded ${COMMUNITY_PARTNERS.length} community partners (1 pending for admin review).`,
  );
}
