import { CalendarDays } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { getTodayInMadonnaHistory } from "@/services/madonna-culture-service";

type TodayInHistoryWidgetProps = {
  date?: Date;
};

export function TodayInMadonnaHistoryWidget({ date }: TodayInHistoryWidgetProps) {
  const entries = getTodayInMadonnaHistory(date);
  const displayDate = (date ?? new Date()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardCard
      title="Today in Madonna History"
      description={displayDate}
      icon={<CalendarDays className="size-5" />}
      status={{ label: "W18", variant: "info" }}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No historical entries for today yet — check back as we grow the archive.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={`${entry.month}-${entry.day}-${entry.title}`} className="rounded-lg border border-border px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{entry.title}</p>
                {entry.year ? (
                  <span className="shrink-0 text-xs font-medium text-[#2F80ED]">{entry.year}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
