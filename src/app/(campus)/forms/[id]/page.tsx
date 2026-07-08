import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FormFillForm } from "@/components/forms/form-fill-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageForms, canSubmitForms } from "@/config/roles";
import { FORM_STATUS_LABELS, FORM_TYPE_LABELS } from "@/lib/forms/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getFormById } from "@/services/form-service";

type FormDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FormDetailPage({ params }: FormDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const form = await getFormById(id, user.id);

  if (!form) {
    notFound();
  }

  const isPublished = form.status === "PUBLISHED" && !form.archiveFlag;
  const submission = form.submission;
  const isComplete =
    submission?.signed &&
    (submission.approved === true || !form.approvalRequired);

  if (!isPublished && !canManageForms(user.role)) {
    redirect("/forms");
  }

  return (
    <ShellPage
      title={form.title}
      description={
        form.description ??
        `${FORM_TYPE_LABELS[form.type]} for Madonna High School Blue Don Campus.`
      }
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={
          <Link href="/forms">
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
      </div>

      {form.content ? (
        <article className="prose prose-sm mt-6 max-w-none rounded-xl border border-border bg-card p-6 dark:prose-invert">
          {form.content.split("\n").map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </article>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-8 text-sm text-muted-foreground">
          Form content will appear here once published by an administrator.
        </div>
      )}

      {isComplete ? (
        <div className="mt-6 rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-5">
          <p className="font-medium text-[#2E8B57]">Submission on file</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed as {submission?.signatureName} on{" "}
            {submission?.submittedAt
              ? new Date(submission.submittedAt).toLocaleString()
              : "record"}
            .
            {form.approvalRequired && submission?.approved === null
              ? " Awaiting advisor approval."
              : null}
          </p>
        </div>
      ) : canSubmitForms(user.role) && isPublished ? (
        <div className="mt-6">
          <FormFillForm
            formId={form.id}
            defaultSignatureName={user.displayName}
          />
        </div>
      ) : null}
    </ShellPage>
  );
}
