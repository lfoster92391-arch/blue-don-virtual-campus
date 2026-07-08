import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminFormStatusActions } from "@/components/forms/admin-form-status-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageForms } from "@/config/roles";
import { FORM_STATUS_LABELS, FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getFormById } from "@/services/form-service";

type AdminFormDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminFormDetailPage({
  params,
}: AdminFormDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();

  if (!canManageForms(user.role)) {
    redirect("/admin");
  }

  const form = await getFormById(id);

  if (!form) {
    notFound();
  }

  return (
    <ShellPage
      title={form.title}
      description="Manage workflow status and archive this form template."
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={
          <Link href="/admin/forms">
            <ArrowLeft className="size-4" />
            Back to forms
          </Link>
        }
      />

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>{FORM_TYPE_LABELS[form.type]}</span>
        <span>·</span>
        <span>Version {form.version}</span>
        <span>·</span>
        <span>{FORM_STATUS_LABELS[form.status]}</span>
        {form.approvalRequired ? <span>· Requires approval</span> : null}
      </div>

      {form.description ? (
        <p className="mt-4 text-sm text-muted-foreground">{form.description}</p>
      ) : null}

      {form.content ? (
        <article className="mt-6 rounded-xl border border-border bg-card p-6">
          {form.content.split("\n").map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </article>
      ) : null}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Workflow actions
        </h2>
        <AdminFormStatusActions
          formId={form.id}
          currentStatus={form.status}
          archiveFlag={form.archiveFlag}
        />
      </div>
    </ShellPage>
  );
}
