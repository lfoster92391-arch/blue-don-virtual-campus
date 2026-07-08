import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { CalendarEntry } from "@/lib/calendar/utils";
import {
  entriesForDay,
  formatDateLabel,
  isSameDay,
} from "@/lib/calendar/utils";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DashboardCalendarProps = {
  entries: CalendarEntry[];
};

export function DashboardCalendar({ entries }: DashboardCalendarProps) {
  const today = new Date();
  const weekDates = getWeekDates(today);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(today);
  const todayEntries = entriesForDay(entries, today);
  const hasEntries = entries.length > 0;

  return (
    <DashboardCard
      title="Calendar"
      description="Your week at a glance"
      icon={<Calendar className="size-4" />}
      status={{ label: hasEntries ? "Active" : "Clear", variant: hasEntries ? "success" : "default" }}
      actions={
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/calendar">
              View all
              <ChevronRight className="size-4" />
            </Link>
          }
        />
      }
      expandable
    >
      <div className="space-y-4">
        <p className="text-sm font-medium text-[#0A2342] dark:text-white">{monthLabel}</p>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDates.map((date) => {
            const isToday = isSameDay(date, today);
            const dayHasEvents = entriesForDay(entries, date).length > 0;
            return (
              <div
                key={date.toISOString()}
                className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center"
              >
                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  {weekDays[date.getDay()]}
                </span>
                <span
                  className={
                    isToday
                      ? "flex size-8 items-center justify-center rounded-full bg-[#0A2342] text-sm font-semibold text-white"
                      : dayHasEvents
                        ? "flex size-8 items-center justify-center rounded-full bg-[#2F80ED]/15 text-sm font-medium text-[#2F80ED]"
                        : "text-sm text-foreground"
                  }
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {todayEntries.length > 0 ? (
          <ul className="space-y-2">
            {todayEntries.slice(0, 3).map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                {entry.eventId ? (
                  <Link href={`/events/${entry.eventId}`} className="font-medium hover:underline">
                    {entry.title}
                  </Link>
                ) : (
                  <span className="font-medium">{entry.title}</span>
                )}
                <p className="text-xs text-muted-foreground">
                  {entry.academyName} · {formatDateLabel(entry.start)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">No events today</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open the full calendar to browse campus schedules.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

function getWeekDates(reference: Date) {
  const start = new Date(reference);
  start.setDate(reference.getDate() - reference.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
