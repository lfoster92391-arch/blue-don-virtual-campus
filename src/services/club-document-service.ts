import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type { ClubDocumentType } from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import type { ClubDocumentView } from "@/lib/club-workspace-types";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type { ClubDocumentView } from "@/lib/club-workspace-types";
export { CLUB_DOCUMENT_TYPE_LABELS } from "@/lib/club-workspace-types";

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

export async function canEditClubDocuments(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:documents:edit");
}

export async function canViewClubDocuments(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:view");
}

export async function listClubDocuments(
  organizationId: string,
): Promise<ClubDocumentView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubDocument.findMany({
      where: { organizationId },
      include: {
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ docType: "asc" }, { title: "asc" }],
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    docType: row.docType,
    body: row.body,
    fileUrl: row.fileUrl,
    createdByName: displayName(row.createdBy),
    updatedAt: row.updatedAt,
  }));
}

export async function createClubDocument(input: {
  organizationId: string;
  title: string;
  docType: ClubDocumentType;
  body?: string | null;
  fileUrl?: string | null;
  userId: string;
}): Promise<ClubDocumentView | null> {
  const row = await withDatabase((prisma) =>
    prisma.clubDocument.create({
      data: {
        organizationId: input.organizationId,
        title: input.title.trim(),
        docType: input.docType,
        body: input.body?.trim() || null,
        fileUrl: input.fileUrl?.trim() || null,
        createdById: input.userId,
        updatedById: input.userId,
      },
      include: {
        createdBy: {
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
    organizationId: row.organizationId,
    title: row.title,
    docType: row.docType,
    body: row.body,
    fileUrl: row.fileUrl,
    createdByName: displayName(row.createdBy),
    updatedAt: row.updatedAt,
  };
}

export async function updateClubDocument(input: {
  documentId: string;
  organizationId: string;
  title: string;
  docType: ClubDocumentType;
  body?: string | null;
  fileUrl?: string | null;
  userId: string;
}): Promise<boolean> {
  const result = await withDatabase((prisma) =>
    prisma.clubDocument.updateMany({
      where: { id: input.documentId, organizationId: input.organizationId },
      data: {
        title: input.title.trim(),
        docType: input.docType,
        body: input.body?.trim() || null,
        fileUrl: input.fileUrl?.trim() || null,
        updatedById: input.userId,
      },
    }),
  );

  return Boolean(result && result.count > 0);
}

export async function deleteClubDocument(input: {
  documentId: string;
  organizationId: string;
}): Promise<boolean> {
  const result = await withDatabase((prisma) =>
    prisma.clubDocument.deleteMany({
      where: { id: input.documentId, organizationId: input.organizationId },
    }),
  );

  return Boolean(result && result.count > 0);
}
