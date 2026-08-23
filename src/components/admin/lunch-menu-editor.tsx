"use client";

import { useActionState } from "react";
import { CalendarCheck, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  publishLunchMenuAction,
  saveLunchMenuDayAction,
  unpublishLunchMenuAction,
  type LunchMenuActionState,
} from "@/features/lunch-menu/actions";
import type { LunchMenuDayRow } from "@/services/lunch-menu-service";

const initialState: LunchMenuActionState = {};

function Feedback({ state }: { state: LunchMenuActionState }) {
  if (state.error) {
    return <p className="text-xs text-destructive">{state.error}</p>;
  }
  if (state.success) {
    return <p className="text-xs text-[#2E8B57]">{state.success}</p>;
  }
  return null;
}

function dayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function LunchMenuDayForm({ day }: { day: LunchMenuDayRow }) {
  const [state, formAction, pending] = useActionState(
    saveLunchMenuDayAction,
    initialState,
  );

  const published = day.publishedAt !== null;

  return (
    <form
      action={formAction}
      className="space-y-3 border-b border-border px-4 py-4 last:border-b-0"
    >
      <input type="hidden" name="dateKey" value={day.dateKey} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-foreground">{dayLabel(day.dateKey)}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            published
              ? "bg-[#2E8B57]/10 text-[#2E8B57]"
              : day.isFallback
                ? "bg-muted text-muted-foreground"
                : "bg-[#D4A017]/10 text-[#D4A017]"
          }`}
        >
          {published
            ? "Published"
            : day.isFallback
              ? "Standard rotation"
              : "Draft"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`entree-${day.dateKey}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Hot lunch
          </label>
          <Input
            id={`entree-${day.dateKey}`}
            name="entree"
            required
            defaultValue={day.entree}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`vegetarian-${day.dateKey}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Vegetarian
          </label>
          <Input
            id={`vegetarian-${day.dateKey}`}
            name="vegetarian"
            required
            defaultValue={day.vegetarian}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`sides-${day.dateKey}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Sides (separate with commas)
          </label>
          <Input
            id={`sides-${day.dateKey}`}
            name="sides"
            defaultValue={day.sides.join(", ")}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`dessert-${day.dateKey}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Dessert
          </label>
          <Input
            id={`dessert-${day.dateKey}`}
            name="dessert"
            defaultValue={day.dessert ?? ""}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor={`note-${day.dateKey}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Note for families (optional)
          </label>
          <Input
            id={`note-${day.dateKey}`}
            name="note"
            placeholder="Early dismissal — cold lunch only"
            defaultValue={day.note ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Saving..." : "Save day"}
        </Button>
        {day.isFallback ? (
          <p className="text-xs text-muted-foreground">
            Prefilled from the standard rotation. Saving makes it a real day.
          </p>
        ) : null}
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function PublishWeekForm({
  dateKeys,
  rangeLabel,
  familyCount,
  publishedCount,
  draftCount,
}: {
  dateKeys: string[];
  rangeLabel: string;
  familyCount: number;
  publishedCount: number;
  draftCount: number;
}) {
  const [publishState, publishAction, publishing] = useActionState(
    publishLunchMenuAction,
    initialState,
  );
  const [pullState, pullAction, pulling] = useActionState(
    unpublishLunchMenuAction,
    initialState,
  );

  return (
    <div className="space-y-3 bg-muted/30 px-4 py-4">
      <form action={publishAction} className="space-y-3">
        {dateKeys.map((dateKey) => (
          <input key={dateKey} type="hidden" name="dateKeys" value={dateKey} />
        ))}
        <input type="hidden" name="rangeLabel" value={rangeLabel} />

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="notifyFamilies"
            defaultChecked
            disabled={publishing}
            className="mt-0.5 size-4 rounded border-input"
          />
          <span className="text-muted-foreground">
            Tell families the menu is up —{" "}
            <span className="font-medium text-foreground">
              {familyCount} parent account{familyCount === 1 ? "" : "s"}
            </span>{" "}
            get a message on their Home page with a link to order.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={publishing}>
            <Send className="size-4" />
            {publishing ? "Publishing..." : `Publish ${rangeLabel}`}
          </Button>
          <p className="text-xs text-muted-foreground">
            {draftCount > 0
              ? `${draftCount} day${draftCount === 1 ? "" : "s"} ready to publish.`
              : "Every saved day here is already published."}
          </p>
          <Feedback state={publishState} />
        </div>
      </form>

      {publishedCount > 0 ? (
        <form action={pullAction} className="flex flex-wrap items-center gap-3">
          {dateKeys.map((dateKey) => (
            <input
              key={dateKey}
              type="hidden"
              name="dateKeys"
              value={dateKey}
            />
          ))}
          <Button type="submit" size="sm" variant="ghost" disabled={pulling}>
            {pulling ? "Pulling back..." : "Pull this week back"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Families fall back to the standard rotating menu.
          </p>
          <Feedback state={pullState} />
        </form>
      ) : null}
    </div>
  );
}

export function MenuWeekHeading({
  label,
  publishedCount,
  totalCount,
}: {
  label: string;
  publishedCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex items-center gap-2 font-semibold text-[#0A2342] dark:text-white">
        <CalendarCheck className="size-4" aria-hidden="true" />
        {label}
      </p>
      <span className="text-xs text-muted-foreground">
        {publishedCount} of {totalCount} days published
      </span>
    </div>
  );
}
