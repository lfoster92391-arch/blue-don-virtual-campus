import Link from "next/link";
import { redirect } from "next/navigation";

import { ParentApprovalRow } from "@/components/admin/parent-approval-row";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageUsers } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  listPendingParents,
  listStudentOptions,
} from "@/services/parent-student-service";

export default async function AdminParentApprovalsPage() {
  const user = await requireCompleteProfile();

  if (!canManageUsers(user.role)) {
    redirect("/service-desk");
  }

  const [pendingParents, students] = await Promise.all([
    listPendingParents(),
    listStudentOptions(),
  ]);

  return (
    <ShellPage
      title="Parent account approvals"
      description="Review parent registrations, approve access, and link each parent to their student."
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/admin">Back to governance</Link>}
      />

      {pendingParents.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {pendingParents.map((parent) => (
            <ParentApprovalRow
              key={parent.id}
              parent={parent}
              students={students}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium text-foreground">No pending parent accounts</p>
          <p className="mt-2 text-sm text-muted-foreground">
            New parent registrations awaiting approval will appear here.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
