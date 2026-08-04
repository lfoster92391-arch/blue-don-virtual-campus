"use client";

import Link from "next/link";
import { CalendarPlus, CheckCircle2, Clock, Mail } from "lucide-react";

import {
  studentMessageDismissAction,
  studentMessageDoneAction,
  studentMessageViewLaterAction,
} from "@/features/student-messages/actions";
import { buildIcsEvent, downloadIcsFile } from "@/lib/calendar-ics";
import type { StudentMessageView } from "@/lib/command-center";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdvisorMessagesPanelProps = {
  messages: StudentMessageView[];
};

function senderLabel(message: StudentMessageView): string {
  if (message.fromRoleLabel) {
    return `Your ${message.fromRoleLabel}`;
  }
  return message.fromName;
}

export function AdvisorMessagesPanel({ messages }: AdvisorMessagesPanelProps) {
  const active = messages.filter((m) => m.status === "UNREAD");
  const later = messages.filter((m) => m.status === "VIEW_LATER");

  if (messages.length === 0) {
    return (
      <section
        aria-labelledby="advisor-messages-heading"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-[#2F80ED]" aria-hidden="true" />
          <h2
            id="advisor-messages-heading"
            className="text-lg font-semibold text-[#0A2342] dark:text-white"
          >
            Messages & advisor requests
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          When your advisor, President, VP, or Secretary sends a request, it
          shows up here.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="advisor-messages-heading"
      className="space-y-4 rounded-2xl border border-[#2F80ED]/25 bg-gradient-to-br from-[#2F80ED]/8 to-transparent p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Mail className="size-5 text-[#2F80ED]" aria-hidden="true" />
        <h2
          id="advisor-messages-heading"
          className="text-lg font-semibold text-[#0A2342] dark:text-white"
        >
          Messages & advisor requests
        </h2>
        {active.length > 0 ? (
          <span className="rounded-full bg-[#2F80ED] px-2 py-0.5 text-xs font-semibold text-white">
            {active.length} new
          </span>
        ) : null}
      </div>

      <ul className="space-y-3">
        {active.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </ul>

      {later.length > 0 ? (
        <div className="space-y-2 border-t border-border/60 pt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            View later
          </p>
          <ul className="space-y-3">
            {later.map((message) => (
              <MessageCard key={message.id} message={message} muted />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function MessageCard({
  message,
  muted,
}: {
  message: StudentMessageView;
  muted?: boolean;
}) {
  function handleAddToCalendar() {
    if (!message.calendarStart || !message.calendarEnd) {
      return;
    }
    const ics = buildIcsEvent({
      title: message.calendarTitle || message.title,
      description: message.body,
      location: message.calendarLocation,
      start: new Date(message.calendarStart),
      end: new Date(message.calendarEnd),
      uid: `msg-${message.id}@campus.assetpilotedu.com`,
    });
    downloadIcsFile(
      (message.calendarTitle || message.title).slice(0, 40),
      ics,
    );
  }

  return (
    <li
      className={cn(
        "rounded-xl border border-border bg-card px-4 py-3",
        muted && "opacity-90",
      )}
    >
      <p className="text-xs font-medium text-[#C9A227]">
        {senderLabel(message)}
        {message.organizationName ? ` · ${message.organizationName}` : ""}
      </p>
      <p className="mt-1 font-medium text-foreground">{message.title}</p>
      {message.body ? (
        <p className="mt-1 text-sm text-muted-foreground">{message.body}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {message.actions.map((action) => {
          if (action.actionType === "view_later") {
            return (
              <form key={`${message.id}-later`} action={studentMessageViewLaterAction}>
                <input type="hidden" name="messageId" value={message.id} />
                <Button type="submit" size="sm" variant="outline">
                  {action.label}
                </Button>
              </form>
            );
          }
          if (action.actionType === "add_to_calendar") {
            return (
              <Button
                key={`${message.id}-cal`}
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddToCalendar}
                disabled={!message.calendarStart || !message.calendarEnd}
              >
                <CalendarPlus className="size-3.5" />
                {action.label}
              </Button>
            );
          }
          if (
            action.actionType === "link" ||
            action.actionType === "upload_receipt" ||
            action.actionType === "custom"
          ) {
            if (!action.href) {
              return null;
            }
            return (
              <Button
                key={`${message.id}-${action.label}`}
                size="sm"
                nativeButton={false}
                render={<Link href={action.href}>{action.label}</Link>}
              />
            );
          }
          return null;
        })}
        <form action={studentMessageDismissAction}>
          <input type="hidden" name="messageId" value={message.id} />
          <Button type="submit" size="sm" variant="ghost">
            <CheckCircle2 className="size-3.5" />
            Done
          </Button>
        </form>
      </div>
    </li>
  );
}
