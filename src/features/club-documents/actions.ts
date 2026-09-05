"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { redirectToClubTab } from "@/lib/club-tab-path";
import {
  canEditClubDocuments,
  createClubDocument,
  deleteClubDocument,
  updateClubDocument,
} from "@/services/club-document-service";

export type ClubDocumentActionState = {
  error?: string;
  success?: string;
};

const docTypeSchema = z.enum(["BYLAWS", "CONSTITUTION", "OTHER"]);

function revalidateOrg(slug: string) {
  revalidatePath(`/organizations/${slug}`);
}

export async function createClubDocumentAction(
  _prev: ClubDocumentActionState,
  formData: FormData,
): Promise<ClubDocumentActionState> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const docTypeRaw = String(formData.get("docType") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();

  const docType = docTypeSchema.safeParse(docTypeRaw);
  if (!organizationId || !title || !docType.success) {
    return { error: "Title and document type are required." };
  }

  const allowed = await canEditClubDocuments(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return { error: "Only officers and admins can manage documents." };
  }

  const created = await createClubDocument({
    organizationId,
    title,
    docType: docType.data,
    body: body || null,
    fileUrl: fileUrl || null,
    userId: user.id,
  });

  if (!created) {
    return { error: "Could not save the document." };
  }

  const slug = organizationSlug || "it-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "documents");
}

export async function updateClubDocumentAction(
  _prev: ClubDocumentActionState,
  formData: FormData,
): Promise<ClubDocumentActionState> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const documentId = String(formData.get("documentId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const docTypeRaw = String(formData.get("docType") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();

  const docType = docTypeSchema.safeParse(docTypeRaw);
  if (!organizationId || !documentId || !title || !docType.success) {
    return { error: "Title and document type are required." };
  }

  const allowed = await canEditClubDocuments(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return { error: "Only officers and admins can manage documents." };
  }

  const ok = await updateClubDocument({
    documentId,
    organizationId,
    title,
    docType: docType.data,
    body: body || null,
    fileUrl: fileUrl || null,
    userId: user.id,
  });

  if (!ok) {
    return { error: "Could not update the document." };
  }

  const slug = organizationSlug || "it-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "documents");
}

export async function deleteClubDocumentAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const documentId = String(formData.get("documentId") ?? "");

  if (!organizationId || !documentId) {
    return;
  }

  const allowed = await canEditClubDocuments(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return;
  }

  await deleteClubDocument({ documentId, organizationId });
  const slug = organizationSlug || "it-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "documents");
}
