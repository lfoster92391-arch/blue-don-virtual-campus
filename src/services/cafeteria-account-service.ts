/**
 * Cafeteria account balances.
 *
 * Madonna takes no card payments. A family sends cash or a check to school in
 * an envelope with the student's name on it, and the front office records it
 * here. The app's whole job is to show the running total to the people who
 * ordered the lunches and to speak up before an account runs dry.
 *
 * An account row only exists once the office has recorded something for that
 * student, so families who pack every day are never shown a balance or nudged
 * about one.
 *
 * Every read soft-fails to an empty result so the lunch board still renders
 * when the database is unreachable, matching the rest of the campus services.
 */

import { isDatabaseConfigured } from "@/config/env";
import {
  CAFETERIA_CREDIT_CONTACT,
  CAFETERIA_CREDIT_LOCATION,
  CAFETERIA_LEDGER_KIND_META,
  CAFETERIA_LOW_BALANCE_QUIET_HOURS,
  formatCafeteriaMoney,
  isLowCafeteriaBalance,
  type CafeteriaLedgerKind,
} from "@/config/cafeteria";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { listLinkedParentIds } from "@/services/parent-student-service";
import { sendSystemStudentMessages } from "@/services/student-message-service";

export type CafeteriaAccountView = {
  studentId: string;
  balanceCents: number;
  balanceLabel: string;
  isLow: boolean;
  updatedAt: string;
};

export type CafeteriaLedgerEntryView = {
  id: string;
  kind: CafeteriaLedgerKind;
  amountCents: number;
  amountLabel: string;
  balanceAfterCents: number;
  note: string | null;
  recordedByName: string | null;
  createdAt: string;
};

