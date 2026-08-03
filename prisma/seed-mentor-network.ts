import type { PrismaClient } from "../src/generated/prisma/client";
import { MENTOR_SEEDS } from "../src/config/mentor-network";

export async function seedMentorNetwork(prisma: PrismaClient) {
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  for (const seed of MENTOR_SEEDS) {
    await prisma.mentorProfile.upsert({
      where: { id: seed.id },
      update: {
        name: seed.name,
        email: seed.email,
        category: seed.category,
        title: seed.title,
        organization: seed.organization,
        bio: seed.bio,
        expertiseTags: seed.expertiseTags,
        photoUrl: seed.photoUrl ?? null,
        status: seed.status,
        approvedById: seed.status === "APPROVED" ? adminUser?.id ?? null : null,
        approvedAt: seed.status === "APPROVED" ? new Date() : null,
      },
      create: {
        id: seed.id,
        name: seed.name,
        email: seed.email,
        category: seed.category,
        title: seed.title,
        organization: seed.organization,
        bio: seed.bio,
        expertiseTags: seed.expertiseTags,
        photoUrl: seed.photoUrl ?? null,
        status: seed.status,
        approvedById: seed.status === "APPROVED" ? adminUser?.id ?? null : null,
        approvedAt: seed.status === "APPROVED" ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${MENTOR_SEEDS.length} mentor profiles (${MENTOR_SEEDS.filter((m) => m.status === "APPROVED").length} approved).`);
}
