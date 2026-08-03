import { isDatabaseConfigured } from "@/config/env";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type { ClubCalendarEventView } from "@/lib/club-calendar";
import { hasOrgPermission } from "@/lib/auth/permissions";
import type { CalendarEntry } from "@/lib/calendar/utils";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type { ClubCalendarEventView } from "@/lib/club-calendar";

const CLUB_ACCENT: Record<string, string> = Object.fromEntries(
  FOCUS_CLUBS.map((club) => [club.slug, club.accent]),
);

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

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    organizationSlug: row.organization.slug,
    organizationName: row.organization.name,
    title: row.title,
    description: row.description,
    location: row.location,
    startDate: row.startDate,
    endDate: row.endDate,
    createdByName:
      row.createdBy.displayName?.trim() ||
      [row.createdBy.firstName, row.createdBy.lastName].filter(Boolean).join(" ") ||
      "User",
  }));
}

export function clubEventsToCalendarEntries(
  events: ClubCalendarEventView[],
): CalendarEntry[] {
  return events.map((event) => ({
    id: `club-event-${event.id}`,
    title: event.title,
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
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
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
        createdById: input.createdById,
      },
      select: { id: true },
    }),
  );

  return created?.id ?? null;
}

export async function deleteClubCalendarEvent(input: {
  eventId: string;
  organizationId: string;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
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
