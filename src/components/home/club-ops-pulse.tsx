import Link from "next/link";
import { Activity, ArrowRight, Radio } from "lucide-react";

import type {
  ClubOpsCard,
  ClubOpsGoal,
  ClubOpsLine,
  ClubOpsPulse,
  ClubOpsTone,
} from "@/services/club-ops-pulse-service";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<ClubOpsTone, string> = {
  neutral: "text-muted-foreground",
  live: "text-[#2F80ED]",
  alert: "text-[#C0392B]",
  good: "text-[#1B7F4B]",
};

const TONE_DOT: Record<ClubOpsTone, string> = {
  neutral: "bg-muted-foreground/40",
  live: "bg-[#2F80ED]",
  alert: "bg-[#C0392B]",
  good: "bg-[#1B7F4B]",
};

function OpsLine({ line }: { line: ClubOpsLine }) {
  const body = (
    <>
      <span
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          TONE_DOT[line.tone],
          line.tone === "live" && "animate-pulse",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.1em]",
            TONE_TEXT[line.tone],
          )}
        >
          {line.label}
        </span>
        <span className="block text-sm text-foreground">{line.text}</span>
        {line.meta ? (
          <span className="block text-xs text-muted-foreground">
            {line.meta}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <li>
      {line.href ? (
        <Link
          href={line.href}
          className="flex gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-muted/60"
        >
          {body}
        </Link>
      ) : (
        <div className="flex gap-2 px-1 py-1">{body}</div>
      )}
    </li>
  );
}

function OpsGoal({ goal, accent }: { goal: ClubOpsGoal; accent: string }) {
  const bar = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium text-foreground">
          {goal.title}
        </span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-[#0A2342] dark:text-white">
          {goal.percent}%
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={goal.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={goal.title}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${goal.percent}%`, backgroundColor: accent }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {goal.detail}
        {goal.caption ? ` · ${goal.caption}` : ""}
      </p>
    </>
  );

  return (
    <li>
      {goal.href ? (
        <Link href={goal.href} className="block rounded-lg p-1 hover:bg-muted/60">
          {bar}
        </Link>
      ) : (
        <div className="p-1">{bar}</div>
      )}
    </li>
  );
}

function OpsCard({ card }: { card: ClubOpsCard }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-background/60 shadow-sm">
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: card.accent }}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/organizations/${card.slug}`}
              className="text-base font-semibold text-[#0A2342] hover:underline dark:text-white"
            >
              {card.name}
            </Link>
            <p
              className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: card.accent }}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  card.isActive && "animate-pulse",
                )}
                style={{ backgroundColor: card.accent }}
                aria-hidden="true"
              />
              {card.activityLabel}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {card.isMember ? (card.orgRoleLabel ?? "Member") : "Monitoring"}
          </span>
        </div>

        <p className="text-sm font-medium text-foreground">{card.headline}</p>

        {card.metrics.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2">
            {card.metrics.map((metric) => {
              const inner = (
                <>
                  <span
                    className={cn(
                      "block text-xl font-semibold tabular-nums",
                      metric.tone === "neutral"
                        ? "text-[#0A2342] dark:text-white"
                        : TONE_TEXT[metric.tone],
                    )}
                  >
                    {metric.value}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted-foreground">
                    {metric.label}
                  </span>
                </>
              );

              return (
                <li key={metric.key}>
                  {metric.href ? (
                    <Link
                      href={metric.href}
                      className="block rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-[#2F80ED]/40"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}

        {card.now.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Now
            </p>
            <ul className="mt-1 space-y-0.5">
              {card.now.map((line) => (
                <OpsLine key={line.key} line={line} />
              ))}
            </ul>
          </div>
        ) : null}

        {card.next.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Next
            </p>
            <ul className="mt-1 space-y-0.5">
              {card.next.map((line) => (
                <OpsLine key={line.key} line={line} />
              ))}
            </ul>
          </div>
        ) : null}

        {card.goals.length > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Goals
            </p>
            <ul className="mt-1 space-y-2">
              {card.goals.map((goal) => (
                <OpsGoal key={goal.key} goal={goal} accent={card.accent} />
              ))}
            </ul>
          </div>
        ) : null}

        {card.now.length === 0 && card.goals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            Nothing logged yet. Work shows up here as soon as the club opens a
            project, task, order, or fundraiser.
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {card.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED] hover:underline"
            >
              {link.label}
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * "Inside the command center" — what each focus club is doing right now.
 * Renders nothing when the viewer belongs to no focus club and cannot monitor.
 */
export function ClubOpsPulsePanel({ pulse }: { pulse: ClubOpsPulse }) {
  if (pulse.cards.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="club-ops-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="size-5 text-[#0A2342] dark:text-white" />
          <h2
            id="club-ops-heading"
            className="text-lg font-semibold text-[#0A2342] dark:text-white"
          >
            Club operations
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2F80ED]">
            <span
              className="size-1.5 animate-pulse rounded-full bg-[#2F80ED]"
              aria-hidden="true"
            />
            Live
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="size-3.5" aria-hidden="true" />
          {pulse.monitoring ? "Monitoring all focus clubs" : "Your clubs"}
          {pulse.generatedAtLabel ? ` · as of ${pulse.generatedAtLabel}` : ""}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        What each club is building, prepping, and making right now — plus goals
        and open work.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {pulse.cards.map((card) => (
          <OpsCard key={card.slug} card={card} />
        ))}
      </div>
    </section>
  );
}
