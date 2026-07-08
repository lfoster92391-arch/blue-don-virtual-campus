"use client";

import { useTransition } from "react";

import { toggleChecklistItemAction } from "@/features/checklists/actions";

type ChecklistItemToggleProps = {
  itemId: string;
  checklistId: string;
  completed: boolean;
  title: string;
  eventId?: string;
};

export function ChecklistItemToggle({
  itemId,
  checklistId,
  completed,
  title,
  eventId,
}: ChecklistItemToggleProps) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={completed}
      disabled={pending}
      aria-label={`Mark ${title} complete`}
      className="mt-1 size-4 rounded border-input"
      onChange={(event) =>
        startTransition(async () => {
          await toggleChecklistItemAction(
            itemId,
            checklistId,
            event.target.checked,
            eventId,
          );
        })
      }
    />
  );
}
