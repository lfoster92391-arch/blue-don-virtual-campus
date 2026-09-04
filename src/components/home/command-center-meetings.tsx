import Link from "next/link";
import { AlertTriangle, CalendarDays, MapPin } from "lucide-react";

import type { CommandCenterMeetingView } from "@/lib/command-center";
import { CAMPUS_TIME_ZONE, campusDateKey, formatCampusDate, formatCampusDateTime } from "@/lib/datetime/campus-local";
import { cn } from "@/lib/utils";

type CommandCenterMeetingsProps = {
  meetings: CommandCenterMeetingView[];
};

function formatWhen(start: Date, end: Date) {
  const sameDay = campusDateKey(start) === campusDateKey(end);
  const day = formatCampusDate(start);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });
  if (sameDay) {
    return `${day} · ${time.format(start)} – ${time.format(end)}`;
  }
  return `${day} ${time.format(start)} → ${formatCampusDateTime(end)}`;
}

export function CommandCenterMeetings({
  meetings,
}: CommandCenterMeetingsProps) {
  return (
    <section
      aria-labelledby="cc-meetings-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-[#0A2342] dark:text-white" />
          <h2
            id="cc-meetings-heading"
            className="text-lg font-semibold text-[#0A2342] dark:text-white"
          >
            Club meetings
          </h2>
        </div>
        <Link
          href="/calendar"
          className="text-sm font-medium text-[#2F80ED] hover:underline"
        >
          Full calendar
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Your club&apos;s meetings only — plus any mandatory campus all-hands.
      </p>

      {meetings.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No upcoming meetings for your clubs.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className={cn(
                "rounded-xl border px-4 py-3",
                meeting.mandatoryAllClubs
                  ? "border-[#C0392B]/30 bg-[#C0392B]/5"
                  : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{meeting.title}</p>
                {meeting.mandatoryAllClubs ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#C0392B]/10 px-2 py-0.5 text-xs font-semibold text-[#C0392B]">
                    <AlertTriangle className="size-3" />
                    Mandatory all clubs
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {meeting.organizationName}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatWhen(
                  new Date(meeting.startDate),
                  new Date(meeting.endDate),
                )}
              </p>
              {meeting.location ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {meeting.location}
                </p>
              ) : null}
              {meeting.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {meeting.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
