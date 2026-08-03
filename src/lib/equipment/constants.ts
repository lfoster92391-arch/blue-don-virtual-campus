import type { EquipmentCategory, EquipmentStatus } from "@/generated/prisma/client";

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  CAMERA: "Camera",
  CHROMEBOOK: "Chromebook",
  MICROPHONE: "Microphone",
  PROJECTOR: "Projector",
  LAPTOP_CART: "Laptop cart",
  OTHER: "Other",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  AVAILABLE: "Available",
  CHECKED_OUT: "Checked out",
  REPAIR: "In repair",
  RETIRED: "Retired",
};

export const EQUIPMENT_STATUS_VARIANTS: Record<
  EquipmentStatus,
  "success" | "warning" | "info" | "muted"
> = {
  AVAILABLE: "success",
  CHECKED_OUT: "warning",
  REPAIR: "info",
  RETIRED: "muted",
};

export const EQUIPMENT_CATEGORIES = Object.keys(
  EQUIPMENT_CATEGORY_LABELS,
) as EquipmentCategory[];

export const EQUIPMENT_STATUSES = Object.keys(
  EQUIPMENT_STATUS_LABELS,
) as EquipmentStatus[];
