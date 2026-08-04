import { isDatabaseConfigured } from "@/config/env";
import {
  SUCCESS_ANALYTICS_BUCKETS,
  SUCCESS_ANALYTICS_GRADE_LABEL,
  SUCCESS_ANALYTICS_THRESHOLDS,
  type SuccessAnalyticsBucketId,
} from "@/config/success-analytics";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { getComplianceIssues } from "@/services/form-service";

export type SuccessAnalyticsAction = {
  label: string;
  href: string;
};

export type SuccessAnalyticsStudentItem = {
  id: string;
  name: string;
  email: string;
  gradeLabel: string;
  reasonTags: string[];
  actions: SuccessAnalyticsAction[];
};

export type SuccessAnalyticsBucket = {
  id: SuccessAnalyticsBucketId;
  label: string;
  description: string;
  statusVariant: "default" | "success" | "warning" | "info";
  count: number;
  students: SuccessAnalyticsStudentItem[];
};

export type SuccessAnalyticsData = {
  totalStudents: number;
  buckets: Record<SuccessAnalyticsBucketId, SuccessAnalyticsBucket>;
};

type StudentRecord = {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  portfolioSlug: string | null;
  portfolioPublic: boolean;
};

type StudentMetrics = {
  clubCount: number;
  leadershipRoles: number;
  volunteerHours: number;
  portfolioServiceHours: number;
  publishedPortfolioItems: number;
  totalPortfolioItems: number;
  certificationCount: number;
  modulesCompleted: number;
  academyMembershipCount: number;
  maxAcademyProgressPct: number;
  complianceIssueCount: number;
};

function displayNameFor(student: StudentRecord): string {
  return (
    student.displayName?.trim() ||
    [student.firstName, student.lastName].filter(Boolean).join(" ").trim() ||
    student.email
  );
}

function profileHref(student: StudentRecord): string {
  if (student.portfolioPublic && student.portfolioSlug) {
    return `/p/${student.portfolioSlug}`;
  }

  return `mailto:${student.email}?subject=${encodeURIComponent("Checking in from Madonna")}`;
}

function reachOutAction(email: string): SuccessAnalyticsAction {
  return {
    label: "Reach out",
    href: `mailto:${email}?subject=${encodeURIComponent("Checking in from Madonna")}`,
  };
}

function viewProfileAction(student: StudentRecord): SuccessAnalyticsAction {
  return {
    label: student.portfolioPublic ? "View portfolio" : "Reach out",
    href: profileHref(student),
  };
}

function buildStudentItem(
  student: StudentRecord,
  reasonTags: string[],
  actions: SuccessAnalyticsAction[],
): SuccessAnalyticsStudentItem {
  return {
    id: student.id,
    name: displayNameFor(student),
    email: student.email,
    gradeLabel: SUCCESS_ANALYTICS_GRADE_LABEL,
    reasonTags,
    actions,
  };
}

function emptyBuckets(): SuccessAnalyticsData["buckets"] {
  return (Object.keys(SUCCESS_ANALYTICS_BUCKETS) as SuccessAnalyticsBucketId[]).reduce(
    (acc, id) => {
      const meta = SUCCESS_ANALYTICS_BUCKETS[id];
      acc[id] = {
        id,
        label: meta.label,
        description: meta.description,
        statusVariant: meta.statusVariant,
        count: 0,
        students: [],
      };
      return acc;
    },
    {} as SuccessAnalyticsData["buckets"],
  );
}

