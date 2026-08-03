import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { AgreementSignForm } from "@/components/forms/agreement-sign-form";
import { MediaReleaseForm } from "@/components/forms/media-release-form";
import { ProfilePermissionForm } from "@/components/forms/profile-permission-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  getDigitalAgreement,
  type DigitalAgreementId,
} from "@/config/digital-agreements";
import { getCurrentSchoolYear } from "@/config/school-year";
import {
  submitAiDisclosureAction,
  submitPortalAgreementAction,
} from "@/features/digital-forms/actions";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getFormById } from "@/services/form-service";
import {
  PARENT_AGREEMENT_FORM_ID,
  STUDENT_AGREEMENT_FORM_ID,
  getAgreementSubmission,
  getChildConsentSubmissions,
} from "@/services/digital-forms-service";
import { listLinkedStudents, userCanAccessParentPortal } from "@/services/parent-student-service";

type PageProps = {
  params: Promise<{ agreementId: string }>;
};

const HANDLED: DigitalAgreementId[] = [
  "parent-media-release",
  "student-profile-permission",
  "ai-assistant-disclosure",
  "parent-student-portal",
];

export default async function AgreementDetailPage({ params }: PageProps) {
  const { agreementId } = await params;
  const user = await requireCompleteProfile();
  const agreement = getDigitalAgreement(agreementId as DigitalAgreementId);

  if (!agreement) {
    notFound();
  }

  if (agreement.id === "club-participation") {
    redirect("/academies");
  }

  if (!HANDLED.includes(agreement.id)) {
    if (agreement.formId) {
      redirect(`/forms/${agreement.formId}`);
    }
    redirect("/forms-center");
  }

  const schoolYear = getCurrentSchoolYear();
  const form = agreement.formId ? await getFormById(agreement.formId) : null;

  return (
    <ShellPage title={agreement.title} description={agreement.purpose}>
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={
          <Link href="/forms-center">
            <ArrowLeft className="size-4" />
            Back to Forms Center
          </Link>
        }
      />

      {form?.content ? (
        <article className="mt-4 space-y-3 rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground">
          {form.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      ) : null}

      <div className="mt-6">
        <AgreementBody agreement={agreement} user={user} schoolYear={schoolYear} />
      </div>
    </ShellPage>
  );
}

async function AgreementBody({
  agreement,
  user,
  schoolYear,
}: {
  agreement: NonNullable<ReturnType<typeof getDigitalAgreement>>;
  user: Awaited<ReturnType<typeof requireCompleteProfile>>;
  schoolYear: string;
}) {
  // Parent per-child consent agreements.
  if (
    agreement.id === "parent-media-release" ||
    agreement.id === "student-profile-permission"
  ) {
    const actsAsParent = await userCanAccessParentPortal(user.id, user.role);
    if (!actsAsParent) {
      return (
        <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          This agreement is completed by a parent or guardian.
        </p>
      );
    }

    const students = await listLinkedStudents(user.id);
    if (students.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          No students are linked to your account yet. Contact campus IT to link your
          student before completing this agreement.
        </p>
      );
    }

    const key =
      agreement.id === "parent-media-release" ? "mediaRelease" : "profilePermissions";
    const consent = await getChildConsentSubmissions({
      parentId: user.id,
      formId: agreement.formId!,
      studentIds: students.map((student) => student.id),
    });

    const existingByStudent: Record<string, Record<string, boolean>> = {};
    for (const student of students) {
      const record = consent.get(student.id);
      const data = (record?.responseData ?? {}) as Record<string, unknown>;
      existingByStudent[student.id] =
        (data[key] as Record<string, boolean> | undefined) ?? {};
    }

    const studentOptions = students.map((student) => ({
      id: student.id,
      displayName: student.displayName,
    }));

    return agreement.id === "parent-media-release" ? (
      <MediaReleaseForm
        students={studentOptions}
        schoolYear={schoolYear}
        defaultSignatureName={user.displayName}
        existingByStudent={existingByStudent}
      />
    ) : (
      <ProfilePermissionForm
        students={studentOptions}
        schoolYear={schoolYear}
        defaultSignatureName={user.displayName}
        existingByStudent={existingByStudent}
      />
    );
  }

  // Self-signed single-signature agreements.
  const actsAsParent = await userCanAccessParentPortal(user.id, user.role);
  const formId =
    agreement.id === "parent-student-portal"
      ? actsAsParent
        ? PARENT_AGREEMENT_FORM_ID
        : STUDENT_AGREEMENT_FORM_ID
      : agreement.formId!;

  const submission = await getAgreementSubmission({ formId, userId: user.id });
  const isComplete = submission?.signed && submission.approved !== false;

  if (isComplete) {
    return (
      <div className="rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-5">
        <p className="flex items-center gap-2 font-medium text-[#2E8B57]">
          <CheckCircle2 className="size-4" /> Signed for {submission?.schoolYear ?? schoolYear}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Recorded as {submission?.signatureName} on{" "}
          {submission?.submittedAt
            ? new Date(submission.submittedAt).toLocaleString()
            : "record"}
          .
        </p>
      </div>
    );
  }

  const action =
    agreement.id === "parent-student-portal"
      ? submitPortalAgreementAction
      : submitAiDisclosureAction;

  return (
    <AgreementSignForm
      action={action}
      schoolYear={schoolYear}
      defaultSignatureName={user.displayName}
      signerLabel={actsAsParent ? "Parent / Guardian" : "Student"}
      submitLabel="Sign and submit"
    />
  );
}
