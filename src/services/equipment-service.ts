import type { CampusRole } from "@/config/roles";
import { canAccessAdmin, canManageAcademy } from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import type {
  EquipmentCategory,
  EquipmentStatus,
  OrgMembershipRole,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type EquipmentListItem = {
  id: string;
  assetTag: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  location: string;
  serialNumber: string | null;
  assignedToName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  checkedOutAt: Date | null;
};

export type EquipmentDetail = EquipmentListItem & {
  notes: string | null;
  assignedToUserId: string | null;
  checkouts: EquipmentCheckoutView[];
};

export type EquipmentCheckoutView = {
  id: string;
  userId: string;
  userName: string;
  checkedOutAt: Date;
  dueAt: Date | null;
  returnedAt: Date | null;
  notes: string | null;
};

export type EquipmentStats = {
  total: number;
  available: number;
  checkedOut: number;
  repair: number;
  retired: number;
  byCategory: Record<EquipmentCategory, number>;
};

export type EquipmentContext = {
  organizationId?: string;
  academyId?: string;
};

export type EquipmentFilters = {
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  search?: string;
  organizationId?: string;
};

const MANAGER_ORG_ROLES: OrgMembershipRole[] = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "SECRETARY",
];

function displayName(
  user: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null,
): string | null {
  if (!user) {
    return null;
  }

  return (
    user.displayName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    null
  );
}

export async function canManageEquipment(
  userId: string,
  role: CampusRole,
  context: EquipmentContext = {},
): Promise<boolean> {
  if (canAccessAdmin(role)) {
    return true;
  }

  if (context.academyId && canManageAcademy(role)) {
    return true;
  }

  if (context.organizationId) {
    const membership = await withDatabase((prisma) =>
      prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: context.organizationId!,
            userId,
          },
        },
        select: { orgRole: true, status: true },
      }),
    );

    if (
      membership?.status === "ACTIVE" &&
      MANAGER_ORG_ROLES.includes(membership.orgRole)
    ) {
      return true;
    }
  }

  if (context.academyId) {
    const membership = await withDatabase((prisma) =>
      prisma.academyMembership.findUnique({
        where: {
          userId_academyId: {
            userId,
            academyId: context.academyId!,
          },
        },
        select: { status: true },
      }),
    );

    if (membership?.status === "ACTIVE") {
      return true;
    }
  }

  if (context.academyId && !context.organizationId) {
    const org = await withDatabase((prisma) =>
      prisma.organization.findFirst({
        where: { academyId: context.academyId },
        select: { id: true },
      }),
    );

    if (org) {
      return canManageEquipment(userId, role, {
        organizationId: org.id,
        academyId: context.academyId,
      });
    }
  }

  return false;
}

export async function canManageAnyEquipment(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  if (canAccessAdmin(role) || canManageAcademy(role)) {
    return true;
  }

  const memberships = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        orgRole: { in: MANAGER_ORG_ROLES },
      },
      select: { id: true },
      take: 1,
    }),
  );

  if ((memberships?.length ?? 0) > 0) {
    return true;
  }

  const academyMembership = await withDatabase((prisma) =>
    prisma.academyMembership.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { id: true },
    }),
  );

  return academyMembership !== null;
}

function buildWhereClause(filters: EquipmentFilters = {}) {
  const search = filters.search?.trim();

  return {
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { assetTag: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
            { serialNumber: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

function mapListItem(
  item: {
    id: string;
    assetTag: string;
    name: string;
    category: EquipmentCategory;
    status: EquipmentStatus;
    location: string;
    serialNumber: string | null;
    checkedOutAt: Date | null;
    organizationId: string | null;
    assignedTo: {
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
    } | null;
    organization: { name: string } | null;
  },
): EquipmentListItem {
  return {
    id: item.id,
    assetTag: item.assetTag,
    name: item.name,
    category: item.category,
    status: item.status,
    location: item.location,
    serialNumber: item.serialNumber,
    assignedToName: displayName(item.assignedTo),
    organizationId: item.organizationId,
    organizationName: item.organization?.name ?? null,
    checkedOutAt: item.checkedOutAt,
  };
}

const listInclude = {
  assignedTo: {
    select: { displayName: true, firstName: true, lastName: true },
  },
  organization: { select: { name: true } },
} as const;

export async function listEquipment(
  filters: EquipmentFilters = {},
): Promise<EquipmentListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const items = await withDatabase((prisma) =>
    prisma.equipmentItem.findMany({
      where: buildWhereClause(filters),
      include: listInclude,
      orderBy: [{ status: "asc" }, { category: "asc" }, { assetTag: "asc" }],
    }),
  );

  return (items ?? []).map(mapListItem);
}

export async function getEquipment(id: string): Promise<EquipmentDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.equipmentItem.findUnique({
      where: { id },
      include: {
        ...listInclude,
        checkouts: {
          include: {
            user: {
              select: { displayName: true, firstName: true, lastName: true },
            },
          },
          orderBy: { checkedOutAt: "desc" },
        },
      },
    }),
  );

  if (!item) {
    return null;
  }

  const base = mapListItem(item);

  return {
    ...base,
    notes: item.notes,
    assignedToUserId: item.assignedToUserId,
    checkouts: item.checkouts.map((checkout) => ({
      id: checkout.id,
      userId: checkout.userId,
      userName: displayName(checkout.user) ?? "Unknown",
      checkedOutAt: checkout.checkedOutAt,
      dueAt: checkout.dueAt,
      returnedAt: checkout.returnedAt,
      notes: checkout.notes,
    })),
  };
}

export async function getEquipmentStats(
  organizationId?: string,
): Promise<EquipmentStats> {
  const emptyStats: EquipmentStats = {
    total: 0,
    available: 0,
    checkedOut: 0,
    repair: 0,
    retired: 0,
    byCategory: {
      CAMERA: 0,
      CHROMEBOOK: 0,
      MICROPHONE: 0,
      PROJECTOR: 0,
      LAPTOP_CART: 0,
      OTHER: 0,
    },
  };

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return emptyStats;
  }

  const where = organizationId ? { organizationId } : {};

  const counts = await withDatabase(async (prisma) => {
    return Promise.all([
      prisma.equipmentItem.count({ where }),
      prisma.equipmentItem.count({ where: { ...where, status: "AVAILABLE" } }),
      prisma.equipmentItem.count({ where: { ...where, status: "CHECKED_OUT" } }),
      prisma.equipmentItem.count({ where: { ...where, status: "REPAIR" } }),
      prisma.equipmentItem.count({ where: { ...where, status: "RETIRED" } }),
      prisma.equipmentItem.groupBy({
        by: ["category"],
        where,
        _count: { category: true },
      }),
    ]);
  });

  if (!counts) {
    return emptyStats;
  }

  const [total, available, checkedOut, repair, retired, byCategory] = counts;

  const categoryMap = { ...emptyStats.byCategory };
  for (const row of byCategory ?? []) {
    categoryMap[row.category] = row._count.category;
  }

  return {
    total: total ?? 0,
    available: available ?? 0,
    checkedOut: checkedOut ?? 0,
    repair: repair ?? 0,
    retired: retired ?? 0,
    byCategory: categoryMap,
  };
}

