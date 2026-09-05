import {
  CRICUT_CLUB_SLUG,
  CRICUT_IMAGE_MAX_BYTES,
  CRICUT_ORDER_STATUS_LABELS,
  CRICUT_PRICE_MAX_CENTS,
  CRICUT_SHOP_BUCKET,
  CRICUT_SHOP_STORAGE_PREFIX,
  getCricutAmazonWishlistEnvUrl,
  getCricutSampleItems,
  shippingCentsFor,
} from "@/config/cricut-shop";
import { CAMPUS_MEDIA_BUCKET } from "@/config/broadcast-media";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import {
  IMAGE_UPLOAD_MAX_LABEL,
  resolveCampusImageType,
} from "@/config/uploads";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission, normalizeOrgRole } from "@/config/roles";
import type {
  CricutFulfillmentMethod,
  CricutShopItemStatus,
  CricutShopOrderStatus,
} from "@/generated/prisma/client";
import { hasOrgPermission, getUserOrgMembership } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { ensureCampusMediaBucket } from "@/services/media-service";
import {
  buildDefaultAdvisorActions,
  sendSystemStudentMessages,
} from "@/services/student-message-service";

export type CricutShopItemView = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  status: CricutShopItemStatus | "ACTIVE";
  availableToSell: boolean;
  sellerName: string;
  organizationId: string;
  createdAt: Date;
  isSample?: boolean;
};

