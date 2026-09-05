import { CAMPUS_MEDIA_BUCKET } from "@/config/broadcast-media";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import {
  canManageAcademy,
  hasPermission,
  orgRoleIsOfficer,
} from "@/config/roles";
import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_LABEL,
  resolveCampusImageType,
} from "@/config/uploads";
import type {
  CampusCampaignKind as PrismaCampaignKind,
  ClubFundraiserStatus,
  ClubLedgerEntryType,
} from "@/generated/prisma/client";
import {
  ALL_TIME_PERIOD_KEY,
  buildAvailablePeriods,
  campusCampaignHeadline,
  CAMPUS_CAMPAIGN_KIND_LABELS,
  isCampusCampaignKind,
  isWithinPeriod,
  resolveClubFinancePeriod,
  sumOpeningBalance,
  sumSignedCents,
  type CampusCampaignBannerView,
  type CampusCampaignKind,
  type ClubFinanceSnapshot,
  type ClubFundraiserView,
} from "@/lib/club-finance";
import { getUserOrgMembership, hasOrgPermission } from "@/lib/auth/permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureCampusMediaBucket } from "@/services/media-service";

export type {
  CampusCampaignBannerView,
  CampusCampaignKind,
  ClubFinancePeriod,
  ClubFinanceSnapshot,
  ClubFundraiserView,
  ClubLedgerEntryView,
} from "@/lib/club-finance";
export {
  ALL_TIME_PERIOD_KEY,
  campusCampaignHeadline,
  CAMPUS_CAMPAIGN_KIND_LABELS,
  CAMPUS_CAMPAIGN_KINDS,
  defaultCampaignKind,
  SCHOOL_YEAR_PERIOD_KEY,
  formatCents,
  ledgerToCsv,
  resolveClubFinancePeriod,
} from "@/lib/club-finance";

const FUNDRAISER_FLYER_PREFIX = "club-fundraisers";

const FACULTY_CAMPAIGN_ROLES: CampusRole[] = [
  "admin",
  "advisor",
  "teacher",
  "staff",
  "coach",
  "counselor",
];

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

function isFacultyCampaignRole(role: CampusRole): boolean {
  return (
    hasPermission(role, "admin:access") ||
    canManageAcademy(role) ||
    FACULTY_CAMPAIGN_ROLES.includes(role)
  );
}

/**
 * Club officers + faculty/admin may post campus campaigns. Regular student
 * members cannot — they could not submit club fundraisers before this either.
 */
export async function canPostCampusCampaign(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (isFacultyCampaignRole(role)) {
    return true;
  }

  const membership = await getUserOrgMembership(userId, organizationId);
  if (!membership || membership.status !== "ACTIVE") {
    return false;
  }

  return orgRoleIsOfficer(membership.orgRole);
}

