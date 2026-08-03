import type { CampusRole } from "@/config/roles";
import { canManageAcademy } from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import type { WishlistLinkType } from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type WishlistItemView = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  linkType: WishlistLinkType;
  fulfilled: boolean;
  sortOrder: number;
  organizationId: string | null;
  academyId: string | null;
};

export type WishlistContext = {
  organizationId?: string;
  academyId?: string;
};

const AMAZON_HOST_PATTERN =
  /(^|\.)amazon\.(com|ca|co\.uk|de|fr|it|es|co\.jp|com\.au|in|com\.mx|com\.br)$/i;

export function detectWishlistLinkType(url: string): WishlistLinkType {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (AMAZON_HOST_PATTERN.test(hostname) || hostname === "amzn.to" || hostname === "a.co") {
      return "AMAZON";
    }
  } catch {
    return "CUSTOM";
  }

  return "CUSTOM";
}

export async function canManageWishlist(
  userId: string,
  role: CampusRole,
  context: WishlistContext,
): Promise<boolean> {
  if (context.organizationId) {
    if (await hasOrgPermission(userId, context.organizationId, "org:resources:edit")) {
      return true;
    }
  }

  if (context.academyId && canManageAcademy(role)) {
    return true;
  }

  if (context.academyId && context.organizationId) {
    return hasOrgPermission(userId, context.organizationId, "org:resources:edit");
  }

  if (context.academyId) {
    const org = await withDatabase((prisma) =>
      prisma.organization.findFirst({
        where: { academyId: context.academyId },
        select: { id: true },
      }),
    );

    if (org) {
      return hasOrgPermission(userId, org.id, "org:resources:edit");
    }
  }

  return false;
}

export async function listWishlistItems(context: WishlistContext): Promise<WishlistItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const items = await withDatabase((prisma) =>
    prisma.wishlistItem.findMany({
      where: {
        OR: [
          context.academyId ? { academyId: context.academyId } : undefined,
          context.organizationId ? { organizationId: context.organizationId } : undefined,
        ].filter(Boolean) as { academyId?: string; organizationId?: string }[],
      },
      orderBy: [{ fulfilled: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  );

  return items ?? [];
}

export async function listWishlistForAcademy(academyId: string): Promise<WishlistItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const org = await withDatabase((prisma) =>
    prisma.organization.findFirst({
      where: { academyId },
      select: { id: true },
    }),
  );

  return listWishlistItems({
    academyId,
    organizationId: org?.id,
  });
}

export type WishlistManageTarget = {
  id: string;
  name: string;
  slug: string;
  type: "academy" | "organization";
  itemCount: number;
};

export async function listWishlistManageTargets(
  userId: string,
  role: CampusRole,
): Promise<WishlistManageTarget[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const targets: WishlistManageTarget[] = [];

  const ledOrgs = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        orgRole: { in: ["LEAD", "OFFICER"] },
      },
      include: {
        organization: {
          include: {
            _count: { select: { wishlistItems: true } },
          },
        },
      },
    }),
  );

  for (const membership of ledOrgs ?? []) {
    if (
      await hasOrgPermission(userId, membership.organizationId, "org:resources:edit")
    ) {
      targets.push({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        type: "organization",
        itemCount: membership.organization._count.wishlistItems,
      });
    }
  }

  if (canManageAcademy(role)) {
    const academies = await withDatabase((prisma) =>
      prisma.academy.findMany({
        include: { _count: { select: { wishlistItems: true } } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    );

    for (const academy of academies ?? []) {
      targets.push({
        id: academy.id,
        name: academy.name,
        slug: academy.slug,
        type: "academy",
        itemCount: academy._count.wishlistItems,
      });
    }
  }

  const seen = new Set<string>();
  return targets.filter((target) => {
    const key = `${target.type}:${target.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function createWishlistItem(input: {
  title: string;
  description?: string;
  url: string;
  createdById: string;
  organizationId?: string;
  academyId?: string;
}) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  if (!input.organizationId && !input.academyId) {
    return null;
  }

  return withDatabase((prisma) =>
    prisma.wishlistItem.create({
      data: {
        title: input.title,
        description: input.description,
        url: input.url,
        linkType: detectWishlistLinkType(input.url),
        organizationId: input.organizationId,
        academyId: input.academyId,
        createdById: input.createdById,
      },
    }),
  );
}

export async function setWishlistItemFulfilled(
  itemId: string,
  fulfilled: boolean,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.wishlistItem.update({
      where: { id: itemId },
      data: { fulfilled },
    }),
  );

  return result !== null;
}

export async function deleteWishlistItem(itemId: string): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.wishlistItem.delete({
      where: { id: itemId },
    }),
  );

  return result !== null;
}

export async function getWishlistItemScope(itemId: string): Promise<WishlistContext | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.wishlistItem.findUnique({
      where: { id: itemId },
      select: { organizationId: true, academyId: true },
    }),
  );

  if (!item) {
    return null;
  }

  return {
    organizationId: item.organizationId ?? undefined,
    academyId: item.academyId ?? undefined,
  };
}
