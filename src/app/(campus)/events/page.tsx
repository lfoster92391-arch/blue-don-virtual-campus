import Link from "next/link";
import { Calendar, MapPin, Plus, Users } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { formatDateLabel, formatTimeRange } from "@/lib/calendar/utils";
import { listEvents } from "@/services/event-service";

export default async function EventsPage() {
  const user = await requireCompleteProfile();
  const events = await listEvents({ userId: user.id });
  const canCreate = canManageEvents(user.role);

  return (
    <ShellPage
      title="Events"
      description="Campus gatherings, academy activities, and community coordination across Madonna High School."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {events.length} event{events.length === 1 ? "" : "s"} on the campus calendar
        </p>
        {canCreate ? (
          <Button
            nativeButton={false}
            render={
              <Link href="/events/new">
                <Plus className="size-4" />
                New event
              </Link>
            }
          />
        ) : null}
      </div>

      {events.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
                        {event.title}
                      </h2>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: event.academy.color ?? "#2F80ED" }}
                      >
                        {event.academy.name}
                      </span>
                      {event.isParticipating ? (
                        <span className="rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
                          Joined
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDateLabel(event.startDate)} ·{" "}
                        {formatTimeRange(event.startDate, event.endDate)}
                      </span>
                      {event.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {event.location}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {event.participantCount} participant
                        {event.participantCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {event.status.toLowerCase().replace("_", " ")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium text-foreground">No events scheduled yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {canCreate
              ? "Create the first campus event to start coordinating activity."
              : "Advisors and administrators will publish campus events here."}
          </p>
          {canCreate ? (
            <Button
              className="mt-4"
              nativeButton={false}
              render={<Link href="/events/new">Create event</Link>}
            />
          ) : null}
        </div>
      )}
    </ShellPage>
  );
}
