import Link from "next/link";
import { BellRing, Calendar, MapPin, Megaphone, Plus, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageEvents } from "@/config/roles";
import {
  EVENT_PUBLICATIONS,
  EVENT_REMINDERS,
  PUBLICATION_CHANNEL_LABELS,
} from "@/config/event-engine";
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
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Event Publications"
          description="Fan-out to campus audiences across feed, calendar, email, and push."
          icon={<Megaphone className="size-5" />}
          status={{ label: "Event Engine v2", variant: "info" }}
        >
          <ul className="space-y-3">
            {EVENT_PUBLICATIONS.map((pub) => (
              <li
                key={pub.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{pub.eventTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {pub.audience} · {pub.reach.toLocaleString()} reach
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      pub.status === "published"
                        ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                        : pub.status === "scheduled"
                          ? "bg-[#D4A017]/10 text-[#D4A017]"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pub.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pub.channels.map((ch) => (
                    <span
                      key={ch}
                      className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {PUBLICATION_CHANNEL_LABELS[ch]}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{pub.publishLabel}</p>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Reminders"
          description="Automated nudges before events go live."
          icon={<BellRing className="size-5" />}
        >
          <ul className="space-y-3">
            {EVENT_REMINDERS.map((rem) => (
              <li
                key={rem.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div>
                  <p className="font-medium text-foreground">{rem.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {rem.offsetLabel} · {PUBLICATION_CHANNEL_LABELS[rem.channel]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{rem.sendLabel}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    rem.status === "sent"
                      ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                      : "bg-[#2F80ED]/10 text-[#2F80ED]"
                  }`}
                >
                  {rem.status}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

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
