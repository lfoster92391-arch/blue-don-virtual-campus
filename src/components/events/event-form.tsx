"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createEventAction,
  type EventActionState,
} from "@/features/events/actions";

const initialState: EventActionState = {};

type EventFormProps = {
  academies: {
    id: string;
    name: string;
  }[];
  defaultStart?: Date;
};

export function EventForm({ academies, defaultStart }: EventFormProps) {
  const [state, formAction, pending] = useActionState(
    createEventAction,
    initialState,
  );

  const start = defaultStart ?? getDefaultStart();
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Event title
        </label>
        <Input id="title" name="title" required placeholder="Campus open house" />
      </div>

      <div className="space-y-2">
        <label htmlFor="academyId" className="text-sm font-medium">
          Academy
        </label>
        <select
          id="academyId"
          name="academyId"
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue={academies[0]?.id ?? ""}
        >
          {academies.map((academy) => (
            <option key={academy.id} value={academy.id}>
              {academy.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">
            Start
          </label>
          <Input
            id="startDate"
            name="startDate"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(start)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium">
            End
          </label>
          <Input
            id="endDate"
            name="endDate"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(end)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium">
          Location
        </label>
        <Input id="location" name="location" placeholder="Main auditorium" />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          placeholder="What should participants know?"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="impactPoints" className="text-sm font-medium">
          Impact points
        </label>
        <Input
          id="impactPoints"
          name="impactPoints"
          type="number"
          min={0}
          defaultValue={10}
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={pending || academies.length === 0}>
        {pending ? "Creating event..." : "Create event"}
      </Button>
    </form>
  );
}

function getDefaultStart(): Date {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  return date;
}

function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
