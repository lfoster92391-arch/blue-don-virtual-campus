/**
 * Live club operations pulse — the Command Center "what is each club doing
 * right now" board.
 *
 * IT Club is *building*, Broadcasting is *prepping to broadcast*, Cricut is
 * *making*. Everything is read from existing Prisma tables (tasks, meetings,
 * fundraisers, ledger, invoices, projects, Cricut orders/designs, broadcast
 * rundown/schedule/submissions) so no new schema is required.
 *
 * Scoping:
 *   - students/parents see the focus clubs they belong to
 *   - faculty/admin (see `canBrowseAllFocusClubs`) monitor all three
 *   - money detail (ledger balance, invoice queue) is officer/admin only
 *
 * Every query soft-fails: a broken club section degrades to a quiet card
 * instead of blanking `/home`.
 */

import type { BroadcastScriptSlotDef } from "@/config/broadcast-script";
import { DEFAULT_BROADCAST_SCRIPT_SLOTS } from "@/config/broadcast-script";
import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import { isDatabaseConfigured } from "@/config/env";
import { canBrowseAllFocusClubs } from "@/config/focus-club-access";
import {
  FOCUS_CLUBS,
  FOCUS_CLUB_SLUGS,
  type FocusClubSlug,
} from "@/config/focused-clubs";
import {
  normalizeOrgRole,
  orgRoleIsOfficer,
  type CampusRole,
  type OrgMembershipRole,
} from "@/config/roles";
import { formatCents } from "@/lib/club-finance";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type ClubOpsTone = "neutral" | "live" | "alert" | "good";

/** Big number chip on a club card (open tasks, orders in production, …). */
export type ClubOpsMetric = {
  key: string;
  label: string;
  value: string;
  tone: ClubOpsTone;
  href?: string;
};

/** A single status line under NOW / NEXT. */
export type ClubOpsLine = {
  key: string;
  label: string;
  text: string;
  meta?: string;
  tone: ClubOpsTone;
  href?: string;
};

/** A monitorable target with progress (fundraiser goal, rundown readiness, …). */
export type ClubOpsGoal = {
  key: string;
  title: string;
  detail: string;
  percent: number;
  caption?: string;
  href?: string;
};

export type ClubOpsCard = {
  slug: FocusClubSlug;
  name: string;
  accent: string;
  /** Verb chip — "Building", "Prepping to broadcast", "Making". */
  activityLabel: string;
  /** One-line answer to "what are they doing right now". */
  headline: string;
  /** True when there is live activity worth watching. */
  isActive: boolean;
  isMember: boolean;
  orgRoleLabel: string | null;
  /** Viewer sees finance detail for this club. */
  showsFinance: boolean;
  metrics: ClubOpsMetric[];
  now: ClubOpsLine[];
  next: ClubOpsLine[];
  goals: ClubOpsGoal[];
  links: { label: string; href: string }[];
};

export type ClubOpsPulse = {
  generatedAt: Date;
  generatedAtLabel: string;
  /** True when the viewer is monitoring clubs beyond their own membership. */
  monitoring: boolean;
  cards: ClubOpsCard[];
};

const EMPTY_PULSE: ClubOpsPulse = {
  generatedAt: new Date(0),
  generatedAtLabel: "",
  monitoring: false,
  cards: [],
};

const ORG_ROLE_LABELS: Record<OrgMembershipRole, string> = {
  president: "President",
  vice_president: "Vice President",
  secretary: "Secretary",
  member: "Member",
};

function clubMeta(slug: FocusClubSlug) {
  return FOCUS_CLUBS.find((club) => club.slug === slug)!;
}

function timeLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function dayTimeLabel(date: Date): string {
  const now = new Date();
  const sameDay =
    new Intl.DateTimeFormat("en-US", {
      timeZone: CAMPUS_WEATHER_LOCATION.timezone,
      dateStyle: "short",
    }).format(date) ===
    new Intl.DateTimeFormat("en-US", {
      timeZone: CAMPUS_WEATHER_LOCATION.timezone,
      dateStyle: "short",
    }).format(now);

  if (sameDay) {
    return `Today ${timeLabel(date)}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function percentOf(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function startOfCampusDay(date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfCampusDay(date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function parseSlotDefs(raw: unknown): BroadcastScriptSlotDef[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_BROADCAST_SCRIPT_SLOTS;
  }

  const parsed: BroadcastScriptSlotDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.key !== "string" || typeof row.label !== "string") continue;
    parsed.push({
      key: row.key,
      label: row.label,
      template: typeof row.template === "string" ? row.template : "",
      order: typeof row.order === "number" ? row.order : parsed.length + 1,
      required: Boolean(row.required),
      slotType:
        row.slotType === "LOCKED_DAILY" || row.slotType === "FIXED"
          ? row.slotType
          : "STUDENT_FILL",
    });
  }

  return parsed.length > 0 ? parsed : DEFAULT_BROADCAST_SCRIPT_SLOTS;
}

function parseScriptValues(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

async function safeSection<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[club-ops-pulse] ${label} failed:`, error);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Shared per-club operations snapshot
// ---------------------------------------------------------------------------

type FundraiserOps = {
  id: string;
  title: string;
  goalCents: number;
  raisedCents: number;
  endsAt: Date | null;
};

type CommonOps = {
  nextMeeting: {
    title: string;
    startDate: Date;
    location: string | null;
    mandatoryAllClubs: boolean;
  } | null;
  meetingsToday: number;
  openTasks: number;
  inProgressTasks: number;
  pastDueTasks: number;
  completedTasks: number;
  totalTasks: number;
  fundraisers: FundraiserOps[];
  pendingInvoices: number;
  balanceCents: number;
  projectsInProgress: number;
  projectsPlanning: number;
  activeProjectTitles: string[];
  documents: number;
};

const EMPTY_COMMON: CommonOps = {
  nextMeeting: null,
  meetingsToday: 0,
  openTasks: 0,
  inProgressTasks: 0,
  pastDueTasks: 0,
  completedTasks: 0,
  totalTasks: 0,
  fundraisers: [],
  pendingInvoices: 0,
  balanceCents: 0,
  projectsInProgress: 0,
  projectsPlanning: 0,
  activeProjectTitles: [],
  documents: 0,
};

async function loadCommonOps(organizationId: string): Promise<CommonOps> {
  const now = new Date();

  const [
    nextMeeting,
    meetingsToday,
    openTasks,
    inProgressTasks,
    pastDueTasks,
    completedTasks,
    fundraiserRows,
    pendingInvoices,
    ledgerTotals,
    projectsInProgress,
    projectsPlanning,
    activeProjects,
    documents,
  ] = await Promise.all([
    withDatabase((prisma) =>
      prisma.clubCalendarEvent.findFirst({
        where: { organizationId, startDate: { gte: now } },
        orderBy: { startDate: "asc" },
        select: {
          title: true,
          startDate: true,
          location: true,
          mandatoryAllClubs: true,
        },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubCalendarEvent.count({
        where: {
          organizationId,
          startDate: { gte: startOfCampusDay(now), lte: endOfCampusDay(now) },
        },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubStudentTask.count({
        where: { organizationId, status: { not: "COMPLETED" } },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubStudentTask.count({
        where: { organizationId, status: "IN_PROGRESS" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubStudentTask.count({
        where: {
          organizationId,
          dueAt: { lt: now },
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
        },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubStudentTask.count({
        where: { organizationId, status: "COMPLETED" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubFundraiser.findMany({
        where: { organizationId, status: "ACTIVE" },
        orderBy: [{ endsAt: "asc" }, { createdAt: "desc" }],
        take: 3,
        select: { id: true, title: true, goalCents: true, endsAt: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubInvoice.count({ where: { organizationId, status: "PENDING" } }),
    ),
    withDatabase((prisma) =>
      prisma.clubLedgerEntry.groupBy({
        by: ["type"],
        where: { organizationId },
        _sum: { amountCents: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubProject.count({
        where: { organizationId, status: "IN_PROGRESS" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubProject.count({
        where: { organizationId, status: "PLANNING" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubProject.findMany({
        where: { organizationId, status: { in: ["IN_PROGRESS", "PLANNING"] } },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 3,
        select: { title: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.clubDocument.count({ where: { organizationId } }),
    ),
  ]);

  const fundraisers = fundraiserRows ?? [];
  const fundraiserIds = fundraisers.map((f) => f.id);
  const fundraiserLedger = fundraiserIds.length
    ? ((await withDatabase((prisma) =>
        prisma.clubLedgerEntry.findMany({
          where: { organizationId, fundraiserId: { in: fundraiserIds } },
          select: { fundraiserId: true, type: true, amountCents: true },
        }),
      )) ?? [])
    : [];

  const raisedByFundraiser = new Map<string, number>();
  for (const entry of fundraiserLedger) {
    if (!entry.fundraiserId) continue;
    const current = raisedByFundraiser.get(entry.fundraiserId) ?? 0;
    raisedByFundraiser.set(
      entry.fundraiserId,
      entry.type === "DEPOSIT"
        ? current + entry.amountCents
        : current - entry.amountCents,
    );
  }

  const balanceCents = (ledgerTotals ?? []).reduce((sum, row) => {
    const amount = row._sum.amountCents ?? 0;
    return row.type === "DEPOSIT" ? sum + amount : sum - amount;
  }, 0);

  const completed = completedTasks ?? 0;
  const open = openTasks ?? 0;

  return {
    nextMeeting: nextMeeting ?? null,
    meetingsToday: meetingsToday ?? 0,
    openTasks: open,
    inProgressTasks: inProgressTasks ?? 0,
    pastDueTasks: pastDueTasks ?? 0,
    completedTasks: completed,
    totalTasks: completed + open,
    fundraisers: fundraisers.map((f) => ({
      id: f.id,
      title: f.title,
      goalCents: f.goalCents,
      endsAt: f.endsAt,
      raisedCents: Math.max(0, raisedByFundraiser.get(f.id) ?? 0),
    })),
    pendingInvoices: pendingInvoices ?? 0,
    balanceCents,
    projectsInProgress: projectsInProgress ?? 0,
    projectsPlanning: projectsPlanning ?? 0,
    activeProjectTitles: (activeProjects ?? []).map((p) => p.title),
    documents: documents ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Shared card pieces
// ---------------------------------------------------------------------------

function commonNextLines(
  slug: FocusClubSlug,
  common: CommonOps,
): ClubOpsLine[] {
  const lines: ClubOpsLine[] = [];

  if (common.nextMeeting) {
    lines.push({
      key: "meeting",
      label: "Next meeting",
      text: common.nextMeeting.title,
      meta: [
        dayTimeLabel(common.nextMeeting.startDate),
        common.nextMeeting.location,
        common.nextMeeting.mandatoryAllClubs ? "All-hands" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      tone: common.meetingsToday > 0 ? "live" : "neutral",
      href: `/organizations/${slug}?tab=calendar`,
    });
  }

  if (common.pastDueTasks > 0) {
    lines.push({
      key: "past-due",
      label: "Past due",
      text: `${plural(common.pastDueTasks, "task")} past the due date`,
      tone: "alert",
      href: `/organizations/${slug}?tab=tasks`,
    });
  }

  return lines;
}

function commonGoals(slug: FocusClubSlug, common: CommonOps): ClubOpsGoal[] {
  const goals: ClubOpsGoal[] = [];

  for (const fundraiser of common.fundraisers) {
    goals.push({
      key: `fundraiser-${fundraiser.id}`,
      title: fundraiser.title,
      detail: `${formatCents(fundraiser.raisedCents)} of ${formatCents(
        fundraiser.goalCents,
      )}`,
      percent: percentOf(fundraiser.raisedCents, fundraiser.goalCents),
      caption: fundraiser.endsAt
        ? `Ends ${dayTimeLabel(fundraiser.endsAt)}`
        : "Active fundraiser",
      href: `/organizations/${slug}?tab=fundraisers`,
    });
  }

  if (common.totalTasks > 0) {
    goals.push({
      key: "task-completion",
      title: "Assigned work completed",
      detail: `${common.completedTasks} of ${common.totalTasks} tasks`,
      percent: percentOf(common.completedTasks, common.totalTasks),
      caption:
        common.pastDueTasks > 0
          ? `${plural(common.pastDueTasks, "task")} past due`
          : `${plural(common.openTasks, "task")} still open`,
      href: `/organizations/${slug}?tab=tasks`,
    });
  }

  return goals;
}

function financeLines(
  slug: FocusClubSlug,
  common: CommonOps,
  showsFinance: boolean,
): ClubOpsLine[] {
  if (!showsFinance) {
    return [];
  }

  const lines: ClubOpsLine[] = [];

  if (common.pendingInvoices > 0) {
    lines.push({
      key: "invoices",
      label: "Finance desk",
      text: `${plural(common.pendingInvoices, "invoice")} waiting on approval`,
      tone: "alert",
      href: `/organizations/${slug}?tab=invoices`,
    });
  }

  if (common.balanceCents !== 0) {
    lines.push({
      key: "balance",
      label: "Club balance",
      text: formatCents(common.balanceCents),
      meta: "Ledger deposits minus expenses",
      tone: common.balanceCents < 0 ? "alert" : "neutral",
      href: `/organizations/${slug}?tab=finances`,
    });
  }

  return lines;
}

// ---------------------------------------------------------------------------
// IT Club — what they are building
// ---------------------------------------------------------------------------

async function buildItCard(
  common: CommonOps,
  base: Omit<ClubOpsCard, "metrics" | "now" | "next" | "goals" | "links">,
): Promise<ClubOpsCard> {
  const openTickets = await safeSection(
    "it-tickets",
    async () =>
      (await withDatabase((prisma) =>
        prisma.ticket.count({
          where: {
            status: { in: ["OPEN", "IN_PROGRESS"] },
            category: "TECHNICAL",
          },
        }),
      )) ?? 0,
    0,
  );

  const building = common.projectsInProgress + common.projectsPlanning;

  const now: ClubOpsLine[] = [];

  if (common.activeProjectTitles.length > 0) {
    now.push({
      key: "projects",
      label: "Building",
      text: common.activeProjectTitles.join(" · "),
      meta: `${plural(common.projectsInProgress, "project")} in progress${
        common.projectsPlanning > 0
          ? ` · ${common.projectsPlanning} in planning`
          : ""
      }`,
      tone: common.projectsInProgress > 0 ? "live" : "neutral",
      href: `/organizations/it-club?tab=projects`,
    });
  }

  if (common.inProgressTasks > 0) {
    now.push({
      key: "tasks",
      label: "Hands on deck",
      text: `${plural(common.inProgressTasks, "task")} actively being worked`,
      meta: `${plural(common.openTasks, "task")} open in total`,
      tone: "live",
      href: `/organizations/it-club?tab=tasks`,
    });
  }

  if (openTickets > 0) {
    now.push({
      key: "help-desk",
      label: "Help desk",
      text: `${plural(openTickets, "ticket")} open`,
      tone: "alert",
      href: "/service-desk",
    });
  }

  now.push(...financeLines("it-club", common, base.showsFinance));

  const headline =
    common.projectsInProgress > 0
      ? `Building ${plural(common.projectsInProgress, "project")} right now`
      : common.inProgressTasks > 0
        ? `${plural(common.inProgressTasks, "task")} in progress on the bench`
        : common.openTasks > 0
          ? `${plural(common.openTasks, "task")} queued up to build`
          : "Bench is clear — nothing in the build queue";

  return {
    ...base,
    headline,
    isActive: common.projectsInProgress + common.inProgressTasks > 0,
    metrics: [
      {
        key: "building",
        label: "Building",
        value: String(building),
        tone: building > 0 ? "live" : "neutral",
        href: "/organizations/it-club?tab=projects",
      },
      {
        key: "open-tasks",
        label: "Open tasks",
        value: String(common.openTasks),
        tone: common.pastDueTasks > 0 ? "alert" : "neutral",
        href: "/organizations/it-club?tab=tasks",
      },
      ...(base.showsFinance
        ? [
            {
              key: "invoices",
              label: "Invoices pending",
              value: String(common.pendingInvoices),
              tone: (common.pendingInvoices > 0
                ? "alert"
                : "good") as ClubOpsTone,
              href: "/organizations/it-club?tab=invoices",
            },
          ]
        : []),
      {
        key: "meetings",
        label: "Meetings today",
        value: String(common.meetingsToday),
        tone: common.meetingsToday > 0 ? "live" : "neutral",
        href: "/organizations/it-club?tab=calendar",
      },
    ],
    now,
    next: commonNextLines("it-club", common),
    goals: commonGoals("it-club", common),
    links: [
      { label: "Projects", href: "/organizations/it-club?tab=projects" },
      { label: "Finances", href: "/organizations/it-club?tab=finances" },
      { label: "Club home", href: "/organizations/it-club" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Broadcasting — what they are prepping to broadcast
// ---------------------------------------------------------------------------

type BroadcastOps = {
  slotsTotal: number;
  slotsFilled: number;
  scriptStarted: boolean;
  scriptUpdatedAt: Date | null;
  nextAirAt: Date | null;
  airTitle: string | null;
  pendingSubmissions: number;
  pendingBookings: number;
  nextBooking: { eventName: string; eventAt: Date; clubOrTeam: string } | null;
  equipmentReady: number;
  equipmentTotal: number;
  pendingApplications: number;
};

const EMPTY_BROADCAST: BroadcastOps = {
  slotsTotal: 0,
  slotsFilled: 0,
  scriptStarted: false,
  scriptUpdatedAt: null,
  nextAirAt: null,
  airTitle: null,
  pendingSubmissions: 0,
  pendingBookings: 0,
  nextBooking: null,
  equipmentReady: 0,
  equipmentTotal: 0,
  pendingApplications: 0,
};

async function loadBroadcastOps(organizationId: string): Promise<BroadcastOps> {
  const now = new Date();

  const [
    template,
    script,
    schedule,
    pendingSubmissions,
    pendingBookings,
    nextBooking,
    equipment,
    pendingApplications,
  ] = await Promise.all([
    withDatabase((prisma) =>
      prisma.broadcastScriptTemplate.findUnique({
        where: { organizationId },
        select: { slots: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastDailyScript.findUnique({
        where: {
          organizationId_scriptDate: {
            organizationId,
            scriptDate: startOfUtcDay(now),
          },
        },
        select: { values: true, updatedAt: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastSchedule.findUnique({
        where: { organizationId },
        select: { nextAirAt: true, title: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastAnnouncementSubmission.count({
        where: { organizationId, status: "PENDING" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastBookingRequest.count({
        where: { organizationId, status: "PENDING" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastBookingRequest.findFirst({
        where: {
          organizationId,
          status: "ACCEPTED",
          eventAt: { gte: now },
        },
        orderBy: { eventAt: "asc" },
        select: { eventName: true, eventAt: true, clubOrTeam: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastEquipmentItem.findMany({
        where: { organizationId },
        select: { isChecked: true },
      }),
    ),
    withDatabase((prisma) =>
      prisma.broadcastJoinApplication.count({
        where: { organizationId, status: "PENDING" },
      }),
    ),
  ]);

  const slots = parseSlotDefs(template?.slots).filter(
    (slot) => slot.slotType === "STUDENT_FILL",
  );
  const values = parseScriptValues(script?.values);
  const slotsFilled = slots.filter(
    (slot) => (values[slot.key] ?? "").trim().length > 0,
  ).length;
  const gear = equipment ?? [];

  return {
    slotsTotal: slots.length,
    slotsFilled,
    scriptStarted: Boolean(script),
    scriptUpdatedAt: script?.updatedAt ?? null,
    nextAirAt: schedule?.nextAirAt ?? null,
    airTitle: schedule?.title ?? null,
    pendingSubmissions: pendingSubmissions ?? 0,
    pendingBookings: pendingBookings ?? 0,
    nextBooking: nextBooking ?? null,
    equipmentReady: gear.filter((item) => item.isChecked).length,
    equipmentTotal: gear.length,
    pendingApplications: pendingApplications ?? 0,
  };
}

function buildBroadcastCard(
  common: CommonOps,
  ops: BroadcastOps,
  base: Omit<ClubOpsCard, "metrics" | "now" | "next" | "goals" | "links">,
): ClubOpsCard {
  const now: ClubOpsLine[] = [];
  const rundownReady =
    ops.slotsTotal > 0 && ops.slotsFilled === ops.slotsTotal;

  now.push({
    key: "rundown",
    label: "Today's rundown",
    text: rundownReady
      ? "Script is ready to read"
      : ops.slotsFilled > 0
        ? `Writing the script — ${ops.slotsFilled} of ${ops.slotsTotal} slots filled`
        : "Script not started yet",
    meta: ops.scriptUpdatedAt
      ? `Last edit ${dayTimeLabel(ops.scriptUpdatedAt)}`
      : undefined,
    tone: rundownReady ? "good" : ops.slotsFilled > 0 ? "live" : "alert",
    href: "/organizations/broadcasting?tab=script",
  });

  if (ops.pendingSubmissions > 0) {
    now.push({
      key: "submissions",
      label: "Announcement queue",
      text: `${plural(
        ops.pendingSubmissions,
        "submission",
      )} waiting to be read on air`,
      tone: "alert",
      href: "/organizations/broadcasting?tab=submissions",
    });
  }

  if (ops.equipmentTotal > 0) {
    now.push({
      key: "gear",
      label: "Studio check",
      text: `${ops.equipmentReady} of ${ops.equipmentTotal} gear items checked`,
      tone:
        ops.equipmentReady === ops.equipmentTotal
          ? "good"
          : ops.equipmentReady > 0
            ? "live"
            : "neutral",
      href: "/organizations/broadcasting?tab=equipment",
    });
  }

  if (common.inProgressTasks > 0) {
    now.push({
      key: "tasks",
      label: "Crew work",
      text: `${plural(common.inProgressTasks, "task")} in progress`,
      tone: "live",
      href: "/organizations/broadcasting?tab=tasks",
    });
  }

  now.push(...financeLines("broadcasting", common, base.showsFinance));

  const next: ClubOpsLine[] = [];

  if (ops.nextAirAt) {
    next.push({
      key: "air",
      label: "Next air time",
      text: ops.airTitle ?? "Blue Don Live",
      meta: dayTimeLabel(ops.nextAirAt),
      tone: "live",
      href: "/media",
    });
  }

  if (ops.nextBooking) {
    next.push({
      key: "booking",
      label: "Next coverage",
      text: `${ops.nextBooking.eventName} · ${ops.nextBooking.clubOrTeam}`,
      meta: dayTimeLabel(ops.nextBooking.eventAt),
      tone: "neutral",
      href: "/organizations/broadcasting?tab=bookings",
    });
  }

  if (ops.pendingBookings > 0) {
    next.push({
      key: "booking-queue",
      label: "Coverage requests",
      text: `${plural(ops.pendingBookings, "request")} awaiting a reply`,
      tone: "alert",
      href: "/organizations/broadcasting?tab=bookings",
    });
  }

  next.push(...commonNextLines("broadcasting", common));

  const goals = commonGoals("broadcasting", common);

  if (ops.slotsTotal > 0) {
    goals.unshift({
      key: "rundown-ready",
      title: "Today's rundown ready",
      detail: `${ops.slotsFilled} of ${ops.slotsTotal} script slots`,
      percent: percentOf(ops.slotsFilled, ops.slotsTotal),
      caption: rundownReady ? "Cleared for air" : "Still being written",
      href: "/organizations/broadcasting?tab=script",
    });
  }

  if (ops.equipmentTotal > 0) {
    goals.push({
      key: "gear-ready",
      title: "Studio gear checked",
      detail: `${ops.equipmentReady} of ${ops.equipmentTotal} items`,
      percent: percentOf(ops.equipmentReady, ops.equipmentTotal),
      caption: "Pre-show equipment checklist",
      href: "/organizations/broadcasting?tab=equipment",
    });
  }

  const headline = rundownReady
    ? "Rundown is written — prepping to go on air"
    : ops.slotsFilled > 0
      ? `Prepping the broadcast — ${ops.slotsFilled} of ${ops.slotsTotal} script slots written`
      : ops.nextAirAt
        ? `Next air time ${dayTimeLabel(ops.nextAirAt)} — script not started`
        : "No rundown started for today yet";

  return {
    ...base,
    headline,
    isActive: ops.slotsFilled > 0 || Boolean(ops.nextAirAt),
    metrics: [
      {
        key: "script",
        label: "Script slots",
        value: `${ops.slotsFilled}/${ops.slotsTotal}`,
        tone: rundownReady ? "good" : "live",
        href: "/organizations/broadcasting?tab=script",
      },
      {
        key: "submissions",
        label: "To read on air",
        value: String(ops.pendingSubmissions),
        tone: ops.pendingSubmissions > 0 ? "alert" : "neutral",
        href: "/organizations/broadcasting?tab=submissions",
      },
      {
        key: "bookings",
        label: "Coverage queue",
        value: String(ops.pendingBookings),
        tone: ops.pendingBookings > 0 ? "alert" : "neutral",
        href: "/organizations/broadcasting?tab=bookings",
      },
      {
        key: "applications",
        label: "Join requests",
        value: String(ops.pendingApplications),
        tone: ops.pendingApplications > 0 ? "live" : "neutral",
        href: "/organizations/broadcasting?tab=applications",
      },
    ],
    now,
    next,
    goals,
    links: [
      { label: "Daily Rundown", href: "/organizations/broadcasting?tab=script" },
      { label: "Control Room", href: "/organizations/broadcasting?tab=media" },
      { label: "Watch live", href: "/media" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Cricut Club — what they are making
// ---------------------------------------------------------------------------

type CricutOps = {
  ordersSent: number;
  inProduction: number;
  readyForPickup: number;
  completedOrders: number;
  designsPending: number;
  designsInProduction: number;
  designsCompleted: number;
  activeListings: number;
  makingNow: { title: string; buyerName: string; updatedAt: Date } | null;
};

const EMPTY_CRICUT: CricutOps = {
  ordersSent: 0,
  inProduction: 0,
  readyForPickup: 0,
  completedOrders: 0,
  designsPending: 0,
  designsInProduction: 0,
  designsCompleted: 0,
  activeListings: 0,
  makingNow: null,
};

async function loadCricutOps(organizationId: string): Promise<CricutOps> {
  const [
    ordersSent,
    inProduction,
    readyForPickup,
    completedOrders,
    designsPending,
    designsInProduction,
    designsCompleted,
    activeListings,
    currentOrder,
  ] = await Promise.all([
    withDatabase((prisma) =>
      prisma.cricutShopOrder.count({ where: { status: "PENDING" } }),
    ),
    withDatabase((prisma) =>
      prisma.cricutShopOrder.count({
        where: { status: { in: ["CONFIRMED", "IN_PRODUCTION"] } },
      }),
    ),
    withDatabase((prisma) =>
      prisma.cricutShopOrder.count({ where: { status: "READY_FOR_PICKUP" } }),
    ),
    withDatabase((prisma) =>
      prisma.cricutShopOrder.count({
        where: { status: { in: ["FULFILLED", "COMPLETED"] } },
      }),
    ),
    withDatabase((prisma) =>
      prisma.cricutDesignSubmission.count({
        where: { organizationId, status: "PENDING" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.cricutDesignSubmission.count({
        where: { organizationId, status: { in: ["ACCEPTED", "IN_PRODUCTION"] } },
      }),
    ),
    withDatabase((prisma) =>
      prisma.cricutDesignSubmission.count({
        where: { organizationId, status: "COMPLETED" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.cricutShopItem.count({
        where: { organizationId, status: "ACTIVE" },
      }),
    ),
    withDatabase((prisma) =>
      prisma.cricutShopOrder.findFirst({
        where: { status: { in: ["CONFIRMED", "IN_PRODUCTION"] } },
        orderBy: { updatedAt: "desc" },
        select: {
          updatedAt: true,
          buyer: {
            select: { displayName: true, firstName: true, lastName: true },
          },
          lines: { select: { title: true, quantity: true }, take: 2 },
        },
      }),
    ),
  ]);

  const buyerName =
    currentOrder?.buyer.displayName?.trim() ||
    [currentOrder?.buyer.firstName, currentOrder?.buyer.lastName]
      .filter(Boolean)
      .join(" ") ||
    "a Blue Don";

  return {
    ordersSent: ordersSent ?? 0,
    inProduction: inProduction ?? 0,
    readyForPickup: readyForPickup ?? 0,
    completedOrders: completedOrders ?? 0,
    designsPending: designsPending ?? 0,
    designsInProduction: designsInProduction ?? 0,
    designsCompleted: designsCompleted ?? 0,
    activeListings: activeListings ?? 0,
    makingNow: currentOrder
      ? {
          title:
            currentOrder.lines
              .map((line) =>
                line.quantity > 1
                  ? `${line.title} ×${line.quantity}`
                  : line.title,
              )
              .join(" · ") || "Custom order",
          buyerName,
          updatedAt: currentOrder.updatedAt,
        }
      : null,
  };
}

function buildCricutCard(
  common: CommonOps,
  ops: CricutOps,
  base: Omit<ClubOpsCard, "metrics" | "now" | "next" | "goals" | "links">,
): ClubOpsCard {
  const now: ClubOpsLine[] = [];
  const pipeline = ops.ordersSent + ops.inProduction + ops.readyForPickup;

  if (ops.makingNow) {
    now.push({
      key: "making",
      label: "On the cut table",
      text: ops.makingNow.title,
      meta: `For ${ops.makingNow.buyerName} · updated ${dayTimeLabel(
        ops.makingNow.updatedAt,
      )}`,
      tone: "live",
      href: "/cricut/orders",
    });
  }

  if (ops.inProduction > 0) {
    now.push({
      key: "in-production",
      label: "In production",
      text: `${plural(ops.inProduction, "order")} being made right now`,
      tone: "live",
      href: "/cricut/orders",
    });
  }

  if (ops.ordersSent > 0) {
    now.push({
      key: "orders-sent",
      label: "Order desk",
      text: `${plural(ops.ordersSent, "new order")} waiting to start`,
      tone: "alert",
      href: "/cricut/orders",
    });
  }

  if (ops.readyForPickup > 0) {
    now.push({
      key: "pickup",
      label: "Ready for pickup",
      text: `${plural(ops.readyForPickup, "order")} finished and waiting`,
      tone: "good",
      href: "/cricut/orders",
    });
  }

  if (ops.designsPending + ops.designsInProduction > 0) {
    now.push({
      key: "designs",
      label: "Design submissions",
      text: `${plural(
        ops.designsInProduction,
        "design",
      )} in production · ${ops.designsPending} awaiting review`,
      tone: ops.designsPending > 0 ? "alert" : "live",
      href: "/cricut/designs",
    });
  }

  now.push(...financeLines("cricut-club", common, base.showsFinance));

  const goals = commonGoals("cricut-club", common);

  if (pipeline + ops.completedOrders > 0) {
    goals.unshift({
      key: "production-queue",
      title: "Production queue cleared",
      detail: `${ops.completedOrders} completed · ${pipeline} still in the pipeline`,
      percent: percentOf(
        ops.completedOrders,
        ops.completedOrders + pipeline,
      ),
      caption:
        pipeline === 0
          ? "Queue is empty"
          : `${plural(ops.inProduction, "order")} on the machines`,
      href: "/cricut/orders",
    });
  }

  const headline =
    ops.inProduction > 0
      ? `Making ${plural(ops.inProduction, "order")} right now`
      : ops.ordersSent > 0
        ? `${plural(ops.ordersSent, "new order")} queued for the cut table`
        : ops.designsInProduction > 0
          ? `${plural(ops.designsInProduction, "design")} moving into production`
          : ops.readyForPickup > 0
            ? `${plural(ops.readyForPickup, "order")} ready for pickup`
            : "Machines are idle — no orders in the queue";

  return {
    ...base,
    headline,
    isActive: ops.inProduction > 0 || ops.designsInProduction > 0,
    metrics: [
      {
        key: "in-production",
        label: "In production",
        value: String(ops.inProduction),
        tone: ops.inProduction > 0 ? "live" : "neutral",
        href: "/cricut/orders",
      },
      {
        key: "orders-sent",
        label: "Order sent",
        value: String(ops.ordersSent),
        tone: ops.ordersSent > 0 ? "alert" : "neutral",
        href: "/cricut/orders",
      },
      {
        key: "ready",
        label: "Ready for pickup",
        value: String(ops.readyForPickup),
        tone: ops.readyForPickup > 0 ? "good" : "neutral",
        href: "/cricut/orders",
      },
      {
        key: "designs",
        label: "Designs in queue",
        value: String(ops.designsPending + ops.designsInProduction),
        tone: ops.designsPending > 0 ? "alert" : "neutral",
        href: "/cricut/designs",
      },
    ],
    now,
    next: commonNextLines("cricut-club", common),
    goals,
    links: [
      { label: "Order desk", href: "/cricut/orders" },
      { label: "Designs", href: "/cricut/designs" },
      { label: "Shop", href: "/cricut/shop" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function getClubOpsPulse(user: {
  id: string;
  role: CampusRole;
}): Promise<ClubOpsPulse> {
  const generatedAt = new Date();
  const generatedAtLabel = timeLabel(generatedAt);

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { ...EMPTY_PULSE, generatedAt, generatedAtLabel };
  }

  const organizations = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      select: { id: true, slug: true, name: true },
    }),
  );

  if (!organizations || organizations.length === 0) {
    return { ...EMPTY_PULSE, generatedAt, generatedAtLabel };
  }

  const memberships =
    (await withDatabase((prisma) =>
      prisma.organizationMembership.findMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
          organizationId: { in: organizations.map((org) => org.id) },
        },
        select: { organizationId: true, orgRole: true },
      }),
    )) ?? [];

  const roleByOrgId = new Map<string, OrgMembershipRole | null>();
  for (const membership of memberships) {
    roleByOrgId.set(
      membership.organizationId,
      normalizeOrgRole(membership.orgRole),
    );
  }

  const canMonitorAll = canBrowseAllFocusClubs(user.role);
  const visible = organizations
    .filter((org) => canMonitorAll || roleByOrgId.has(org.id))
    .sort(
      (a, b) =>
        FOCUS_CLUB_SLUGS.indexOf(a.slug as FocusClubSlug) -
        FOCUS_CLUB_SLUGS.indexOf(b.slug as FocusClubSlug),
    );

  if (visible.length === 0) {
    return { ...EMPTY_PULSE, generatedAt, generatedAtLabel };
  }

  const cards = await Promise.all(
    visible.map((org) =>
      safeSection<ClubOpsCard | null>(
        `card:${org.slug}`,
        async () => {
          const slug = org.slug as FocusClubSlug;
          const meta = clubMeta(slug);
          const orgRole = roleByOrgId.get(org.id) ?? null;
          const isMember = roleByOrgId.has(org.id);
          const showsFinance =
            canMonitorAll || (orgRole ? orgRoleIsOfficer(orgRole) : false);

          const base: Omit<
            ClubOpsCard,
            "metrics" | "now" | "next" | "goals" | "links"
          > = {
            slug,
            name: org.name || meta.name,
            accent: meta.accent,
            activityLabel:
              slug === "it-club"
                ? "Building"
                : slug === "broadcasting"
                  ? "Prepping to broadcast"
                  : "Making",
            headline: "",
            isActive: false,
            isMember,
            orgRoleLabel: orgRole ? ORG_ROLE_LABELS[orgRole] : null,
            showsFinance,
          };

          const common = await safeSection(
            `common:${org.slug}`,
            () => loadCommonOps(org.id),
            EMPTY_COMMON,
          );

          if (slug === "it-club") {
            return buildItCard(common, base);
          }

          if (slug === "broadcasting") {
            const ops = await safeSection(
              "broadcast-ops",
              () => loadBroadcastOps(org.id),
              EMPTY_BROADCAST,
            );
            return buildBroadcastCard(common, ops, base);
          }

          const ops = await safeSection(
            "cricut-ops",
            () => loadCricutOps(org.id),
            EMPTY_CRICUT,
          );
          return buildCricutCard(common, ops, base);
        },
        null,
      ),
    ),
  );

  return {
    generatedAt,
    generatedAtLabel,
    monitoring: canMonitorAll,
    cards: cards.filter((card): card is ClubOpsCard => card !== null),
  };
}
