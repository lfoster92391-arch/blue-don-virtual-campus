import { listAssignmentsForUser } from "@/services/assignment-service";
import { listEventsForDay } from "@/services/event-service";
import { endOfDay, startOfDay } from "@/lib/calendar/utils";

export type TodayDigestItem = {
  id: string;
  type: "event" | "assignment" | "campus";
  title: string;
  subtitle?: string;
  timeLabel?: string;
  href?: string;
};

export type BlueDonOSViewModel = {
  today: Date;
  items: TodayDigestItem[];
  eventCount: number;
  assignmentCount: number;
};

function formatEventTime(start: Date, end: Date): string {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const sameDay =
    start.toDateString() === end.toDateString() ||
    end.getTime() - start.getTime() < 60_000;

  if (sameDay) {
    return timeFormatter.format(start);
  }

  return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export async function getTodayDigest(
  userId: string,
  date: Date = new Date(),
): Promise<BlueDonOSViewModel> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [events, assignments] = await Promise.all([
    listEventsForDay(userId, date),
    listAssignmentsForUser(userId, { limit: 20 }),
  ]);

  const assignmentsDueToday = assignments.filter(
    (assignment) =>
      assignment.dueDate >= dayStart && assignment.dueDate <= dayEnd,
  );

  const eventItems: TodayDigestItem[] = events.map((event) => ({
    id: `event-${event.id}`,
    type: "event",
    title: event.title,
    subtitle: event.academy.name,
    timeLabel: formatEventTime(event.startDate, event.endDate),
    href: `/events/${event.id}`,
  }));

  const assignmentItems: TodayDigestItem[] = assignmentsDueToday.map(
    (assignment) => ({
      id: `assignment-${assignment.id}`,
      type: "assignment",
      title: assignment.title,
      subtitle: assignment.academyName ?? "Campus",
      timeLabel: "Due today",
      href: assignment.eventId
        ? `/events/${assignment.eventId}`
        : "/calendar",
    }),
  );

  const campusItems: TodayDigestItem[] = [
    {
      id: "campus-calendar",
      type: "campus",
      title: "View full calendar",
      subtitle: "Events and deadlines this week",
      href: "/calendar",
    },
  ];

  const items = [...eventItems, ...assignmentItems, ...campusItems];

  return {
    today: date,
    items,
    eventCount: events.length,
    assignmentCount: assignmentsDueToday.length,
  };
}