export type CricutOrderLineView = {
  id: string;
  itemId: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type CricutOrderView = {
  id: string;
  buyerId: string;
  buyerName: string;
  fulfillment: CricutFulfillmentMethod;
  status: CricutShopOrderStatus;
  statusLabel: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  customizationNotes: string | null;
  shipName: string | null;
  shipLine1: string | null;
  shipLine2: string | null;
  shipCity: string | null;
  shipState: string | null;
  shipPostal: string | null;
  notes: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  lines: CricutOrderLineView[];
  createdAt: Date;
  updatedAt: Date;
};

export type CartLineInput = {
  itemId: string;
  quantity: number;
};

export type CricutProductionStats = {
  completedOrders: number;
  completedProjects: number;
  completedDesigns: number;
  totalMade: number;
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

function mapOrder(row: {
  id: string;
  buyerId: string;
  fulfillment: CricutFulfillmentMethod;
  status: CricutShopOrderStatus;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  customizationNotes: string | null;
  shipName: string | null;
  shipLine1: string | null;
  shipLine2: string | null;
  shipCity: string | null;
  shipState: string | null;
  shipPostal: string | null;
  notes: string | null;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  assignedTo: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  lines: {
    id: string;
    itemId: string;
    title: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }[];
}): CricutOrderView {
  return {
    id: row.id,
    buyerId: row.buyerId,
    buyerName: displayName(row.buyer),
    fulfillment: row.fulfillment,
    status: row.status,
    statusLabel: CRICUT_ORDER_STATUS_LABELS[row.status] ?? row.status,
    subtotalCents: row.subtotalCents,
    shippingCents: row.shippingCents,
    totalCents: row.totalCents,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    customizationNotes: row.customizationNotes,
    shipName: row.shipName,
    shipLine1: row.shipLine1,
    shipLine2: row.shipLine2,
    shipCity: row.shipCity,
    shipState: row.shipState,
    shipPostal: row.shipPostal,
    notes: row.notes,
    assignedToId: row.assignedToId,
    assignedToName: row.assignedTo ? displayName(row.assignedTo) : null,
    lines: row.lines.map((line) => ({
      id: line.id,
      itemId: line.itemId,
      title: line.title,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
      lineTotalCents: line.lineTotalCents,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function isCricutShopStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

/** President / VP (and store managers) — catalog toggles, assignments, wishlist. */
export async function canManageCricutShop(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  if (await hasOrgPermission(userId, organizationId, "org:orders:manage")) {
    return true;
  }
  const store = await hasOrgPermission(userId, organizationId, "org:store:manage");
  if (store) {
    const membership = await getUserOrgMembership(userId, organizationId);
    const orgRole = membership ? normalizeOrgRole(membership.orgRole) : null;
    // Secretary has store:manage but not full catalog/order management.
    return orgRole === "president" || orgRole === "vice_president";
  }
  return hasOrgPermission(userId, organizationId, "org:finances:manage");
}

/** Any active Cricut member (or officer) may upload catalog products. */
export async function canCreateCricutListing(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (await canManageCricutShop(userId, role, organizationId)) {
    return true;
  }
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  if (await hasOrgPermission(userId, organizationId, "org:catalog:list")) {
    return true;
  }
  const membership = await getUserOrgMembership(userId, organizationId);
  return Boolean(membership && membership.status === "ACTIVE");
}

/** Officers + assignees may update order status. */
export async function canUpdateCricutOrder(
  userId: string,
  role: CampusRole,
  organizationId: string,
  order?: { assignedToId: string | null },
): Promise<boolean> {
  if (await canManageCricutShop(userId, role, organizationId)) {
    return true;
  }
  if (order?.assignedToId === userId) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:orders:fulfill");
}

export async function getCricutOrganization(): Promise<{
  id: string;
  slug: string;
  name: string;
  amazonWishlistUrl: string | null;
} | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const org = await withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { slug: CRICUT_CLUB_SLUG },
      select: {
        id: true,
        slug: true,
        name: true,
        amazonWishlistUrl: true,
      },
    }),
  );

  if (!org) {
    return null;
  }

  return {
    ...org,
    amazonWishlistUrl:
      org.amazonWishlistUrl?.trim() || getCricutAmazonWishlistEnvUrl(),
  };
}

export async function getCricutAmazonWishlistUrl(): Promise<string | null> {
  const org = await getCricutOrganization();
  if (org?.amazonWishlistUrl) {
    return org.amazonWishlistUrl;
  }
  return getCricutAmazonWishlistEnvUrl();
}

export async function updateCricutAmazonWishlistUrl(
  url: string | null,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }
  const org = await getCricutOrganization();
  if (!org) {
    return false;
  }
  const cleaned = url?.trim() || null;
  if (cleaned && !/^https?:\/\//i.test(cleaned)) {
    return false;
  }
  const updated = await withDatabase((prisma) =>
    prisma.organization.update({
      where: { id: org.id },
      data: { amazonWishlistUrl: cleaned },
      select: { id: true },
    }),
  );
  return Boolean(updated);
}

export async function uploadCricutShopImage(
  file: File,
  userId: string,
  prefix: string = CRICUT_SHOP_STORAGE_PREFIX,
): Promise<{ storagePath: string; publicUrl: string }> {
  if (file.size <= 0) {
    throw new Error("That photo is empty. Pick the file again and retry.");
  }
  if (file.size > CRICUT_IMAGE_MAX_BYTES) {
    throw new Error(`Photo must be ${IMAGE_UPLOAD_MAX_LABEL} or smaller.`);
  }

  const imageType = resolveCampusImageType(file);
  if (!imageType) {
    throw new Error(
      "Use a JPG, PNG, WebP, GIF, or HEIC photo of the product.",
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "Photo storage isn’t configured. Ask an admin to set the campus media bucket.",
    );
  }

  if (CRICUT_SHOP_BUCKET === CAMPUS_MEDIA_BUCKET) {
    await ensureCampusMediaBucket(admin);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storagePath = `${prefix}/${userId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(CRICUT_SHOP_BUCKET)
    .upload(storagePath, buffer, { contentType: imageType, upsert: false });

  if (error) {
    console.error("[cricut-shop] Photo upload failed:", error.message);
    throw new Error(`Unable to store the photo (${error.message}).`);
  }

  const { data } = admin.storage
    .from(CRICUT_SHOP_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

function sampleViews(organizationId = "sample"): CricutShopItemView[] {
  return getCricutSampleItems().map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    priceCents: item.priceCents,
    imageUrl: item.imageUrl,
    status: "ACTIVE" as const,
    availableToSell: item.availableToSell !== false,
    sellerName: "Cricut Club",
    organizationId,
    createdAt: new Date(),
    isSample: true,
  }));
}

export async function listCricutShopItems(options?: {
  includeUnavailable?: boolean;
  manageView?: boolean;
}): Promise<CricutShopItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return sampleViews();
  }

  const org = await getCricutOrganization();
  if (!org) {
    return sampleViews();
  }

  const rows = await withDatabase((prisma) =>
    prisma.cricutShopItem.findMany({
      where: {
        organizationId: org.id,
        status: options?.manageView
          ? { in: ["ACTIVE", "DRAFT", "SOLD"] }
          : "ACTIVE",
      },
      include: {
        seller: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  );

  if (!rows?.length) {
    return sampleViews(org.id);
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    status: row.status,
    availableToSell: row.availableToSell,
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
      availableToSell: sample.availableToSell !== false,
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
    availableToSell: row.availableToSell,
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
  availableToSell?: boolean;
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
        availableToSell: input.availableToSell !== false,
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function updateCricutShopItemImage(input: {
  itemId: string;
  imageUrl: string;
  storagePath: string;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }
  const updated = await withDatabase((prisma) =>
    prisma.cricutShopItem.updateMany({
      where: { id: input.itemId, status: { not: "REMOVED" } },
      data: {
        imageUrl: input.imageUrl,
        storagePath: input.storagePath,
      },
    }),
  );
  return (updated?.count ?? 0) > 0;
}

export async function setCricutItemAvailableToSell(input: {
  itemId: string;
  availableToSell: boolean;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }
  const updated = await withDatabase((prisma) =>
    prisma.cricutShopItem.updateMany({
      where: { id: input.itemId, status: { not: "REMOVED" } },
      data: { availableToSell: input.availableToSell },
    }),
  );
  return (updated?.count ?? 0) > 0;
}

async function listCricutOfficerUserIds(
  organizationId: string,
): Promise<string[]> {
  const rows = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        orgRole: { in: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"] },
      },
      select: { userId: true },
    }),
  );
  return rows?.map((r) => r.userId) ?? [];
}

async function notifyCricutCrewOfOrder(input: {
  fromUserId: string;
  orderId: string;
  organizationId: string;
  extraRecipientIds?: string[];
}): Promise<void> {
  const officers = await listCricutOfficerUserIds(input.organizationId);
  const recipients = [
    ...new Set([
      ...officers,
      ...(input.extraRecipientIds ?? []),
    ]),
  ].filter((id) => id !== input.fromUserId);

  if (recipients.length === 0) {
    return;
  }

  await sendSystemStudentMessages({
    fromUserId: input.fromUserId,
    toUserIds: recipients,
    organizationId: input.organizationId,
    kind: "CRICUT_ORDER",
    title: "You have a new order",
    body: "A campus order just landed in the Cricut Club shop. Open it to start production.",
    actions: buildDefaultAdvisorActions(`/cricut/orders/${input.orderId}`),
  });
}

export async function placeCricutShopOrder(input: {
  buyerId: string;
  fulfillment: CricutFulfillmentMethod;
  lines: CartLineInput[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  customizationNotes?: string;
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
      where: {
        id: { in: itemIds },
        status: "ACTIVE",
        availableToSell: true,
      },
    }),
  );

  if (!items || items.length !== itemIds.length) {
    if (itemIds.some((id) => id.startsWith("sample-"))) {
      return {
        error:
          "Sample items are for browsing only. Ask a Cricut lead to publish real listings.",
      };
    }
    return { error: "One or more items are no longer available for sale." };
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

  if (!input.contactName?.trim()) {
    return { error: "Your name is required on the order form." };
  }

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

  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club is not seeded yet." };
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
        contactName: input.contactName?.trim().slice(0, 120) || null,
        contactEmail: input.contactEmail?.trim().slice(0, 160) || null,
        contactPhone: input.contactPhone?.trim().slice(0, 40) || null,
        customizationNotes:
          input.customizationNotes?.trim().slice(0, 800) || null,
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

  await notifyCricutCrewOfOrder({
    fromUserId: input.buyerId,
    orderId: created.id,
    organizationId: org.id,
  });

  return { orderId: created.id };
}

export async function getCricutOrder(
  orderId: string,
): Promise<CricutOrderView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.cricutShopOrder.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        lines: true,
      },
    }),
  );

  if (!row) {
    return null;
  }

  return mapOrder(row);
}

export async function listCricutOrdersForCrew(): Promise<CricutOrderView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.cricutShopOrder.findMany({
      include: {
        buyer: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        lines: true,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
  );

  return (rows ?? []).map(mapOrder);
}

export async function listCricutOrdersForBuyer(
  buyerId: string,
): Promise<CricutOrderView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.cricutShopOrder.findMany({
      where: { buyerId },
      include: {
        buyer: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        lines: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  );

  return (rows ?? []).map(mapOrder);
}

export async function updateCricutOrderStatus(input: {
  orderId: string;
  status: CricutShopOrderStatus;
  actorId: string;
  role: CampusRole;
}): Promise<{ ok: true } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Database unavailable." };
  }

  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club not found." };
  }

  const order = await withDatabase((prisma) =>
    prisma.cricutShopOrder.findUnique({
      where: { id: input.orderId },
      select: { id: true, assignedToId: true, buyerId: true },
    }),
  );

  if (!order) {
    return { error: "Order not found." };
  }

  const allowed = await canUpdateCricutOrder(
    input.actorId,
    input.role,
    org.id,
    order,
  );
  if (!allowed) {
    return { error: "You cannot update this order." };
  }

  await withDatabase((prisma) =>
    prisma.cricutShopOrder.update({
      where: { id: input.orderId },
      data: { status: input.status },
    }),
  );

  // Notify buyer of status progress (skip cancelled noise for now if same user)
  if (order.buyerId !== input.actorId) {
    await sendSystemStudentMessages({
      fromUserId: input.actorId,
      toUserIds: [order.buyerId],
      organizationId: org.id,
      kind: "CRICUT_ORDER",
      title: `Order update: ${CRICUT_ORDER_STATUS_LABELS[input.status] ?? input.status}`,
      body: "Your Cricut Club order status changed. Check it out for the latest progress.",
      actions: buildDefaultAdvisorActions(`/cricut/orders/${input.orderId}`),
    });
  }

  return { ok: true };
}

export async function assignCricutOrder(input: {
  orderId: string;
  assigneeId: string | null;
  actorId: string;
  role: CampusRole;
}): Promise<{ ok: true } | { error: string }> {
  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club not found." };
  }
  if (!(await canManageCricutShop(input.actorId, input.role, org.id))) {
    return { error: "Only President / VP can assign orders." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.cricutShopOrder.update({
      where: { id: input.orderId },
      data: { assignedToId: input.assigneeId },
      select: { id: true },
    }),
  );

  if (!updated) {
    return { error: "Unable to assign order." };
  }

  if (input.assigneeId && input.assigneeId !== input.actorId) {
    await sendSystemStudentMessages({
      fromUserId: input.actorId,
      toUserIds: [input.assigneeId],
      organizationId: org.id,
      kind: "CRICUT_ORDER",
      title: "You have a new order",
      body: "You were assigned a Cricut Club production order.",
      actions: buildDefaultAdvisorActions(`/cricut/orders/${input.orderId}`),
    });
  }

  return { ok: true };
}

export async function getCricutProductionStats(): Promise<CricutProductionStats> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      completedOrders: 0,
      completedProjects: 0,
      completedDesigns: 0,
      totalMade: 0,
    };
  }

  const org = await getCricutOrganization();
  if (!org) {
    return {
      completedOrders: 0,
      completedProjects: 0,
      completedDesigns: 0,
      totalMade: 0,
    };
  }

  const [completedOrders, completedProjects, completedDesigns] =
    await Promise.all([
      withDatabase((prisma) =>
        prisma.cricutShopOrder.count({
          where: { status: { in: ["FULFILLED", "COMPLETED"] } },
        }),
      ),
      withDatabase((prisma) =>
        prisma.clubProject.count({
          where: { organizationId: org.id, status: "COMPLETED" },
        }),
      ),
      withDatabase((prisma) =>
        prisma.cricutDesignSubmission.count({
          where: { organizationId: org.id, status: "COMPLETED" },
        }),
      ),
    ]);

  const orders = completedOrders ?? 0;
  const projects = completedProjects ?? 0;
  const designs = completedDesigns ?? 0;

  return {
    completedOrders: orders,
    completedProjects: projects,
    completedDesigns: designs,
    totalMade: orders + projects + designs,
  };
}
