import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, Wallet } from "lucide-react";

import {
  CafeteriaEntryForm,
  type CafeteriaFormStudent,
} from "@/components/admin/cafeteria-entry-form";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  CAFETERIA_CREDIT_CONTACT,
  CAFETERIA_LOW_BALANCE_CENTS,
  formatCafeteriaMoney,
} from "@/config/cafeteria";
import { canManageCafeteriaAccounts } from "@/config/roles";
import { requireCampusAccess } from "@/lib/auth/session";
import { listCafeteriaAccountsForOffice } from "@/services/cafeteria-account-service";
import { listStudentOptions } from "@/services/parent-student-service";

export const metadata = {
  title: "Cafeteria accounts",
  description:
    "Credit the cash and checks families bring to the office, and record what students have eaten.",
};

export default async function AdminCafeteriaPage() {
  const user = await requireCampusAccess();

  if (!canManageCafeteriaAccounts(user.role)) {
    redirect("/lunch");
  }

  const [accounts, studentOptions] = await Promise.all([
    listCafeteriaAccountsForOffice(),
    listStudentOptions(),
  ]);

  const balanceByStudent = new Map(
    accounts.map((account) => [account.studentId, account.balanceLabel]),
  );

  const students: CafeteriaFormStudent[] = studentOptions.map((student) => ({
    id: student.id,
    displayName: student.displayName,
    balanceLabel: balanceByStudent.get(student.id) ?? null,
  }));

  const lowAccounts = accounts.filter((account) => account.isLow);

  return (
    <ShellPage
      title="Cafeteria accounts"
      description={`Families pay at school, never in the app. When an envelope comes in, ${CAFETERIA_CREDIT_CONTACT} records it here and the balance shows up on the family's Cafeteria Lunch page right away.`}
      actions={
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/lunch">Cafeteria lunch</Link>}
        />
      }
    >
      <DashboardCard
        title="Record an envelope"
        description="Match the name written on the envelope, enter the amount, and save. Parents are told in the app whenever a balance ends up low."
        icon={<Coins className="size-5" />}
      >
        <CafeteriaEntryForm students={students} />
      </DashboardCard>

      <DashboardCard
        title="Balances"
        description={`Lowest first. Anything at or under ${formatCafeteriaMoney(CAFETERIA_LOW_BALANCE_CENTS)} counts as low.`}
        icon={<Wallet className="size-5" />}
        status={{
          label: `${lowAccounts.length} low`,
          variant: lowAccounts.length > 0 ? "warning" : "success",
        }}
      >
        {accounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Student</th>
                  <th className="py-2 pr-3 font-medium">Balance</th>
                  <th className="py-2 font-medium">Last change</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.studentId}
                    className="border-b border-border/60"
                  >
                    <td className="py-2 pr-3 font-medium text-foreground">
                      {account.displayName}
                    </td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        account.isLow ? "text-destructive" : "text-[#2E8B57]"
                      }`}
                    >
                      {account.balanceLabel}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {new Date(account.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No cafeteria money has been recorded yet. A student gets an account
            the first time an envelope is credited here.
          </p>
        )}
      </DashboardCard>
    </ShellPage>
  );
}
