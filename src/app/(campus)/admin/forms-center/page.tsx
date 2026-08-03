import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, FileCheck, UserCheck } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canApproveForms } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getFormsCenterStats } from "@/services/digital-forms-service";

export default async function AdminFormsCenterPage() {
  const user = await requireCompleteProfile();

  if (!canApproveForms(user.role)) {
    redirect("/dashboard");
  }

  const stats = await getFormsCenterStats();

  return (
    <ShellPage
      title="Forms Center compliance"
      description="Completion rates and pending queues across Madonna's required digital agreements."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <FileCheck className="size-3.5" aria-hidden="true" />
          {stats.schoolYear}
        </span>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin">Back to governance</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/compliance">Compliance detail</Link>}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Advisor queue"
          description="Signed submissions awaiting approval"
          icon={<ClipboardCheck className="size-4" />}
          status={{
            label: `${stats.advisorPending}`,
            variant: stats.advisorPending > 0 ? "warning" : "success",
          }}
        >
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/approvals">Open queue</Link>}
          />
        </DashboardCard>

        <DashboardCard
          title="Club — parent approval"
          description="Club requests waiting on a parent"
          icon={<UserCheck className="size-4" />}
          status={{
            label: `${stats.parentPendingClub}`,
            variant: stats.parentPendingClub > 0 ? "warning" : "success",
          }}
        >
          <p className="text-sm text-muted-foreground">
            Parents approve club joins before advisor review.
          </p>
        </DashboardCard>

        <DashboardCard
          title="Club — advisor pending"
          description="Memberships pending activation"
          icon={<ClipboardCheck className="size-4" />}
          status={{
            label: `${stats.clubMembershipPending}`,
            variant: stats.clubMembershipPending > 0 ? "warning" : "success",
          }}
        >
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/academies">Review memberships</Link>}
          />
        </DashboardCard>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          Completion by agreement
        </h2>
        <div className="space-y-4">
          {stats.agreements.map((agreement) => (
            <div
              key={agreement.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{agreement.title}</p>
                  <p className="text-xs text-muted-foreground">{agreement.note}</p>
                </div>
                <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
                  {agreement.completed}/{agreement.total}{" "}
                  <span className="text-muted-foreground">({agreement.pct}%)</span>
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#2F80ED] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, agreement.pct))}%` }}
                />
              </div>
            </div>
          ))}
          {stats.agreements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <p className="font-medium text-foreground">No data available</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Completion rates appear once the database is connected and forms are
                published.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </ShellPage>
  );
}
