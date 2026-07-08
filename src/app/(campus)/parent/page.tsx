import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { redirect } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/config/roles";
import { FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getParentFormSummary } from "@/services/form-service";

export default async function ParentPortalPage() {
  const user = await requireCompleteProfile();

  if (!hasPermission(user.role, "parent:portal")) {
    redirect("/dashboard");
  }

  const summary = await getParentFormSummary(user.id);

  return (
    <ShellPage
      title="Parent Portal"
      description="Review agreement status and complete required parent forms for campus participation."
    >
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
        Student-linked family views and multi-child tracking will expand in a later
        phase. For now, parents complete their own assigned agreements here.
      </p>
    </ShellPage>
  );
}
