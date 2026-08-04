"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { CRICUT_PROJECT_DIFFICULTY_LABELS } from "@/config/cricut-projects";
import {
  saveCricutProjectIdeaAction,
  type CricutProjectActionState,
} from "@/features/cricut-projects/actions";

const initialState: CricutProjectActionState = {};

const DIFFICULTIES = ["EASY", "MEDIUM", "ADVANCED"] as const;

/** Officer-only quick add — one material/step per line, pipe separated. */
export function CricutProjectIdeaForm() {
  const [state, formAction, pending] = useActionState(
    saveCricutProjectIdeaAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Project title</span>
        <input
          name="title"
          required
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Monogram glass candle jar"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Short description</span>
        <textarea
          name="summary"
          required
          rows={3}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="What it is and why it's an easy build…"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Materials</span>
        <textarea
          name="materials"
          required
          rows={5}
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
          placeholder={"Glass candle jar | 1 | Dollar Tree | 1.25\nPermanent vinyl | 3x3 in | Club cart | 0.55"}
        />
        <span className="text-xs text-muted-foreground">
          One per line — name | quantity | where to get it | cost in dollars
        </span>
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Steps</span>
        <textarea
          name="steps"
          required
          rows={5}
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
          placeholder={"Design the monogram | Size it to 2 in tall\nCut on permanent vinyl | Mirror OFF"}
        />
        <span className="text-xs text-muted-foreground">
          One per line — step | optional detail
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Supplies cost (USD)</span>
          <input
            name="estimatedCost"
            type="number"
            min="0"
            step="0.01"
            required
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Suggested sell price (USD)</span>
          <input
            name="suggestedSellPrice"
            type="number"
            min="0"
            step="0.01"
            required
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Difficulty</span>
          <select
            name="difficulty"
            defaultValue="EASY"
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {CRICUT_PROJECT_DIFFICULTY_LABELS[difficulty]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Time (minutes)</span>
          <input
            name="timeMinutes"
            type="number"
            min="0"
            step="5"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Store tag</span>
        <input
          name="dollarStoreTag"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Dollar Tree · under $2"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Selling notes</span>
        <textarea
          name="sellNotes"
          rows={2}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Bundle pricing, best season, custom add-ons…"
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add project"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}
    </form>
  );
}
