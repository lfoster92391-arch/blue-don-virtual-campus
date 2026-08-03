import Link from "next/link";
import { Landmark } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getHistoryEvents } from "@/services/madonna-culture-service";

const CATEGORY_COLORS: Record<string, string> = {
  founding: "bg-[#0A2342]/10 text-[#0A2342]",
  faith: "bg-[#D4A017]/10 text-[#D4A017]",
  academics: "bg-[#2F80ED]/10 text-[#2F80ED]",
  athletics: "bg-[#2E8B57]/10 text-[#2E8B57]",
  technology: "bg-purple-500/10 text-purple-600",
  campus: "bg-muted text-muted-foreground",
};

export default function HistoryPage() {
  const events = getHistoryEvents();

  return (
    <ShellPage
      title="Madonna History"
      description="From 1955 to Blue Don — an interactive timeline of our Blue Don story."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/why-madonna">Our Story timeline</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/traditions">Traditions Hub</Link>}
          />
        </>
      }
    >
      <DashboardCard
        title="Interactive Timeline"
        description={`${events.length} milestones · 1955–2027`}
        icon={<Landmark className="size-5" />}
        status={{ label: "W18", variant: "info" }}
      >
        <ol className="relative space-y-0 border-l-2 border-[#2F80ED]/30 pl-6">
          {events.map((event, i) => (
            <li key={event.year} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[1.65rem] top-1 flex size-5 items-center justify-center rounded-full bg-[#2F80ED] text-[9px] font-bold text-white">
                {i + 1}
              </span>
              <div className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#2F80ED]">{event.year}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[event.category]}`}>
                      {event.category}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </DashboardCard>
    </ShellPage>
  );
}
