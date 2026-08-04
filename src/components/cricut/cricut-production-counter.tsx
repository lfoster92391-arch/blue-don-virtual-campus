import { Scissors } from "lucide-react";

import type { CricutProductionStats } from "@/services/cricut-shop-service";
import { cn } from "@/lib/utils";

export function CricutProductionCounter({
  stats,
  className,
}: {
  stats: CricutProductionStats;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#DB2777]/25 bg-gradient-to-br from-[#0A2342] to-[#1a3a5c] px-6 py-8 text-white shadow-sm",
        className,
      )}
      aria-labelledby="cricut-made-heading"
    >
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#F9A8D4]">Production counter</p>
          <h2
            id="cricut-made-heading"
            className="text-lg font-semibold tracking-tight sm:text-xl"
          >
            Made by Cricut Club
          </h2>
          <p className="max-w-md text-sm text-white/70">
            Completed shop orders, club projects, and finished design requests —
            live from campus production.
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
            {stats.totalMade.toLocaleString()}
          </p>
          <Scissors className="size-7 text-[#F9A8D4]" aria-hidden="true" />
        </div>
      </div>
      <dl className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs text-white/60">Shop orders</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {stats.completedOrders}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs text-white/60">Club projects</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {stats.completedProjects}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs text-white/60">Design builds</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {stats.completedDesigns}
          </dd>
        </div>
      </dl>
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-[#DB2777]/25 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}
