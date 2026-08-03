"use server";

import { revalidatePath } from "next/cache";

import {
  MILITARY_PASSPORT_ITEMS,
  type MilitaryPassportItem,
} from "@/config/military-passport";
import {
  TRADE_PASSPORT_ITEMS,
  type TradePassportItem,
} from "@/config/trade-passport";
import { requireCompleteProfile } from "@/lib/auth/session";
import type { PassportType } from "@/generated/prisma/client";
import { togglePassportItem } from "@/services/passport-progress-service";

export type PassportActionState = {
  error?: string;
};

function itemIdsForType(passportType: PassportType): string[] {
  if (passportType === "TRADE") {
    return TRADE_PASSPORT_ITEMS.map((item: TradePassportItem) => item.id);
  }
  if (passportType === "MILITARY") {
    return MILITARY_PASSPORT_ITEMS.map((item: MilitaryPassportItem) => item.id);
  }
  return [];
}

function revalidatePassportPaths(passportType: PassportType) {
  if (passportType === "TRADE") {
    revalidatePath("/trade-passport");
  } else if (passportType === "MILITARY") {
    revalidatePath("/military-passport");
  }
  revalidatePath("/pathways");
}

export async function togglePassportItemAction(
  passportType: PassportType,
  itemId: string,
  completed: boolean,
): Promise<PassportActionState> {
  const user = await requireCompleteProfile();
  const validIds = itemIdsForType(passportType);

  const success = await togglePassportItem(
    user.id,
    passportType,
    itemId,
    completed,
    validIds,
  );

  if (!success) {
    return { error: "Unable to update checklist item." };
  }

  revalidatePassportPaths(passportType);
  return {};
}
