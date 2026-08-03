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
  createdAt: Date;
};

export type ClubFundraiserView = {
  id: string;
  title: string;
  description: string | null;
  goalCents: number;
  raisedCents: number;
  status: ClubFundraiserStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
};

export type ClubFinanceSnapshot = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  balanceCents: number;
  entries: ClubLedgerEntryView[];
  fundraisers: ClubFundraiserView[];
};

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ledgerToCsv(entries: ClubLedgerEntryView[]): string {
  const header = [
    "date",
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
