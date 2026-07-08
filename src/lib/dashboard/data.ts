import { formatDateLabel } from "@/lib/calendar/utils";
import type {
  DashboardAssignment,
  DashboardEvent,
  DashboardMetric,
} from "@/lib/dashboard/mock-data";
import { countDueThisWeek, listAssignmentsForUser } from "@/services/assignment-service";
import { listEvents } from "@/services/event-service";
import { countPortfolioItems, getPortfolioSummary } from "@/services/portfolio-service";
import { countOpenTickets } from "@/services/ticket-service";

export async function getDashboardMetrics(userId: string): Promise<DashboardMetric[]> {
  const [dueThisWeek, upcomingEvents, portfolioCount, openTickets] =
    await Promise.all([
      countDueThisWeek(userId),
      listEvents({ userId, upcomingOnly: true }),
      countPortfolioItems(userId),
      countOpenTickets(userId),
    ]);

  return [
    {
      label: "Due This Week",
      value: String(dueThisWeek),
      hint: "Assignments linked to events and academies",
    },
    {
      label: "Upcoming Events",
      value: String(upcomingEvents.length),
      hint: "Campus-wide calendar activity",
    },
    {
      label: "Open Tickets",
      value: String(openTickets),
      hint: "Service desk requests awaiting response",
    },
    {
      label: "Portfolio Items",
      value: String(portfolioCount),
      hint: "Projects, certifications, and service evidence",
    },
  ];
}

export async function getDashboardPortfolioSummary(userId: string) {
  return getPortfolioSummary(userId);
}

export async function getDashboardAssignments(
  userId: string,
): Promise<DashboardAssignment[]> {
  const assignments = await listAssignmentsForUser(userId, {
    limit: 5,
    includeUnassigned: true,
  });

  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    course: assignment.eventTitle ?? assignment.academyName ?? "Campus",
    dueLabel: assignment.dueLabel,
    status:
      assignment.status === "OVERDUE"
        ? "due-soon"
        : assignment.status === "SUBMITTED" || assignment.status === "COMPLETED"
          ? "submitted"
          : "upcoming",
  }));
}

export async function getDashboardEvents(userId: string): Promise<DashboardEvent[]> {
  const events = await listEvents({ userId, upcomingOnly: true, limit: 5 });

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    dateLabel: formatDateLabel(event.startDate),
    location: event.location ?? event.academy.name,
    type: "community" as const,
  }));
}

export async function getDashboardCalendarEntries(userId: string) {
  const { getCalendarEntries } = await import("@/services/event-service");
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(now.getDate() - now.getDay());
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeStart.getDate() + 13);

  return getCalendarEntries({
    userId,
    rangeStart,
    rangeEnd,
  });
}
