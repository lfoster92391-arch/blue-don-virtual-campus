import type {
  ClubFundraiserStatus,
  ClubLedgerEntryType,
} from "@/generated/prisma/client";

export type ClubLedgerEntryView = {
  id: string;
  type: ClubLedgerEntryType;
  amountCents: number;
  memo: string | null;
  fundraiserId: string | null;
  fundraiserTitle: string | null;
  createdByName: string;
  /** When the money moved — what the ledger is grouped and filtered by. */
  occurredAt: Date;
  /** When the row was typed in. Differs from `occurredAt` on backfills. */
  createdAt: Date;
};

export type ClubFundraiserView = {
  id: string;
  title: string;
  description: string | null;
  goalCents: number;
  /** All-time net raised — a goal is cumulative, so this never gets scoped. */
  raisedCents: number;
  /** Net raised inside the selected period. */
  periodRaisedCents: number;
  /** Tagged ledger entries all-time. Zero means nothing was ever tagged. */
  taggedEntryCount: number;
  status: ClubFundraiserStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
};

/**
 * A selectable window over a club ledger. `ALL_TIME_PERIOD_KEY` and
 * `SCHOOL_YEAR_PERIOD_KEY` are open-ended; month keys are `YYYY-MM`.
 */
export type ClubFinancePeriod = {
  key: string;
  label: string;
  /** Inclusive lower bound. `null` means "no lower bound". */
  start: Date | null;
  /** Exclusive upper bound. `null` means "no upper bound". */
  end: Date | null;
};

export type ClubFinanceSnapshot = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  /**
   * All-time net balance (deposits minus withdrawals) across the whole
   * ledger. Never scoped to the selected period — this is the club's real
   * money on hand, so it stays visible while browsing a single month.
   */
  balanceCents: number;
  /** Total ledger rows all-time, regardless of the selected period. */
  totalEntryCount: number;
  /** Window the entries and period totals below are scoped to. */
  period: ClubFinancePeriod;
  /** Every window with activity, newest first, for the period picker. */
  availablePeriods: ClubFinancePeriod[];
  /** Net balance carried into the period. Equals 0 for all-time. */
  openingBalanceCents: number;
  /** Deposits inside the period. */
  periodDepositsCents: number;
  /** Withdrawals inside the period (positive number). */
  periodWithdrawalsCents: number;
  /** Deposits minus withdrawals inside the period. */
  periodNetCents: number;
  /** Opening balance plus the period net. */
  closingBalanceCents: number;
  /** Ledger rows inside the period, newest first. */
  entries: ClubLedgerEntryView[];
  fundraisers: ClubFundraiserView[];
};

export const ALL_TIME_PERIOD_KEY = "all";
export const SCHOOL_YEAR_PERIOD_KEY = "school-year";

/** Month (0-indexed) a Madonna school year begins. August = 7. */
const SCHOOL_YEAR_START_MONTH = 7;

const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

export function allTimePeriod(): ClubFinancePeriod {
  return { key: ALL_TIME_PERIOD_KEY, label: "All time", start: null, end: null };
}

/**
 * August 1 of the current school year through today. Matches the Digital
 * Forms Center's school-year boundary so finance and compliance agree.
 */
export function schoolYearPeriod(now: Date = new Date()): ClubFinancePeriod {
  const startYear =
    now.getMonth() >= SCHOOL_YEAR_START_MONTH
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return {
    key: SCHOOL_YEAR_PERIOD_KEY,
    label: `School year ${startYear}–${startYear + 1}`,
    start: new Date(startYear, SCHOOL_YEAR_START_MONTH, 1),
    end: null,
  };
}

function monthPeriod(year: number, monthIndex: number): ClubFinancePeriod {
  return {
    key: monthKey(new Date(year, monthIndex, 1)),
    label: monthLabel(year, monthIndex),
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 1),
  };
}

/**
 * Turns a `?period=` value into a window. Unknown or missing values fall back
 * to all-time so a stale bookmark can never hide the club's money.
 */
export function resolveClubFinancePeriod(
  key: string | null | undefined,
  now: Date = new Date(),
): ClubFinancePeriod {
  const trimmed = key?.trim();

  if (!trimmed || trimmed === ALL_TIME_PERIOD_KEY) {
    return allTimePeriod();
  }

  if (trimmed === SCHOOL_YEAR_PERIOD_KEY) {
    return schoolYearPeriod(now);
  }

  const match = MONTH_KEY_PATTERN.exec(trimmed);
  if (match) {
    return monthPeriod(Number(match[1]), Number(match[2]) - 1);
  }

  return allTimePeriod();
}

/**
 * Every window worth offering in the picker: all-time, the current school
 * year, then one entry per month that actually has activity (newest first).
 * Months are derived from the data, so an empty ledger offers no dead options.
 */
export function buildAvailablePeriods(
  occurredDates: Date[],
  now: Date = new Date(),
): ClubFinancePeriod[] {
  const seen = new Map<string, ClubFinancePeriod>();

  for (const date of occurredDates) {
    const period = monthPeriod(date.getFullYear(), date.getMonth());
    if (!seen.has(period.key)) {
      seen.set(period.key, period);
    }
  }

  const months = [...seen.values()].sort((a, b) =>
    a.key < b.key ? 1 : a.key > b.key ? -1 : 0,
  );

  return [allTimePeriod(), schoolYearPeriod(now), ...months];
}

export function isWithinPeriod(date: Date, period: ClubFinancePeriod): boolean {
  if (period.start && date.getTime() < period.start.getTime()) {
    return false;
  }
  if (period.end && date.getTime() >= period.end.getTime()) {
    return false;
  }
  return true;
}

function isBeforePeriod(date: Date, period: ClubFinancePeriod): boolean {
  return period.start !== null && date.getTime() < period.start.getTime();
}

function signedCents(entry: {
  type: ClubLedgerEntryType;
  amountCents: number;
}): number {
  return entry.type === "DEPOSIT" ? entry.amountCents : -entry.amountCents;
}

/** Net of every entry that landed before the period opened. */
export function sumOpeningBalance(
  entries: { type: ClubLedgerEntryType; amountCents: number; occurredAt: Date }[],
  period: ClubFinancePeriod,
): number {
  return entries.reduce(
    (sum, entry) =>
      isBeforePeriod(entry.occurredAt, period) ? sum + signedCents(entry) : sum,
    0,
  );
}

export function sumSignedCents(
  entries: { type: ClubLedgerEntryType; amountCents: number }[],
): number {
  return entries.reduce((sum, entry) => sum + signedCents(entry), 0);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ledgerToCsv(entries: ClubLedgerEntryView[]): string {
  const header = [
    "date",
    "entered_on",
    "type",
    "amount",
    "memo",
    "fundraiser",
    "created_by",
  ];
  const lines = entries.map((entry) => {
    const amount =
      entry.type === "WITHDRAWAL"
        ? `-${(entry.amountCents / 100).toFixed(2)}`
        : (entry.amountCents / 100).toFixed(2);
    const cells = [
      entry.occurredAt.toISOString(),
      entry.createdAt.toISOString(),
      entry.type,
      amount,
      entry.memo ?? "",
      entry.fundraiserTitle ?? "",
      entry.createdByName,
    ].map((value) => `"${String(value).replaceAll('"', '""')}"`);
    return cells.join(",");
  });

  return [header.join(","), ...lines].join("\n");
}
