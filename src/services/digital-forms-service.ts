import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { getCurrentSchoolYear } from "@/config/school-year";
import {
  DIGITAL_AGREEMENTS,
  getDigitalAgreement,
  getDigitalAgreementsForRole,
  type DigitalAgreementDefinition,
  type DigitalAgreementId,
} from "@/config/digital-agreements";
import { CLUB_MEMBERSHIP_COMMITMENT_FORM_ID } from "@/config/club-commitment";
import type { CampusRole } from "@/config/roles";
import type { CampusUser } from "@/types/auth";
import { listLinkedStudents, canAccessParentPortal } from "@/services/parent-student-service";
import type { LinkedStudent } from "@/services/parent-student-service";

export const STUDENT_AGREEMENT_FORM_ID = "form-student-agreement";
export const PARENT_AGREEMENT_FORM_ID = "form-parent-agreement";

/** Context key used when a form is signed about a specific student. */
export function getStudentContextKey(studentId: string): string {
  return `student:${studentId}`;
}

export type AgreementState =
  | "complete"
  | "outstanding"
  | "waiting_parent"
  | "needs_link"
  | "not_available"
  | "not_required";

export type AgreementStatus = {
  agreement: DigitalAgreementDefinition;
  state: AgreementState;
  detail: string;
  href: string | null;
};

type SubmissionRow = {
  formId: string;
  contextKey: string;
  subjectUserId: string | null;
  signed: boolean;
  approved: boolean | null;
  parentApproved: boolean | null;
  expiresAt: Date | null;
  submittedAt: Date | null;
};

const STATE_LABELS: Record<AgreementState, string> = {
  complete: "Complete",
  outstanding: "Action needed",
  waiting_parent: "Waiting for parent",
  needs_link: "Awaiting student link",
  not_available: "Not yet available",
  not_required: "Not required",
};

export function agreementStateLabel(state: AgreementState): string {
  return STATE_LABELS[state];
}

function isSubmissionComplete(submission: SubmissionRow | undefined): boolean {
  if (!submission || !submission.signed) {
    return false;
  }
  if (submission.approved === false) {
    return false;
  }
  return true;
}

async function loadUserSubmissions(userId: string): Promise<SubmissionRow[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.formSubmission.findMany({
      where: { userId },
      select: {
        formId: true,
        contextKey: true,
        subjectUserId: true,
        signed: true,
        approved: true,
        parentApproved: true,
        expiresAt: true,
        submittedAt: true,
      },
    }),
  );

  return rows ?? [];
}

function resolveHref(agreement: DigitalAgreementDefinition): string | null {
  switch (agreement.id) {
    case "parent-media-release":
      return "/forms-center/parent-media-release";
    case "student-profile-permission":
      return "/forms-center/student-profile-permission";
    case "ai-assistant-disclosure":
      return "/forms-center/ai-assistant-disclosure";
    case "parent-student-portal":
      return "/forms-center/parent-student-portal";
    case "club-participation":
      return "/academies";
    default:
      return agreement.formId ? `/forms/${agreement.formId}` : null;
  }
}

/**
 * Per-user status for every digital agreement visible to their role.
 * Powers the Forms Center hub and dashboard widgets.
 */
export async function getAgreementStatusesForUser(
  user: CampusUser,
): Promise<AgreementStatus[]> {
  const linkedStudents = await listLinkedStudents(user.id);
  const actsAsParent = canAccessParentPortal(user.role, linkedStudents.length > 0);

  const roleAgreements = getDigitalAgreementsForRole(user.role);
  const parentOnlyAgreements =
    actsAsParent && user.role !== "parent"
      ? getDigitalAgreementsForRole("parent").filter(
          (agreement) =>
            !roleAgreements.some((existing) => existing.id === agreement.id),
        )
      : [];
  const agreements = [...roleAgreements, ...parentOnlyAgreements];
  const submissions = await loadUserSubmissions(user.id);
  const linkedForStatus = actsAsParent ? linkedStudents : [];

  const byFormAndContext = new Map<string, SubmissionRow>();
  for (const submission of submissions) {
    byFormAndContext.set(`${submission.formId}::${submission.contextKey}`, submission);
  }

  return agreements
    .filter((agreement) => agreement.id !== "digital-signature-system")
    .map((agreement) =>
      buildStatus(
        agreement,
        user.role,
        byFormAndContext,
        linkedForStatus,
        actsAsParent,
      ),
    );
}

