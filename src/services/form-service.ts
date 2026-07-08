import type { CampusRole } from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import type {
  ApprovalType,
  FormStatus,
  FormType,
} from "@/generated/prisma/client";
import {
  PARENT_FORM_TYPES,
  STUDENT_EXCLUDED_FORM_TYPES,
} from "@/lib/forms/constants";
import { isPrismaReady, prisma } from "@/lib/prisma";

export type FormListItem = {
  id: string;
  title: string;
  type: FormType;
  version: number;
  status: FormStatus;
  description: string | null;
  approvalRequired: boolean;
  approvalType: ApprovalType | null;
  archiveFlag: boolean;
  updatedAt: Date;
  submission?: {
    id: string;
    signed: boolean;
    signatureName: string | null;
    approved: boolean | null;
    submittedAt: Date | null;
    expiresAt: Date | null;
  } | null;
};

export type FormDetail = FormListItem & {
  content: string | null;
  formFields: unknown;
};

export type CreateFormInput = {
  title: string;
  type: FormType;
  description?: string;
  content?: string;
  approvalRequired?: boolean;
  approvalType?: ApprovalType;
};

export type SubmitFormInput = {
  formId: string;
  userId: string;
  signatureName: string;
  responseData?: Record<string, string>;
};

function isFormVisibleToRole(type: FormType, role: CampusRole): boolean {
  if (role === "admin" || role === "advisor") {
    return true;
  }

  if (role === "parent") {
    return PARENT_FORM_TYPES.includes(type);
  }

  if (role === "student") {
    return !STUDENT_EXCLUDED_FORM_TYPES.includes(type);
  }

  return type !== "PARENT_AGREEMENT";
}

function mapFormListItem(
  form: {
    id: string;
    title: string;
    type: FormType;
    version: number;
    status: FormStatus;
    description: string | null;
    approvalRequired: boolean;
    approvalType: ApprovalType | null;
    archiveFlag: boolean;
    updatedAt: Date;
    submissions?: {
      id: string;
      signed: boolean;
      signatureName: string | null;
      approved: boolean | null;
      submittedAt: Date | null;
      expiresAt: Date | null;
    }[];
  },
): FormListItem {
  return {
    id: form.id,
    title: form.title,
    type: form.type,
    version: form.version,
    status: form.status,
    description: form.description,
    approvalRequired: form.approvalRequired,
    approvalType: form.approvalType,
    archiveFlag: form.archiveFlag,
    updatedAt: form.updatedAt,
    submission: form.submissions?.[0]
      ? {
          id: form.submissions[0].id,
          signed: form.submissions[0].signed,
          signatureName: form.submissions[0].signatureName,
          approved: form.submissions[0].approved,
          submittedAt: form.submissions[0].submittedAt,
          expiresAt: form.submissions[0].expiresAt,
        }
      : null,
  };
}

export async function listFormsForUser(
  userId: string,
  role: CampusRole,
): Promise<FormListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const forms = await prisma.form.findMany({
    where: {
      status: "PUBLISHED",
      archiveFlag: false,
    },
    include: {
      submissions: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: [{ type: "asc" }, { title: "asc" }],
  });

  return forms
    .filter((form) => isFormVisibleToRole(form.type, role))
    .map(mapFormListItem);
}

export async function listAllForms(): Promise<FormListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const forms = await prisma.form.findMany({
    where: { archiveFlag: false },
    orderBy: [{ status: "asc" }, { title: "asc" }],
  });

  return forms.map((form) => mapFormListItem(form));
}

export async function listArchivedForms(): Promise<FormListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const forms = await prisma.form.findMany({
    where: { archiveFlag: true },
    orderBy: { updatedAt: "desc" },
  });

  return forms.map((form) => mapFormListItem(form));
}

export async function getFormById(
  formId: string,
  userId?: string,
): Promise<FormDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: userId
      ? {
          submissions: {
            where: { userId },
            take: 1,
          },
        }
      : undefined,
  });

  if (!form) {
    return null;
  }

  return {
    ...mapFormListItem(form),
    content: form.content,
    formFields: form.formFields,
  };
}

export async function createForm(input: CreateFormInput) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return prisma.form.create({
    data: {
      title: input.title,
      type: input.type,
      description: input.description,
      content: input.content,
      approvalRequired: input.approvalRequired ?? false,
      approvalType: input.approvalType,
      status: "DRAFT",
    },
  });
}

