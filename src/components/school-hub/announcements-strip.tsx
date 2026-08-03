import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { FeedPost } from "@/config/campus-feed";

type AnnouncementsStripProps = {
  posts: FeedPost[];
};

export function AnnouncementsStrip({ posts }: AnnouncementsStripProps) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No school-wide announcements right now.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => {
        const body = (
          <div className="flex gap-3">
            <span className="text-xl" aria-hidden="true">
              {post.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-[#0A2342] dark:text-white">
                  {post.title}
                </p>
                {post.href ? (
                  <ArrowRight
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.source} · {post.timeLabel}
              </p>
            </div>
          </div>
        );

        return (
          <li key={post.id}>
            {post.href ? (
              <Link
                href={post.href}
                className="block rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-[#2F80ED]/40"
              >
                {body}
              </Link>
            ) : (
              <div className="rounded-lg border border-border px-3 py-2.5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
