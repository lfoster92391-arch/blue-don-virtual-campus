export type CalendarView = "month" | "week" | "day" | "agenda" | "academy";

export type CalendarEntry = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  academyId: string;
  academyName: string;
  academyColor: string | null;
  type: "event" | "assignment";
  eventId?: string;
  assignmentId?: string;
};

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function getMonthGrid(reference: Date): Date[] {
  const monthStart = startOfMonth(reference);
  const gridStart = startOfWeek(monthStart);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function formatDateLabel(date: Date, style: "short" | "long" = "short"): string {
  return new Intl.DateTimeFormat("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: style === "long" ? "numeric" : undefined,
  }).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${time.format(start)} – ${time.format(end)}`;
}

export function formatRelativeDue(date: Date, reference = new Date()): string {
  const diffMs = date.getTime() - reference.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d overdue`;
  }
  if (diffDays === 0) {
    return "Due today";
  }
  if (diffDays === 1) {
    return "Due tomorrow";
  }
  if (diffDays <= 7) {
    return `Due in ${diffDays}d`;
  }

  return formatDateLabel(date);
}

export function entriesForDay(entries: CalendarEntry[], day: Date): CalendarEntry[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return entries.filter(
    (entry) => entry.start <= dayEnd && entry.end >= dayStart,
  );
}

export function entriesInRange(
  entries: CalendarEntry[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEntry[] {
  return entries.filter(
    (entry) => entry.start <= rangeEnd && entry.end >= rangeStart,
  );
}

export function toDateParam(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return undefined;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    9,
    0,
    0,
    0,
  );

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function newEventUrl(date?: Date): string {
  if (!date) {
    return "/events/new";
  }

  return `/events/new?start=${toDateParam(date)}`;
}