export async function createEquipment(input: {
  assetTag: string;
  name: string;
  category: EquipmentCategory;
  location: string;
  serialNumber?: string;
  notes?: string;
  organizationId?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.equipmentItem.create({
      data: {
        assetTag: input.assetTag,
        name: input.name,
        category: input.category,
        location: input.location,
        serialNumber: input.serialNumber,
        notes: input.notes,
        organizationId: input.organizationId,
        status: "AVAILABLE",
      },
    }),
  );

  return item?.id ?? null;
}

export async function updateEquipment(
  id: string,
  input: {
    assetTag?: string;
    name?: string;
    category?: EquipmentCategory;
    status?: EquipmentStatus;
    location?: string;
    serialNumber?: string | null;
    notes?: string | null;
  },
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.equipmentItem.update({
      where: { id },
      data: input,
    }),
  );

  return result !== null;
}

export async function getEquipmentContext(id: string): Promise<EquipmentContext | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.equipmentItem.findUnique({
      where: { id },
      select: {
        organizationId: true,
        organization: { select: { academyId: true } },
      },
    }),
  );

  if (!item) {
    return null;
  }

  return {
    organizationId: item.organizationId ?? undefined,
    academyId: item.organization?.academyId ?? undefined,
  };
}

export async function checkoutEquipment(input: {
  equipmentId: string;
  userId: string;
  dueAt?: Date;
  notes?: string;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase(async (prisma) => {
    const item = await prisma.equipmentItem.findUnique({
      where: { id: input.equipmentId },
      select: { status: true },
    });

    if (!item || item.status !== "AVAILABLE") {
      return false;
    }

    const now = new Date();

    await prisma.equipmentCheckout.create({
      data: {
        equipmentId: input.equipmentId,
        userId: input.userId,
        dueAt: input.dueAt,
        notes: input.notes,
      },
    });

    await prisma.equipmentItem.update({
      where: { id: input.equipmentId },
      data: {
        status: "CHECKED_OUT",
        assignedToUserId: input.userId,
        checkedOutAt: now,
      },
    });

    return true;
  });

  return result === true;
}

export async function returnEquipment(
  equipmentId: string,
  notes?: string,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase(async (prisma) => {
    const item = await prisma.equipmentItem.findUnique({
      where: { id: equipmentId },
      select: { status: true },
    });

    if (!item || item.status !== "CHECKED_OUT") {
      return false;
    }

    const activeCheckout = await prisma.equipmentCheckout.findFirst({
      where: { equipmentId, returnedAt: null },
      orderBy: { checkedOutAt: "desc" },
    });

    const now = new Date();

    if (activeCheckout) {
      await prisma.equipmentCheckout.update({
        where: { id: activeCheckout.id },
        data: {
          returnedAt: now,
          notes: notes ?? activeCheckout.notes,
        },
      });
    }

    await prisma.equipmentItem.update({
      where: { id: equipmentId },
      data: {
        status: "AVAILABLE",
        assignedToUserId: null,
        checkedOutAt: null,
      },
    });

    return true;
  });

  return result === true;
}

export async function markEquipmentRepair(equipmentId: string): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.equipmentItem.update({
      where: { id: equipmentId },
      data: {
        status: "REPAIR",
        assignedToUserId: null,
        checkedOutAt: null,
      },
    }),
  );

  return result !== null;
}

export async function getItClubOrganization(): Promise<{
  id: string;
  slug: string;
  academyId: string | null;
} | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { slug: "it-club" },
      select: { id: true, slug: true, academyId: true },
    }),
  );
}
