"use client";

import { useActionState } from "react";
import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  upsertDailyAnnouncementAction,
  type MediaActionState,
} from "@/features/media/actions";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";

const initialState: MediaActionState = {};

type DailyAnnouncementProps = {
  announcement: BroadcastAnnouncementView | null;
  canManage: boolean;
  compact?: boolean;
};

export function DailyAnnouncement({
  announcement,
  canManage,
  compact = false,
}: DailyAnnouncementProps) {
  const [state, formAction, pending] = useActionState(
    upsertDailyAnnouncementAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      {announcement ? (
        <div
          className={`rounded-lg border border-[#E11D48]/25 bg-[#E11D48]/5 ${
            compact ? "p-3" : "p-4"
          }`}
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#E11D48]">
            <Megaphone className="size-3.5" aria-hidden="true" />
            Today&apos;s announcement
          </p>
          <p className={`mt-2 font-semibold text-foreground ${compact ? "text-sm" : "text-base"}`}>
            {announcement.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
            {announcement.body}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {announcement.authorName}
            {" · "}
            {announcement.announcementDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No daily announcement posted yet
          {canManage ? " — write today’s message below." : "."}
        </p>
      )}

      {canManage ? (
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="announce-title" className="text-sm font-medium">
              {announcement ? "Update title" : "Announcement title"}
            </label>
            <Input
              id="announce-title"
              name="title"
              required
              defaultValue={announcement?.title ?? ""}
              placeholder="Morning Blue Don News"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="announce-body" className="text-sm font-medium">
              Body
            </label>
            <textarea
              id="announce-body"
              name="body"
              required
              rows={compact ? 3 : 4}
              defaultValue={announcement?.body ?? ""}
              placeholder="What’s on air today, spirit reminders, and studio notes…"
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-emerald-600" role="status">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" size="sm" disabled={pending}>
            {pending
              ? "Saving…"
              : announcement
                ? "Update today’s announcement"
                : "Publish today’s announcement"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
