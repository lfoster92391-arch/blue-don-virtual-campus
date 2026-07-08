import type { PrismaClient } from "../src/generated/prisma/client";

const DEMO_ORGANIZATIONS = [
  {
    id: "org-robotics-club",
    slug: "robotics-club",
    name: "Robotics Club",
    type: "CLUB" as const,
    description:
      "Student robotics team — workspace shell for Phase 16 organization foundation.",
  },
  {
    id: "org-varsity-basketball",
    slug: "varsity-basketball",
    name: "Varsity Basketball",
    type: "TEAM" as const,
    description: "Athletics team workspace shell for future roster and schedule tools.",
  },
] as const;

export async function seedPhase16Organizations(prisma: PrismaClient) {
  for (const org of DEMO_ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        description: org.description,
        type: org.type,
      },
      create: {
        id: org.id,
        slug: org.slug,
        name: org.name,
        type: org.type,
        description: org.description,
      },
    });
  }

  const academies = await prisma.academy.findMany({
    select: { id: true, slug: true, name: true },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  for (const academy of academies) {
    await prisma.organization.upsert({
      where: { slug: `academy-${academy.slug}` },
      update: {
        name: academy.name,
        type: "ACADEMY",
        academyId: academy.id,
        description: `Organization bridge for ${academy.name} academy workspace migration.`,
      },
      create: {
        id: `org-academy-${academy.slug}`,
        slug: `academy-${academy.slug}`,
        name: academy.name,
        type: "ACADEMY",
        academyId: academy.id,
        description: `Organization bridge for ${academy.name} academy workspace migration.`,
      },
    });
  }
}
