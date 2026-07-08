"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  joinEventAction,
  leaveEventAction,
  type EventActionState,
} from "@/features/events/actions";

type EventParticipationButtonsProps = {
  eventId: string;
  isParticipating: boolean;
  canParticipate?: boolean;
};

export function EventParticipationButtons({
  eventId,
  isParticipating,
  canParticipate = true,
}: EventParticipationButtonsProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<EventActionState>({});

  function handleJoin() {
    startTransition(async () => {
      const result = await joinEventAction(eventId);
      setMessage(result);
    });
  }

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveEventAction(eventId);
      setMessage(result);
    });
  }

  if (!canParticipate) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isParticipating ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={handleLeave}
        >
          {pending ? "Updating..." : "Leave event"}
        </Button>
      ) : (
        <Button type="button" disabled={pending} onClick={handleJoin}>
          {pending ? "Joining..." : "Join event"}
        </Button>
      )}
      {message.error ? (
        <p className="text-sm text-destructive">{message.error}</p>
      ) : null}
      {message.success ? (
        <p className="text-sm text-[#2E8B57]">{message.success}</p>
      ) : null}
    </div>
  );
}
