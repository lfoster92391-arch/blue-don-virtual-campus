import { isDatabaseConfigured } from "@/config/env";
import { SUCCESS_ANALYTICS_GRADE_LABEL, SUCCESS_ANALYTICS_THRESHOLDS } from "@/config/success-analytics";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { getEquipmentStats } from "@/services/equipment-service";
import { getComplianceIssues, listPendingApprovals } from "@/services/form-service";
import { formatCurrency, getImpactFundSummary, listAllProposals } from "@/services/impact-fund-service";
import { listPendingMemberships } from "@/services/academy-service";
import { listPendingParents } from "@/services/parent-student-service";

export type LeadershipSummaryMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type LeadershipFundraiserItem = {
  id: string;
  title: string;
  status: string;
  amountRequestedCents: number;
  fundedCents: number | null;
};

export type LeadershipContributor = {
  name: string;
  hours: number;
};

export type LeadershipTicketBreakdown = {
  category: string;
  open: number;
  closed: number;
};

export type LeadershipDrillDown = {
  label: string;
  href: string;
  count?: number;
};

export type LeadershipAnalyticsData = {
  summary: LeadershipSummaryMetric[];
  fundraising: {
    balanceCents: number;
    totalRaisedCents: number;
    availableCents: number;
    activeProposals: number;
    votingProposals: number;
    cornerStoreListings: number;
    fundraisers: LeadershipFundraiserItem[];
    balanceLabel: string;
    raisedLabel: string;
    availableLabel: string;
  };
  serviceHours: {
    schoolTotal: number;
    topContributors: LeadershipContributor[];
    belowThreshold: number;
    threshold: number;
  };
  studentBody: {
    activeStudents: number;
    clubMemberships: number;
    academyEnrollments: number;
    pendingAcademyJoins: number;
    pendingParentApprovals: number;
    pendingOrgJoins: number;
    gradeLabel: string;
  };
  campusActivity: {
    recentFormSubmissions: number;
    pendingApprovals: number;
    complianceIssues: number;
    openTickets: number;
    closedTickets: number;
    ticketsByCategory: LeadershipTicketBreakdown[];
    mediaUploads: number;
    dailyDiscoveryEngagement: number | null;
    opportunityInterests: number | null;
  };
  academics: {
    academyEnrollments: number;
    pendingEnrollments: number;
    equipmentTotal: number;
    equipmentCheckedOut: number;
    equipmentAvailable: number;
  };
  drillDown: LeadershipDrillDown[];
};

function emptyData(): LeadershipAnalyticsData {
  const threshold = SUCCESS_ANALYTICS_THRESHOLDS.serviceHoursMinimum;

  return {
    summary: [
      { label: "Active students", value: "0" },
      { label: "Service hours", value: "0" },
      { label: "Impact Fund raised", value: formatCurrency(0) },
      { label: "Open tickets", value: "0" },
      { label: "Pending approvals", value: "0" },
    ],
    fundraising: {
      balanceCents: 0,
      totalRaisedCents: 0,
      availableCents: 0,
      activeProposals: 0,
      votingProposals: 0,
      cornerStoreListings: 0,
      fundraisers: [],
      balanceLabel: formatCurrency(0),
      raisedLabel: formatCurrency(0),
      availableLabel: formatCurrency(0),
    },
    serviceHours: {
      schoolTotal: 0,
      topContributors: [],
      belowThreshold: 0,
      threshold,
    },
    studentBody: {
      activeStudents: 0,
      clubMemberships: 0,
      academyEnrollments: 0,
      pendingAcademyJoins: 0,
      pendingParentApprovals: 0,
      pendingOrgJoins: 0,
      gradeLabel: SUCCESS_ANALYTICS_GRADE_LABEL,
    },
    campusActivity: {
      recentFormSubmissions: 0,
      pendingApprovals: 0,
      complianceIssues: 0,
      openTickets: 0,
      closedTickets: 0,
      ticketsByCategory: [],
      mediaUploads: 0,
      dailyDiscoveryEngagement: null,
      opportunityInterests: null,
    },
    academics: {
      academyEnrollments: 0,
      pendingEnrollments: 0,
      equipmentTotal: 0,
      equipmentCheckedOut: 0,
      equipmentAvailable: 0,
    },
    drillDown: [
      { label: "Governance Center", href: "/admin" },
      { label: "Success Analytics", href: "/counselor/analytics" },
      { label: "Impact Fund admin", href: "/admin/impact-fund" },
      { label: "Service Center", href: "/service" },
      { label: "Forms Center", href: "/admin/forms-center" },
      { label: "Equipment", href: "/equipment" },
    ],
  };
}

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email
  );
}

