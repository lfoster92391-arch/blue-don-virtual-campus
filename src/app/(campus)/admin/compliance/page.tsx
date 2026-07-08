import Link from "next/link";
import { redirect } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canApproveForms } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getComplianceIssues } from "@/services/form-service";

const issueLabels = {
  missing: "Missing",
  unsigned: "Unsigned",
  pending_approval: "Pending approval",
  expired: "Expired",
} as const;

const issueStyles = {
  missing: "bg-[#EB5757]/10 text-[#EB5757]",
  unsigned: "bg-[#D4A017]/10 text-[#D4A017]",
  pending_approval: "bg-[#2F80ED]/10 text-[#2F80ED]",
  expired: "bg-muted text-muted-foreground",
} as const;

export default async function AdminCompliancePage() {
  const user = await requireCompleteProfile();

  if (!canApproveForms(user.role)) {
    redirect("/dashboard");
  }

  const issues = await getComplianceIssues();
  const grouped = {
    missing: issues.filter((item) => item.issue === "missing"),
    unsigned: issues.filter((item) => item.issue === "unsigned"),
    pending_approval: issues.filter((item) => item.issue === "pending_approval"),
    expired: issues.filter((item) => item.issue === "expired"),
  };

  return (
    <ShellPage
      title="Compliance tracking"
      description="Monitor missing forms, unsigned agreements, pending approvals, and expired submissions."
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/admin">Back to governance</Link>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((key) => (
          <div key={key} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{issueLabels[key]}</p>
            <p className="text-2xl font-semibold">{grouped[key].length}</p>
          </div>
        ))}
      </div>

      {issues.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Form</th>
                <th className="px-4 py-3 font-medium">Issue</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={`${issue.userId}-${issue.formId}-${index}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{issue.displayName}</p>
                    <p className="text-xs text-muted-foreground">{issue.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{issue.role.toLowerCase()}</td>
                  <td className="px-4 py-3">{issue.formTitle}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${issueStyles[issue.issue]}`}
                    >
                      {issueLabels[issue.issue]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium text-foreground">All clear</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No compliance issues detected for active users and published forms.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
