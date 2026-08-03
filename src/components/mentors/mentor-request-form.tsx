"use client";

import { useActionState } from "react";

import {
  requestMentorConnectionAction,
  type MentorActionState,
} from "@/features/mentors/actions";
import { Button } from "@/components/ui/button";
import { MENTOR_APPROVAL_COPY } from "@/config/mentor-network";
import type { MentorConnectionRequestStatus } from "@/generated/prisma/client";

const initialState: MentorActionState = {};

type MentorRequestFormProps = {
  mentorProfileId: string;
  connectionStatus: MentorConnectionRequestStatus | null;
};

export function MentorRequestForm({
  mentorProfileId,
  connectionStatus,
}: MentorRequestFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: MentorActionState, formData: FormData) => {
      return requestMentorConnectionAction({
        mentorProfileId,
        message: String(formData.get("message") ?? ""),
      });
    },
    initialState,
  );

  if (connectionStatus === "APPROVED") {
    return (
      <div className="rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-4">
        <p className="text-sm font-medium text-foreground">
          {MENTOR_APPROVAL_COPY.connectionApproved}
        </p>
      </div>
    );
  }

  if (connectionStatus === "PENDING") {
    return (
      <div className="rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/5 p-4">
        <p className="text-sm font-medium text-foreground">
          {MENTOR_APPROVAL_COPY.connectionPending}
        </p>
      </div>
    );
  }

  if (connectionStatus === "DECLINED" && !state.success) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {MENTOR_APPROVAL_COPY.connectionDeclined}
        </p>
        <form action={formAction} className="space-y-4">
          {state.error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Why would you like to connect?</span>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Share your interests, career goals, and what you hope to learn from this mentor."
            />
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Request mentorship again"}
          </Button>
        </form>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-4">
        <p className="text-sm font-medium text-foreground">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Why would you like to connect?</span>
        <textarea
          name="message"
          required
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="Share your interests, career goals, and what you hope to learn from this mentor."
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Request mentorship"}
      </Button>
    </form>
  );
}
