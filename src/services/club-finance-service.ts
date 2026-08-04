import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type {
  ClubFundraiserStatus,
  ClubLedgerEntryType,
} from "@/generated/prisma/client";
import {
  formatCents,
  ledgerToCsv,
  type ClubFinanceSnapshot,
  type ClubFundraiserView,
  type ClubLedgerEntryView,
} from "@/lib/club-finance";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type {
  ClubFinanceSnapshot,
  ClubFundraiserView,
  ClubLedgerEntryView,
} from "@/lib/club-finance";
export { formatCents, ledgerToCsv };

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "User"
  );
}

export async function canManageClubFinances(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }

  return hasOrgPermission(userId, organizationId, "org:finances:manage");
}

/** View club financials (President / VP / Secretary / admin). Members cannot. */
export async function canViewClubFinances(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }

  return hasOrgPermission(userId, organizationId, "org:finances:view");
}

async function computeRaisedCents(
  organizationId: string,
  fundraiserId: string,
): Promise<number> {
  const rows = await withDatabase((prisma) =>
    prisma.clubLedgerEntry.findMany({
      where: { organizationId, fundraiserId },
      select: { type: true, amountCents: true },
    }),
  );

  if (!rows) {
    return 0;
  }

  return rows.reduce((sum, row) => {
    return row.type === "DEPOSIT" ? sum + row.amountCents : sum - row.amountCents;
  }, 0);
}

export async function getClubFinanceSnapshot(
  organizationId: string,
): Promise<ClubFinanceSnapshot | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const org = await withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, slug: true, name: true },
    }),
  );

  if (!org) {
    return null;
  }

  const [entries, fundraisers] = await Promise.all([
    withDatabase((prisma) =>
      prisma.clubLedgerEntry.findMany({
        where: { organizationId },
        include: {
          createdBy: {
            select: { displayName: true, firstName: true, lastName: true },
          },
          fundraiser: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubFundraiser.findMany({
        where: { organizationId },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      }),
    ),
  ]);

  const ledger = entries ?? [];
  const balanceCents = ledger.reduce((sum, row) => {
    return row.type === "DEPOSIT" ? sum + row.amountCents : sum - row.amountCents;
  }, 0);

  const fundraiserViews: ClubFundraiserView[] = await Promise.all(
    (fundraisers ?? []).map(async (f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      goalCents: f.goalCents,
      raisedCents: Math.max(0, await computeRaisedCents(organizationId, f.id)),
      status: f.status,
      startsAt: f.startsAt,
      endsAt: f.endsAt,
      createdAt: f.createdAt,
    })),
  );

  return {
    organizationId: org.id,
    organizationSlug: org.slug,
    organizationName: org.name,
    balanceCents,
    entries: ledger.map((row) => ({
      id: row.id,
      type: row.type,
      amountCents: row.amountCents,
      memo: row.memo,
      fundraiserId: row.fundraiserId,
      fundraiserTitle: row.fundraiser?.title ?? null,
      createdByName: displayName(row.createdBy),
      createdAt: row.createdAt,
    })),
    fundraisers: fundraiserViews,
  };
}

export async function listFocusClubFinanceSnapshots(
  organizationIds: string[],
): Promise<ClubFinanceSnapshot[]> {
  const snapshots = await Promise.all(
    organizationIds.map((id) => getClubFinanceSnapshot(id)),
  );
  return snapshots.filter((s): s is ClubFinanceSnapshot => s !== null);
}

export async function addClubLedgerEntry(input: {
  organizationId: string;
  type: ClubLedgerEntryType;
  amountCents: number;
  memo?: string;
  fundraiserId?: string;
  createdById: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  if (input.amountCents <= 0) {
    return null;
  }

  const created = await withDatabase((prisma) =>
    prisma.clubLedgerEntry.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        amountCents: input.amountCents,
        memo: input.memo?.trim() || null,
        fundraiserId: input.fundraiserId || null,
        createdById: input.createdById,
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function createClubFundraiser(input: {
  organizationId: string;
  title: string;
  description?: string;
  goalCents: number;
  startsAt?: Date;
  endsAt?: Date;
  createdById: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  if (input.goalCents <= 0) {
    return null;
  }

  const created = await withDatabase((prisma) =>
    prisma.clubFundraiser.create({
      data: {
        organizationId: input.organizationId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        goalCents: input.goalCents,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        createdById: input.createdById,
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function updateClubFundraiserStatus(input: {
  fundraiserId: string;
  organizationId: string;
  status: ClubFundraiserStatus;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const updated = await withDatabase((prisma) =>
    prisma.clubFundraiser.updateMany({
      where: {
        id: input.fundraiserId,
        organizationId: input.organizationId,
      },
      data: { status: input.status },
    }),
  );

  return (updated?.count ?? 0) > 0;
}
