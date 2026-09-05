import {
  CRICUT_DESIGN_STORAGE_PREFIX,
  CRICUT_CLUB_SLUG,
} from "@/config/cricut-shop";
import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import type { CricutDesignStatus } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import {
  canManageCricutShop,
  getCricutOrganization,
  isCricutShopStorageConfigured,
  uploadCricutShopImage,
} from "@/services/cricut-shop-service";

export type CricutDesignView = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: CricutDesignStatus;
  submitterName: string;
  submitterId: string;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Student"
  );
}

export const CRICUT_DESIGN_STATUS_LABELS: Record<CricutDesignStatus, string> = {
  PENDING: "Pending review",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  IN_PRODUCTION: "In production",
  COMPLETED: "Completed",
};

export async function listCricutDesigns(options?: {
  status?: CricutDesignStatus | CricutDesignStatus[];
}): Promise<CricutDesignView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const org = await getCricutOrganization();
  if (!org) {
    return [];
  }

  const statusFilter = options?.status
    ? Array.isArray(options.status)
      ? { in: options.status }
      : options.status
    : undefined;

  const rows = await withDatabase((prisma) =>
    prisma.cricutDesignSubmission.findMany({
      where: {
        organizationId: org.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        submitter: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    status: row.status,
    submitterName: displayName(row.submitter),
    submitterId: row.submitterId,
    reviewNote: row.reviewNote,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  }));
}

export async function submitCricutDesign(input: {
  submitterId: string;
  title: string;
  description: string;
  imageUrl?: string;
  storagePath?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const org = await getCricutOrganization();
  if (!org) {
    return null;
  }

  const title = input.title.trim().slice(0, 120);
  const description = input.description.trim().slice(0, 2000);
  if (title.length < 2 || description.length < 4) {
    return null;
  }

  const created = await withDatabase((prisma) =>
    prisma.cricutDesignSubmission.create({
      data: {
        organizationId: org.id,
        submitterId: input.submitterId,
        title,
        description,
        imageUrl: input.imageUrl ?? null,
        storagePath: input.storagePath ?? null,
        status: "PENDING",
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function reviewCricutDesign(input: {
  designId: string;
  reviewerId: string;
  role: CampusRole;
  status: CricutDesignStatus;
  reviewNote?: string;
}): Promise<{ ok: true } | { error: string }> {
  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club not found." };
  }
  if (!(await canManageCricutShop(input.reviewerId, input.role, org.id))) {
    return { error: "Only President / VP can review design submissions." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.cricutDesignSubmission.updateMany({
      where: { id: input.designId, organizationId: org.id },
      data: {
        status: input.status,
        reviewNote: input.reviewNote?.trim().slice(0, 500) || null,
        reviewedById: input.reviewerId,
        reviewedAt: new Date(),
      },
    }),
  );

  if ((updated?.count ?? 0) === 0) {
    return { error: "Design not found." };
  }
  return { ok: true };
}

export async function uploadCricutDesignImage(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  if (!isCricutShopStorageConfigured()) {
    throw new Error(
      "Photo storage isn’t configured — submit without a reference image, or ask an admin.",
    );
  }
  return uploadCricutShopImage(file, userId, CRICUT_DESIGN_STORAGE_PREFIX);
}

export { CRICUT_CLUB_SLUG };
