"use client";

import { useActionState, useState } from "react";
import { Send, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  sendClubAudienceMessageAction,
  type StudentMessageActionState,
} from "@/features/student-messages/actions";
import type { ClubAudienceOption } from "@/services/club-audience-message-service";

const initialState: StudentMessageActionState = {};

export function ClubAudienceCompose({
  options,
}: {
  options: ClubAudienceOption[];
}) {
  const [state, action, pending] = useActionState(
    sendClubAudienceMessageAction,
    initialState,
  );
  const [audienceId, setAudienceId] = useState(options[0]?.id ?? "");

  const selected = options.find((option) => option.id === audienceId);

  return (
    <DashboardCard
      title="Compose"
      description="Goes straight to each member's Command Center on the home page."
      icon={<Send className="size-5" />}
    >
      <form action={action} className="grid gap-4">
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Send to</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-[#2F80ED] has-[:checked]:bg-[#2F80ED]/5"
              >
                <input
                  type="radio"
                  name="audienceId"
                  value={option.id}
                  checked={audienceId === option.id}
                  onChange={() => setAudienceId(option.id)}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED]">
                    <Users className="size-3.5" aria-hidden="true" />
                    {option.recipientCount}{" "}
                    {option.recipientCount === 1 ? "recipient" : "recipients"}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            maxLength={140}
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder="Crew call moved to 7:15 on Friday"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Message</span>
          <textarea
            name="body"
            rows={4}
            maxLength={2000}
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder="What everyone needs to know, and what to do about it."
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Link (optional)</span>
          <input
            name="href"
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder="/organizations/broadcasting?tab=script"
          />
          <span className="text-xs text-muted-foreground">
            Adds a “Check it out” button to the message.
          </span>
        </label>

        <div>
          <Button type="submit" size="sm" disabled={pending || !selected}>
            {pending
              ? "Sending…"
              : selected
                ? `Send to ${selected.label}`
                : "Send"}
          </Button>
          {selected ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {selected.recipientCount === 0
                ? "This group has no active members yet."
                : `${selected.recipientCount} ${
                    selected.recipientCount === 1 ? "person" : "people"
                  } will see this on their home page.`}
            </p>
          ) : null}
          {state.error ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="mt-2 text-sm text-[#2E8B57]" role="status">
              {state.success}
            </p>
          ) : null}
        </div>
      </form>
    </DashboardCard>
  );
}
