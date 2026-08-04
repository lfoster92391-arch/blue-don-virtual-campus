import Link from "next/link";
import { ExternalLink, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CricutAmazonWishlistBanner({
  url,
  className,
  compact = false,
}: {
  url: string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!url) {
    return null;
  }

  return (
    <aside
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-[#FF9900]/35 bg-gradient-to-r from-[#FF9900]/10 to-[#DB2777]/5 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FF9900]/20 text-[#B35900]">
          <Gift className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-[#0A2342] dark:text-white">
            Support Cricut Club
          </p>
          {!compact ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Donate materials via our Amazon wishlist — vinyl, blanks, blades,
              and more for Madonna makers.
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Amazon wishlist for club supplies.
            </p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        className="shrink-0 bg-[#FF9900] text-[#0A2342] hover:bg-[#E88B00]"
        nativeButton={false}
        render={
          <Link href={url} target="_blank" rel="noopener noreferrer">
            Open wishlist
            <ExternalLink className="size-3.5" />
          </Link>
        }
      />
    </aside>
  );
}
