import Link from "next/link";
import { Circle, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PHONE_LIVE_ROUTE } from "@/config/phone-live";

export const RECORD_HREF = "/organizations/broadcasting?tab=media#record";

type BroadcastPrimaryActionsProps = {
  canGoLive?: boolean;
  /** Existing on-device capture / publish flow (Control Room upload). */
  canRecord?: boolean;
  /** Pre-fills the Go Live show name. */
  title?: string;
  className?: string;
};

/**
 * The two broadcast actions the campus actually runs: Record a clip, or Go Live.
 */
export function BroadcastPrimaryActions({
  canGoLive = false,
  canRecord = false,
  title,
  className,
}: BroadcastPrimaryActionsProps) {
  if (!canGoLive && !canRecord) {
    return null;
  }

  const goLiveHref = title?.trim()
    ? `${PHONE_LIVE_ROUTE}?title=${encodeURIComponent(title.trim())}`
    : PHONE_LIVE_ROUTE;

  return (
    <div
      className={
        className ??
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      }
    >
      {canRecord ? (
        <Button
          variant="action"
          size="lg"
          className="h-12 w-full sm:w-auto"
          nativeButton={false}
          render={
            <Link href={RECORD_HREF}>
              <Circle className="size-4 fill-current" />
              Record
            </Link>
          }
        />
      ) : null}
      {canGoLive ? (
        <Button
          variant="action"
          size="lg"
          className="h-12 w-full sm:w-auto"
          nativeButton={false}
          render={
            <Link href={goLiveHref}>
              <Radio className="size-4" />
              Go Live
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