export function isClubFundraiserStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
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
      kind: isCampusCampaignKind(f.kind) ? f.kind : "CLUB_FUNDRAISER",
      flyerUrl: f.flyerUrl,
      linkUrl: f.linkUrl,
      pricesText: f.pricesText,
      startsAt: f.startsAt,
      endsAt: f.endsAt,
      arrivesAt: f.arrivesAt,
      pickupLocation: f.pickupLocation,
      contactName: f.contactName,
      contactEmail: f.contactEmail,
      contactPhone: f.contactPhone,
      raisingFor: f.raisingFor,
      isPublic: f.isPublic,
      organizationName: org.name,
      organizationSlug: org.slug,
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
  kind?: CampusCampaignKind;
  flyerUrl?: string;
  flyerStoragePath?: string;
  linkUrl?: string;
  pricesText?: string;
  startsAt?: Date;
  endsAt?: Date;
  arrivesAt?: Date;
  pickupLocation?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  raisingFor?: string;
  isPublic?: boolean;
  createdById: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  if (input.goalCents < 0) {
    return null;
  }

  const created = await withDatabase((prisma) =>
    prisma.clubFundraiser.create({
      data: {
        organizationId: input.organizationId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        goalCents: input.goalCents,
        kind: (input.kind ?? "CLUB_FUNDRAISER") as PrismaCampaignKind,
        flyerUrl: input.flyerUrl?.trim() || null,
        flyerStoragePath: input.flyerStoragePath?.trim() || null,
        linkUrl: input.linkUrl?.trim() || null,
        pricesText: input.pricesText?.trim() || null,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        arrivesAt: input.arrivesAt ?? null,
        pickupLocation: input.pickupLocation?.trim() || null,
        contactName: input.contactName?.trim() || null,
        contactEmail: input.contactEmail?.trim() || null,
        contactPhone: input.contactPhone?.trim() || null,
        raisingFor: input.raisingFor?.trim() || null,
        isPublic: input.isPublic ?? true,
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

export async function uploadClubFundraiserFlyer(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  if (file.size <= 0) {
    throw new Error("That photo is empty. Pick the file again and retry.");
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error(`Photo must be ${IMAGE_UPLOAD_MAX_LABEL} or smaller.`);
  }

  const imageType = resolveCampusImageType(file);
  if (!imageType) {
    throw new Error("Use a JPG, PNG, WebP, GIF, or HEIC flyer photo.");
  }

  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "Photo storage isn’t configured. Ask an admin to set the campus media bucket.",
    );
  }

  await ensureCampusMediaBucket(admin);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storagePath = `${FUNDRAISER_FLYER_PREFIX}/${userId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .upload(storagePath, buffer, { contentType: imageType, upsert: false });

  if (error) {
    console.error("[club-fundraiser] Flyer upload failed:", error.message);
    throw new Error(`Unable to store the flyer (${error.message}).`);
  }

  const { data } = admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function toBannerView(row: {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  flyerUrl: string | null;
  linkUrl: string | null;
  pricesText: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  arrivesAt: Date | null;
  pickupLocation: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  raisingFor: string | null;
  organization: { name: string; slug: string };
}): CampusCampaignBannerView {
  const kind = isCampusCampaignKind(row.kind) ? row.kind : "CLUB_FUNDRAISER";
  return {
    id: row.id,
    headline: campusCampaignHeadline(kind, row.title),
    title: row.title,
    kindLabel: CAMPUS_CAMPAIGN_KIND_LABELS[kind],
    description: row.description,
    flyerUrl: row.flyerUrl,
    linkUrl: row.linkUrl,
    pricesText: row.pricesText,
    orderOpensAt: toIso(row.startsAt),
    orderClosesAt: toIso(row.endsAt),
    arrivesAt: toIso(row.arrivesAt),
    pickupLocation: row.pickupLocation,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    raisingFor: row.raisingFor,
    organizationName: row.organization.name,
    organizationSlug: row.organization.slug,
    href: `/fundraisers/${row.id}`,
  };
}

function campaignSortScore(row: { startsAt: Date | null; endsAt: Date | null; createdAt: Date }, now: Date): number {
  const start = row.startsAt?.getTime() ?? null;
  const end = row.endsAt?.getTime() ?? null;
  const t = now.getTime();
  if (start !== null && end !== null && t >= start && t <= end) {
    return 0;
  }
  if (start !== null && t < start) {
    return 1;
  }
  return 2;
}

/** Active school-public campaigns for home / guest / parent headlines. */
export async function listPublicCampusCampaigns(options?: {
  take?: number;
}): Promise<CampusCampaignBannerView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const take = options?.take ?? 8;
  const rows = await withDatabase((prisma) =>
    prisma.clubFundraiser.findMany({
      where: { status: "ACTIVE", isPublic: true },
      include: { organization: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: Math.max(take, 12),
    }),
  );

  const now = new Date();
  return (rows ?? [])
    .sort((a, b) => {
      const score = campaignSortScore(a, now) - campaignSortScore(b, now);
      if (score !== 0) return score;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .slice(0, take)
    .map(toBannerView);
}

export async function getCampusCampaign(
  id: string,
): Promise<CampusCampaignBannerView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.clubFundraiser.findUnique({
      where: { id },
      include: { organization: { select: { name: true, slug: true } } },
    }),
  );

  if (!row) {
    return null;
  }

  return toBannerView(row);
}

export type PostableOrganization = {
  id: string;
  slug: string;
  name: string;
  type: string;
};

export async function listPostableOrganizations(
  userId: string,
  role: CampusRole,
): Promise<PostableOrganization[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  if (isFacultyCampaignRole(role)) {
    const rows = await withDatabase((prisma) =>
      prisma.organization.findMany({
        where: { slug: { not: { startsWith: "academy-" } } },
        select: { id: true, slug: true, name: true, type: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    );
    return rows ?? [];
  }

  const memberships = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        orgRole: { in: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"] },
      },
      include: {
        organization: {
          select: { id: true, slug: true, name: true, type: true },
        },
      },
    }),
  );

  return (memberships ?? []).map((row) => row.organization);
}
