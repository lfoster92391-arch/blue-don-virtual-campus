"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { OverlayStage } from "@/components/broadcast-overlay/overlay-stage";
import { STUDIO_OVERLAY_POLL_INTERVAL_MS } from "@/config/broadcast-studio";
import type { StudioOverlayPayload } from "@/services/broadcast-studio-service";

/**
 * The OBS Browser Source surface.
 *
 * It pulls; nothing is pushed at it. A take in Studio B is a row in the campus
 * database, and this page picks it up on its next read — about a second later.
 * That is the whole sync mechanism: no websocket to drop, no OBS plugin, and a
 * failed read simply leaves the last good frame on screen instead of blanking
 * the graphics mid-show.
 */
export function BroadcastOverlay({
  sessionKey,
  initialPayload,
}: {
  sessionKey: string;
  initialPayload: StudioOverlayPayload;
}) {
  const [payload, setPayload] = useState(initialPayload);
  const inFlight = useRef(false);
  const endpoint = `/api/broadcast/overlay/${encodeURIComponent(sessionKey)}`;

  const read = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;

    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const next = (await response.json()) as StudioOverlayPayload;
      setPayload((current) =>
        Date.parse(next.fetchedAt) >= Date.parse(current.fetchedAt)
          ? next
          : current,
      );
    } catch {
      // Keep the last good frame. A dropped poll must never clear the screen.
    } finally {
      inFlight.current = false;
    }
  }, [endpoint]);

  useEffect(() => {
    const timer = window.setInterval(
      () => void read(),
      STUDIO_OVERLAY_POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [read]);

  return <OverlayStage graphics={payload.live} />;
}
