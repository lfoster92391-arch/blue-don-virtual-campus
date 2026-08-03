"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  CAMPUS_FEED,
  FEED_CATEGORY_LABELS,
  type FeedCategory,
} from "@/config/campus-feed";
import { cn } from "@/lib/utils";

const FILTERS: (FeedCategory | "all")[] = [
  "all",
  "school",
  "clubs",
  "athletics",
  "classes",
  "faith",
  "service",
];

export function CampusFeed() {
  const [filter, setFilter] = useState<FeedCategory | "all">("all");

  const posts = useMemo(
    () =>
      filter === "all"
        ? CAMPUS_FEED
        : CAMPUS_FEED.filter((post) => post.category === filter),
    [filter],
  );

  return (
    <section aria-labelledby="feed-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="feed-heading"
          className="text-lg font-semibold text-[#0A2342] dark:text-white"
        >
          Campus Feed
        </h2>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter feed">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === value
                  ? "bg-[#0A2342] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {value === "all" ? "All" : FEED_CATEGORY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          No announcements yet. Posts from the office, clubs, athletics, and
          ministry will show up here.
        </p>
      ) : (
      <ul className="space-y-3">
        {posts.map((post) => {
          const inner = (
            <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden="true">{post.emoji}</span>
                <span className="font-medium text-[#0A2342] dark:text-white">
                  {post.source}
                </span>
                <span aria-hidden="true">·</span>
                <span>{post.timeLabel}</span>
              </div>
              <h3 className="mt-2 font-semibold text-[#0A2342] dark:text-white">
                {post.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>
            </article>
          );

          return (
            <li key={post.id}>
              {post.href ? <Link href={post.href}>{inner}</Link> : inner}
            </li>
          );
        })}
      </ul>
      )}
    </section>
  );
}
