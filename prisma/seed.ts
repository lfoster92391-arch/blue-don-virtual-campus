import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { MEN_ACADEMIES, seedAcademyEngine } from "./seed-academy-engine";
import { seedPhase16Organizations } from "./seed-phase16";

const ACADEMIES = MEN_ACADEMIES;

const FORM_TEMPLATES = [
  {
    id: "form-enrollment-packet",
    title: "Enrollment Packet",
    type: "ENROLLMENT_PACKET" as const,
    status: "DRAFT" as const,
    description: "Complete enrollment documentation for new program participants.",
    content:
      "By submitting this enrollment packet, the student and family confirm program interest and provide required onboarding information.",
    approvalRequired: true,
    approvalType: "JOIN_ACADEMY" as const,
  },
  {
    id: "form-student-agreement",
    title: "Student Agreement",
    type: "STUDENT_AGREEMENT" as const,
    status: "PUBLISHED" as const,
    description: "Core participation standards for Blue Don students.",
    content:
      "I agree to represent Madonna High School with integrity, attend scheduled academy activities, and follow campus technology and conduct policies.",
    approvalRequired: false,
  },
  {
    id: "form-parent-agreement",
    title: "Parent Agreement",
    type: "PARENT_AGREEMENT" as const,
    status: "PUBLISHED" as const,
    description: "Parent/guardian acknowledgment of program expectations.",
    content:
      "As parent or guardian, I support my student's participation in Blue Don Virtual Campus and agree to communicate with advisors regarding attendance and conduct.",
    approvalRequired: false,
  },
  {
    id: "form-participation-commitment",
    title: "Participation Commitment",
    type: "PARTICIPATION_COMMITMENT" as const,
    status: "DRAFT" as const,
    description: "Commitment to academy attendance and project completion.",
    content:
      "I commit to active participation in my academy pathway, including events, assignments, and community expectations.",
    approvalRequired: true,
    approvalType: "JOIN_ACADEMY" as const,
  },
  {
    id: "form-media-release",
    title: "Media Release",
    type: "MEDIA_RELEASE" as const,
    status: "PUBLISHED" as const,
    description: "Permission to use photos, video, and student work in campus media.",
    content:
      "I grant Madonna High School and Blue Don Virtual Campus permission to use my name, image, likeness, and project work for educational and promotional purposes.",
    approvalRequired: false,
  },
  {
    id: "form-technology-agreement",
    title: "Technology Agreement",
    type: "TECHNOLOGY_AGREEMENT" as const,
    status: "DRAFT" as const,
    description: "Acceptable use of campus devices, accounts, and lab resources.",
    content:
      "I will use campus technology responsibly, protect login credentials, and report security concerns to an advisor.",
    approvalRequired: false,
  },
  {
    id: "form-event-registration",
    title: "Event Registration",
    type: "EVENT_REGISTRATION" as const,
    status: "DRAFT" as const,
    description: "Register for campus or academy events.",
    content: "I register for the selected campus event and agree to follow event safety guidelines.",
    approvalRequired: true,
    approvalType: "EVENT" as const,
  },
  {
    id: "form-volunteer",
    title: "Volunteer Form",
    type: "VOLUNTEER_FORM" as const,
    status: "DRAFT" as const,
    description: "Volunteer interest and availability for campus service.",
    content:
      "I volunteer to support Blue Don campus activities and understand service hours may be tracked for portfolio records.",
    approvalRequired: true,
    approvalType: "EVENT" as const,
  },
  {
    id: "form-sponsor-packet",
    title: "Sponsor Packet",
    type: "SPONSOR_PACKET" as const,
    status: "DRAFT" as const,
    description: "Sponsor onboarding and stewardship acknowledgment.",
    content:
      "Sponsor acknowledges campus partnership terms. Full sponsor workflows expand in Phase 13.",
    approvalRequired: true,
    approvalType: "SPONSOR" as const,
  },
  {
    id: "form-purchase-request",
    title: "Purchase Request",
    type: "PURCHASE_REQUEST" as const,
    status: "DRAFT" as const,
    description: "Request approval for academy or event purchases.",
    content:
      "I request purchase approval and confirm the item supports an approved campus or academy activity.",
    approvalRequired: true,
    approvalType: "PURCHASE" as const,
  },
  {
    id: "form-travel-approval",
    title: "Travel Approval",
    type: "TRAVEL_APPROVAL" as const,
    status: "DRAFT" as const,
    description: "Off-campus travel and field experience authorization.",
    content:
      "I request travel approval and agree to follow chaperone instructions and school travel policies.",
    approvalRequired: true,
    approvalType: "TRAVEL" as const,
  },
  {
    id: "form-risk-acknowledgement",
    title: "Risk Acknowledgement",
    type: "RISK_ACKNOWLEDGEMENT" as const,
    status: "DRAFT" as const,
    description: "Acknowledge activity-specific risks for labs and events.",
    content:
      "I understand the risks associated with selected campus activities and agree to follow safety briefings.",
    approvalRequired: true,
    approvalType: "EVENT" as const,
  },
  {
    id: "form-equipment-checkout",
    title: "Equipment Checkout",
    type: "EQUIPMENT_CHECKOUT" as const,
    status: "DRAFT" as const,
    description: "Checkout campus equipment with return accountability.",
    content:
      "I accept responsibility for checked-out equipment and agree to return it by the stated deadline.",
    approvalRequired: true,
    approvalType: "PURCHASE" as const,
  },
] as const;

