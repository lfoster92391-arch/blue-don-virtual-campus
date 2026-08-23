"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  CAFETERIA_MAX_ENTRY_CENTS,
  formatCafeteriaMoney,
  isCafeteriaLedgerKind,
  parseCafeteriaAmountToCents,
} from "@/config/cafeteria";
import { canManageCafeteriaAccounts } from "@/config/roles";
import { requireCampusAccess } from "@/lib/auth/session";
import { recordCafeteriaLedgerEntry } from "@/services/cafeteria-account-service";

export type CafeteriaActionState = {
  error?: string;
  success?: string;
};

const entrySchema = z.object({
  studentId: z.string().trim().min(1, "Choose a student."),
  kind: z.string().trim().refine(isCafeteriaLedgerKind, "Choose what this is."),
  amount: z.string().trim().min(1, "Enter an amount."),
  note: z.string().trim().max(280, "Keep the note under 280 characters.").optional(),
});

/**
 * Record money brought to the office, a meal charged, or a correction.
 *
 * This is the only way a cafeteria balance moves — families do not pay in the
 * app, so there is no self-service path to guard against here.
 */
export async function recordCafeteriaEntryAction(
  _prevState: CafeteriaActionState,
  formData: FormData,
): Promise<CafeteriaActionState> {
  const user = await requireCampusAccess();

  if (!canManageCafeteriaAccounts(user.role)) {
    return { error: "Your account cannot change cafeteria balances." };
  }

  const parsed = entrySchema.safeParse({
    studentId: formData.get("studentId"),
    kind: formData.get("kind"),
    amount: formData.get("amount"),
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const { studentId, kind, amount, note } = parsed.data;

  const amountCents = parseCafeteriaAmountToCents(amount);
  if (amountCents === null) {
    return { error: "Enter an amount like 20 or 20.50." };
  }

  if (amountCents > CAFETERIA_MAX_ENTRY_CENTS) {
    return {
      error: `Single entries are capped at ${formatCafeteriaMoney(CAFETERIA_MAX_ENTRY_CENTS)}. Split it or ask IT.`,
    };
  }

  if (kind === "ADJUSTMENT" && !note) {
    return { error: "Corrections need a note explaining what was fixed." };
  }

  const result = await recordCafeteriaLedgerEntry({
    studentId,
    kind,
    amountCents,
    note: note ?? null,
    recordedBy: { id: user.id, displayName: user.displayName },
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/cafeteria");
  revalidatePath("/lunch");
  revalidatePath("/parent");

  const balance = `New balance ${result.account.balanceLabel}.`;
  const told =
    result.notifiedParents > 0
      ? ` Told ${result.notifiedParents} parent account${result.notifiedParents === 1 ? "" : "s"} the balance is low.`
      : "";

  if (kind === "CREDIT") {
    return {
      success: `Added ${formatCafeteriaMoney(amountCents)}. ${balance}${told}`,
    };
  }

  return {
    success: `Recorded ${formatCafeteriaMoney(amountCents)}. ${balance}${told}`,
  };
}
