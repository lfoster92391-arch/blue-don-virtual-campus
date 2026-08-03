import { CalendarDays, ClipboardList, Megaphone, Users } from "lucide-react";

import type { BlueDonOSViewModel } from "@/services/campus-os-service";
import type { StudentContext } from "@/services/student-context-service";

type CommandStripProps = {
  digest: BlueDonOSViewModel;
  context: StudentContext;
  announcementCount: number;
};

export function CommandStrip({
  digest,
  context,
  announcementCount,
}: CommandStripProps) {
  const nextEvent = digest.items.find((item) => item.type === "event");
  const communityCount =
    context.clubs.length + context.teams.length + context.classes.length;

  const chips = [
    {
      icon: CalendarDays,
      label: "Today's schedule",
      value:
        nextEvent?.timeLabel && nextEvent.title
          ? `${nextEvent.title} · ${nextEvent.timeLabel}`
          : `${digest.eventCount} event${digest.eventCount === 1 ? "" : "s"}`,
    },
    {
      icon: ClipboardList,
      label: "Assignments",
      value: `${digest.assignmentCount} due today`,
    },
    {
      icon: Megaphone,
      label: "Announcements",
      value: `${announcementCount} new`,
    },
    {
      icon: Users,
      label: "My communities",
      value: `${communityCount} joined`,
    },
  ];

  return (
    <section aria-label="Command center summary">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {chips.map((chip) => {
          const Icon = chip.icon;

          return (
            <li
              key={chip.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2F80ED]/10">
                <Icon className="size-4 text-[#2F80ED]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{chip.label}</p>
                <p className="truncate text-sm font-semibold text-[#0A2342] dark:text-white">
                  {chip.value}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
