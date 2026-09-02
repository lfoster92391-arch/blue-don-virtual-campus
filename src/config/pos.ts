/**
 * Cricut Club cashier — the register the crew runs at a table on campus.
 *
 * Sales are rung up in person (game nights, open house, the hallway table) and
 * land in the club ledger as a deposit, which is the same money the Finances
 * tab already reports. Nothing here is secret; the PIN that opens the register
 * lives in `src/lib/pos/lock.ts`, which the browser never sees.
 */

import { formatCents } from "@/lib/club-finance";

/** Signed, HttpOnly cookie that marks this browser as an open register. */
export const POS_UNLOCK_COOKIE = "bd_pos_unlock";

/** One school day. A cashier enters the PIN at the start of a shift, not per sale. */
export const POS_UNLOCK_MAX_AGE_SECONDS = 60 * 60 * 8;

export const POS_PIN_LENGTH = 4;

/** Ceiling on a typed one-off amount, as a fat-finger guard. */
export const POS_CUSTOM_MAX_CENTS = 50_000;

/** Most items anyone rings onto a single ticket. */
export const POS_MAX_LINE_QUANTITY = 99;

/**
 * Every register deposit starts with this, so the Finances tab and the CSV
 * export show at a glance which money came off the table.
 */
export const POS_MEMO_PREFIX = "Register sale";

export type PosTenderId = "CASH" | "VENMO" | "CARD" | "OTHER";

export type PosTender = {
  id: PosTenderId;
  label: string;
  hint: string;
};

export const POS_TENDERS: PosTender[] = [
  { id: "CASH", label: "Cash", hint: "Bills and change in the box." },
  { id: "VENMO", label: "Venmo", hint: "Paid to the club handle." },
  { id: "CARD", label: "Card", hint: "Tapped on the club reader." },
  { id: "OTHER", label: "Other", hint: "Check, IOU, or a staff account." },
];

export function isPosTender(value: string): value is PosTenderId {
  return POS_TENDERS.some((tender) => tender.id === value);
}

export function posTenderLabel(id: PosTenderId): string {
  return POS_TENDERS.find((tender) => tender.id === id)?.label ?? "Other";
}

export type PosTicketLine = {
  itemId: string;
  quantity: number;
};

/**
 * Turn what a cashier typed for a one-off item into whole cents. Accepts `5`,
 * `5.5`, `$5.50`, and `1,250.00`; rejects anything else so a slip of the
 * keyboard cannot post a strange amount to the club ledger.
 */
export function parsePosAmountToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const cents = Math.round(Number(cleaned) * 100);
  if (!Number.isFinite(cents) || cents <= 0 || cents > POS_CUSTOM_MAX_CENTS) {
    return null;
  }

  return cents;
}

/**
 * The one-line memo written onto the ledger entry. Trimmed to fit the same
 * 240-character budget the manual finance form uses.
 */
export function buildPosMemo(input: {
  parts: string[];
  tender: PosTenderId;
  note?: string;
}): string {
  const segments = [
    POS_MEMO_PREFIX,
    input.parts.join(", "),
    posTenderLabel(input.tender),
  ];
  if (input.note?.trim()) {
    segments.push(input.note.trim());
  }
  return segments.join(" · ").slice(0, 240);
}

export function isPosMemo(memo: string | null): boolean {
  return Boolean(memo?.startsWith(POS_MEMO_PREFIX));
}

export { formatCents as formatPosMoney };
