import { isDatabaseConfigured } from "@/config/env";
import type {
  PortfolioItemStatus,
  PortfolioItemType,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type PortfolioListItem = {
  id: string;
  title: string;
  description: string | null;
  type: PortfolioItemType;
  status: PortfolioItemStatus;
  points: number;
  evidenceUrl: string | null;
  academyName: string | null;
  createdAt: Date;
};

export type PortfolioSummary = {
  totalItems: number;
  publishedItems: number;
  projects: number;
  certifications: number;
  serviceHours: number;
  completionPercent: number;
};

export async function listPortfolioItems(
  userId: string,
): Promise<PortfolioListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const items = await withDatabase((prisma) =>
    prisma.portfolioItem.findMany({
      where: { userId, status: { not: "ARCHIVED" } },
      include: { academy: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  );

  if (!items) {
    return [];
  }

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    status: item.status,
    points: item.points,
    evidenceUrl: item.evidenceUrl,
    academyName: item.academy?.name ?? null,
    createdAt: item.createdAt,
  }));
}

export async function getPortfolioItem(id: string, userId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return withDatabase((prisma) =>
    prisma.portfolioItem.findFirst({
      where: { id, userId },
      include: {
        academy: { select: { name: true, slug: true } },
        event: { select: { id: true, title: true } },
      },
    }),
  );
}

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      totalItems: 0,
      publishedItems: 0,
      projects: 0,
      certifications: 0,
      serviceHours: 0,
      completionPercent: 0,
    };
  }

  const items = await withDatabase((prisma) =>
    prisma.portfolioItem.findMany({
      where: { userId, status: { not: "ARCHIVED" } },
      select: { type: true, status: true, points: true },
    }),
  );

  if (!items || items.length === 0) {
    return {
      totalItems: 0,
      publishedItems: 0,
      projects: 0,
      certifications: 0,
      serviceHours: 0,
      completionPercent: 0,
    };
  }

  const publishedItems = items.filter((i) => i.status === "PUBLISHED");
  const projects = items.filter((i) => i.type === "PROJECT").length;
  const certifications = items.filter((i) => i.type === "CERTIFICATION").length;
  const serviceHours = items
    .filter((i) => i.type === "SERVICE")
    .reduce((sum, i) => sum + i.points, 0);

  return {
    totalItems: items.length,
    publishedItems: publishedItems.length,
    projects,
    certifications,
    serviceHours,
    completionPercent: Math.round((publishedItems.length / items.length) * 100),
  };
}

export async function createPortfolioItem(input: {
  userId: string;
  title: string;
  description?: string;
  type: PortfolioItemType;
  evidenceUrl?: string;
  points?: number;
  academyId?: string;
  eventId?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.portfolioItem.create({
      data: {
        userId: input.userId,
        title: input.title,
        description: input.description,
        type: input.type,
        evidenceUrl: input.evidenceUrl,
        points: input.points ?? 0,
        academyId: input.academyId,
        eventId: input.eventId,
        status: "DRAFT",
      },
      select: { id: true },
    }),
  );

  return item?.id ?? null;
}

export async function publishPortfolioItem(
  id: string,
  userId: string,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.portfolioItem.updateMany({
      where: { id, userId },
      data: { status: "PUBLISHED" },
    }),
  );

  return (result?.count ?? 0) > 0;
}

export async function countPortfolioItems(userId: string): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const count = await withDatabase((prisma) =>
    prisma.portfolioItem.count({
      where: { userId, status: { not: "ARCHIVED" } },
    }),
  );

  return count ?? 0;
}