const TICKET_CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "IT",
  FACILITIES: "Facilities",
  ACADEMIC: "Academic",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export async function getLeadershipAnalytics(): Promise<LeadershipAnalyticsData> {
  const empty = emptyData();

  const [
    impactSummary,
    impactProposals,
    pendingApprovals,
    complianceIssues,
    pendingMemberships,
    pendingParents,
    equipmentStats,
  ] = await Promise.all([
    getImpactFundSummary(),
    listAllProposals(),
    listPendingApprovals(),
    getComplianceIssues(),
    listPendingMemberships(),
    listPendingParents(),
    getEquipmentStats(),
  ]);

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      ...empty,
      fundraising: {
        ...empty.fundraising,
        balanceCents: impactSummary.balanceCents,
        totalRaisedCents: impactSummary.allocatedCents,
        availableCents: impactSummary.availableCents,
        activeProposals: impactSummary.openProposals,
        votingProposals: impactSummary.votingProposals,
        fundraisers: impactProposals.slice(0, 6).map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          amountRequestedCents: p.amountRequested,
          fundedCents: p.fundedAmount,
        })),
        balanceLabel: formatCurrency(impactSummary.balanceCents),
        raisedLabel: formatCurrency(impactSummary.allocatedCents),
        availableLabel: formatCurrency(impactSummary.availableCents),
      },
      campusActivity: {
        ...empty.campusActivity,
        pendingApprovals: pendingApprovals.length,
        complianceIssues: complianceIssues.length,
      },
      studentBody: {
        ...empty.studentBody,
        pendingAcademyJoins: pendingMemberships.length,
        pendingParentApprovals: pendingParents.length,
      },
      academics: {
        ...empty.academics,
        pendingEnrollments: pendingMemberships.length,
        equipmentTotal: equipmentStats.total,
        equipmentCheckedOut: equipmentStats.checkedOut,
        equipmentAvailable: equipmentStats.available,
      },
      drillDown: buildDrillDown({
        pendingApprovals: pendingApprovals.length,
        complianceIssues: complianceIssues.length,
        pendingMemberships: pendingMemberships.length,
        pendingParents: pendingParents.length,
      }),
      summary: [
        { label: "Active students", value: "0", hint: "No database connection" },
        { label: "Service hours", value: "0" },
        { label: "Impact Fund raised", value: formatCurrency(impactSummary.allocatedCents) },
        { label: "Open tickets", value: "0" },
        { label: "Pending approvals", value: String(pendingApprovals.length) },
      ],
    };
  }

  const dbData = await withDatabase(async (prisma) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Promise.all([
      prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
      prisma.organizationMembership.count({
        where: {
          status: "ACTIVE",
          organization: { type: "CLUB" },
          user: { role: "STUDENT", status: "ACTIVE" },
        },
      }),
      prisma.organizationMembership.count({
        where: { status: "PENDING" },
      }),
      prisma.academyMembership.count({ where: { status: "ACTIVE" } }),
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
          type: "SERVICE",
          status: { not: "ARCHIVED" },
        },
        select: { userId: true, points: true },
      }),
      prisma.eventParticipant.findMany({
        where: {
          role: "VOLUNTEER",
          user: { role: "STUDENT", status: "ACTIVE" },
        },
        select: {
          userId: true,
          hours: true,
          user: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.formSubmission.count({
        where: { submittedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.ticket.groupBy({
        by: ["category", "status"],
        _count: { _all: true },
      }),
      prisma.campusMediaItem.count(),
      prisma.cornerStoreItem.count({ where: { status: "ACTIVE" } }),
      prisma.user.findMany({
        where: { role: "STUDENT", status: "ACTIVE" },
        select: {
          id: true,
          displayName: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
    ]);
  });

  if (!dbData) {
    return empty;
  }

  const [
    activeStudents,
    clubMemberships,
    pendingOrgJoins,
    academyEnrollments,
    volunteerHoursByUser,
    portfolioServiceItems,
    volunteerDetails,
    recentFormSubmissions,
    ticketGroups,
    mediaUploads,
    cornerStoreListings,
    students,
  ] = dbData;

  const threshold = SUCCESS_ANALYTICS_THRESHOLDS.serviceHoursMinimum;

  const hoursByUser = new Map<string, number>();
  for (const entry of volunteerHoursByUser) {
    hoursByUser.set(entry.userId, entry._sum.hours ?? 0);
  }
  for (const item of portfolioServiceItems) {
    hoursByUser.set(
      item.userId,
      (hoursByUser.get(item.userId) ?? 0) + item.points,
    );
  }

  let schoolTotal = 0;
  let belowThreshold = 0;
  for (const hours of hoursByUser.values()) {
    schoolTotal += hours;
    if (hours < threshold) {
      belowThreshold += 1;
    }
  }
  for (const student of students) {
    if (!hoursByUser.has(student.id)) {
      belowThreshold += 1;
    }
  }

  const contributorMap = new Map<string, { name: string; hours: number }>();
  for (const entry of volunteerDetails) {
    const existing = contributorMap.get(entry.userId);
    const hours = entry.hours ?? 0;
    if (existing) {
      existing.hours += hours;
    } else {
      contributorMap.set(entry.userId, {
        name: displayName(entry.user),
        hours,
      });
    }
  }
  for (const item of portfolioServiceItems) {
    const student = students.find((s) => s.id === item.userId);
    if (!student) continue;
    const existing = contributorMap.get(item.userId);
    if (existing) {
      existing.hours += item.points;
    } else {
      contributorMap.set(item.userId, {
        name: displayName(student),
        hours: item.points,
      });
    }
  }

  const topContributors = [...contributorMap.values()]
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5)
    .map((c) => ({ name: c.name, hours: Math.round(c.hours * 10) / 10 }));

  const ticketCategoryMap = new Map<string, { open: number; closed: number }>();
  let openTickets = 0;
  let closedTickets = 0;

  for (const row of ticketGroups) {
    const label = TICKET_CATEGORY_LABELS[row.category] ?? row.category;
    const current = ticketCategoryMap.get(label) ?? { open: 0, closed: 0 };
    const count = row._count._all;

    if (row.status === "OPEN" || row.status === "IN_PROGRESS") {
      current.open += count;
      openTickets += count;
    } else {
      current.closed += count;
      closedTickets += count;
    }

    ticketCategoryMap.set(label, current);
  }

  const ticketsByCategory = [...ticketCategoryMap.entries()].map(
    ([category, counts]) => ({
      category,
      ...counts,
    }),
  );

  const activeFundraisers = impactProposals
    .filter((p) => !["DRAFT", "ARCHIVED", "REJECTED"].includes(p.status))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      amountRequestedCents: p.amountRequested,
      fundedCents: p.fundedAmount,
    }));

  const drillDown = buildDrillDown({
    pendingApprovals: pendingApprovals.length,
    complianceIssues: complianceIssues.length,
    pendingMemberships: pendingMemberships.length,
    pendingParents: pendingParents.length,
  });

  return {
    summary: [
      {
        label: "Active students",
        value: String(activeStudents),
        hint: "Enrolled and active",
      },
      {
        label: "Service hours",
        value: String(Math.round(schoolTotal)),
        hint: "Volunteer + portfolio service",
      },
      {
        label: "Impact Fund raised",
        value: formatCurrency(impactSummary.allocatedCents),
        hint: `${impactSummary.votingProposals} voting · ${impactSummary.openProposals} submitted`,
      },
      {
        label: "Open tickets",
        value: String(openTickets),
        hint: `${closedTickets} resolved or closed`,
      },
      {
        label: "Pending approvals",
        value: String(pendingApprovals.length),
        hint: "Forms awaiting review",
      },
    ],
    fundraising: {
      balanceCents: impactSummary.balanceCents,
      totalRaisedCents: impactSummary.allocatedCents,
      availableCents: impactSummary.availableCents,
      activeProposals: impactSummary.openProposals,
      votingProposals: impactSummary.votingProposals,
      cornerStoreListings,
      fundraisers: activeFundraisers,
      balanceLabel: formatCurrency(impactSummary.balanceCents),
      raisedLabel: formatCurrency(impactSummary.allocatedCents),
      availableLabel: formatCurrency(impactSummary.availableCents),
    },
    serviceHours: {
      schoolTotal: Math.round(schoolTotal),
      topContributors,
      belowThreshold,
      threshold,
    },
    studentBody: {
      activeStudents,
      clubMemberships,
      academyEnrollments,
      pendingAcademyJoins: pendingMemberships.length,
      pendingParentApprovals: pendingParents.length,
      pendingOrgJoins,
      gradeLabel: SUCCESS_ANALYTICS_GRADE_LABEL,
    },
    campusActivity: {
      recentFormSubmissions,
      pendingApprovals: pendingApprovals.length,
      complianceIssues: complianceIssues.length,
      openTickets,
      closedTickets,
      ticketsByCategory,
      mediaUploads,
      dailyDiscoveryEngagement: null,
      opportunityInterests: null,
    },
    academics: {
      academyEnrollments,
      pendingEnrollments: pendingMemberships.length,
      equipmentTotal: equipmentStats.total,
      equipmentCheckedOut: equipmentStats.checkedOut,
      equipmentAvailable: equipmentStats.available,
    },
    drillDown,
  };
}

function buildDrillDown(counts: {
  pendingApprovals: number;
  complianceIssues: number;
  pendingMemberships: number;
  pendingParents: number;
}): LeadershipDrillDown[] {
  return [
    { label: "Governance Center", href: "/admin" },
    {
      label: "Success Analytics",
      href: "/counselor/analytics",
    },
    { label: "Impact Fund admin", href: "/admin/impact-fund" },
    { label: "Service Center", href: "/service" },
    {
      label: "Forms approvals",
      href: "/admin/approvals",
      count: counts.pendingApprovals,
    },
    {
      label: "Compliance",
      href: "/admin/compliance",
      count: counts.complianceIssues,
    },
    {
      label: "Academy memberships",
      href: "/admin/academies",
      count: counts.pendingMemberships,
    },
    {
      label: "Parent approvals",
      href: "/admin/parent-approvals",
      count: counts.pendingParents,
    },
    { label: "Equipment", href: "/equipment" },
    { label: "Campus Operations", href: "/operations" },
  ];
}