export async function updateFormStatus(formId: string, status: FormStatus) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return prisma.form.update({
    where: { id: formId },
    data: { status },
  });
}

export async function archiveForm(formId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return prisma.form.update({
    where: { id: formId },
    data: {
      archiveFlag: true,
      status: "ARCHIVED",
    },
  });
}

export async function submitForm(input: SubmitFormInput) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const form = await prisma.form.findUnique({ where: { id: input.formId } });

  if (!form || form.status !== "PUBLISHED" || form.archiveFlag) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  return prisma.formSubmission.upsert({
    where: {
      formId_userId: {
        formId: input.formId,
        userId: input.userId,
      },
    },
    create: {
      formId: input.formId,
      userId: input.userId,
      signed: true,
      signatureName: input.signatureName,
      responseData: input.responseData,
      submittedAt: now,
      expiresAt,
      approved: form.approvalRequired ? null : true,
      approvedAt: form.approvalRequired ? null : now,
    },
    update: {
      signed: true,
      signatureName: input.signatureName,
      responseData: input.responseData,
      submittedAt: now,
      expiresAt,
      approved: form.approvalRequired ? null : true,
      approvedAt: form.approvalRequired ? null : now,
    },
  });
}

export async function listPendingApprovals() {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  return prisma.formSubmission.findMany({
    where: {
      signed: true,
      approved: null,
      form: {
        approvalRequired: true,
        archiveFlag: false,
      },
    },
    include: {
      form: true,
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
}

export async function approveSubmission(
  submissionId: string,
  approverId: string,
  approved: boolean,
) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return prisma.formSubmission.update({
    where: { id: submissionId },
    data: {
      approved,
      approvedById: approverId,
      approvedAt: new Date(),
    },
  });
}

export type ComplianceIssue = {
  userId: string;
  displayName: string;
  email: string;
  role: string;
  formId: string;
  formTitle: string;
  issue: "missing" | "unsigned" | "pending_approval" | "expired";
};

export async function getComplianceIssues(): Promise<ComplianceIssue[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const [publishedForms, users, submissions] = await Promise.all([
    prisma.form.findMany({
      where: { status: "PUBLISHED", archiveFlag: false },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
      },
    }),
    prisma.formSubmission.findMany({
      include: { form: true },
    }),
  ]);

  const issues: ComplianceIssue[] = [];
  const now = new Date();

  for (const user of users) {
    const role = user.role.toLowerCase() as CampusRole;
    const applicableForms = publishedForms.filter((form) =>
      isFormVisibleToRole(form.type, role),
    );

    for (const form of applicableForms) {
      const submission = submissions.find(
        (entry) => entry.formId === form.id && entry.userId === user.id,
      );

      if (!submission) {
        issues.push({
          userId: user.id,
          displayName: user.displayName ?? user.email,
          email: user.email,
          role: user.role,
          formId: form.id,
          formTitle: form.title,
          issue: "missing",
        });
        continue;
      }

      if (!submission.signed) {
        issues.push({
          userId: user.id,
          displayName: user.displayName ?? user.email,
          email: user.email,
          role: user.role,
          formId: form.id,
          formTitle: form.title,
          issue: "unsigned",
        });
        continue;
      }

      if (form.approvalRequired && submission.approved === null) {
        issues.push({
          userId: user.id,
          displayName: user.displayName ?? user.email,
          email: user.email,
          role: user.role,
          formId: form.id,
          formTitle: form.title,
          issue: "pending_approval",
        });
      }

      if (submission.expiresAt && submission.expiresAt < now) {
        issues.push({
          userId: user.id,
          displayName: user.displayName ?? user.email,
          email: user.email,
          role: user.role,
          formId: form.id,
          formTitle: form.title,
          issue: "expired",
        });
      }
    }
  }

  return issues;
}

export async function getParentFormSummary(userId: string) {
  const forms = await listFormsForUser(userId, "parent");
  const completed = forms.filter(
    (form) =>
      form.submission?.signed &&
      (form.submission.approved === true || !form.approvalRequired),
  );

  return {
    total: forms.length,
    completed: completed.length,
    pending: forms.length - completed.length,
    forms,
  };
}
