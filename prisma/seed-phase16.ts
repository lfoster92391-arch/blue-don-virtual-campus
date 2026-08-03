import type { PrismaClient } from "../src/generated/prisma/client";

import { MADONNA_ORGANIZATIONS } from "../src/config/madonna-organizations";

export async function seedPhase16Organizations(prisma: PrismaClient) {
  for (const org of MADONNA_ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        description: org.description,
        type: org.type,
        category: org.category,
        sortOrder: org.sortOrder,
      },
      create: {
        id: org.id,
        slug: org.slug,
        name: org.name,
        type: org.type,
        category: org.category,
        sortOrder: org.sortOrder,
        description: org.description,
      },
    });
  }

  const academies = await prisma.academy.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { sortOrder: "asc" },
  });

  for (const academy of academies) {
    await prisma.organization.upsert({
      where: { slug: `academy-${academy.slug}` },
      update: {
        name: academy.name,
        type: "ACADEMY",
        academyId: academy.id,
        category: "school-headquarters",
        description: `${academy.name} — academy pathway headquarters.`,
      },
      create: {
        id: `org-academy-${academy.slug}`,
        slug: `academy-${academy.slug}`,
        name: academy.name,
        type: "ACADEMY",
        academyId: academy.id,
        category: "school-headquarters",
        sortOrder: 100 + academies.indexOf(academy),
        description: `${academy.name} — academy pathway headquarters.`,
      },
    });
  }
}
