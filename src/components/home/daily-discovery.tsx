import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getDailyDiscovery, splitBrainGame } from "@/config/daily-discovery";

export function DailyDiscovery({ date }: { date?: Date }) {
  const items = getDailyDiscovery(date);

  return (
    <section aria-labelledby="daily-discovery-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="daily-discovery-heading"
          className="text-lg font-semibold text-[#0A2342] dark:text-white"
        >
          Daily Discovery
        </h2>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
        >
          Open Daily Discovery
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          // Keep the brain-game answer hidden on the home feed — students reveal it
          // in the Daily Discovery hub.
          const body =
            item.key === "brain" ? splitBrainGame(item.body).prompt : item.body;

          return (
            <li
              key={item.key}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
                <span aria-hidden="true">{item.emoji}</span>
                {item.label}
              </p>
              <p className="mt-2 font-semibold text-[#0A2342] dark:text-white">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              {item.key === "brain" ? (
                <Link
                  href="/discover"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED] hover:underline"
                >
                  Reveal answer
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
