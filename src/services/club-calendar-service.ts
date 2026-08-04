import { isDatabaseConfigured } from "@/config/env";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type { ClubCalendarEventView } from "@/lib/club-calendar";
import type { CommandCenterMeetingView } from "@/lib/command-center";
import {
  canCreateClubMeetings,
  canCreateMandatoryAllMeeting,
  listUserFocusClubOrganizationIds,
} from "@/lib/command-center-permissions";
import { hasOrgPermission } from "@/lib/auth/permissions";
import type { CalendarEntry } from "@/lib/calendar/utils";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type { ClubCalendarEventView } from "@/lib/club-calendar";

const CLUB_ACCENT: Record<string, string> = Object.fromEntries(
  FOCUS_CLUBS.map((club) => [club.slug, club.accent]),
);

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "User"
  );
}

export async function canManageClubCalendar(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }

  return hasOrgPermission(userId, organizationId, "org:events:manage");
}

function mapEvent(row: {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  mandatoryAllClubs: boolean;
  organization: { id: string; slug: string; name: string };
  createdBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}): ClubCalendarEventView {
  return {
    id: row.id,
    organizationId: row.organizationId,
    organizationSlug: row.organization.slug,
    organizationName: row.organization.name,
    title: row.title,
    description: row.description,
    location: row.location,
    startDate: row.startDate,
    endDate: row.endDate,
    createdByName: displayName(row.createdBy),
    mandatoryAllClubs: row.mandatoryAllClubs,
  };
}

export async function listClubCalendarEvents(options?: {
  organizationId?: string;
  organizationSlug?: string;
  rangeStart?: Date;
  rangeEnd?: Date;
}): Promise<ClubCalendarEventView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rangeStart = options?.rangeStart;
  const rangeEnd = options?.rangeEnd;

  const rows = await withDatabase((prisma) =>
    prisma.clubCalendarEvent.findMany({
      where: {
        organizationId: options?.organizationId,
        organization: options?.organizationSlug
          ? { slug: options.organizationSlug }
          : undefined,
        ...(rangeStart && rangeEnd
          ? {
              startDate: { lte: rangeEnd },
              endDate: { gte: rangeStart },
            }
          : {}),
      },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startDate: "asc" },
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map(mapEvent);
}

/**
 * Meetings visible on a student's Command Center:
 * - Events for clubs they belong to
 * - Plus mandatoryAllClubs events (IT all-hands) even if they're in another club
 */
export async function listMeetingsForStudent(
  userId: string,
  options?: { rangeStart?: Date; rangeEnd?: Date },
): Promise<CommandCenterMeetingView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const orgIds = await listUserFocusClubOrganizationIds(userId);
  const rangeStart = options?.rangeStart ?? new Date();
  const rangeEnd =
    options?.rangeEnd ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);

  const rows = await withDatabase((prisma) =>
    prisma.clubCalendarEvent.findMany({
      where: {
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart },
        OR: [
          ...(orgIds.length > 0 ? [{ organizationId: { in: orgIds } }] : []),
          { mandatoryAllClubs: true },
        ],
      },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startDate: "asc" },
    }),
  );

  if (!rows) {
    return [];
  }

  const seen = new Set<string>();
  const meetings: CommandCenterMeetingView[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    meetings.push({
      id: row.id,
      organizationId: row.organizationId,
      organizationSlug: row.organization.slug,
      organizationName: row.organization.name,
      title: row.title,
      description: row.description,
      location: row.location,
      startDate: row.startDate,
      endDate: row.endDate,
      mandatoryAllClubs: row.mandatoryAllClubs,
      createdByName: displayName(row.createdBy),
    });
  }
  return meetings;
}

export function clubEventsToCalendarEntries(
  events: ClubCalendarEventView[],
): CalendarEntry[] {
  return events.map((event) => ({
    id: `club-event-${event.id}`,
    title: event.mandatoryAllClubs
      ? `[All clubs] ${event.title}`
      : event.title,
    start: event.startDate,
    end: event.endDate,
    location: event.location,
    academyId: `club:${event.organizationSlug}`,
    academyName: event.organizationName,
    academyColor: CLUB_ACCENT[event.organizationSlug] ?? "#0A2342",
    type: "event" as const,
    eventId: event.id,
  }));
}

export async function createClubCalendarEvent(input: {
  organizationId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  createdById: string;
  role: CampusRole;
  mandatoryAllClubs?: boolean;
}): Promise<{ id: string | null; error?: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { id: null, error: "Database unavailable." };
  }

  const mandatory = Boolean(input.mandatoryAllClubs);

  if (mandatory) {
    const allowed = await canCreateMandatoryAllMeeting(
      input.createdById,
      input.role,
      input.organizationId,
    );
    if (!allowed) {
      return {
        id: null,
        error:
          "Only IT Club President/VP or admin can schedule mandatory all-hands meetings.",
      };
    }
  } else {
    const allowed = await canCreateClubMeetings(
      input.createdById,
      input.role,
      input.organizationId,
    );
    const legacy = await canManageClubCalendar(
      input.createdById,
      input.role,
      input.organizationId,
    );
    if (!allowed && !legacy) {
      return {
        id: null,
        error: "Only President, Vice President, or admin can schedule meetings.",
      };
    }
  }

  const created = await withDatabase((prisma) =>
    prisma.clubCalendarEvent.create({
      data: {
        organizationId: input.organizationId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        location: input.location?.trim() || null,
        startDate: input.startDate,
        endDate: input.endDate,
        mandatoryAllClubs: mandatory,
        createdById: input.createdById,
      },
      select: { id: true },
    }),
  );

  return { id: created?.id ?? null };
}

export async function deleteClubCalendarEvent(input: {
  eventId: string;
  organizationId: string;
  userId: string;
  role: CampusRole;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const allowed =
    (await canCreateClubMeetings(
      input.userId,
      input.role,
      input.organizationId,
    )) ||
    (await canManageClubCalendar(
      input.userId,
      input.role,
      input.organizationId,
    ));
  if (!allowed) {
    return false;
  }

  const deleted = await withDatabase((prisma) =>
    prisma.clubCalendarEvent.deleteMany({
      where: {
        id: input.eventId,
        organizationId: input.organizationId,
      },
    }),
  );

  return (deleted?.count ?? 0) > 0;
}