function buildStatus(
  agreement: DigitalAgreementDefinition,
  role: CampusRole,
  submissions: Map<string, SubmissionRow>,
  linkedStudents: LinkedStudent[],
  actsAsParent: boolean,
): AgreementStatus {
  const href = resolveHref(agreement);
  const base = { agreement, href };

  // Per-child parent agreements.
  if (
    agreement.id === "parent-media-release" ||
    agreement.id === "student-profile-permission"
  ) {
    if (!actsAsParent) {
      return { ...base, state: "not_required", detail: STATE_LABELS.not_required };
    }
    if (linkedStudents.length === 0) {
      return { ...base, state: "needs_link", detail: STATE_LABELS.needs_link };
    }
    const formId = agreement.formId!;
    const done = linkedStudents.filter((student) =>
      isSubmissionComplete(
        submissions.get(`${formId}::${getStudentContextKey(student.id)}`),
      ),
    ).length;
    if (done >= linkedStudents.length) {
      return { ...base, state: "complete", detail: `Complete for ${done} student(s)` };
    }
    return {
      ...base,
      state: "outstanding",
      detail: `${done}/${linkedStudents.length} students complete`,
    };
  }

  // Portal agreement uses a different form per signer role.
  if (agreement.id === "parent-student-portal") {
    const formId =
      actsAsParent ? PARENT_AGREEMENT_FORM_ID : STUDENT_AGREEMENT_FORM_ID;
    const submission = submissions.get(`${formId}::`);
    if (isSubmissionComplete(submission)) {
      return { ...base, state: "complete", detail: STATE_LABELS.complete };
    }
    return { ...base, state: "outstanding", detail: STATE_LABELS.outstanding };
  }

  // Club participation — surfaced through Academies / Parent Portal.
  if (agreement.id === "club-participation") {
    if (actsAsParent) {
      const waiting = [...submissions.values()].some(
        (submission) =>
          submission.formId === CLUB_MEMBERSHIP_COMMITMENT_FORM_ID &&
          submission.parentApproved === null,
      );
      return {
        ...base,
        href: "/parent",
        state: waiting ? "outstanding" : "not_required",
        detail: waiting ? "Club request awaiting approval" : "Approve from Parent Portal",
      };
    }
    return {
      ...base,
      state: "not_required",
      detail: "Join a club from Academies",
    };
  }

  // Acceptable-use / other agreements without a published form.
  if (agreement.status === "planned" || agreement.status === "future") {
    return { ...base, state: "not_available", detail: STATE_LABELS.not_available };
  }
  if (agreement.id === "acceptable-use") {
    return {
      ...base,
      state: "not_available",
      detail: "Publishing pending handbook text",
    };
  }

  // Default: self-signed account-level agreement (e.g. AI disclosure).
  if (!agreement.formId) {
    return { ...base, state: "not_available", detail: STATE_LABELS.not_available };
  }
  const submission = submissions.get(`${agreement.formId}::`);
  if (isSubmissionComplete(submission)) {
    return { ...base, state: "complete", detail: STATE_LABELS.complete };
  }
  return { ...base, state: "outstanding", detail: STATE_LABELS.outstanding };
}

/** Get a single submission for a form + optional context key + signer. */
export async function getAgreementSubmission(input: {
  formId: string;
  userId: string;
  contextKey?: string;
}) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }
  return withDatabase((prisma) =>
    prisma.formSubmission.findUnique({
      where: {
        formId_userId_contextKey: {
          formId: input.formId,
          userId: input.userId,
          contextKey: input.contextKey ?? "",
        },
      },
    }),
  );
}

