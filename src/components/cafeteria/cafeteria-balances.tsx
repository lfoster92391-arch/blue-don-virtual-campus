import Link from "next/link";

import {
  CAFETERIA_CREDIT_CONTACT,
  CAFETERIA_CREDIT_LOCATION,
  cafeteriaBalanceMessage,
} from "@/config/cafeteria";

export type CafeteriaBalanceRow = {
  studentId: string;
  studentName: string;
  balanceLabel: string;
  balanceCents: number;
  isLow: boolean;
};

/**
 * Cafeteria money as a family sees it. Read-only on purpose — nothing in the
 * app takes a payment, so the only thing to show alongside a low balance is
 * where to send the envelope.
 */
export function CafeteriaBalances({
  rows,
  showGuideLink = true,
}: {
  rows: CafeteriaBalanceRow[];
  showGuideLink?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No cafeteria balance is being tracked yet. One starts the first time you
        send money to {CAFETERIA_CREDIT_LOCATION} — put cash or a check in an
        envelope with your student&apos;s name on it and {CAFETERIA_CREDIT_CONTACT}{" "}
        will add it to their account.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.studentId}
            className={`rounded-xl border p-4 ${
              row.isLow
                ? "border-[#D4A017]/50 bg-[#D4A017]/10"
                : "border-border bg-card"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-foreground">{row.studentName}</p>
              <p
                className={`text-lg font-semibold ${
                  row.isLow ? "text-[#D4A017]" : "text-[#2E8B57]"
                }`}
              >
                {row.balanceLabel}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {cafeteriaBalanceMessage(row.balanceCents)}
            </p>
          </li>
        ))}
      </ul>

      {showGuideLink ? (
        <p className="text-sm text-muted-foreground">
          Not sure how payments work?{" "}
          <Link
            href="/parent/guide#paying-for-lunch"
            className="font-medium text-[#2F80ED] underline underline-offset-4"
          >
            Read the parent guide
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
