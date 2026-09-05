"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { redirectToClubTab } from "@/lib/club-tab-path";
import {
  addClubChecklistItem,
  canCompleteClubChecklistItems,
  canManageClubProjects,
  createClubChecklist,
  createClubProject,
  deleteClubChecklist,
  deleteClubProject,
  setClubChecklistItemDone,
  updateClubProject,
} from "@/services/club-project-service";

export type ClubProjectActionState = {
  error?: string;
  success?: string;
};

const statusSchema = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
]);

function revalidateOrg(slug: string) {
  revalidatePath(`/organizations/${slug}`);
}

export async function createClubProjectAction(
  _prev: ClubProjectActionState,
  formData: FormData,
): Promise<ClubProjectActionState> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "PLANNING");
  const ownerUserId = String(formData.get("ownerUserId") ?? "").trim();

  const status = statusSchema.safeParse(statusRaw);
  if (!organizationId || !title || !status.success) {
    return { error: "Project title is required." };
  }

  const allowed = await canManageClubProjects(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return { error: "Only officers and admins can manage projects." };
  }

  const created = await createClubProject({
    organizationId,
    title,
    description: description || null,
    status: status.data,
    ownerUserId: ownerUserId || user.id,
    userId: user.id,
  });

  if (!created) {
    return { error: "Could not create the project." };
  }

  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "projects");
}

export async function updateClubProjectAction(
  _prev: ClubProjectActionState,
  formData: FormData,
): Promise<ClubProjectActionState> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "PLANNING");
  const ownerUserId = String(formData.get("ownerUserId") ?? "").trim();

  const status = statusSchema.safeParse(statusRaw);
  if (!organizationId || !projectId || !title || !status.success) {
    return { error: "Project title is required." };
  }

  const allowed = await canManageClubProjects(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return { error: "Only officers and admins can manage projects." };
  }

  const ok = await updateClubProject({
    projectId,
    organizationId,
    title,
    description: description || null,
    status: status.data,
    ownerUserId: ownerUserId || null,
  });

  if (!ok) {
    return { error: "Could not update the project." };
  }

  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "projects");
}

export async function deleteClubProjectAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!organizationId || !projectId) {
    return;
  }
  const allowed = await canManageClubProjects(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return;
  }
  await deleteClubProject({ projectId, organizationId });
  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "projects");
}

export async function createClubChecklistAction(
  _prev: ClubProjectActionState,
  formData: FormData,
): Promise<ClubProjectActionState> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "");

  if (!organizationId || !title) {
    return { error: "Checklist title is required." };
  }

  const allowed = await canManageClubProjects(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return { error: "Only officers and admins can manage checklists." };
  }

  const itemTitles = itemsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const created = await createClubChecklist({
    organizationId,
    title,
    projectId: projectId || null,
    userId: user.id,
    itemTitles,
  });

  if (!created) {
    return { error: "Could not create the checklist." };
  }

  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "checklists");
}

export async function addClubChecklistItemAction(
  _prev: ClubProjectActionState,
  formData: FormData,
): Promise<ClubProjectActionState> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const checklistId = String(formData.get("checklistId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!organizationId || !checklistId || !title) {
    return { error: "Item title is required." };
  }

  const allowed = await canManageClubProjects(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return { error: "Only officers and admins can add checklist items." };
  }

  const ok = await addClubChecklistItem({
    checklistId,
    organizationId,
    title,
  });
  if (!ok) {
    return { error: "Could not add the item." };
  }

  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "checklists");
}

export async function toggleClubChecklistItemAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const done = String(formData.get("done") ?? "") === "true";

  if (!organizationId || !itemId) {
    return;
  }

  const allowed = await canCompleteClubChecklistItems(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return;
  }

  await setClubChecklistItemDone({
    itemId,
    organizationId,
    done,
    userId: user.id,
  });
  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "checklists");
}

export async function deleteClubChecklistAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const organizationId = String(formData.get("organizationId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const checklistId = String(formData.get("checklistId") ?? "");
  if (!organizationId || !checklistId) {
    return;
  }
  const allowed = await canManageClubProjects(
    user.id,
    user.role,
    organizationId,
  );
  if (!allowed) {
    return;
  }
  await deleteClubChecklist({ checklistId, organizationId });
  const slug = organizationSlug || "cricut-club";
  revalidateOrg(slug);
  redirectToClubTab(slug, "checklists");
}
