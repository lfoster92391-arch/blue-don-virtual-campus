import {
  CRICUT_CLUB_SLUG,
  CRICUT_IMAGE_MAX_BYTES,
  CRICUT_IMAGE_TYPES,
  CRICUT_PRICE_MAX_CENTS,
  CRICUT_SHOP_BUCKET,
  CRICUT_SHOP_STORAGE_PREFIX,
  getCricutSampleItems,
  shippingCentsFor,
} from "@/config/cricut-shop";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type {
  CricutFulfillmentMethod,
  CricutShopItemStatus,
} from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type CricutShopItemView = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  status: CricutShopItemStatus | "ACTIVE";
  sellerName: string;
  organizationId: string;
  createdAt: Date;
  isSample?: boolean;
};

export type CartLineInput = {
  itemId: string;
  quantity: number;
};

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Cricut Club"
  );
}

export function isCricutShopStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

export async function canManageCricutShop(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  // Leads have store:manage; officers have finances — allow both for listing.
  const store = await hasOrgPermission(userId, organizationId, "org:store:manage");
  if (store) return true;
  return hasOrgPermission(userId, organizationId, "org:finances:manage");
}

export async function getCricutOrganization(): Promise<{
  id: string;
  slug: string;
  name: string;
} | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return (
    (await withDatabase((prisma) =>
      prisma.organization.findUnique({
        where: { slug: CRICUT_CLUB_SLUG },
        select: { id: true, slug: true, name: true },
      }),
    )) ?? null
  );
}

export async function uploadCricutShopImage(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  if (file.size <= 0 || file.size > CRICUT_IMAGE_MAX_BYTES) {
    return null;
  }
  if (!(CRICUT_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storagePath = `${CRICUT_SHOP_STORAGE_PREFIX}/${userId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(CRICUT_SHOP_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return null;
  }

  const { data } = admin.storage
    .from(CRICUT_SHOP_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

export async function listCricutShopItems(): Promise<CricutShopItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return getCricutSampleItems().map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
      status: "ACTIVE" as const,
      sellerName: "Cricut Club",
      organizationId: "sample",
      createdAt: new Date(),
      isSample: true,
    }));
  }

  const org = await getCricutOrganization();
  if (!org) {
    return getCricutSampleItems().map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
      status: "ACTIVE" as const,
      sellerName: "Cricut Club",
      organizationId: "sample",
      createdAt: new Date(),
      isSample: true,
    }));
  }

  const rows = await withDatabase((prisma) =>
    prisma.cricutShopItem.findMany({
      where: { organizationId: org.id, status: "ACTIVE" },
      include: {
        seller: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  );

  if (!rows?.length) {
    return getCricutSampleItems().map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
      status: "ACTIVE" as const,
      sellerName: "Cricut Club",
      organizationId: org.id,
      createdAt: new Date(),
      isSample: true,
    }));
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    status: row.status,
    sellerName: displayName(row.seller),
    organizationId: row.organizationId,
    createdAt: row.createdAt,
  }));
}

export async function getCricutShopItem(
  id: string,
): Promise<CricutShopItemView | null> {
  const samples = getCricutSampleItems();
  const sample = samples.find((s) => s.id === id);
  if (sample) {
    return {
      id: sample.id,
      title: sample.title,
      description: sample.description,
      priceCents: sample.priceCents,
      imageUrl: sample.imageUrl,
      status: "ACTIVE",
      sellerName: "Cricut Club",
      organizationId: "sample",
      createdAt: new Date(),
      isSample: true,
    };
  }

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.cricutShopItem.findFirst({
      where: { id, status: { not: "REMOVED" } },
      include: {
        seller: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    status: row.status,
    sellerName: displayName(row.seller),
    organizationId: row.organizationId,
    createdAt: row.createdAt,
  };
}

export async function createCricutShopItem(input: {
  sellerId: string;
  organizationId: string;
  title: string;
  description?: string;
  priceCents: number;
  imageUrl?: string;
  storagePath?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }
  if (input.priceCents < 0 || input.priceCents > CRICUT_PRICE_MAX_CENTS) {
    return null;
  }

  const created = await withDatabase((prisma) =>
    prisma.cricutShopItem.create({
      data: {
        sellerId: input.sellerId,
        organizationId: input.organizationId,
        title: input.title.trim().slice(0, 120),
        description: input.description?.trim().slice(0, 1200) || null,
        priceCents: input.priceCents,
        imageUrl: input.imageUrl ?? null,
        storagePath: input.storagePath ?? null,
        status: "ACTIVE",
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function placeCricutShopOrder(input: {
  buyerId: string;
  fulfillment: CricutFulfillmentMethod;
  lines: CartLineInput[];
  shipName?: string;
  shipLine1?: string;
  shipLine2?: string;
  shipCity?: string;
  shipState?: string;
  shipPostal?: string;
  notes?: string;
}): Promise<{ orderId: string } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Shop checkout needs the database. Try again after setup." };
  }

  if (input.lines.length === 0) {
    return { error: "Your cart is empty." };
  }

  const itemIds = input.lines.map((l) => l.itemId);
  const items = await withDatabase((prisma) =>
    prisma.cricutShopItem.findMany({
      where: { id: { in: itemIds }, status: "ACTIVE" },
    }),
  );

  if (!items || items.length !== itemIds.length) {
    // Allow sample-only carts to soft-fail with a clear message
    if (itemIds.some((id) => id.startsWith("sample-"))) {
      return {
        error:
          "Sample items are for browsing only. Ask a Cricut lead to publish real listings.",
      };
    }
    return { error: "One or more items are no longer available." };
  }

  const byId = new Map(items.map((i) => [i.id, i]));
  const orderLines = input.lines.map((line) => {
    const item = byId.get(line.itemId)!;
    const qty = Math.max(1, Math.min(99, Math.floor(line.quantity)));
    return {
      itemId: item.id,
      title: item.title,
      unitPriceCents: item.priceCents,
      quantity: qty,
      lineTotalCents: item.priceCents * qty,
    };
  });

  const subtotalCents = orderLines.reduce((s, l) => s + l.lineTotalCents, 0);
  const shippingCents = shippingCentsFor(input.fulfillment);
  const totalCents = subtotalCents + shippingCents;

  if (input.fulfillment === "SHIP") {
    if (
      !input.shipName?.trim() ||
      !input.shipLine1?.trim() ||
      !input.shipCity?.trim() ||
      !input.shipState?.trim() ||
      !input.shipPostal?.trim()
    ) {
      return { error: "Shipping address is required for delivery." };
    }
  }

  const created = await withDatabase((prisma) =>
    prisma.cricutShopOrder.create({
      data: {
        buyerId: input.buyerId,
        fulfillment: input.fulfillment,
        status: "PENDING",
        subtotalCents,
        shippingCents,
        totalCents,
        shipName: input.shipName?.trim() || null,
        shipLine1: input.shipLine1?.trim() || null,
        shipLine2: input.shipLine2?.trim() || null,
        shipCity: input.shipCity?.trim() || null,
        shipState: input.shipState?.trim().toUpperCase().slice(0, 2) || null,
        shipPostal: input.shipPostal?.trim() || null,
        notes: input.notes?.trim().slice(0, 400) || null,
        lines: { create: orderLines },
      },
      select: { id: true },
    }),
  );

  if (!created) {
    return { error: "Unable to place order." };
  }

  return { orderId: created.id };
}
