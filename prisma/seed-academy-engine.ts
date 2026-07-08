import type { PrismaClient } from "../src/generated/prisma/client";

import { seedPhase14AcademyContent } from "./seed-academy-content-phase14";
import {
  seedPhase15Batch1AcademyContent,
  seedPhase15Batch2AcademyContent,
  seedPhase15Batch3AcademyContent,
} from "./seed-academy-content-phase15";

type AcademySeed = {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  pathways: (
    | "BROADCAST_MEDIA"
    | "IT"
    | "ROBOTICS_ENGINEERING"
    | "SOFTWARE_DEVELOPMENT"
    | "DIGITAL_MARKETING"
    | "GRAPHIC_DESIGN"
    | "BUSINESS_ENTREPRENEURSHIP"
  )[];
};

export const MEN_ACADEMIES: AcademySeed[] = [
  {
    id: "academy-broadcast",
    slug: "broadcast",
    name: "Broadcast Academy",
    description: "Live production, journalism, audio mixing, and on-air workflows.",
    color: "#9B51E0",
    icon: "🎥",
    sortOrder: 1,
    pathways: ["BROADCAST_MEDIA"],
  },
  {
    id: "academy-it",
    slug: "it",
    name: "IT Academy",
    description: "Help desk, device management, Active Directory, and enterprise support.",
    color: "#2F80ED",
    icon: "💻",
    sortOrder: 2,
    pathways: ["IT", "SOFTWARE_DEVELOPMENT"],
  },
  {
    id: "academy-cricut-makers",
    slug: "cricut-makers",
    name: "Cricut & Makers Academy",
    description: "Design, cut, and produce maker projects with Cricut and fabrication tools.",
    color: "#EB5757",
    icon: "✂️",
    sortOrder: 3,
    pathways: ["GRAPHIC_DESIGN"],
  },
  {
    id: "academy-robotics",
    slug: "robotics",
    name: "Robotics Academy",
    description: "Build robots, program sensors, and compete in engineering challenges.",
    color: "#27AE60",
    icon: "🤖",
    sortOrder: 4,
    pathways: ["ROBOTICS_ENGINEERING", "SOFTWARE_DEVELOPMENT"],
  },
  {
    id: "academy-cybersecurity",
    slug: "cybersecurity",
    name: "Cybersecurity Academy",
    description: "Threat analysis, secure configurations, and defensive operations.",
    color: "#0A2342",
    icon: "🔒",
    sortOrder: 5,
    pathways: ["IT"],
  },
  {
    id: "academy-networking",
    slug: "networking",
    name: "Networking Academy",
    description: "Routing, switching, VLANs, and campus network infrastructure.",
    color: "#00B4D8",
    icon: "🌐",
    sortOrder: 6,
    pathways: ["IT"],
  },
  {
    id: "academy-graphic-design",
    slug: "graphic-design",
    name: "Graphic Design Academy",
    description: "Brand identity, layout, typography, and visual storytelling.",
    color: "#F2994A",
    icon: "🎨",
    sortOrder: 7,
    pathways: ["GRAPHIC_DESIGN", "DIGITAL_MARKETING"],
  },
  {
    id: "academy-photography",
    slug: "photography",
    name: "Photography Academy",
    description: "Composition, lighting, editing, and visual documentation.",
    color: "#6C5CE7",
    icon: "📸",
    sortOrder: 8,
    pathways: ["BROADCAST_MEDIA", "GRAPHIC_DESIGN"],
  },
  {
    id: "academy-social-media",
    slug: "social-media",
    name: "Social Media Academy",
    description: "Content strategy, analytics, and community engagement.",
    color: "#E84393",
    icon: "📱",
    sortOrder: 9,
    pathways: ["DIGITAL_MARKETING", "BROADCAST_MEDIA"],
  },
  {
    id: "academy-business-marketing",
    slug: "business-marketing",
    name: "Business & Marketing Academy",
    description: "Entrepreneurship, finance, campaigns, and venture skills.",
    color: "#D4A017",
    icon: "📊",
    sortOrder: 10,
    pathways: ["BUSINESS_ENTREPRENEURSHIP", "DIGITAL_MARKETING"],
  },
  {
    id: "academy-nutrition-services",
    slug: "nutrition-services",
    name: "Nutrition Services Academy",
    description: "Food service operations, safety, and community nutrition programs.",
    color: "#2E8B57",
    icon: "🍽",
    sortOrder: 11,
    pathways: ["BUSINESS_ENTREPRENEURSHIP"],
  },
  {
    id: "academy-athletics-operations",
    slug: "athletics-operations",
    name: "Athletics Operations Academy",
    description: "Game day operations, stats, media, and event logistics.",
    color: "#E17055",
    icon: "🏀",
    sortOrder: 12,
    pathways: ["BROADCAST_MEDIA", "BUSINESS_ENTREPRENEURSHIP"],
  },
  {
    id: "academy-theater-production",
    slug: "theater-production",
    name: "Theater Production Academy",
    description: "Stage management, lighting, sound, and live performance production.",
    color: "#8E44AD",
    icon: "🎭",
    sortOrder: 13,
    pathways: ["BROADCAST_MEDIA"],
  },
  {
    id: "academy-student-leadership",
    slug: "student-leadership",
    name: "Student Leadership Academy",
    description: "Governance, service, mentorship, and campus operations leadership.",
    color: "#2F80ED",
    icon: "🎓",
    sortOrder: 14,
    pathways: ["BUSINESS_ENTREPRENEURSHIP"],
  },
];