export async function getSuccessAnalytics(): Promise<SuccessAnalyticsData> {
  const empty: SuccessAnalyticsData = {
    totalStudents: 0,
    buckets: emptyBuckets(),
  };

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return empty;
  }

  const data = await withDatabase(async (prisma) => {
    const [
      students,
      clubMemberships,
      volunteerHours,
      portfolioItems,
      certificationCounts,
      moduleProgress,
      academyProgress,
      academyMemberships,
      complianceIssues,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { role: "STUDENT", status: "ACTIVE" },
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          portfolioSlug: true,
          portfolioPublic: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      }),
      prisma.organizationMembership.findMany({
        where: {
          status: "ACTIVE",
          organization: { type: "CLUB" },
          user: { role: "STUDENT", status: "ACTIVE" },
        },
        select: {
          userId: true,
          orgRole: true,
        },
      }),
      prisma.eventParticipant.groupBy({
        by: ["userId"],
        where: {
          role: "VOLUNTEER",
          user: { role: "STUDENT", status: "ACTIVE" },
        },
        _sum: { hours: true },
      }),
      prisma.portfolioItem.findMany({
        where: {
          user: { role: "STUDENT", status: "ACTIVE" },
          status: { not: "ARCHIVED" },
        },
        select: {
          userId: true,
          type: true,
          status: true,
          points: true,
        },
      }),
      prisma.studentCertification.groupBy({
        by: ["userId"],
        where: { user: { role: "STUDENT", status: "ACTIVE" } },
        _count: { _all: true },
      }),
      prisma.studentModuleProgress.groupBy({
        by: ["userId", "status"],
        where: { user: { role: "STUDENT", status: "ACTIVE" } },
        _count: { _all: true },
      }),
      prisma.studentAcademyProgress.findMany({
        where: { user: { role: "STUDENT", status: "ACTIVE" } },
        select: { userId: true, progressPct: true },
      }),
      prisma.academyMembership.groupBy({
        by: ["userId"],
        where: {
          status: "ACTIVE",
          user: { role: "STUDENT", status: "ACTIVE" },
        },
        _count: { _all: true },
      }),
      getComplianceIssues(),
    ]);

    return {
      students,
      clubMemberships,
      volunteerHours,
      portfolioItems,
      certificationCounts,
      moduleProgress,
      academyProgress,
      academyMemberships,
      complianceIssues,
    };
  });

  if (!data) {
    return empty;
  }

  const {
    students,
    clubMemberships,
    volunteerHours,
    portfolioItems,
    certificationCounts,
    moduleProgress,
    academyProgress,
    academyMemberships,
    complianceIssues,
  } = data;

  const metricsByUser = new Map<string, StudentMetrics>();

  for (const student of students) {
    metricsByUser.set(student.id, {
      clubCount: 0,
      leadershipRoles: 0,
      volunteerHours: 0,
      portfolioServiceHours: 0,
      publishedPortfolioItems: 0,
      totalPortfolioItems: 0,
      certificationCount: 0,
      modulesCompleted: 0,
      academyMembershipCount: 0,
      maxAcademyProgressPct: 0,
      complianceIssueCount: 0,
    });
  }

  for (const membership of clubMemberships) {
    const metrics = metricsByUser.get(membership.userId);
    if (!metrics) {
      continue;
    }

    metrics.clubCount += 1;
    if (["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"].includes(membership.orgRole)) {
      metrics.leadershipRoles += 1;
    }
  }

  for (const entry of volunteerHours) {
    const metrics = metricsByUser.get(entry.userId);
    if (metrics) {
      metrics.volunteerHours = entry._sum.hours ?? 0;
    }
  }

  for (const item of portfolioItems) {
    const metrics = metricsByUser.get(item.userId);
    if (!metrics) {
      continue;
    }

    metrics.totalPortfolioItems += 1;
    if (item.status === "PUBLISHED") {
      metrics.publishedPortfolioItems += 1;
    }
    if (item.type === "SERVICE") {
      metrics.portfolioServiceHours += item.points;
    }
  }

  for (const entry of certificationCounts) {
    const metrics = metricsByUser.get(entry.userId);
    if (metrics) {
      metrics.certificationCount = entry._count._all;
    }
  }

  for (const entry of moduleProgress) {
    const metrics = metricsByUser.get(entry.userId);
    if (!metrics || entry.status !== "COMPLETED") {
      continue;
    }

    metrics.modulesCompleted = entry._count._all;
  }

  for (const entry of academyProgress) {
    const metrics = metricsByUser.get(entry.userId);
    if (!metrics) {
      continue;
    }

    metrics.maxAcademyProgressPct = Math.max(
      metrics.maxAcademyProgressPct,
      entry.progressPct,
    );
  }

  for (const entry of academyMemberships) {
    const metrics = metricsByUser.get(entry.userId);
    if (metrics) {
      metrics.academyMembershipCount = entry._count._all;
    }
  }

  const studentCompliance = new Map<string, number>();
  for (const issue of complianceIssues) {
    if (issue.role.toLowerCase() !== "student") {
      continue;
    }

    studentCompliance.set(
      issue.userId,
      (studentCompliance.get(issue.userId) ?? 0) + 1,
    );
  }

  for (const [userId, count] of studentCompliance) {
    const metrics = metricsByUser.get(userId);
    if (metrics) {
      metrics.complianceIssueCount = count;
    }
  }

  const buckets = emptyBuckets();
  const thresholds = SUCCESS_ANALYTICS_THRESHOLDS;

  for (const student of students) {
    const metrics = metricsByUser.get(student.id)!;
    const totalServiceHours =
      metrics.volunteerHours + metrics.portfolioServiceHours;
    const portfolioCompletionPercent =
      metrics.totalPortfolioItems > 0
        ? Math.round(
            (metrics.publishedPortfolioItems / metrics.totalPortfolioItems) *
              100,
          )
        : 0;
    const hasRecentActivity =
      metrics.modulesCompleted > 0 ||
      metrics.volunteerHours > 0 ||
      metrics.publishedPortfolioItems > 0;

    const supportReasons: string[] = [];
    if (metrics.clubCount === 0) {
      supportReasons.push("No club memberships yet");
    }
    if (!hasRecentActivity) {
      supportReasons.push("Quiet on campus activity");
    }
    if (metrics.complianceIssueCount > 0) {
      supportReasons.push("Agreement needs attention");
    }

    if (supportReasons.length > 0) {
      buckets.needingSupport.students.push(
        buildStudentItem(student, supportReasons, [
          reachOutAction(student.email),
          viewProfileAction(student),
        ]),
      );
    }

    const excellingReasons: string[] = [];
    if (metrics.clubCount >= thresholds.excellingClubCount) {
      excellingReasons.push(`${metrics.clubCount} clubs`);
    }
    if (metrics.certificationCount >= thresholds.excellingCertificationCount) {
      excellingReasons.push(`${metrics.certificationCount} certification${metrics.certificationCount === 1 ? "" : "s"}`);
    }
    if (metrics.maxAcademyProgressPct >= thresholds.excellingProgressPercent) {
      excellingReasons.push("Strong academy progress");
    }
    if (metrics.modulesCompleted >= thresholds.excellingModulesCompleted) {
      excellingReasons.push("High learning engagement");
    }
    if (metrics.leadershipRoles > 0) {
      excellingReasons.push("Club leadership");
    }

    if (excellingReasons.length >= 2) {
      buckets.excelling.students.push(
        buildStudentItem(student, excellingReasons, [
          reachOutAction(student.email),
          viewProfileAction(student),
        ]),
      );
    }

    const opportunityReasons: string[] = [];
    if (metrics.academyMembershipCount === 0) {
      opportunityReasons.push("No academy pathway yet");
    }
    if (metrics.modulesCompleted === 0) {
      opportunityReasons.push("Future Center not explored");
    }
    if (metrics.certificationCount === 0) {
      opportunityReasons.push("No certifications started");
    }

    if (opportunityReasons.length >= 2) {
      buckets.missingOpportunities.students.push(
        buildStudentItem(student, opportunityReasons, [
          {
            label: "Suggest pathway",
            href: "/pathways",
          },
          reachOutAction(student.email),
        ]),
      );
    }

    if (totalServiceHours < thresholds.serviceHoursMinimum) {
      const serviceReasons =
        totalServiceHours === 0
          ? ["No service hours logged"]
          : [`${Math.round(totalServiceHours)} of ${thresholds.serviceHoursMinimum} hours`];

      buckets.needsServiceHours.students.push(
        buildStudentItem(student, serviceReasons, [
          {
            label: "Service Center",
            href: "/service",
          },
          reachOutAction(student.email),
        ]),
      );
    }

    if (metrics.clubCount === 0) {
      buckets.withoutClubs.students.push(
        buildStudentItem(student, ["Not in a club yet"], [
          {
            label: "Suggest club",
            href: "/find-your-place",
          },
          reachOutAction(student.email),
        ]),
      );
    }

    const lacksResume =
      !student.portfolioPublic ||
      metrics.publishedPortfolioItems < thresholds.resumeMinPublishedItems ||
      portfolioCompletionPercent < thresholds.resumeMinCompletionPercent;

    if (lacksResume) {
      const resumeReasons: string[] = [];
      if (!student.portfolioPublic) {
        resumeReasons.push("Portfolio not shared");
      }
      if (metrics.publishedPortfolioItems < thresholds.resumeMinPublishedItems) {
        resumeReasons.push("Resume section incomplete");
      }
      if (portfolioCompletionPercent < thresholds.resumeMinCompletionPercent) {
        resumeReasons.push("Professional skills in progress");
      }

      buckets.withoutResume.students.push(
        buildStudentItem(student, resumeReasons, [
          {
            label: "Career portfolio",
            href: "/career-portfolio",
          },
          reachOutAction(student.email),
        ]),
      );
    }
  }

  for (const id of Object.keys(buckets) as SuccessAnalyticsBucketId[]) {
    buckets[id].count = buckets[id].students.length;
  }

  return {
    totalStudents: students.length,
    buckets,
  };
}
