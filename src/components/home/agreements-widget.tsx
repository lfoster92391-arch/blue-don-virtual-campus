import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { getCurrentSchoolYear } from "@/config/school-year";
import type { CampusUser } from "@/types/auth";
import {
  agreementStateLabel,
  getAgreementStatusesForUser,
  listStudentClubStatuses,
  type StudentClubStatus,
} from "@/services/digital-forms-service";

const CLUB_CHIP: Record<StudentClubStatus["state"], { label: string; className: string }> = {
  active: { label: "Approved", className: "bg-[#2E8B57]/10 text-[#2E8B57]" },
  advisor_review: { label: "Advisor review", className: "bg-[#2F80ED]/10 text-[#2F80ED]" },
  waiting_parent: { label: "Waiting for parent", className: "bg-[#D4A017]/10 text-[#D4A017]" },
  declined: { label: "Declined", className: "bg-destructive/10 text-destructive" },
};

/**
 * Home dashboard widget: pending agreements needing signature plus a
 * student's club-join approval status (Approved / Waiting for Parent / etc).
 */
export async function AgreementsWidget({ user }: { user: CampusUser }) {
  let statuses: Awaited<ReturnType<typeof getAgreementStatusesForUser>> = [];
  let clubStatuses: StudentClubStatus[] = [];

  try {
    [statuses, clubStatuses] = await Promise.all([
      getAgreementStatusesForUser(user),
      user.role === "student"
        ? listStudentClubStatuses(user.id)
        : Promise.resolve([]),
    ]);
  } catch (error) {
    console.error("[home] agreements widget failed:", error);
  }

  const outstanding = statuses.filter(
    (status) => status.state === "outstanding" || status.state === "waiting_parent",
  );
  const pendingClubs = clubStatuses.filter((club) => club.state !== "active");
  const openCount = outstanding.length + pendingClubs.length;
  const schoolYear = getCurrentSchoolYear();

  return (
    <DashboardCard
      title="Digital Forms Center"
      description={`Required agreements and approvals for ${schoolYear}.`}
      icon={<ClipboardList className="size-5" />}
      status={{
        label: openCount > 0 ? `${openCount} to do` : "All clear",
        variant: openCount > 0 ? "warning" : "success",
      }}
      actions={
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/forms-center">Open</Link>}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Needs signature</p>
          {outstanding.length > 0 ? (
            <ul className="space-y-2">
              {outstanding.map((status) => (
                <li key={status.agreement.id}>
                  <Link
                    href={status.href ?? "/forms-center"}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-[#2F80ED]/40"
                  >
                    <span className="font-medium text-foreground">
                      {status.agreement.title}
                    </span>
                    <span className="text-xs font-medium text-[#D4A017]">
                      {agreementStateLabel(status.state)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing outstanding.</p>
          )}
        </div>

        {user.role === "student" && clubStatuses.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Club requests</p>
            <ul className="space-y-2">
              {clubStatuses.map((club) => {
                const chip = CLUB_CHIP[club.state];
                return (
                  <li
                    key={club.academyId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">{club.academyName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${chip.className}`}
                    >
                      {chip.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </DashboardCard>
  );
}
