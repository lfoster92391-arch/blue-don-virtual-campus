import { AlertTriangle, Circle, Clock, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HubBellSchedule } from "@/services/school-hub-service";

type BellScheduleWidgetProps = {
  schedule: HubBellSchedule;
  isSchoolDay: boolean;
};

export function BellScheduleWidget({ schedule, isSchoolDay }: BellScheduleWidgetProps) {
  const { periods, currentPeriod, nextPeriod, beforeSchool, afterSchool, notes } =
    schedule;

  let statusLine: string;
  if (!isSchoolDay) {
    statusLine = "No classes today — enjoy the day off.";
  } else if (beforeSchool) {
    statusLine = nextPeriod
      ? `Doors open soon — first up: ${nextPeriod.label} at ${nextPeriod.startLabel}.`
      : "Before school hours.";
  } else if (afterSchool) {
    statusLine = "School day complete — see you tomorrow!";
  } else if (currentPeriod) {
    statusLine = `Now: ${currentPeriod.label} · ends ${currentPeriod.endLabel}`;
  } else {
    statusLine = nextPeriod
      ? `Passing period — next: ${nextPeriod.label} at ${nextPeriod.startLabel}.`
      : "Between periods.";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg bg-[#0A2342]/5 px-3 py-2 text-sm dark:bg-white/5">
        <Clock className="size-4 shrink-0 text-[#2F80ED]" aria-hidden="true" />
        <span className="font-medium text-[#0A2342] dark:text-white">{statusLine}</span>
      </div>

      <ol className="space-y-1.5">
        {periods.map((period) => {
          const isCurrent = period.status === "current";
          const isPast = period.status === "past";

          return (
            <li
              key={period.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                isCurrent
                  ? "border-[#2F80ED]/50 bg-[#2F80ED]/5"
                  : "border-border",
                isPast && "opacity-55",
              )}
            >
              <Circle
                className={cn(
                  "size-2.5 shrink-0",
                  isCurrent
                    ? "fill-[#2F80ED] text-[#2F80ED]"
                    : isPast
                      ? "fill-muted-foreground/40 text-muted-foreground/40"
                      : "fill-transparent text-muted-foreground/40",
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm",
                    isCurrent
                      ? "font-semibold text-[#0A2342] dark:text-white"
                      : "font-medium text-foreground",
                  )}
                >
                  {period.label}
                  {isCurrent ? (
                    <span className="ml-2 rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-xs font-medium text-[#2F80ED]">
                      Now
                    </span>
                  ) : null}
                </p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {period.startLabel} – {period.endLabel}
              </span>
            </li>
          );
        })}
      </ol>

      {notes.length > 0 ? (
        <ul className="space-y-1.5 border-t border-border pt-3">
          {notes.map((note) => (
            <li key={note.id} className="flex items-start gap-2 text-xs">
              {note.tone === "warning" ? (
                <AlertTriangle
                  className="mt-0.5 size-3.5 shrink-0 text-[#D4A017]"
                  aria-hidden="true"
                />
              ) : (
                <Info className="mt-0.5 size-3.5 shrink-0 text-[#2F80ED]" aria-hidden="true" />
              )}
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{note.label}:</span>{" "}
                {note.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