/** Media release / profile permission submissions for each linked student. */
export async function getChildConsentSubmissions(input: {
  parentId: string;
  formId: string;
  studentIds: string[];
}): Promise<Map<string, { signed: boolean; approved: boolean | null; responseData: unknown }>> {
  const result = new Map<
    string,
    { signed: boolean; approved: boolean | null; responseData: unknown }
  >();
  if (!isDatabaseConfigured() || !isPrismaReady() || input.studentIds.length === 0) {
    return result;
  }

  const rows = await withDatabase((prisma) =>
    prisma.formSubmission.findMany({
      where: {
        formId: input.formId,
        userId: input.parentId,
        contextKey: { in: input.studentIds.map(getStudentContextKey) },
      },
      select: {
        subjectUserId: true,
        contextKey: true,
        signed: true,
        approved: true,
        responseData: true,
      },
    }),
  );

  for (const row of rows ?? []) {
    const studentId =
      row.subjectUserId ?? row.contextKey.replace(/^student:/, "");
    result.set(studentId, {
      signed: row.signed,
      approved: row.approved,
      responseData: row.responseData,
    });
  }

  return result;
}

export type ChildClubRequest = {
  submissionId: string;
  studentId: string;
  studentName: string;
  academyId: string;
  academyName: string;
  signatureName: string | null;
  submittedAt: Date | null;
  parentApproved: boolean | null;
};

/** Club join requests from a parent's linked students awaiting a decision. */
export async function listChildClubRequests(
  parentId: string,
): Promise<ChildClubRequest[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const linked = await listLinkedStudents(parentId);
  if (linked.length === 0) {
    return [];
  }
  const studentIds = linked.map((student) => student.id);
  const nameById = new Map(linked.map((student) => [student.id, student.displayName]));

  const rows = await withDatabase((prisma) =>
    prisma.formSubmission.findMany({
      where: {
        formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
        userId: { in: studentIds },
        signed: true,
        parentApproved: null,
      },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true,
        userId: true,
        signatureName: true,
        submittedAt: true,
        parentApproved: true,
        responseData: true,
      },
    }),
  );

  return (rows ?? []).map((row) => {
    const data = (row.responseData ?? {}) as {
      academyId?: string;
      academyName?: string;
    };
    return {
      submissionId: row.id,
      studentId: row.userId,
      studentName: nameById.get(row.userId) ?? "Student",
      academyId: data.academyId ?? "",
      academyName: data.academyName ?? "Club",
      signatureName: row.signatureName,
      submittedAt: row.submittedAt,
      parentApproved: row.parentApproved,
    };
  });
}

export type StudentClubStatus = {
  academyId: string;
  academyName: string;
  state: "active" | "advisor_review" | "waiting_parent" | "declined";
};

/** A student's club requests with their current approval state. */
export async function listStudentClubStatuses(
  userId: string,
): Promise<StudentClubStatus[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const result = await withDatabase(async (prisma) => {
    const submissions = await prisma.formSubmission.findMany({
      where: {
        formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
        userId,
        signed: true,
      },
      select: { parentApproved: true, responseData: true },
    });

    const memberships = await prisma.academyMembership.findMany({
      where: { userId },
      select: { academyId: true, status: true },
    });
    const statusByAcademy = new Map(
      memberships.map((m) => [m.academyId, m.status]),
    );

    return submissions.map((submission) => {
      const data = (submission.responseData ?? {}) as {
        academyId?: string;
        academyName?: string;
      };
      const academyId = data.academyId ?? "";
      const membershipStatus = statusByAcademy.get(academyId);

      let state: StudentClubStatus["state"];
      if (membershipStatus === "ACTIVE") {
        state = "active";
      } else if (membershipStatus === "REJECTED" || submission.parentApproved === false) {
        state = "declined";
      } else if (submission.parentApproved === null) {
        state = "waiting_parent";
      } else {
        state = "advisor_review";
      }

      return {
        academyId,
        academyName: data.academyName ?? "Club",
        state,
      };
    });
  });

  return result ?? [];
}

export type AgreementStat = {
  id: DigitalAgreementId;
  title: string;
  completed: number;
  total: number;
  pct: number;
  note: string;
};

export type FormsCenterStats = {
  schoolYear: string;
  agreements: AgreementStat[];
  advisorPending: number;
  parentPendingClub: number;
  clubMembershipPending: number;
};

