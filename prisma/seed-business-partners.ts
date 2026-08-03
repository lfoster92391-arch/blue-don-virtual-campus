import type { PrismaClient } from "../src/generated/prisma/client";
import { BUSINESS_PARTNER_SEEDS } from "../src/config/business-partners";

export async function seedBusinessPartners(prisma: PrismaClient): Promise<void> {
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  for (const seed of BUSINESS_PARTNER_SEEDS) {
    const partner = await prisma.businessPartner.upsert({
      where: { slug: seed.slug },
      update: {
        name: seed.name,
        description: seed.description,
        logoUrl: seed.logoUrl ?? null,
        website: seed.website ?? null,
        industry: seed.industry,
        address: seed.address ?? null,
        status: seed.status,
        careerInfo: seed.careerInfo ?? null,
        employees: seed.employees ?? [],
        alumni: seed.alumni ?? [],
        approvedById: seed.status === "APPROVED" && adminUser ? adminUser.id : null,
        approvedAt: seed.status === "APPROVED" ? new Date() : null,
      },
      create: {
        id: `bp-${seed.slug}`,
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        logoUrl: seed.logoUrl ?? null,
        website: seed.website ?? null,
        industry: seed.industry,
        address: seed.address ?? null,
        status: seed.status,
        careerInfo: seed.careerInfo ?? null,
        employees: seed.employees ?? [],
        alumni: seed.alumni ?? [],
        approvedById: seed.status === "APPROVED" && adminUser ? adminUser.id : null,
        approvedAt: seed.status === "APPROVED" ? new Date() : null,
      },
    });

    await prisma.businessPartnerOpportunity.deleteMany({
      where: { partnerId: partner.id },
    });

    for (const [index, opp] of seed.opportunities.entries()) {
      await prisma.businessPartnerOpportunity.create({
        data: {
          id: `bpo-${seed.slug}-${index}`,
          partnerId: partner.id,
          type: opp.type,
          title: opp.title,
          description: opp.description,
          isActive: opp.isActive !== false,
        },
      });
    }
  }

  console.log(`Seeded ${BUSINESS_PARTNER_SEEDS.length} business partners.`);
}
