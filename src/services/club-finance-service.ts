import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type {
  ClubFundraiserStatus,
  ClubLedgerEntryType,
} from "@/generated/prisma/client";
import {
  ALL_TIME_PERIOD_KEY,
  buildAvailablePeriods,
  isWithinPeriod,
  resolveClubFinancePeriod,
  sumOpeningBalance,
  sumSignedCents,
  type ClubFinanceSnapshot,
  type ClubFundraiserView,
} from "@/lib/club-finance";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type {
  ClubFinancePeriod,
  ClubFinanceSnapshot,
  ClubFundraiserView,
  ClubLedgerEntryView,
} from "@/lib/club-finance";
export {
  ALL_TIME_PERIOD_KEY,
  SCHOOL_YEAR_PERIOD_KEY,
  formatCents,
  ledgerToCsv,
  resolveClubFinancePeriod,
} from "@/lib/club-finance";

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

/**
 * Ledger + fundraisers for one club, scoped to a viewing period.
 *
 * The whole ledger is loaded once so a single month can still report an
 * opening balance and so `balanceCents` always carries the club's true
 * all-time total. Narrowing the period never hides money — it only changes
 * which rows are listed and which subtotals are reported.
 */
export async function getClubFinanceSnapshot(
  organizationId: string,
  periodKey?: string | null,
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
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
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
  const period = resolveClubFinancePeriod(periodKey);
  const availablePeriods = buildAvailablePeriods(
    ledger.map((row) => row.occurredAt),
  );

  const balanceCents = sumSignedCents(ledger);
  const openingBalanceCents = sumOpeningBalance(ledger, period);

  const inPeriod = ledger.filter((row) => isWithinPeriod(row.occurredAt, period));
  const periodDepositsCents = inPeriod
    .filter((row) => row.type === "DEPOSIT")
    .reduce((sum, row) => sum + row.amountCents, 0);
  const periodWithdrawalsCents = inPeriod
    .filter((row) => row.type === "WITHDRAWAL")
    .reduce((sum, row) => sum + row.amountCents, 0);
  const periodNetCents = periodDepositsCents - periodWithdrawalsCents;

  const fundraiserViews: ClubFundraiserView[] = (fundraisers ?? []).map((f) => {
    const tagged = ledger.filter((row) => row.fundraiserId === f.id);
    const taggedInPeriod = tagged.filter((row) =>
      isWithinPeriod(row.occurredAt, period),
    );

    return {
      id: f.id,
      title: f.title,
      description: f.description,
      goalCents: f.goalCents,
      raisedCents: Math.max(0, sumSignedCents(tagged)),
      periodRaisedCents: Math.max(0, sumSignedCents(taggedInPeriod)),
      taggedEntryCount: tagged.length,
      status: f.status,
      startsAt: f.startsAt,
      endsAt: f.endsAt,
      createdAt: f.createdAt,
    };
  });

  return {
    organizationId: org.id,
    organizationSlug: org.slug,
    organizationName: org.name,
    balanceCents,
    totalEntryCount: ledger.length,
    period,
    availablePeriods,
    openingBalanceCents,
    periodDepositsCents,
    periodWithdrawalsCents,
    periodNetCents,
    closingBalanceCents: openingBalanceCents + periodNetCents,
    entries: inPeriod.map((row) => ({
      id: row.id,
      type: row.type,
      amountCents: row.amountCents,
      memo: row.memo,
      fundraiserId: row.fundraiserId,
      fundraiserTitle: row.fundraiser?.title ?? null,
      createdByName: displayName(row.createdBy),
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
    })),
    fundraisers: fundraiserViews,
  };
}

/**
 * Cross-club balance strip. Always all-time so the IT Club hub compares
 * clubs on the same footing regardless of the period being browsed.
 */
export async function listFocusClubFinanceSnapshots(
  organizationIds: string[],
): Promise<ClubFinanceSnapshot[]> {
  const snapshots = await Promise.all(
    organizationIds.map((id) =>
      getClubFinanceSnapshot(id, ALL_TIME_PERIOD_KEY),
    ),
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
  /** When the money moved. Defaults to now, so live sales need not pass it. */
  occurredAt?: Date;
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
        ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
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
