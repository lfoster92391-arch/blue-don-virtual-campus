import { isDatabaseConfigured } from "@/config/env";
import { FOCUS_CLUBS, FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import { formatCents } from "@/lib/club-finance";
import { SUCCESS_ANALYTICS_GRADE_LABEL, SUCCESS_ANALYTICS_THRESHOLDS } from "@/config/success-analytics";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { getEquipmentStats } from "@/services/equipment-service";
import { getComplianceIssues, listPendingApprovals } from "@/services/form-service";
import { formatCurrency, getImpactFundSummary, listAllProposals } from "@/services/impact-fund-service";
import { listPendingMemberships } from "@/services/academy-service";
import { listPendingParents } from "@/services/parent-student-service";
import {
  listFocusClubFinanceSnapshots,
} from "@/services/club-finance-service";
import { listPendingInvoicesForFocusClubs } from "@/services/club-invoice-service";
import { ensureAllFocusClubOrganizations } from "@/services/focus-club-org-service";
import { getActiveLiveStream } from "@/services/media-service";
import { countFocusClubMemberships } from "@/services/student-admin-service";

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

export type LeadershipFocusClubPulse = {
  slug: string;
  name: string;
  balanceCents: number;
  balanceLabel: string;
  memberCount: number;
  pendingInvoices: number;
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
  focusClubs: {
    clubs: LeadershipFocusClubPulse[];
    pendingInvoicesTotal: number;
    liveStreamActive: boolean;
    mediaUploadsBroadcast: number;
    itFinancesHref: string;
    recentLedger: Array<{
      id: string;
      type: string;
      amountCents: number;
      memo: string | null;
      createdAt: Date;
      clubName: string;
    }>;
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
    focusClubs: {
      clubs: [],
      pendingInvoicesTotal: 0,
      liveStreamActive: false,
      mediaUploadsBroadcast: 0,
      itFinancesHref: "/organizations/it-club?tab=finances",
      recentLedger: [],
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
      { label: "Students", href: "/admin/students" },
      { label: "Principal Dashboard", href: "/admin/leadership" },
      { label: "IT Finances", href: "/organizations/it-club?tab=finances" },
      { label: "Service Desk", href: "/service-desk" },
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

  await ensureAllFocusClubOrganizations();
  const focusOrgs = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      select: { id: true, slug: true, name: true },
    }),
  );
  const focusOrgIds = (focusOrgs ?? []).map((o) => o.id);
  const [focusSnapshots, pendingClubInvoices, memberCounts, liveStream, broadcastMediaCount] =
    await Promise.all([
      listFocusClubFinanceSnapshots(focusOrgIds),
      listPendingInvoicesForFocusClubs(focusOrgIds),
      countFocusClubMemberships(),
      getActiveLiveStream(),
      withDatabase((prisma) => {
        const broadcasting = (focusOrgs ?? []).find((o) => o.slug === "broadcasting");
        if (!broadcasting) {
          return Promise.resolve(0);
        }
        return prisma.campusMediaItem.count({
          where: { organizationId: broadcasting.id },
        });
      }),
    ]);

  const memberCountBySlug = new Map(
    memberCounts.map((row) => [row.slug, row.count]),
  );
  const pendingByOrg = new Map<string, number>();
  for (const invoice of pendingClubInvoices) {
    pendingByOrg.set(
      invoice.organizationId,
      (pendingByOrg.get(invoice.organizationId) ?? 0) + 1,
    );
  }

  const recentLedger = focusSnapshots
    .flatMap((snap) =>
      snap.entries.slice(0, 4).map((entry) => ({
        id: entry.id,
        type: entry.type,
        amountCents: entry.amountCents,
        memo: entry.memo,
        createdAt: entry.createdAt,
        clubName: snap.organizationName,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const focusClubPulse: LeadershipFocusClubPulse[] = FOCUS_CLUBS.map((club) => {
    const snap = focusSnapshots.find((s) => s.organizationSlug === club.slug);
    return {
      slug: club.slug,
      name: club.name,
      balanceCents: snap?.balanceCents ?? 0,
      balanceLabel: formatCents(snap?.balanceCents ?? 0),
      memberCount: memberCountBySlug.get(club.slug) ?? 0,
      pendingInvoices: snap
        ? (pendingByOrg.get(snap.organizationId) ?? 0)
        : 0,
    };
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
    focusClubs: {
      clubs: focusClubPulse,
      pendingInvoicesTotal: pendingClubInvoices.length,
      liveStreamActive: Boolean(liveStream),
      mediaUploadsBroadcast: broadcastMediaCount ?? 0,
      itFinancesHref: "/organizations/it-club?tab=finances",
      recentLedger,
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

function buildDrillDown(_counts: {
  pendingApprovals: number;
  complianceIssues: number;
  pendingMemberships: number;
  pendingParents: number;
}): LeadershipDrillDown[] {
  return [
    { label: "Students", href: "/admin/students" },
    { label: "Principal Dashboard", href: "/admin/leadership" },
    {
      label: "IT Finances & approvals",
      href: "/organizations/it-club?tab=finances",
    },
    { label: "Service Desk", href: "/service-desk" },
    {
      label: "Parent approvals",
      href: "/admin/parent-approvals",
      count: _counts.pendingParents,
    },
  ];
}
