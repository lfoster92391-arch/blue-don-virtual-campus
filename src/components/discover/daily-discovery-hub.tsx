"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Info, Sparkles } from "lucide-react";

import {
  DISCOVERY_CATEGORIES,
  splitBrainGame,
  type DiscoveryItem,
} from "@/config/daily-discovery";
import { cn } from "@/lib/utils";

type DailyDiscoveryHubProps = {
  today: DiscoveryItem[];
  dateLabel: string;
  cleanSlate: boolean;
};

type TabId = "today" | (typeof DISCOVERY_CATEGORIES)[number]["key"];

const CATEGORY_BY_KEY = new Map(
  DISCOVERY_CATEGORIES.map((category) => [category.key, category]),
);

/** A single Brain Game card with a tap-to-reveal answer. */
function BrainGameCard({ title, body }: { title: string; body: string }) {
  const { prompt, answer } = useMemo(() => splitBrainGame(body), [body]);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
        <span aria-hidden="true">🧠</span>
        {title}
      </p>
      <p className="mt-2 flex-1 font-medium text-[#0A2342] dark:text-white">{prompt}</p>
      {answer ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-expanded={revealed}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2F80ED]/30 bg-[#2F80ED]/5 px-3 py-1.5 text-sm font-medium text-[#2F80ED] transition-colors hover:bg-[#2F80ED]/10"
          >
            {revealed ? (
              <>
                <EyeOff className="size-3.5" aria-hidden="true" />
                Hide answer
              </>
            ) : (
              <>
                <Eye className="size-3.5" aria-hidden="true" />
                Reveal answer
              </>
            )}
          </button>
          {revealed ? (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-[#0A2342] dark:text-white">
              {answer}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      )}
    </div>
  );
}

/** A standard discovery card (fun fact, saint, career, word, good news). */
function DiscoveryCard({
  emoji,
  label,
  title,
  body,
  sample,
}: {
  emoji: string;
  label: string;
  title: string;
  body: string;
  sample?: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
          <span aria-hidden="true">{emoji}</span>
          {label}
        </p>
        {sample ? (
          <span className="rounded-full bg-[#D4A017]/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-[#D4A017]">
            Sample
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-semibold text-[#0A2342] dark:text-white">{title}</p>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function renderCard(
  item: { key: string; emoji: string; label: string; title: string; body: string },
  options: { sample?: boolean } = {},
) {
  if (item.key === "brain") {
    return <BrainGameCard key={`${item.key}-${item.title}`} title={item.title} body={item.body} />;
  }

  return (
    <DiscoveryCard
      key={`${item.key}-${item.title}`}
      emoji={item.emoji}
      label={item.label}
      title={item.title}
      body={item.body}
      sample={options.sample}
    />
  );
}

export function DailyDiscoveryHub({ today, dateLabel, cleanSlate }: DailyDiscoveryHubProps) {
  const [tab, setTab] = useState<TabId>("today");

  const tabs: { id: TabId; label: string; emoji?: string }[] = [
    { id: "today", label: "Today's Picks" },
    ...DISCOVERY_CATEGORIES.map((category) => ({
      id: category.key as TabId,
      label: category.label,
      emoji: category.emoji,
    })),
  ];

  const activeCategory = tab === "today" ? null : CATEGORY_BY_KEY.get(tab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-4 text-[#2F80ED]" aria-hidden="true" />
          {dateLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          A fresh set of cards rotates in automatically every day.
        </p>
      </div>

      {cleanSlate ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/5 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-[#D4A017]" aria-hidden="true" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-[#0A2342] dark:text-white">
              Sample content preview
            </p>
            <p className="text-muted-foreground">
              Learning cards (saints, brain games, facts, careers, words) are live. Campus
              &ldquo;Good News&rdquo; entries are sample placeholders until real school activity
              is added — they&apos;re marked with a <span className="font-medium">Sample</span> tag.
            </p>
          </div>
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Daily Discovery categories"
        className="flex flex-wrap gap-2"
      >
        {tabs.map((entry) => {
          const active = entry.id === tab;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-[#2F80ED] bg-[#2F80ED] text-white"
                  : "border-border bg-card text-muted-foreground hover:border-[#2F80ED]/40 hover:text-foreground",
              )}
            >
              {entry.emoji ? <span aria-hidden="true">{entry.emoji}</span> : null}
              {entry.label}
            </button>
          );
        })}
      </div>

      {tab === "today" ? (
        <section aria-label="Today's picks" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {today.map((item) =>
              renderCard(item, {
                sample: cleanSlate && CATEGORY_BY_KEY.get(item.key)?.demo,
              }),
            )}
          </div>
        </section>
      ) : activeCategory ? (
        <section aria-label={activeCategory.label} className="space-y-3">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="flex items-center gap-2 font-semibold text-[#0A2342] dark:text-white">
              <span aria-hidden="true">{activeCategory.emoji}</span>
              {activeCategory.label}
              <span className="text-xs font-normal text-muted-foreground">
                · {activeCategory.items.length} in the pool
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{activeCategory.blurb}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeCategory.items.map((item) =>
              renderCard(
                {
                  key: activeCategory.key,
                  emoji: activeCategory.emoji,
                  label: activeCategory.label,
                  title: item.title,
                  body: item.body,
                },
                { sample: cleanSlate && activeCategory.demo },
              ),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
