import Link from "next/link";
import { redirect } from "next/navigation";

import { ApprovalActions } from "@/components/forms/approval-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canApproveForms } from "@/config/roles";
import { APPROVAL_TYPE_LABELS, FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPendingApprovals } from "@/services/form-service";

export default async function AdminApprovalsPage() {
  const user = await requireCompleteProfile();

  if (!canApproveForms(user.role)) {
    redirect("/dashboard");
  }

  const pending = await listPendingApprovals();

  return (
    <ShellPage
      title="Approvals queue"
      description="Signed form submissions awaiting advisor or administrator review."
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/admin">Back to governance</Link>}
      />

      {pending.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {pending.map((submission) => (
            <li
              key={submission.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {submission.form.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {submission.user.displayName ?? submission.user.email} ·{" "}
                    {submission.user.role.toLowerCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {FORM_TYPE_LABELS[submission.form.type]}
                    {submission.form.approvalType
                      ? ` · ${APPROVAL_TYPE_LABELS[submission.form.approvalType]}`
                      : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Signed as {submission.signatureName} on{" "}
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : "record"}
                  </p>
                </div>
                <ApprovalActions submissionId={submission.id} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium text-foreground">No pending approvals</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Submissions requiring review will appear here.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
