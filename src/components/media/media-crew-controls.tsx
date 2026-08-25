"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Sparkles, Trash2 } from "lucide-react";

import type { CampusMediaCategoryKey } from "@/config/broadcast-production";
import {
  deleteCampusMediaAction,
  setHighlightReelFlagAction,
} from "@/features/media/actions";

type MediaCrewControlsProps = {
  mediaId: string;
  title: string;
  isHighlightReel: boolean;
  /**
   * Category applied when a `HIGHLIGHT_REEL` clip leaves the reel, so it keeps
   * a home in the library instead of falling out of every filtered surface.
   */
  fallbackCategory?: CampusMediaCategoryKey | null;
  /** Hide the reel toggle on surfaces where reel placement is meaningless. */
  showReelToggle?: boolean;
  /** Icon-only buttons for tight rows like the reel's up-next queue. */
  compact?: boolean;
  className?: string;
};

/**
 * Crew-only remove/delete pair. Authorization is enforced in the server
 * actions — rendering this only checks whether it is worth showing.
 */
export function MediaCrewControls({
  mediaId,
  title,
  isHighlightReel,
  fallbackCategory = null,
  showReelToggle = true,
  compact = false,
  className = "",
}: MediaCrewControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (work: () => Promise<{ error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const toggleReel = () =>
    run(() =>
      setHighlightReelFlagAction(mediaId, !isHighlightReel, fallbackCategory),
    );

  const remove = () => {
    if (
      !window.confirm(
        "Delete this video? Viewers will no longer see it.\n\n" + title,
      )
    ) {
      return;
    }
    run(() => deleteCampusMediaAction(mediaId));
  };

  const buttonBase = compact
    ? "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-60"
    : "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60";

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5">
        {showReelToggle ? (
          <button
            type="button"
            onClick={toggleReel}
            disabled={pending}
            aria-pressed={isHighlightReel}
            title={
              isHighlightReel
                ? "Take this clip out of the reel. It stays in the video library."
                : "Feature this clip in the Sports Highlight Reel."
            }
            className={`${buttonBase} ${
              isHighlightReel
                ? "bg-[#C9A227]/15 text-[#8A6D14] hover:bg-[#C9A227]/25 dark:text-[#C9A227]"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {isHighlightReel ? "Remove from reel" : "Add to reel"}
          </button>
        ) : null}

        <button
          type="button"
          onClick={remove}
          disabled={pending}
          title="Delete this video from the campus library."
          className={`${buttonBase} bg-destructive/10 text-destructive hover:bg-destructive/20`}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          {compact ? "Delete" : "Delete upload"}
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
