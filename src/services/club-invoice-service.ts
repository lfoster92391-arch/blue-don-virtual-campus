import {
  CLUB_INVOICE_BUCKET,
  CLUB_INVOICE_IMAGE_MAX_BYTES,
  CLUB_INVOICE_IMAGE_TYPES,
  CLUB_INVOICE_STORAGE_PREFIX,
} from "@/config/club-invoices";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type { ClubInvoiceStatus } from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type ClubInvoiceLineInput = {
  description: string;
  quantity: number;
  unitCostCents: number;
};

export type ClubInvoiceLineView = {
  id: string;
  description: string;
  quantity: number;
  unitCostCents: number;
  lineTotalCents: number;
};

export type ClubInvoiceView = {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  vendor: string;
  invoiceDate: Date;
  totalCents: number;
  memo: string | null;
  receiptUrl: string | null;
  status: ClubInvoiceStatus;
  submittedByName: string;
  reviewedByName: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
  lines: ClubInvoiceLineView[];
  ledgerEntryId: string | null;
};

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

export function isInvoiceStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

export async function canSubmitClubInvoice(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:view");
}

export async function canReviewClubInvoice(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:finances:manage");
}

export async function uploadInvoiceReceipt(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  if (file.size <= 0 || file.size > CLUB_INVOICE_IMAGE_MAX_BYTES) {
    return null;
  }

  const typeOk = (CLUB_INVOICE_IMAGE_TYPES as readonly string[]).includes(
    file.type,
  );
  if (!typeOk) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storagePath = `${CLUB_INVOICE_STORAGE_PREFIX}/${userId}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(CLUB_INVOICE_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return null;
  }

  const { data } = admin.storage
    .from(CLUB_INVOICE_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

function mapInvoice(row: {
  id: string;
  organizationId: string;
  vendor: string;
  invoiceDate: Date;
  totalCents: number;
  memo: string | null;
  receiptUrl: string | null;
  status: ClubInvoiceStatus;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
  organization: { slug: string; name: string };
  submittedBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  reviewedBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  lines: {
    id: string;
    description: string;
    quantity: { toNumber?: () => number } | number;
    unitCostCents: number;
    lineTotalCents: number;
  }[];
  ledgerEntry: { id: string } | null;
}): ClubInvoiceView {
  return {
    id: row.id,
    organizationId: row.organizationId,
    organizationSlug: row.organization.slug,
    organizationName: row.organization.name,
    vendor: row.vendor,
    invoiceDate: row.invoiceDate,
    totalCents: row.totalCents,
    memo: row.memo,
    receiptUrl: row.receiptUrl,
    status: row.status,
    submittedByName: displayName(row.submittedBy),
    reviewedByName: row.reviewedBy ? displayName(row.reviewedBy) : null,
    reviewedAt: row.reviewedAt,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
    lines: row.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity:
        typeof line.quantity === "number"
          ? line.quantity
          : Number(line.quantity.toNumber?.() ?? line.quantity),
      unitCostCents: line.unitCostCents,
      lineTotalCents: line.lineTotalCents,
    })),
    ledgerEntryId: row.ledgerEntry?.id ?? null,
  };
}

const invoiceInclude = {
  organization: { select: { slug: true, name: true } },
  submittedBy: {
    select: { displayName: true, firstName: true, lastName: true },
  },
  reviewedBy: {
    select: { displayName: true, firstName: true, lastName: true },
  },
  lines: { orderBy: { sortOrder: "asc" as const } },
  ledgerEntry: { select: { id: true } },
};

export async function listClubInvoices(options: {
  organizationId?: string;
  status?: ClubInvoiceStatus;
  limit?: number;
}): Promise<ClubInvoiceView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubInvoice.findMany({
      where: {
        ...(options.organizationId
          ? { organizationId: options.organizationId }
          : {}),
        ...(options.status ? { status: options.status } : {}),
      },
      include: invoiceInclude,
      orderBy: { createdAt: "desc" },
      take: options.limit ?? 80,
    }),
  );

  return (rows ?? []).map(mapInvoice);
}

export async function listPendingInvoicesForFocusClubs(
  organizationIds: string[],
): Promise<ClubInvoiceView[]> {
  if (!organizationIds.length || !isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubInvoice.findMany({
      where: {
        organizationId: { in: organizationIds },
        status: "PENDING",
      },
      include: invoiceInclude,
      orderBy: { createdAt: "asc" },
    }),
  );

  return (rows ?? []).map(mapInvoice);
}

export async function createClubInvoice(input: {
  organizationId: string;
  vendor: string;
  invoiceDate: Date;
  memo?: string;
  receiptUrl?: string;
  receiptStoragePath?: string;
  lines: ClubInvoiceLineInput[];
  submittedById: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  if (input.lines.length === 0) {
    return null;
  }

  const normalized = input.lines.map((line, index) => {
    const qty = Math.max(0.001, line.quantity);
    const unit = Math.max(0, Math.round(line.unitCostCents));
    const lineTotal = Math.round(qty * unit);
    return {
      description: line.description.trim().slice(0, 200),
      quantity: qty,
      unitCostCents: unit,
      lineTotalCents: lineTotal,
      sortOrder: index,
    };
  });

  const totalCents = normalized.reduce((sum, l) => sum + l.lineTotalCents, 0);
  if (totalCents <= 0) {
    return null;
  }

  const created = await withDatabase((prisma) =>
    prisma.clubInvoice.create({
      data: {
        organizationId: input.organizationId,
        vendor: input.vendor.trim().slice(0, 160),
        invoiceDate: input.invoiceDate,
        totalCents,
        memo: input.memo?.trim().slice(0, 500) || null,
        receiptUrl: input.receiptUrl ?? null,
        receiptStoragePath: input.receiptStoragePath ?? null,
        submittedById: input.submittedById,
        lines: { create: normalized },
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function approveClubInvoice(input: {
  invoiceId: string;
  reviewerId: string;
  reviewNote?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { ok: false, error: "Database unavailable." };
  }

  const result = await withDatabase(async (prisma) => {
    const invoice = await prisma.clubInvoice.findUnique({
      where: { id: input.invoiceId },
      include: { ledgerEntry: true },
    });

    if (!invoice) {
      return { ok: false as const, error: "Invoice not found." };
    }
    if (invoice.status !== "PENDING") {
      return { ok: false as const, error: "Invoice is not pending." };
    }
    if (invoice.ledgerEntry) {
      return { ok: false as const, error: "Already posted to ledger." };
    }

    const memo = [
      `Invoice · ${invoice.vendor}`,
      invoice.memo?.trim() || null,
    ]
      .filter(Boolean)
      .join(" — ")
      .slice(0, 240);

    const ledger = await prisma.clubLedgerEntry.create({
      data: {
        organizationId: invoice.organizationId,
        type: "WITHDRAWAL",
        amountCents: invoice.totalCents,
        memo,
        invoiceId: invoice.id,
        receiptUrl: invoice.receiptUrl,
        createdById: input.reviewerId,
      },
      select: { id: true },
    });

    await prisma.clubInvoice.update({
      where: { id: invoice.id },
      data: {
        status: "APPROVED",
        reviewedById: input.reviewerId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote?.trim().slice(0, 300) || null,
      },
    });

    return { ok: true as const, ledgerId: ledger.id };
  });

  if (!result) {
    return { ok: false, error: "Unable to approve invoice." };
  }

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function rejectClubInvoice(input: {
  invoiceId: string;
  reviewerId: string;
  reviewNote?: string;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const updated = await withDatabase((prisma) =>
    prisma.clubInvoice.updateMany({
      where: { id: input.invoiceId, status: "PENDING" },
      data: {
        status: "REJECTED",
        reviewedById: input.reviewerId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote?.trim().slice(0, 300) || null,
      },
    }),
  );

  return (updated?.count ?? 0) > 0;
}
