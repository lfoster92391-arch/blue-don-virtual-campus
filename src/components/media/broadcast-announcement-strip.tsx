import Link from "next/link";
import { Megaphone } from "lucide-react";

import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";

type BroadcastAnnouncementStripProps = {
  announcement: BroadcastAnnouncementView | null;
};

/** Home strip when focused clubs mode is on and Broadcasting posted today. */
export function BroadcastAnnouncementStrip({
  announcement,
}: BroadcastAnnouncementStripProps) {
  if (!FOCUSED_CLUBS_MODE || !announcement) {
    return null;
  }

  return (
    <aside className="border-b border-[#E11D48]/20 bg-[#E11D48]/5 px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#E11D48]">
            <Megaphone className="size-3.5 shrink-0" aria-hidden="true" />
            Broadcasting · Daily announcement
          </p>
          <p className="truncate text-sm font-medium text-foreground">{announcement.title}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{announcement.body}</p>
        </div>
        <Link
          href="/organizations/broadcasting?tab=media"
          className="shrink-0 text-sm font-medium text-[#E11D48] underline-offset-2 hover:underline"
        >
          Open Broadcasting
        </Link>
      </div>
    </aside>
  );
}
