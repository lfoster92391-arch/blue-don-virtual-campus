"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAssignmentAction,
  type EventActionState,
} from "@/features/events/actions";

const initialState: EventActionState = {};

type EventAssignmentFormProps = {
  eventId: string;
};

export function EventAssignmentForm({ eventId }: EventAssignmentFormProps) {
  const [state, formAction, pending] = useActionState(
    createAssignmentAction,
    initialState,
  );

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border p-4">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="space-y-2">
        <label htmlFor="assignment-title" className="text-sm font-medium">
          Assignment title
        </label>
        <Input
          id="assignment-title"
          name="title"
          required
          placeholder="Prepare presentation slides"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="assignment-dueDate" className="text-sm font-medium">
          Due date
        </label>
        <Input
          id="assignment-dueDate"
          name="dueDate"
          type="datetime-local"
          required
          defaultValue={toDateTimeLocal(defaultDue)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="assignment-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="assignment-description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="assignment-points" className="text-sm font-medium">
          Points
        </label>
        <Input id="assignment-points" name="points" type="number" min={0} defaultValue={5} />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "Add assignment"}
      </Button>
    </form>
  );
}

function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
