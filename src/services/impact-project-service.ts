import {
  IMPACT_PROJECT_MILESTONE_TEMPLATES,
  IMPACT_PROJECT_STATUS_ORDER,
  type ImpactProjectStatus,
} from "@/config/impact-before-diploma";
import { isDatabaseConfigured } from "@/config/env";
import type { ImpactProjectStatus as PrismaImpactProjectStatus } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type ImpactProjectMilestone = {
  id: string;
  label: string;
  status: ImpactProjectStatus;
  completedAt?: string;
};

export type ImpactProjectRecord = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  status: ImpactProjectStatus;
  milestones: ImpactProjectMilestone[];
  advisorId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const memoryProjects = new Map<string, ImpactProjectRecord>();

function parseMilestones(value: unknown): ImpactProjectMilestone[] {
  if (!Array.isArray(value)) {
    return IMPACT_PROJECT_MILESTONE_TEMPLATES.map((m) => ({ ...m }));
  }
  return value as ImpactProjectMilestone[];
}

function rowToRecord(row: {
  id: string;
  studentId: string;
  title: string;
  description: string;
  status: PrismaImpactProjectStatus;
  milestones: unknown;
  advisorId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}): ImpactProjectRecord {
  const studentName =
    row.student.displayName?.trim() ||
    [row.student.firstName, row.student.lastName].filter(Boolean).join(" ").trim() ||
    "Student";

  return {
    id: row.id,
    studentId: row.studentId,
    studentName,
    title: row.title,
    description: row.description,
    status: row.status as ImpactProjectStatus,
    milestones: parseMilestones(row.milestones),
    advisorId: row.advisorId,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getStudentImpactProject(
  studentId: string,
): Promise<ImpactProjectRecord | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    const project = [...memoryProjects.values()].find((p) => p.studentId === studentId);
    return project ?? null;
  }

  const row = await withDatabase((prisma) =>
    prisma.impactProject.findFirst({
      where: { studentId },
      orderBy: { updatedAt: "desc" },
      include: {
        student: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  );

  if (!row) return null;
  return rowToRecord(row);
}

export async function listImpactProjectsForReview(): Promise<ImpactProjectRecord[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [...memoryProjects.values()].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  const rows = await withDatabase((prisma) =>
    prisma.impactProject.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        student: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  );

  return (rows ?? []).map(rowToRecord);
}

export async function createImpactProject(input: {
  studentId: string;
  studentName: string;
  title: string;
  description: string;
}): Promise<string | null> {
  const milestones: ImpactProjectMilestone[] = IMPACT_PROJECT_MILESTONE_TEMPLATES.map(
    (m, index) => ({
      ...m,
      completedAt: index === 0 ? new Date().toISOString() : undefined,
    }),
  );

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    const id = `mem-${Date.now()}`;
    const now = new Date();
    memoryProjects.set(id, {
      id,
      studentId: input.studentId,
      studentName: input.studentName,
      title: input.title,
      description: input.description,
      status: "PROPOSAL",
      milestones,
      advisorId: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }

  const row = await withDatabase((prisma) =>
    prisma.impactProject.create({
      data: {
        studentId: input.studentId,
        title: input.title,
        description: input.description,
        status: "PROPOSAL",
        milestones,
      },
    }),
  );

  return row?.id ?? null;
}

export async function updateImpactProjectStatus(
  projectId: string,
  status: ImpactProjectStatus,
  advisorId?: string,
): Promise<boolean> {
  const completedAt = status === "COMPLETE" ? new Date() : null;

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    const project = memoryProjects.get(projectId);
    if (!project) return false;
    project.status = status;
    project.advisorId = advisorId ?? project.advisorId;
    project.completedAt = completedAt;
    project.updatedAt = new Date();
    const statusIndex = IMPACT_PROJECT_STATUS_ORDER.indexOf(status);
    project.milestones = project.milestones.map((m, index) => ({
      ...m,
      completedAt:
        index <= statusIndex ? m.completedAt ?? new Date().toISOString() : undefined,
    }));
    memoryProjects.set(projectId, project);
    return true;
  }

  const existing = await withDatabase((prisma) =>
    prisma.impactProject.findUnique({
      where: { id: projectId },
      select: { milestones: true },
    }),
  );

  const milestones = parseMilestones(existing?.milestones);
  const statusIndex = IMPACT_PROJECT_STATUS_ORDER.indexOf(status);
  const updatedMilestones = milestones.map((m, index) => ({
    ...m,
    completedAt:
      index <= statusIndex ? m.completedAt ?? new Date().toISOString() : undefined,
  }));

  const result = await withDatabase((prisma) =>
    prisma.impactProject.update({
      where: { id: projectId },
      data: {
        status,
        advisorId,
        completedAt,
        milestones: updatedMilestones,
      },
    }),
  );

  return result !== null;
}

export function getImpactProjectProgress(status: ImpactProjectStatus): number {
  const index = IMPACT_PROJECT_STATUS_ORDER.indexOf(status);
  if (index < 0) return 0;
  return Math.round(((index + 1) / IMPACT_PROJECT_STATUS_ORDER.length) * 100);
}
