"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { togglePassportItemAction } from "@/features/passports/actions";
import type { PassportType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type PassportChecklistItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  resourceHref?: string;
  completed: boolean;
};

type PassportChecklistProps = {
  passportType: PassportType;
  title: string;
  tagline: string;
  items: PassportChecklistItem[];
  percentComplete: number;
  completedCount: number;
  totalCount: number;
};

export function PassportChecklist({
  passportType,
  title,
  tagline,
  items,
  percentComplete,
  completedCount,
  totalCount,
}: PassportChecklistProps) {
  const [pending, startTransition] = useTransition();

  const grouped = items.reduce<Record<string, PassportChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[#D4A017]/30 bg-gradient-to-br from-[#0A2342] to-[#0A2342]/90 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#D4A017]">
              Future Center Passport
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">{tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#D4A017]">{percentComplete}%</p>
            <p className="text-sm text-white/70">
              {completedCount} of {totalCount} complete
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#D4A017] transition-all"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0A2342] dark:text-white">
            {categoryItems[0]?.categoryLabel ?? category}
          </h3>
          <ul className="space-y-2">
            {categoryItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 rounded-xl border p-4 transition-colors",
                  item.completed
                    ? "border-[#2E8B57]/40 bg-[#2E8B57]/5"
                    : "border-border bg-card",
                )}
              >
                <button
                  type="button"
                  disabled={pending}
                  aria-label={`Mark ${item.title} ${item.completed ? "incomplete" : "complete"}`}
                  className="mt-0.5 shrink-0 text-[#D4A017] disabled:opacity-50"
                  onClick={() =>
                    startTransition(async () => {
                      await togglePassportItemAction(
                        passportType,
                        item.id,
                        !item.completed,
                      );
                    })
                  }
                >
                  {item.completed ? (
                    <CheckCircle2 className="size-5 text-[#2E8B57]" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-medium",
                      item.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  {item.resourceHref ? (
                    <Link
                      href={item.resourceHref}
                      className="mt-2 inline-block text-xs font-medium text-[#2F80ED] hover:underline"
                    >
                      View resource →
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