function toView(row: {
  studentId: string;
  balanceCents: number;
  updatedAt: Date;
}): CafeteriaAccountView {
  return {
    studentId: row.studentId,
    balanceCents: row.balanceCents,
    balanceLabel: formatCafeteriaMoney(row.balanceCents),
    isLow: isLowCafeteriaBalance(row.balanceCents),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function displayNameFor(row: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const joined = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.displayName ?? (joined.length > 0 ? joined : row.email);
}

/**
 * Balances for the given students, keyed by student id. Students the office
 * has never recorded money for are simply absent from the result.
 */
export async function getCafeteriaAccounts(
  studentIds: string[],
): Promise<Record<string, CafeteriaAccountView>> {
  if (studentIds.length === 0 || !isDatabaseConfigured() || !isPrismaReady()) {
    return {};
  }

  const rows = await withDatabase((prisma) =>
    prisma.cafeteriaAccount.findMany({
      where: { studentId: { in: studentIds } },
      select: { studentId: true, balanceCents: true, updatedAt: true },
    }),
  );

  const accounts: Record<string, CafeteriaAccountView> = {};
  for (const row of rows ?? []) {
    accounts[row.studentId] = toView(row);
  }

  return accounts;
}

export async function getCafeteriaAccount(
  studentId: string,
): Promise<CafeteriaAccountView | null> {
  const accounts = await getCafeteriaAccounts([studentId]);
  return accounts[studentId] ?? null;
}

export async function listCafeteriaLedgerEntries(
  studentId: string,
  limit = 10,
): Promise<CafeteriaLedgerEntryView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.cafeteriaLedgerEntry.findMany({
      where: { account: { studentId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        kind: true,
        amountCents: true,
        balanceAfterCents: true,
        note: true,
        createdAt: true,
        recordedBy: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as CafeteriaLedgerKind,
    amountCents: row.amountCents,
    amountLabel: formatCafeteriaMoney(row.amountCents),
    balanceAfterCents: row.balanceAfterCents,
    note: row.note,
    recordedByName: row.recordedBy ? displayNameFor(row.recordedBy) : null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export type CafeteriaOfficeRow = {
  studentId: string;
  displayName: string;
  email: string;
  balanceCents: number;
  balanceLabel: string;
  isLow: boolean;
  updatedAt: string;
};

/**
 * Every tracked account, lowest balance first, so the office sees who needs an
 * envelope before anything else.
 */
export async function listCafeteriaAccountsForOffice(): Promise<
  CafeteriaOfficeRow[]
> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.cafeteriaAccount.findMany({
      orderBy: { balanceCents: "asc" },
      select: {
        studentId: true,
        balanceCents: true,
        updatedAt: true,
        student: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    studentId: row.studentId,
    displayName: displayNameFor(row.student),
    email: row.student.email,
    balanceCents: row.balanceCents,
    balanceLabel: formatCafeteriaMoney(row.balanceCents),
    isLow: isLowCafeteriaBalance(row.balanceCents),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export type RecordCafeteriaEntryInput = {
  studentId: string;
  kind: CafeteriaLedgerKind;
  /** Always positive; `kind` decides which way the balance moves. */
  amountCents: number;
  note?: string | null;
  recordedBy: { id: string; displayName: string };
};

export type RecordCafeteriaEntryResult =
  | {
      ok: true;
      account: CafeteriaAccountView;
      /** True when this entry is what pushed the balance into low territory. */
      notifiedParents: number;
    }
  | { ok: false; error: string };

/**
 * Record one movement of cafeteria money and, when the balance ends up low,
 * tell the linked parents in the app.
 *
 * The read of the current balance and the write of the new one share a
 * transaction so two people crediting the same envelope cannot both post
 * against a stale total.
 */
export async function recordCafeteriaLedgerEntry(
  input: RecordCafeteriaEntryInput,
): Promise<RecordCafeteriaEntryResult> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { ok: false, error: "Cafeteria accounts are unavailable right now." };
  }

  const direction = CAFETERIA_LEDGER_KIND_META[input.kind].direction;
  const delta = input.amountCents * direction;
  const note = input.note?.trim() || null;

  const outcome = await withDatabase((prisma) =>
    prisma.$transaction(async (tx) => {
      const account = await tx.cafeteriaAccount.upsert({
        where: { studentId: input.studentId },
        create: { studentId: input.studentId, balanceCents: 0 },
        update: {},
        select: {
          id: true,
          balanceCents: true,
          lowBalanceNotifiedAt: true,
        },
      });

      const balanceAfterCents = account.balanceCents + delta;
      const wasLow = isLowCafeteriaBalance(account.balanceCents);
      const isLow = isLowCafeteriaBalance(balanceAfterCents);

      // Re-warn only after the quiet window, and never twice for the same slide
      // downward — but always re-arm once a family tops the account back up.
      const quietUntil = account.lowBalanceNotifiedAt
        ? new Date(
            account.lowBalanceNotifiedAt.getTime() +
              CAFETERIA_LOW_BALANCE_QUIET_HOURS * 60 * 60 * 1000,
          )
        : null;
      const shouldNotify =
        isLow && (!wasLow || !quietUntil || quietUntil <= new Date());

      await tx.cafeteriaLedgerEntry.create({
        data: {
          accountId: account.id,
          kind: input.kind,
          amountCents: input.amountCents,
          balanceAfterCents,
          note,
          recordedById: input.recordedBy.id,
        },
      });

      const updated = await tx.cafeteriaAccount.update({
        where: { id: account.id },
        data: {
          balanceCents: balanceAfterCents,
          lowBalanceNotifiedAt: shouldNotify
            ? new Date()
            : isLow
              ? account.lowBalanceNotifiedAt
              : null,
        },
        select: { studentId: true, balanceCents: true, updatedAt: true },
      });

      return { account: updated, shouldNotify };
    }),
  );

  if (!outcome) {
    return { ok: false, error: "Unable to record that cafeteria entry." };
  }

  const account = toView(outcome.account);
  const notifiedParents = outcome.shouldNotify
    ? await notifyParentsOfLowBalance({
        studentId: input.studentId,
        balanceLabel: account.balanceLabel,
        balanceCents: account.balanceCents,
        fromUserId: input.recordedBy.id,
      })
    : 0;

  return { ok: true, account, notifiedParents };
}

/**
 * In-app notice to every linked parent, using the same Command Center inbox
 * that carries advisor and club messages, so families have one place to look.
 */
async function notifyParentsOfLowBalance(input: {
  studentId: string;
  balanceLabel: string;
  balanceCents: number;
  fromUserId: string;
}): Promise<number> {
  const parentIds = await listLinkedParentIds(input.studentId);
  if (parentIds.length === 0) {
    return 0;
  }

  const student = await withDatabase((prisma) =>
    prisma.user.findUnique({
      where: { id: input.studentId },
      select: {
        displayName: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
  );

  const studentName = student ? displayNameFor(student) : "Your student";
  const behind = input.balanceCents < 0;

  const result = await sendSystemStudentMessages({
    fromUserId: input.fromUserId,
    toUserIds: parentIds,
    organizationId: null,
    title: behind
      ? `${studentName}'s cafeteria account is behind`
      : `${studentName}'s cafeteria balance is low`,
    body: [
      `The balance is now ${input.balanceLabel}.`,
      `To add money, send cash or a check to ${CAFETERIA_CREDIT_LOCATION} in an envelope with ${studentName}'s name written on it.`,
      `${CAFETERIA_CREDIT_CONTACT} adds it to the account the same day, and the new balance shows up on the Cafeteria Lunch page.`,
    ].join(" "),
    actions: [
      { label: "View lunch balance", href: "/lunch", actionType: "link" },
      { label: "View Later", actionType: "view_later" },
    ],
  });

  return result.count;
}
