"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

import {
  createClubCalendarEventAction,
  deleteClubCalendarEventAction,
  type ClubCalendarActionState,
} from "@/features/club-calendar/actions";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { ClubCalendarEventView } from "@/lib/club-calendar";

const initialState: ClubCalendarActionState = {};

type ClubCalendarPanelProps = {
  clubName: string;
  organizationId: string;
  organizationSlug: string;
  events: ClubCalendarEventView[];
  canManage: boolean;
};

export function ClubCalendarPanel({
  clubName,
  organizationId,
  organizationSlug,
  events,
  canManage,
}: ClubCalendarPanelProps) {
  const [state, action, pending] = useActionState(
    createClubCalendarEventAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Club calendar"
        description={`Events for ${clubName} — visible to all students on the school calendar`}
        icon={<Calendar className="size-5" />}
      >
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No club events yet. Advisors and leads can add meetings and deadlines below.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(event.startDate))}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                  {event.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  ) : null}
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void deleteClubCalendarEventAction(
                        organizationId,
                        organizationSlug,
                        event.id,
                      )
                    }
                  >
                    Remove
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <Button className="mt-4" size="sm" variant="outline" nativeButton={false} render={
          <Link href={`/calendar?club=${organizationSlug}`}>
            Open school calendar
            <ArrowRight className="size-4" />
          </Link>
        } />
      </DashboardCard>

      {canManage ? (
        <DashboardCard title="Add club event" description="Shows on the shared student calendar.">
          <form action={action} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="organizationSlug" value={organizationSlug} />
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">Title</span>
              <input
                name="title"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Weekly club meeting"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Starts</span>
              <input
                name="startDate"
                type="datetime-local"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Ends</span>
              <input
                name="endDate"
                type="datetime-local"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Location</span>
              <input
                name="location"
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Room 214"
              />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">Description</span>
              <input
                name="description"
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Optional details"
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Saving…" : "Add event"}
              </Button>
              {state.error ? (
                <p className="mt-2 text-sm text-destructive">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="mt-2 text-sm text-[#2E8B57]">{state.success}</p>
              ) : null}
            </div>
          </form>
        </DashboardCard>
      ) : null}
    </div>
  );
}
