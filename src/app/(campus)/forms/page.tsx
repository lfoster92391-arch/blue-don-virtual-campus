import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listFormsForUser } from "@/services/form-service";

function submissionStatus(form: Awaited<ReturnType<typeof listFormsForUser>>[number]) {
  const submission = form.submission;

  if (!submission) {
    return { label: "Not started", variant: "default" as const, icon: Circle };
  }

  if (!submission.signed) {
    return { label: "Unsigned", variant: "warning" as const, icon: Circle };
  }

  if (form.approvalRequired && submission.approved === null) {
    return { label: "Pending approval", variant: "info" as const, icon: Clock };
  }

  if (submission.approved === false) {
    return { label: "Rejected", variant: "warning" as const, icon: Circle };
  }

  return { label: "Complete", variant: "success" as const, icon: CheckCircle2 };
}

export default async function FormsPage() {
  const user = await requireCompleteProfile();
  const forms = await listFormsForUser(user.id, user.role);
  const completed = forms.filter((form) => {
    const status = submissionStatus(form);
    return status.label === "Complete";
  });
  const pending = forms.filter((form) => {
    const status = submissionStatus(form);
    return status.label !== "Complete";
  });

  return (
    <ShellPage
      title="Forms"
      description="Campus agreements, releases, and onboarding documents assigned to your role."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Assigned</p>
          <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">
            {forms.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">{completed.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-2xl font-semibold text-[#D4A017]">{pending.length}</p>
        </div>
      </div>

      {pending.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Needs your attention
          </h2>
          <ul className="space-y-3">
            {pending.map((form) => {
              const status = submissionStatus(form);
              const Icon = status.icon;

              return (
                <li key={form.id}>
                  <Link
                    href={`/forms/${form.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{form.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {FORM_TYPE_LABELS[form.type]} · v{form.version}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon className="size-4" />
                      {status.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Completed
          </h2>
          <ul className="space-y-3">
            {completed.map((form) => (
              <li key={form.id}>
                <Link
                  href={`/forms/${form.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 opacity-90 transition-colors hover:border-[#2F80ED]/40"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{form.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Signed{" "}
                      {form.submission?.submittedAt
                        ? new Date(form.submission.submittedAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#2E8B57]">
                    <CheckCircle2 className="size-4" />
                    Complete
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {forms.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium text-foreground">No forms assigned yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Administrators will publish onboarding and agreement forms here.
          </p>
        </div>
      ) : null}
    </ShellPage>
  );
}
