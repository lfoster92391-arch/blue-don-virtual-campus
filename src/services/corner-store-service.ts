import {
  CORNER_IMAGE_MAX_BYTES,
  CORNER_IMAGE_TYPES,
  CORNER_STORAGE_PREFIX,
  CORNER_STORE_BUCKET,
  getCornerSampleItems,
  type CornerPaymentConfig,
  type CornerPaymentMethodId,
} from "@/config/corner-store";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import type { CornerStoreStatus } from "@/generated/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type CornerStoreItemView = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priceCents: number;
  imageUrl: string | null;
  status: CornerStoreStatus;
  sellerId: string;
  sellerName: string;
  organizationId: string | null;
  organizationName: string | null;
  payment: CornerPaymentConfig;
  createdAt: Date;
  /** True for sample/demo rows that are not backed by the database. */
  isSample?: boolean;
};

/**
 * Roles allowed to publish a Corner listing. Students, faculty, staff, and
 * alumni can sell; parents and sponsors are consumers only.
 */
const CORNER_SELLER_ROLES: CampusRole[] = [
  "admin",
  "advisor",
  "teacher",
  "student",
  "alumni",
  "staff",
  "coach",
  "counselor",
];

export function canListInCornerStore(role: CampusRole): boolean {
  return CORNER_SELLER_ROLES.includes(role);
}

export function isCornerStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

function coercePaymentConfig(value: unknown): CornerPaymentConfig {
  if (!value || typeof value !== "object") {
    return { methods: ["cash"] };
  }

  const raw = value as Record<string, unknown>;
  const methods = Array.isArray(raw.methods)
    ? (raw.methods.filter((m) => typeof m === "string") as CornerPaymentMethodId[])
    : [];

  return {
    methods: methods.length > 0 ? methods : ["cash"],
    handles:
      raw.handles && typeof raw.handles === "object"
        ? (raw.handles as CornerPaymentConfig["handles"])
        : undefined,
    note: typeof raw.note === "string" ? raw.note : undefined,
  };
}

type CornerRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priceCents: number;
  imageUrl: string | null;
  status: CornerStoreStatus;
  sellerId: string;
  organizationId: string | null;
  paymentMethods: unknown;
  createdAt: Date;
  seller: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  organization: { name: string } | null;
};

function mapRow(row: CornerRow): CornerStoreItemView {
  const sellerName =
    row.seller.displayName?.trim() ||
    [row.seller.firstName, row.seller.lastName].filter(Boolean).join(" ") ||
    "Blue Don student";

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    status: row.status,
    sellerId: row.sellerId,
    sellerName,
    organizationId: row.organizationId,
    organizationName: row.organization?.name ?? null,
    payment: coercePaymentConfig(row.paymentMethods),
    createdAt: row.createdAt,
  };
}

const cornerSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  priceCents: true,
  imageUrl: true,
  status: true,
  sellerId: true,
  organizationId: true,
  paymentMethods: true,
  createdAt: true,
  seller: {
    select: { displayName: true, firstName: true, lastName: true },
  },
  organization: { select: { name: true } },
} as const;

function sampleView(): CornerStoreItemView[] {
  return getCornerSampleItems().map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    priceCents: item.priceCents,
    imageUrl: item.imageUrl,
    status: "ACTIVE" as CornerStoreStatus,
    sellerId: "sample",
    sellerName: item.sellerName,
    organizationId: null,
    organizationName: item.sellerKind === "student" ? null : item.sellerName,
    payment: item.payment,
    createdAt: new Date(),
    isSample: true,
  }));
}

export async function listCornerItems(): Promise<CornerStoreItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return sampleView();
  }

  const rows = await withDatabase((prisma) =>
    prisma.cornerStoreItem.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: cornerSelect,
    }),
  );

  const mapped = (rows ?? []).map(mapRow);

  // In demo mode with an empty DB, still surface the curated sample listings.
  if (mapped.length === 0) {
    return sampleView();
  }

  return mapped;
}

export async function getCornerItem(id: string): Promise<CornerStoreItemView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return sampleView().find((item) => item.id === id) ?? null;
  }

  const row = await withDatabase((prisma) =>
    prisma.cornerStoreItem.findUnique({
      where: { id },
      select: cornerSelect,
    }),
  );

  if (!row) {
    return sampleView().find((item) => item.id === id) ?? null;
  }

  return mapRow(row);
}

export async function listSellerItems(sellerId: string): Promise<CornerStoreItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.cornerStoreItem.findMany({
      where: { sellerId, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: cornerSelect,
    }),
  );

  return (rows ?? []).map(mapRow);
}

/** Organizations the user can list on behalf of (needs `org:store:manage`). */
export async function listSellableOrganizations(
  userId: string,
): Promise<{ id: string; name: string }[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const memberships = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        orgRole: { in: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"] },
      },
      select: { organization: { select: { id: true, name: true } } },
      orderBy: { organization: { name: "asc" } },
    }),
  );

  return (memberships ?? []).map((m) => m.organization);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "photo";
}

export async function uploadCornerImage(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (file.size > CORNER_IMAGE_MAX_BYTES) {
    throw new Error("Photo must be 8 MB or smaller.");
  }

  if (!CORNER_IMAGE_TYPES.includes(file.type as (typeof CORNER_IMAGE_TYPES)[number])) {
    throw new Error("Upload a JPEG, PNG, WebP, GIF, or HEIC image.");
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const storagePath = `${CORNER_STORAGE_PREFIX}/${userId}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(CORNER_STORE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[corner] Storage upload failed:", error.message);
    throw new Error("Unable to upload the photo to campus storage.");
  }

  const { data } = admin.storage.from(CORNER_STORE_BUCKET).getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

export async function createCornerItem(input: {
  sellerId: string;
  title: string;
  description?: string;
  category?: string;
  priceCents: number;
  imageUrl?: string;
  storagePath?: string;
  payment: CornerPaymentConfig;
  organizationId?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.cornerStoreItem.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        priceCents: input.priceCents,
        imageUrl: input.imageUrl,
        storagePath: input.storagePath,
        paymentMethods: input.payment as object,
        status: "ACTIVE",
        sellerId: input.sellerId,
        organizationId: input.organizationId,
      },
      select: { id: true },
    }),
  );

  return item?.id ?? null;
}

export async function updateCornerItemStatus(
  id: string,
  sellerId: string,
  status: CornerStoreStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.cornerStoreItem.updateMany({
      where: { id, sellerId },
      data: { status },
    }),
  );

  return (result?.count ?? 0) > 0;
}
