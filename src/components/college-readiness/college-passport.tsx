"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  Stamp,
} from "lucide-react";

import {
  COLLEGE_READINESS_PASSPORT_ITEMS,
  COLLEGE_READINESS_PASSPORT_TAGLINE,
} from "@/config/college-readiness-passport";
import {
  cycleCollegeReadinessStatusAction,
  updateCollegeReadinessStatusAction,
} from "@/features/college-readiness/actions";
import type { CollegeReadinessStatus } from "@/generated/prisma/client";
import type { CollegeReadinessItemView } from "@/services/college-readiness-service";
import { cn } from "@/lib/utils";

type CollegePassportProps = {
  items: CollegeReadinessItemView[];
  remainingItems: CollegeReadinessItemView[];
  percentComplete: number;
  completedCount: number;
  totalCount: number;
};

const STATUS_LABELS: Record<CollegeReadinessStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETE: "Complete",
};

const STATUS_CYCLE: CollegeReadinessStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETE",
];

function ProgressRing({ percent }: { percent: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative size-28 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#D4A017"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#D4A017]">{percent}%</span>
        <span className="text-[10px] uppercase tracking-wider text-white/70">Ready</span>
      </div>
    </div>
  );
}

function StatusStamp({ status }: { status: CollegeReadinessStatus }) {
  if (status === "COMPLETE") {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#D4A017] bg-[#D4A017]/10">
        <Stamp className="size-6 text-[#D4A017]" aria-hidden="true" />
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#2F80ED]/40 bg-[#2F80ED]/10">
        <Clock3 className="size-5 text-[#2F80ED]" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30">
      <Circle className="size-5 text-muted-foreground" aria-hidden="true" />
    </span>
  );
}

function StatusSelector({
  itemId,
  status,
  disabled,
}: {
  itemId: CollegeReadinessItemView["id"];
  status: CollegeReadinessStatus;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_CYCLE.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled || pending}
          aria-pressed={status === option}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
            status === option
              ? option === "COMPLETE"
                ? "bg-[#2E8B57] text-white"
                : option === "IN_PROGRESS"
                  ? "bg-[#2F80ED] text-white"
                  : "bg-[#0A2342] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
          onClick={() =>
            startTransition(async () => {
              await updateCollegeReadinessStatusAction(itemId, option);
            })
          }
        >
          {STATUS_LABELS[option]}
        </button>
      ))}
    </div>
  );
}

export function CollegePassport({
  items,
  remainingItems,
  percentComplete,
  completedCount,
  totalCount,
}: CollegePassportProps) {
  const [pending, startTransition] = useTransition();

  const iconMap = new Map(
    COLLEGE_READINESS_PASSPORT_ITEMS.map((item) => [item.id, item.icon]),
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[#D4A017]/30 bg-gradient-to-br from-[#0A2342] to-[#0A2342]/90 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#D4A017]">
              College Readiness Passport
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Your path to college</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              {COLLEGE_READINESS_PASSPORT_TAGLINE}
            </p>
            <p className="mt-3 text-sm font-medium text-[#D4A017]">
              {completedCount} of {totalCount} complete
            </p>
          </div>
          <ProgressRing percent={percentComplete} />
        </div>
      </div>

      {remainingItems.length > 0 ? (
        <section
          aria-label="What's left"
          className="rounded-2xl border border-[#D4A017]/40 bg-[#D4A017]/5 p-5"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0A2342] dark:text-[#D4A017]">
            What&apos;s left
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {remainingItems.length} milestone{remainingItems.length === 1 ? "" : "s"} still
            on your list — tap a stamp below to update your progress.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {remainingItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium",
                  item.status === "IN_PROGRESS"
                    ? "bg-[#2F80ED]/15 text-[#2F80ED]"
                    : "bg-[#0A2342]/10 text-[#0A2342] dark:bg-white/10 dark:text-white",
                )}
              >
                {item.label}
                {item.status === "IN_PROGRESS" ? " · in progress" : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#2E8B57]/40 bg-[#2E8B57]/5 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-6 text-[#2E8B57]" />
            <div>
              <h3 className="font-semibold text-[#2E8B57]">Passport complete!</h3>
              <p className="text-sm text-muted-foreground">
                All eight milestones stamped — you&apos;re college-ready.
              </p>
            </div>
          </div>
        </section>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = iconMap.get(item.id);
          const isComplete = item.status === "COMPLETE";

          return (
            <li
              key={item.id}
              className={cn(
                "relative flex flex-col gap-4 rounded-2xl border p-5 transition-colors",
                isComplete
                  ? "border-[#2E8B57]/40 bg-[#2E8B57]/5"
                  : item.status === "IN_PROGRESS"
                    ? "border-[#2F80ED]/30 bg-card"
                    : "border-border bg-card",
              )}
            >
              {isComplete ? (
                <span className="absolute right-4 top-4 rounded-full bg-[#2E8B57]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2E8B57]">
                  Stamped
                </span>
              ) : null}

              <div className="flex items-start gap-4">
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Update ${item.label} status`}
                  className="shrink-0 disabled:opacity-50"
                  onClick={() =>
                    startTransition(async () => {
                      await cycleCollegeReadinessStatusAction(item.id, item.status);
                    })
                  }
                >
                  <StatusStamp status={item.status} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {Icon ? (
                      <Icon className="size-4 shrink-0 text-[#D4A017]" aria-hidden="true" />
                    ) : null}
                    <p
                      className={cn(
                        "font-semibold text-[#0A2342] dark:text-white",
                        isComplete && "text-muted-foreground line-through",
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>

                  {item.resourceHref ? (
                    item.external ? (
                      <a
                        href={item.resourceHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED] hover:underline"
                      >
                        {item.resourceLabel ?? "View resource"}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <Link
                        href={item.resourceHref}
                        className="mt-2 inline-block text-xs font-medium text-[#2F80ED] hover:underline"
                      >
                        {item.resourceLabel ?? "View resource"} →
                      </Link>
                    )
                  ) : null}
                </div>
              </div>

              <StatusSelector itemId={item.id} status={item.status} disabled={pending} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
