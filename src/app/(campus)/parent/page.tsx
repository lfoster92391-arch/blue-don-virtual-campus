import Link from "next/link";
import { CampusCampaignBanner } from "@/components/fundraisers/campus-campaign-banner";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardList,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { ChildClubApprovals } from "@/components/forms/child-club-approvals";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { ShopComingSoonButton } from "@/components/shop/shop-coming-soon-button";
import { Button } from "@/components/ui/button";
import { FACTS_SYNC_FIELDS, FACTS_SYNC_SUMMARY } from "@/config/facts-sync";
import { getCurrentSchoolYear } from "@/config/school-year";
import {
  PARENT_PREVIEW_RELATIONSHIP,
  PARENT_PREVIEW_STUDENT_EMAIL,
  PARENT_PREVIEW_STUDENT_ID,
  PARENT_PREVIEW_STUDENT_NAME,
} from "@/config/parent-preview";
import { FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { isParentPreviewActive } from "@/lib/auth/preview";
import { requireCampusAccess } from "@/lib/auth/session";
import { getParentFormSummary } from "@/services/form-service";
import {
  agreementStateLabel,
  getAgreementStatusesForUser,
  listChildClubRequests,
} from "@/services/digital-forms-service";
import { listPublicCampusCampaigns } from "@/services/club-finance-service";
import {
  listLinkedStudents,
  userCanAccessParentPortal,
  type LinkedStudent,
} from "@/services/parent-student-service";

const PREVIEW_STUDENT: LinkedStudent = {
  id: PARENT_PREVIEW_STUDENT_ID,
  displayName: PARENT_PREVIEW_STUDENT_NAME,
  email: PARENT_PREVIEW_STUDENT_EMAIL,
  relationship: PARENT_PREVIEW_RELATIONSHIP,
};

export default async function ParentPortalPage() {
  const user = await requireCampusAccess();
  const previewing = await isParentPreviewActive(user);

  if (!previewing && !(await userCanAccessParentPortal(user.id, user.role))) {
    redirect("/dashboard");
  }

  // While previewing, agreements are read against the parent role so the admin
  // sees the family agreement list rather than their own staff one.
  const agreementUser = previewing ? { ...user, role: "parent" as const } : user;

  const [summary, realLinkedStudents, agreementStatuses, childClubRequests, campaigns] =
    await Promise.all([
      getParentFormSummary(user.id),
      previewing ? Promise.resolve([]) : listLinkedStudents(user.id),
      getAgreementStatusesForUser(agreementUser),
      previewing ? Promise.resolve([]) : listChildClubRequests(user.id),
      listPublicCampusCampaigns({ take: 3 }).catch(() => []),
    ]);

  const linkedStudents = previewing ? [PREVIEW_STUDENT] : realLinkedStudents;

  const schoolYear = getCurrentSchoolYear();
  const outstandingAgreements = agreementStatuses.filter(
    (status) =>
      status.state === "outstanding" || status.state === "waiting_parent",
  );

  return (
    <ShellPage
      title="Parent Portal"
      description={
        previewing
          ? "Preview of the family view, built against a sample student. Nothing here saves."
          : "Review agreement status and view your linked student's campus activity."
      }
      actions={
        <>
          <ShopComingSoonButton size="sm" />
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/parent/guide">Parent guide</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/madonna">Madonna Hub</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/forms-center">Open Forms Center</Link>}
          />
        </>
      }
    >
      <CampusCampaignBanner campaigns={campaigns} />

      <DashboardCard
        title="New here? Start with the parent guide"
        description="Step-by-step: setting up your account, what a parent account can do, and how the school reaches you."
        icon={<BookOpen className="size-5" />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/parent/guide">Read the guide</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/parent/guide#getting-around">
                What you can do here
              </Link>
            }
          />
        </div>
      </DashboardCard>

      {previewing ? (
        <div className="rounded-xl border border-[#D4A017]/40 bg-[#D4A017]/10 p-4">
          <p className="text-sm font-semibold text-foreground">
            Preview mode — no student is linked to your account
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {PARENT_PREVIEW_STUDENT_NAME} stands in for a real child so the whole
            parent portal is visible. Nothing saves while previewing. Exit from
            the yellow banner at the top.
          </p>
        </div>
      ) : null}

      <FuelTheDonsRow />

      <DashboardCard
        title="Action required"
        description={`Agreements and approvals that need you for ${schoolYear}.`}
        icon={<ClipboardList className="size-5" />}
        status={{
          label: `${outstandingAgreements.length + childClubRequests.length} open`,
          variant:
            outstandingAgreements.length + childClubRequests.length > 0
              ? "warning"
              : "success",
        }}
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserCheck className="size-4" /> Club requests awaiting your approval
            </p>
            <ChildClubApprovals requests={childClubRequests} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Agreements needing your signature</p>
            {outstandingAgreements.length > 0 ? (
              <ul className="space-y-2">
                {outstandingAgreements.map((status) => (
                  <li key={status.agreement.id}>
                    <Link
                      href={status.href ?? "/forms-center"}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-[#2F80ED]/40"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {status.agreement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{status.detail}</p>
                      </div>
                      <span className="text-xs font-medium text-[#D4A017]">
                        {agreementStateLabel(status.state)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No agreements need your signature right now.
              </p>
            )}
          </div>

          <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            Field trip and event registrations will appear here when published.
          </p>
        </div>
      </DashboardCard>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Linked students</h2>
        {linkedStudents.length > 0 ? (
          <ul className="space-y-2">
            {linkedStudents.map((student) => (
              <li
                key={student.id}
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <p className="font-medium">{student.displayName}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
                {student.relationship ? (
                  <p className="text-sm text-muted-foreground">
                    Relationship: {student.relationship}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No students linked yet. Contact campus IT to connect your account.
          </p>
        )}
      </section>

      <DashboardCard
        title="FACTS Sync Status"
        description="Student profile and parent contact data from FACTS SIS."
        icon={<RefreshCw className="size-5" />}
        status={{ label: "W14", variant: "info" }}
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Last sync</p>
            <p className="text-sm font-medium">{FACTS_SYNC_SUMMARY.lastFullSync}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Students</p>
            <p className="text-sm font-medium">{FACTS_SYNC_SUMMARY.studentProfilesSynced}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Parents</p>
            <p className="text-sm font-medium">{FACTS_SYNC_SUMMARY.parentContactsSynced}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Conflicts</p>
            <p className="text-sm font-medium text-[#D4A017]">{FACTS_SYNC_SUMMARY.pendingConflicts}</p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {FACTS_SYNC_FIELDS.map((field) => (
            <li
              key={field.field}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              <span className="text-foreground">{field.field}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{field.lastSyncedLabel}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-medium ${
                    field.status === "synced"
                      ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                      : field.status === "pending"
                        ? "bg-[#D4A017]/10 text-[#D4A017]"
                        : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {field.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Required forms</p>
          <p className="text-2xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">
            {summary.completed}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-semibold text-[#D4A017]">
            {summary.pending}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Button
          nativeButton={false}
          render={<Link href="/forms">Open all forms</Link>}
        />
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Parent form status</h2>
        {summary.forms.length > 0 ? (
          <ul className="space-y-3">
            {summary.forms.map((form) => {
              const complete =
                form.submission?.signed &&
                (form.submission.approved === true || !form.approvalRequired);

              return (
                <li key={form.id}>
                  <Link
                    href={`/forms/${form.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
                  >
                    <div>
                      <p className="font-medium">{form.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {FORM_TYPE_LABELS[form.type]}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${complete ? "text-[#2E8B57]" : "text-muted-foreground"}`}
                    >
                      {complete ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                      {complete ? "Complete" : "Outstanding"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No parent forms are published yet.
          </p>
        )}
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Your portal reflects forms and activity for your linked student
        {linkedStudents.length === 1
          ? `, ${linkedStudents[0].displayName}`
          : linkedStudents.length > 1
            ? "s"
            : ""}
        . Multi-child tracking will expand in a later phase.
      </p>
    </ShellPage>
  );
}
