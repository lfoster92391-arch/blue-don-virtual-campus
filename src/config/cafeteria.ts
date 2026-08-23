/**
 * Cafeteria account money.
 *
 * The campus does not take card payments. Families send cash or a check to
 * school in an envelope with the student's name on it, and the front office
 * credits the account by hand. Everything here supports that paper process
 * rather than a checkout.
 */

/** Who families hand cafeteria money to, named on every parent-facing screen. */
export const CAFETERIA_CREDIT_CONTACT = "Mrs. Dalfol";

/** Where the envelope goes. */
export const CAFETERIA_CREDIT_LOCATION = "the school office";

/**
 * At or below this, the balance is called low and linked parents get one
 * in-app message. Roughly two hot lunches, which leaves a family time to send
 * an envelope before the account runs dry.
 */
export const CAFETERIA_LOW_BALANCE_CENTS = 1000;

/**
 * How long before the same family can be told again that a balance is low.
 * A run of daily charges should not produce a run of daily messages.
 */
export const CAFETERIA_LOW_BALANCE_QUIET_HOURS = 72;

/** Largest single entry the office screen accepts, as a typo guard. */
export const CAFETERIA_MAX_ENTRY_CENTS = 100_000;

export type CafeteriaLedgerKind = "CREDIT" | "CHARGE" | "ADJUSTMENT";

export const CAFETERIA_LEDGER_KINDS: CafeteriaLedgerKind[] = [
  "CREDIT",
  "CHARGE",
  "ADJUSTMENT",
];

export const CAFETERIA_LEDGER_KIND_META: Record<
  CafeteriaLedgerKind,
  { label: string; hint: string; direction: 1 | -1 }
> = {
  CREDIT: {
    label: "Money added",
    hint: "Cash or a check brought to the office.",
    direction: 1,
  },
  CHARGE: {
    label: "Lunch charged",
    hint: "Meals taken in the cafeteria.",
    direction: -1,
  },
  ADJUSTMENT: {
    label: "Correction",
    hint: "Fixes a mistake — always needs a note.",
    direction: -1,
  },
};

export function isCafeteriaLedgerKind(
  value: string,
): value is CafeteriaLedgerKind {
  return (CAFETERIA_LEDGER_KINDS as string[]).includes(value);
}

export function formatCafeteriaMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Turn what someone typed into the office form into whole cents. Accepts
 * `12`, `12.5`, `$12.50`, and `1,250.00`; rejects anything else so a slip of
 * the keyboard cannot post a strange amount.
 */
export function parseCafeteriaAmountToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const cents = Math.round(Number(cleaned) * 100);
  if (!Number.isFinite(cents) || cents <= 0) {
    return null;
  }

  return cents;
}

/** Low enough to warn a family about, including an account already overdrawn. */
export function isLowCafeteriaBalance(balanceCents: number): boolean {
  return balanceCents <= CAFETERIA_LOW_BALANCE_CENTS;
}

/** One short line a parent can act on, used on the lunch board and the guide. */
export function cafeteriaBalanceMessage(balanceCents: number): string {
  if (balanceCents < 0) {
    return `This account is behind by ${formatCafeteriaMoney(
      Math.abs(balanceCents),
    )}. Send an envelope with your student's name on it to ${CAFETERIA_CREDIT_LOCATION}.`;
  }

  if (isLowCafeteriaBalance(balanceCents)) {
    return `This balance is running low. Send cash or a check to ${CAFETERIA_CREDIT_LOCATION} in an envelope with your student's name on it, and ${CAFETERIA_CREDIT_CONTACT} will add it to the account.`;
  }

  return "This balance is in good shape.";
}