const LEVEL_TIERS = [
  { tier: "EXPLORER" as const, title: "Explorer", description: "Discover the academy and core concepts." },
  { tier: "FOUNDATION" as const, title: "Foundation", description: "Build fundamental skills and safety awareness." },
  { tier: "INTERMEDIATE" as const, title: "Intermediate", description: "Apply skills in guided and practice labs." },
  { tier: "ADVANCED" as const, title: "Advanced", description: "Tackle challenge and troubleshooting scenarios." },
  { tier: "PROFESSIONAL" as const, title: "Professional", description: "Demonstrate job-ready competency." },
  { tier: "COLLEGIATE" as const, title: "Collegiate", description: "Prepare for post-secondary pathways." },
  { tier: "INDUSTRY_CAPSTONE" as const, title: "Industry Capstone", description: "Complete industry-aligned capstone missions." },
];

export async function seedAcademyEngine(prisma: PrismaClient) {
  for (const academy of MEN_ACADEMIES) {
    await prisma.academy.upsert({
      where: { slug: academy.slug },
      update: {
        name: academy.name,
        description: academy.description,
        color: academy.color,
        icon: academy.icon,
        sortOrder: academy.sortOrder,
      },
      create: {
        id: academy.id,
        slug: academy.slug,
        name: academy.name,
        description: academy.description,
        color: academy.color,
        icon: academy.icon,
        sortOrder: academy.sortOrder,
      },
    });

    for (const pathway of academy.pathways) {
      await prisma.academyPathwayMapping.upsert({
        where: {
          academyId_pathway: { academyId: academy.id, pathway },
        },
        update: {},
        create: { academyId: academy.id, pathway },
      });
    }

    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      const level = LEVEL_TIERS[i];
      await prisma.academyLevel.upsert({
        where: {
          academyId_tier: { academyId: academy.id, tier: level.tier },
        },
        update: {
          title: level.title,
          description: level.description,
          sortOrder: i,
        },
        create: {
          id: `level-${academy.slug}-${level.tier.toLowerCase()}`,
          academyId: academy.id,
          tier: level.tier,
          title: level.title,
          description: level.description,
          sortOrder: i,
        },
      });
    }
  }

  await seedPhase14AcademyContent(prisma);
  await seedPhase15Batch1AcademyContent(prisma);
  await seedPhase15Batch2AcademyContent(prisma);
  await seedPhase15Batch3AcademyContent(prisma);
}
