import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminFormCreate } from "@/components/forms/admin-form-create";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageForms } from "@/config/roles";
import { FORM_STATUS_LABELS, FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAllForms, listArchivedForms } from "@/services/form-service";

type AdminFormsPageProps = {
  searchParams: Promise<{ archived?: string }>;
};

export default async function AdminFormsPage({ searchParams }: AdminFormsPageProps) {
  const user = await requireCompleteProfile();

  if (!canManageForms(user.role)) {
    redirect("/admin");
  }

  const { archived } = await searchParams;
  const showArchived = archived === "1";
  const forms = showArchived ? await listArchivedForms() : await listAllForms();

  return (
    <ShellPage
      title={showArchived ? "Archived forms" : "Form management"}
      description="Draft → Review → Approve → Publish → Complete → Archive. No hard deletes."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href={showArchived ? "/admin/forms" : "/admin/forms?archived=1"}>
              {showArchived ? "View active forms" : "View archive"}
            </Link>
          }
        />
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin">Back to governance</Link>}
        />
      </div>

      {!showArchived ? (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Create form</h2>
          <AdminFormCreate />
        </section>
      ) : null}

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">
          {showArchived ? "Archived records" : "All forms"}
        </h2>
        {forms.length > 0 ? (
          <ul className="space-y-3">
            {forms.map((form) => (
              <li key={form.id}>
                <Link
                  href={`/admin/forms/${form.id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{form.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {FORM_TYPE_LABELS[form.type]} · v{form.version}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {FORM_STATUS_LABELS[form.status]}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {showArchived
              ? "No archived forms yet."
              : "No forms yet. Create a draft template above."}
          </p>
        )}
      </section>
    </ShellPage>
  );
}
