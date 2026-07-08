import Link from "next/link";
import { ChevronRight, Landmark, MapPin } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { DashboardEvent } from "@/lib/dashboard/mock-data";

type DashboardEventsProps = {
  events: DashboardEvent[];
};

export function DashboardEvents({ events }: DashboardEventsProps) {
  const hasEvents = events.length > 0;

  return (
    <DashboardCard
      title="Events"
      description="Campus and community happenings"
      icon={<Landmark className="size-4" />}
      status={{ label: hasEvents ? "Upcoming" : "None scheduled", variant: "default" }}
      actions={
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/events">
              Browse events
              <ChevronRight className="size-4" />
            </Link>
          }
        />
      }
      expandable
    >
      {hasEvents ? (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-border px-3 py-3"
            >
              <Link href={`/events/${event.id}`} className="block hover:opacity-90">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {event.location}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {event.dateLabel}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No campus events on your radar
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assemblies, club meetings, and community gatherings appear here as
            advisors schedule campus events.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
