"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { CRICUT_CLUB_SLUG } from "@/config/cricut-shop";
import {
  POS_MAX_LINE_QUANTITY,
  buildPosMemo,
  isPosTender,
  parsePosAmountToCents,
  type PosTenderId,
} from "@/config/pos";
import {
  clearRegisterUnlock,
  grantRegisterUnlock,
  isRegisterUnlocked,
  verifyPosPin,
} from "@/lib/pos/lock";
import { requireCompleteProfile } from "@/lib/auth/session";
import { addClubLedgerEntry } from "@/services/club-finance-service";
import {
  canManageCricutShop,
  getCricutOrganization,
  getCricutShopItem,
} from "@/services/cricut-shop-service";

export type PosUnlockState = {
  error?: string;
};

export type PosSaleState = {
  error?: string;
  /** Set when the shift expired mid-ticket, so the UI can send them back to the PIN. */
  locked?: boolean;
  success?: string;
  /** Changes on every recorded sale — the register clears the ticket off it. */
  saleId?: string;
};

/**
 * A soft brake on guessing, not a lockout: five misses in a row rest the pad
 * for half a minute. Held in memory on purpose — a restart forgiving a few
 * attempts is a better trade than locking a cashier out mid-shift.
 */
const WRONG_PIN_LIMIT = 5;
const WRONG_PIN_COOLDOWN_MS = 30_000;

const attempts = new Map<string, { misses: number; blockedUntil: number }>();

function cooldownRemaining(userId: string): number {
  const record = attempts.get(userId);
  if (!record) {
    return 0;
  }
  return Math.max(0, record.blockedUntil - Date.now());
}

function noteWrongPin(userId: string): void {
  const record = attempts.get(userId) ?? { misses: 0, blockedUntil: 0 };
  record.misses += 1;
  if (record.misses >= WRONG_PIN_LIMIT) {
    record.misses = 0;
    record.blockedUntil = Date.now() + WRONG_PIN_COOLDOWN_MS;
  }
  attempts.set(userId, record);
}

function revalidateRegister() {
  revalidatePath("/cricut/pos");
  revalidatePath("/cricut");
  revalidatePath("/finances");
  revalidatePath(`/organizations/${CRICUT_CLUB_SLUG}`);
}

/** The signed-in user, confirmed as someone who may run the club register. */
async function requireCashier() {
  const user = await requireCompleteProfile();
  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club is not set up yet." as const };
  }
  if (!(await canManageCricutShop(user.id, user.role, org.id))) {
    return { error: "You do not have access to the Cricut Club register." as const };
  }
  return { user, org };
}

export async function unlockRegisterAction(
  _prev: PosUnlockState,
  submitted: string,
): Promise<PosUnlockState> {
  const cashier = await requireCashier();
  if ("error" in cashier) {
    return { error: cashier.error };
  }

  const waiting = cooldownRemaining(cashier.user.id);
  if (waiting > 0) {
    return {
      error: `Too many tries. Wait ${Math.ceil(waiting / 1000)} seconds and enter the PIN again.`,
    };
  }

  const pin = String(submitted ?? "").trim();
  if (!verifyPosPin(pin)) {
    noteWrongPin(cashier.user.id);
    return { error: "That PIN is not right. Try again." };
  }

  attempts.delete(cashier.user.id);
  await grantRegisterUnlock(cashier.user.id);
  revalidatePath("/cricut/pos");
  return {};
}

export async function lockRegisterAction(): Promise<void> {
  await requireCompleteProfile();
  await clearRegisterUnlock();
  redirect("/cricut/pos");
}

const saleLineSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(POS_MAX_LINE_QUANTITY),
});

export async function recordRegisterSaleAction(
  _prev: PosSaleState,
  formData: FormData,
): Promise<PosSaleState> {
  const cashier = await requireCashier();
  if ("error" in cashier) {
    return { error: cashier.error };
  }

  const { user, org } = cashier;
  if (!(await isRegisterUnlocked(user.id))) {
    return {
      locked: true,
      error: "The register locked. Enter the PIN to keep ringing sales.",
    };
  }

  const tenderRaw = String(formData.get("tender") ?? "CASH");
  const tender: PosTenderId = isPosTender(tenderRaw) ? tenderRaw : "CASH";

  let parsedLines: { itemId: string; quantity: number }[];
  try {
    const decoded = JSON.parse(String(formData.get("lines") ?? "[]")) as unknown;
    parsedLines = z.array(saleLineSchema).max(40).parse(decoded);
  } catch {
    return { error: "That ticket could not be read. Start it over." };
  }

  // Prices come from the catalog, never from the browser, so a tampered
  // request cannot post an invented amount to the club ledger.
  const resolved = await Promise.all(
    parsedLines.map(async (line) => {
      const item = await getCricutShopItem(line.itemId);
      if (!item || !item.availableToSell) {
        return null;
      }
      if (item.organizationId !== org.id && !item.isSample) {
        return null;
      }
      return {
        title: item.title,
        quantity: line.quantity,
        totalCents: item.priceCents * line.quantity,
      };
    }),
  );

  if (resolved.some((line) => line === null)) {
    return { error: "Something on this ticket is no longer for sale. Rebuild it." };
  }

  const lines = resolved.filter((line) => line !== null);
  const memoParts = lines.map((line) => `${line.quantity}× ${line.title}`);
  let totalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);

  const customAmount = String(formData.get("customAmount") ?? "").trim();
  if (customAmount) {
    const cents = parsePosAmountToCents(customAmount);
    if (cents === null) {
      return { error: "Enter the one-off amount as dollars, like 5.00." };
    }
    const label = String(formData.get("customLabel") ?? "").trim().slice(0, 60);
    memoParts.push(label || "Other item");
    totalCents += cents;
  }

  if (totalCents <= 0) {
    return { error: "Add something to the ticket first." };
  }

  const saleId = await addClubLedgerEntry({
    organizationId: org.id,
    type: "DEPOSIT",
    amountCents: totalCents,
    memo: buildPosMemo({
      parts: memoParts,
      tender,
      note: String(formData.get("note") ?? ""),
    }),
    createdById: user.id,
  });

  if (!saleId) {
    return { error: "The sale did not save. Try it again." };
  }

  revalidateRegister();
  return { success: "Sale recorded to the club ledger.", saleId };
}
