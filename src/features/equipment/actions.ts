"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { EquipmentCategory, EquipmentStatus } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageEquipment,
  checkoutEquipment,
  createEquipment,
  getEquipmentContext,
  markEquipmentRepair,
  returnEquipment,
  updateEquipment,
} from "@/services/equipment-service";

export type EquipmentActionState = {
  error?: string;
  success?: string;
  equipmentId?: string;
};

const createSchema = z.object({
  assetTag: z.string().trim().min(1, "Asset tag is required"),
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().trim().min(1, "Location is required"),
  serialNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  organizationId: z.string().optional(),
});

const updateSchema = z.object({
  assetTag: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  location: z.string().trim().min(1).optional(),
  serialNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const checkoutSchema = z.object({
  equipmentId: z.string().min(1),
  userId: z.string().uuid("Select a valid borrower"),
  dueAt: z.string().optional(),
  notes: z.string().trim().optional(),
});

function revalidateEquipmentPaths(equipmentId?: string) {
  revalidatePath("/equipment");
  revalidatePath("/equipment/manage");
  revalidatePath("/operations");
  if (equipmentId) {
    revalidatePath(`/equipment/${equipmentId}`);
  }
}

async function assertCanManageEquipment(equipmentId: string) {
  const user = await requireCompleteProfile();
  const context = await getEquipmentContext(equipmentId);

  if (!context) {
    return { ok: false as const, error: "Equipment not found." };
  }

  const allowed = await canManageEquipment(user.id, user.role, context);

  if (!allowed) {
    return {
      ok: false as const,
      error: "You do not have permission to manage this equipment.",
    };
  }

  return { ok: true as const, user };
}

export async function createEquipmentAction(
  _prev: EquipmentActionState,
  formData: FormData,
): Promise<EquipmentActionState> {
  const user = await requireCompleteProfile();

  const parsed = createSchema.safeParse({
    assetTag: formData.get("assetTag"),
    name: formData.get("name"),
    category: formData.get("category"),
    location: formData.get("location"),
    serialNumber: formData.get("serialNumber") || undefined,
    notes: formData.get("notes") || undefined,
    organizationId: formData.get("organizationId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid equipment data." };
  }

  const context = { organizationId: parsed.data.organizationId };
  const allowed = await canManageEquipment(user.id, user.role, context);

  if (!allowed) {
    return { error: "You do not have permission to add equipment." };
  }

  const equipmentId = await createEquipment({
    ...parsed.data,
    category: parsed.data.category as EquipmentCategory,
  });

  if (!equipmentId) {
    return { error: "Unable to create equipment item." };
  }

  revalidateEquipmentPaths(equipmentId);
  return { success: "Equipment item added.", equipmentId };
}

export async function updateEquipmentAction(
  equipmentId: string,
  _prev: EquipmentActionState,
  formData: FormData,
): Promise<EquipmentActionState> {
  const check = await assertCanManageEquipment(equipmentId);
  if (!check.ok) {
    return { error: check.error };
  }

  const parsed = updateSchema.safeParse({
    assetTag: formData.get("assetTag") || undefined,
    name: formData.get("name") || undefined,
    category: formData.get("category") || undefined,
    status: formData.get("status") || undefined,
    location: formData.get("location") || undefined,
    serialNumber: formData.get("serialNumber") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid equipment data." };
  }

  const updated = await updateEquipment(equipmentId, {
    ...parsed.data,
    category: parsed.data.category as EquipmentCategory | undefined,
    status: parsed.data.status as EquipmentStatus | undefined,
  });

  if (!updated) {
    return { error: "Unable to update equipment item." };
  }

  revalidateEquipmentPaths(equipmentId);
  return { success: "Equipment updated." };
}

export async function checkoutEquipmentAction(
  _prev: EquipmentActionState,
  formData: FormData,
): Promise<EquipmentActionState> {
  const parsed = checkoutSchema.safeParse({
    equipmentId: formData.get("equipmentId"),
    userId: formData.get("userId"),
    dueAt: formData.get("dueAt") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout data." };
  }

  const check = await assertCanManageEquipment(parsed.data.equipmentId);
  if (!check.ok) {
    return { error: check.error };
  }

  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined;

  const success = await checkoutEquipment({
    equipmentId: parsed.data.equipmentId,
    userId: parsed.data.userId,
    dueAt,
    notes: parsed.data.notes,
  });

  if (!success) {
    return { error: "Unable to check out equipment. It may not be available." };
  }

  revalidateEquipmentPaths(parsed.data.equipmentId);
  return { success: "Equipment checked out." };
}

export async function returnEquipmentAction(
  equipmentId: string,
  notes?: string,
): Promise<EquipmentActionState> {
  const check = await assertCanManageEquipment(equipmentId);
  if (!check.ok) {
    return { error: check.error };
  }

  const success = await returnEquipment(equipmentId, notes);

  if (!success) {
    return { error: "Unable to return equipment." };
  }

  revalidateEquipmentPaths(equipmentId);
  return { success: "Equipment returned." };
}

export async function markRepairAction(
  equipmentId: string,
): Promise<EquipmentActionState> {
  const check = await assertCanManageEquipment(equipmentId);
  if (!check.ok) {
    return { error: check.error };
  }

  const success = await markEquipmentRepair(equipmentId);

  if (!success) {
    return { error: "Unable to mark equipment for repair." };
  }

  revalidateEquipmentPaths(equipmentId);
  return { success: "Equipment marked for repair." };
}