async function main() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/blue_don_virtual_campus";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.school.upsert({
      where: { id: "madonna-high-school" },
      update: {},
      create: {
        id: "madonna-high-school",
        name: "Madonna High School",
      },
    });

    for (const academy of ACADEMIES) {
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
    }

    await seedAcademyEngine(prisma);

    await seedPhase16Organizations(prisma);

    for (const template of FORM_TEMPLATES) {
      await prisma.form.upsert({
        where: { id: template.id },
        update: {
          title: template.title,
          description: template.description,
          content: template.content,
          status: template.status,
          approvalRequired: template.approvalRequired,
          approvalType: "approvalType" in template ? template.approvalType : null,
        },
        create: {
          id: template.id,
          title: template.title,
          type: template.type,
          status: template.status,
          description: template.description,
          content: template.content,
          approvalRequired: template.approvalRequired,
          approvalType: "approvalType" in template ? template.approvalType : null,
        },
      });
    }

    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (adminUser) {
      await prisma.knowledgeArticle.upsert({
        where: { slug: "welcome-to-blue-don" },
        update: {
          title: "Welcome to Blue Don Virtual Campus",
          content:
            "Blue Don Virtual Campus is Madonna High School's student experience platform. Use the dashboard for daily activity, join an academy pathway, complete forms, and track your portfolio.",
          category: "Onboarding",
          tags: ["onboarding", "campus"],
          status: "PUBLISHED",
        },
        create: {
          id: "kb-welcome",
          title: "Welcome to Blue Don Virtual Campus",
          slug: "welcome-to-blue-don",
          content:
            "Blue Don Virtual Campus is Madonna High School's student experience platform. Use the dashboard for daily activity, join an academy pathway, complete forms, and track your portfolio.",
          category: "Onboarding",
          tags: ["onboarding", "campus"],
          status: "PUBLISHED",
          authorId: adminUser.id,
        },
      });

      await prisma.knowledgeArticle.upsert({
        where: { slug: "joining-an-academy" },
        update: {
          title: "Joining an Academy",
          content:
            "Browse Academies from the sidebar, open a pathway, and request to join. Advisors review pending requests from the Governance Center.",
          category: "Academies",
          tags: ["academies", "students"],
          status: "PUBLISHED",
        },
        create: {
          id: "kb-join-academy",
          title: "Joining an Academy",
          slug: "joining-an-academy",
          content:
            "Browse Academies from the sidebar, open a pathway, and request to join. Advisors review pending requests from the Governance Center.",
          category: "Academies",
          tags: ["academies", "students"],
          status: "PUBLISHED",
          authorId: adminUser.id,
        },
      });

      await prisma.simulator.upsert({
        where: { slug: "business-pitch" },
        update: {
          title: "Business Pitch Simulator",
          description: "Practice investor pitches and receive automated feedback on clarity and structure.",
          status: "ACTIVE",
          category: "BUSINESS",
          academyId: "academy-business-marketing",
          launchUrl: "https://blue-don-virtual-campus.vercel.app/simulators",
          sortOrder: 1,
        },
        create: {
          id: "sim-business-pitch",
          slug: "business-pitch",
          title: "Business Pitch Simulator",
          description: "Practice investor pitches and receive automated feedback on clarity and structure.",
          academyId: "academy-business-marketing",
          status: "ACTIVE",
          category: "BUSINESS",
          launchUrl: "https://blue-don-virtual-campus.vercel.app/simulators",
          sortOrder: 1,
        },
      });
    }

    console.log(
      "Seed complete: Madonna High School, 14 MEN academies, Academy Engine, Phase 16 organizations, governance forms, knowledge articles, labs, and simulators.",
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
