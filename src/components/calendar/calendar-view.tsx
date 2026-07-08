"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AddEventButton } from "@/components/calendar/add-event-button";
import { Button } from "@/components/ui/button";
import {
  addMonths,
  entriesForDay,
  formatDateLabel,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  newEventUrl,
  type CalendarEntry,
  type CalendarView,
} from "@/lib/calendar/utils";
import { cn } from "@/lib/utils";

const viewOptions: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "agenda", label: "Agenda" },
  { value: "academy", label: "Academy" },
];

type CalendarViewSwitcherProps = {
  initialView?: CalendarView;
  entries: CalendarEntry[];
  academies: { id: string; name: string; color: string | null }[];
  canCreate?: boolean;
};

export function CalendarViewSwitcher({
  initialView = "month",
  entries,
  academies,
  canCreate = false,
}: CalendarViewSwitcherProps) {
  const [view, setView] = useState<CalendarView>(initialView);
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>("all");

  const filteredEntries = useMemo(() => {
    if (selectedAcademyId === "all") {
      return entries;
    }
    return entries.filter((entry) => entry.academyId === selectedAcademyId);
  }, [entries, selectedAcademyId]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(referenceDate);

  function shiftPeriod(direction: -1 | 1) {
    if (view === "month" || view === "academy") {
      setReferenceDate((current) => addMonths(current, direction));
      return;
    }
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + direction * (view === "week" ? 7 : 1));
    setReferenceDate(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={view === option.value ? "default" : "outline"}
              onClick={() => setView(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => shiftPeriod(-1)}>
            Previous
          </Button>
          <span className="min-w-36 text-center text-sm font-medium">{monthLabel}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => shiftPeriod(1)}>
            Next
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setReferenceDate(new Date())}
          >
            Today
          </Button>
          {canCreate ? (
            <AddEventButton
              date={referenceDate}
              size="sm"
              className="hidden sm:inline-flex"
            />
          ) : null}
        </div>
      </div>

      {view === "academy" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectedAcademyId === "all" ? "default" : "outline"}
            onClick={() => setSelectedAcademyId("all")}
          >
            All academies
          </Button>
          {academies.map((academy) => (
            <Button
              key={academy.id}
              type="button"
              size="sm"
              variant={selectedAcademyId === academy.id ? "default" : "outline"}
              onClick={() => setSelectedAcademyId(academy.id)}
            >
              {academy.name}
            </Button>
          ))}
        </div>
      ) : null}

      {view === "month" || view === "academy" ? (
        <MonthGrid
          referenceDate={referenceDate}
          entries={filteredEntries}
          canCreate={canCreate}
        />
      ) : null}

      {view === "week" ? (
        <WeekView
          referenceDate={referenceDate}
          entries={filteredEntries}
          canCreate={canCreate}
        />
      ) : null}

      {view === "day" ? (
        <DayView
          referenceDate={referenceDate}
          entries={filteredEntries}
          canCreate={canCreate}
        />
      ) : null}

      {view === "agenda" ? (
        <AgendaView entries={filteredEntries} canCreate={canCreate} />
      ) : null}
    </div>
  );
}

function MonthGrid({
  referenceDate,
  entries,
  canCreate,
}: {
  referenceDate: Date;
  entries: CalendarEntry[];
  canCreate: boolean;
}) {
  const today = new Date();
  const gridDates = getMonthGrid(referenceDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {gridDates.map((date) => {
          const dayEntries = entriesForDay(entries, date);
          const inMonth = isSameMonth(date, referenceDate);
          const isToday = isSameDay(date, today);

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "min-h-28 border-b border-r border-border p-2",
                !inMonth && "bg-muted/20 text-muted-foreground",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                {canCreate ? (
                  <Link
                    href={newEventUrl(date)}
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm transition-colors hover:bg-[#2F80ED]/10",
                      isToday && "bg-[#0A2342] font-semibold text-white hover:bg-[#0A2342]/90",
                    )}
                    title={`Add event on ${formatDateLabel(date)}`}
                    aria-label={`Add event on ${formatDateLabel(date)}`}
                  >
                    {date.getDate()}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm",
                      isToday && "bg-[#0A2342] font-semibold text-white",
                    )}
                  >
                    {date.getDate()}
                  </span>
                )}
              </div>
              <ul className="space-y-1">
                {dayEntries.slice(0, 3).map((entry) => (
                  <li key={entry.id}>
                    <CalendarEntryChip entry={entry} />
                  </li>
                ))}
                {dayEntries.length > 3 ? (
                  <li className="text-xs text-muted-foreground">
                    +{dayEntries.length - 3} more
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  referenceDate,
  entries,
  canCreate,
}: {
  referenceDate: Date;
  entries: CalendarEntry[];
  canCreate: boolean;
}) {
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - referenceDate.getDay());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const dayEntries = entriesForDay(entries, day);

        return (
          <div key={day.toISOString()} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{formatDateLabel(day)}</p>
              {canCreate ? (
                <AddEventButton
                  date={day}
                  variant="ghost"
                  size="sm"
                  showLabel={false}
                  className="size-8 px-0"
                  label={`Add event on ${formatDateLabel(day)}`}
                />
              ) : null}
            </div>
            <ul className="mt-3 space-y-2">
              {dayEntries.map((entry) => (
                <li key={entry.id}>
                  <CalendarEntryChip entry={entry} />
                </li>
              ))}
              {dayEntries.length === 0 && canCreate ? (
                <li>
                  <Link
                    href={newEventUrl(day)}
                    className="block rounded-lg border border-dashed border-border px-2 py-3 text-center text-xs text-muted-foreground transition-colors hover:border-[#2F80ED]/40 hover:text-[#2F80ED]"
                  >
                    Add event
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  referenceDate,
  entries,
  canCreate,
}: {
  referenceDate: Date;
  entries: CalendarEntry[];
  canCreate: boolean;
}) {
  const dayEntries = entriesForDay(entries, referenceDate);

  return (
    <div className="rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">{formatDateLabel(referenceDate, "long")}</h2>
      {dayEntries.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {dayEntries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border px-3 py-3"
            >
              <CalendarEntryChip entry={entry} />
              {entry.location ? (
                <p className="mt-2 text-sm text-muted-foreground">{entry.location}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">No events or deadlines.</p>
          {canCreate ? <AddEventButton date={referenceDate} size="sm" /> : null}
        </div>
      )}
    </div>
  );
}

function AgendaView({
  entries,
  canCreate,
}: {
  entries: CalendarEntry[];
  canCreate: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No upcoming calendar items in this range.
        </p>
        {canCreate ? (
          <div className="mt-4 flex justify-center">
            <AddEventButton size="sm" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <CalendarEntryChip entry={entry} />
            <p className="mt-1 text-sm text-muted-foreground">
              {entry.academyName}
              {entry.location ? ` · ${entry.location}` : ""}
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDateLabel(entry.start)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CalendarEntryChip({ entry }: { entry: CalendarEntry }) {
  const href = entry.eventId ? `/events/${entry.eventId}` : undefined;
  const color = entry.academyColor ?? "#2F80ED";

  const content = (
    <span
      className="block truncate rounded px-2 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {entry.title}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