const MVP_STAT_AGREEMENTS: DigitalAgreementId[] = [
  "parent-student-portal",
  "acceptable-use",
  "parent-media-release",
  "student-profile-permission",
  "ai-assistant-disclosure",
];

function pct(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

/** Admin compliance aggregates for the Forms Center dashboard. */
export async function getFormsCenterStats(): Promise<FormsCenterStats> {
  const schoolYear = getCurrentSchoolYear();
  const empty: FormsCenterStats = {
    schoolYear,
    agreements: [],
    advisorPending: 0,
    parentPendingClub: 0,
    clubMembershipPending: 0,
  };

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return empty;
  }

  const data = await withDatabase(async (prisma) => {
    const [studentCount, parentCount, submissions, advisorPending, parentPendingClub, clubPending] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
        prisma.user.count({ where: { role: "PARENT", status: "ACTIVE" } }),
        prisma.formSubmission.findMany({
          where: { signed: true },
          select: {
            formId: true,
            userId: true,
            subjectUserId: true,
            approved: true,
          },
        }),
        prisma.formSubmission.count({
          where: { signed: true, approved: null, form: { approvalRequired: true } },
        }),
        prisma.formSubmission.count({
          where: {
            formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
            signed: true,
            parentApproved: null,
          },
        }),
        prisma.academyMembership.count({ where: { status: "PENDING" } }),
      ]);

    return {
      studentCount,
      parentCount,
      submissions,
      advisorPending,
      parentPendingClub,
      clubPending,
    };
  });

  if (!data) {
    return empty;
  }

  const signedByForm = (formId: string) =>
    data.submissions.filter((s) => s.formId === formId && s.approved !== false);
  const distinctSubjects = (formId: string) =>
    new Set(
      signedByForm(formId)
        .map((s) => s.subjectUserId)
        .filter((id): id is string => Boolean(id)),
    ).size;

  const agreements: AgreementStat[] = MVP_STAT_AGREEMENTS.map((id) => {
    const agreement = getDigitalAgreement(id)!;

    if (id === "parent-student-portal") {
      const completed =
        signedByForm(STUDENT_AGREEMENT_FORM_ID).length +
        signedByForm(PARENT_AGREEMENT_FORM_ID).length;
      const total = data.studentCount + data.parentCount;
      return {
        id,
        title: agreement.title,
        completed,
        total,
        pct: pct(completed, total),
        note: "Student + parent signatures",
      };
    }

    if (id === "acceptable-use") {
      return {
        id,
        title: agreement.title,
        completed: 0,
        total: data.studentCount + data.parentCount,
        pct: 0,
        note: "Template DRAFT — not yet published",
      };
    }

    if (id === "parent-media-release" || id === "student-profile-permission") {
      const completed = distinctSubjects(agreement.formId!);
      return {
        id,
        title: agreement.title,
        completed,
        total: data.studentCount,
        pct: pct(completed, data.studentCount),
        note: "Parent consent per student",
      };
    }

    // ai-assistant-disclosure — self-signed by students.
    const completed = new Set(
      signedByForm(agreement.formId!).map((s) => s.userId),
    ).size;
    return {
      id,
      title: agreement.title,
      completed,
      total: data.studentCount,
      pct: pct(completed, data.studentCount),
      note: "Signed before AI use",
    };
  });

  return {
    schoolYear,
    agreements,
    advisorPending: data.advisorPending,
    parentPendingClub: data.parentPendingClub,
    clubMembershipPending: data.clubPending,
  };
}

/** Registry-wide summary counts for the hub header. */
export function summarizeAgreementStatuses(statuses: AgreementStatus[]) {
  return {
    total: statuses.length,
    complete: statuses.filter((s) => s.state === "complete").length,
    outstanding: statuses.filter(
      (s) => s.state === "outstanding" || s.state === "waiting_parent",
    ).length,
  };
}

export function getMvpAgreementIds(): DigitalAgreementId[] {
  return DIGITAL_AGREEMENTS.filter(
    (a) => a.status === "partial" || a.status === "implemented",
  ).map((a) => a.id);
}
