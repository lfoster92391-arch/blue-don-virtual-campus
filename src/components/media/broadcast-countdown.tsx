"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  setNextAirTimeAction,
  type BroadcastActionState,
} from "@/features/broadcast-production/actions";
import type { BroadcastScheduleView } from "@/services/broadcast-production-service";

type BroadcastCountdownProps = {
  schedule: BroadcastScheduleView;
  canSet?: boolean;
  compact?: boolean;
};

function formatRemaining(ms: number): string {
  if (ms <= 0) {
    return "On air window";
  }
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function BroadcastCountdown({
  schedule,
  canSet = false,
  compact = false,
}: BroadcastCountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  const [state, formAction, pending] = useActionState(
    setNextAirTimeAction,
    {} as BroadcastActionState,
  );

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = useMemo(() => {
    if (!schedule.nextAirAt) {
      return null;
    }
    return schedule.nextAirAt.getTime() - now;
  }, [schedule.nextAirAt, now]);

  const airLabel = schedule.nextAirAt
    ? schedule.nextAirAt.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border border-[#0A2342]/15 bg-gradient-to-br from-[#0A2342]/5 to-[#2F80ED]/5 ${compact ? "px-4 py-3" : "px-5 py-4"}`}
      >
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 size-5 text-[#2F80ED]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#0A2342] dark:text-white">
              {schedule.title?.trim() || "Next Blue Don Live"}
            </p>
            {airLabel && remaining !== null ? (
              <>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-[#0A2342] dark:text-white">
                  {formatRemaining(remaining)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Airs {airLabel}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                No upcoming live scheduled yet.
              </p>
            )}
            {schedule.notes ? (
              <p className="mt-2 text-xs text-muted-foreground">{schedule.notes}</p>
            ) : null}
          </div>
        </div>
      </div>

      {canSet ? (
        <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Set next air time</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="nextAirAt" className="text-xs font-medium">
                Date &amp; time
              </label>
              <Input
                id="nextAirAt"
                name="nextAirAt"
                type="datetime-local"
                defaultValue={
                  schedule.nextAirAt
                    ? new Date(
                        schedule.nextAirAt.getTime() -
                          schedule.nextAirAt.getTimezoneOffset() * 60_000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="air-title" className="text-xs font-medium">
                Show title (optional)
              </label>
              <Input
                id="air-title"
                name="title"
                defaultValue={schedule.title ?? ""}
                placeholder="Morning Announcements"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="air-notes" className="text-xs font-medium">
              Notes (optional)
            </label>
            <Input
              id="air-notes"
              name="notes"
              defaultValue={schedule.notes ?? ""}
              placeholder="Studio B · wear spirit colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Save countdown"}
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              name="clear"
              value="1"
              disabled={pending}
            >
              Clear
            </Button>
          </div>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {state.success}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
