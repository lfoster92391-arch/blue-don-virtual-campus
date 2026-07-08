"use client";

import { useTransition } from "react";

import { createEventChecklistAction } from "@/features/checklists/actions";
import { Button } from "@/components/ui/button";

export function EventChecklistCreateButton({
  eventId,
  academyId,
}: {
  eventId: string;
  academyId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await createEventChecklistAction(eventId, academyId);
        })
      }
    >
      {pending ? "Creating…" : "Add checklist"}
    </Button>
  );
}
