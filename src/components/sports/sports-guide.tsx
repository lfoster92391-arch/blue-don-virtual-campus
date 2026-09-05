"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askSportsGuideAction, type SportsGuideState } from "@/features/sports-guide/actions";

const initialState: SportsGuideState = {
  query: "",
  answer: "",
  hits: [],
};

export function SportsGuide({
  placeholder = "Next game, a player, or last score…",
}: {
  placeholder?: string;
}) {
  const [state, formAction, pending] = useActionState(
    askSportsGuideAction,
    initialState,
  );

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="sports-guide-q" className="text-sm font-medium">
            Sports guide
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="sports-guide-q"
              name="q"
              defaultValue={state.query}
              placeholder={placeholder}
              className="pl-9"
            />
          </div>
        </div>
        <Button type="submit" variant="action" disabled={pending}>
          {pending ? "Searching…" : "Find"}
        </Button>
      </form>

      {state.answer ? (
        <p className="mt-3 text-sm" role="status">
          {state.answer}
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Searches the live roster, schedule, and scores — not the open internet.
        </p>
      )}

      {state.hits.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {state.hits.map((hit) => (
            <li key={`${hit.kind}-${hit.href}-${hit.title}`}>
              <Link
                href={hit.href}
                className="block rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#2F80ED]">
                  {hit.kind === "next" ? "Upcoming" : hit.kind}
                </span>
                <span className="mt-0.5 block text-sm font-medium">{hit.title}</span>
                <span className="block text-xs text-muted-foreground">{hit.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
