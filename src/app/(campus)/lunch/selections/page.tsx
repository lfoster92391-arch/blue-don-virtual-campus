import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Wallet } from "lucide-react";

import {
  CafeteriaBalances,
  type CafeteriaBalanceRow,
} from "@/components/cafeteria/cafeteria-balances";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { LunchSelectionSummary } from "@/components/lunch/lunch-selection-summary";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { LUNCH_ORDER_CUTOFF_HOUR } from "@/config/lunch";
import { canOrderLunch } from "@/config/roles";
import { formatMinutes } from "@/config/school-hub";
import { buildLunchSelectionSummary } from "@/lib/lunch-selections";
import { requireCampusAccess } from "@/lib/auth/session";
import { getCafeteriaAccounts } from "@/services/cafeteria-account-service";
import { getLunchBoard } from "@/services/lunch-service";

export const metadata = {
  title: "Your lunch selections",
  description:
    "Every lunch choice saved for your student, day by day, with what is still open.",
};

export default async function LunchSelectionsPage() {
  const user = await requireCampusAccess();

  if (!canOrderLunch(user.role)) {
    redirect("/lunch");
  }

  const board = await getLunchBoard({
    id: user.id,
    displayName: user.displayName,
    role: user.role,
  });

  const summary = buildLunchSelectionSummary(board);
  const cutoffLabel = formatMinutes(LUNCH_ORDER_CUTOFF_HOUR * 60);

  const studentIds = board.diners
    .filter((diner) => diner.kind === "student")
    .map((diner) => diner.id);
  const accounts = await getCafeteriaAccounts(studentIds);

  const balanceRows: CafeteriaBalanceRow[] = board.diners
    .map((diner) => {
      const account = accounts[diner.id];
      if (!account) {
        return null;
      }
      return {
        studentId: diner.id,
        studentName: diner.displayName,
        balanceLabel: account.balanceLabel,
        balanceCents: account.balanceCents,
        isLow: account.isLow,
      };
    })
    .filter((row): row is CafeteriaBalanceRow => row !== null);

  return (
    <ShellPage
      title="Your lunch selections"
      description={`Everything saved so far, day by day. Change any day that is still open — ordering closes at ${cutoffLabel} that morning.`}
      actions={
        <>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/lunch">Change a lunch</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/parent/guide">Parent guide</Link>}
          />
        </>
      }
    >
      <DashboardCard
        title="Saved selections"
        description="A green check means the cafeteria already has it. Nothing else is needed from you."
        icon={<ClipboardCheck className="size-5" />}
      >
        <LunchSelectionSummary summary={summary} showAllDays showFullLink={false} />
      </DashboardCard>

      {balanceRows.length > 0 ? (
        <DashboardCard
          title="Cafeteria balance"
          description="Money on file for your student."
          icon={<Wallet className="size-5" />}
        >
          <CafeteriaBalances rows={balanceRows} />
        </DashboardCard>
      ) : null}
    </ShellPage>
  );
}
