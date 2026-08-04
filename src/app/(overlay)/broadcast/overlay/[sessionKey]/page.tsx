import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BroadcastOverlay } from "@/components/broadcast-overlay/overlay-client";
import { getStudioOverlayPayload } from "@/services/broadcast-studio-service";

/**
 * The graphics overlay an OBS Browser Source loads.
 *
 * Unauthenticated on purpose — OBS cannot hold a campus session — so the long
 * session key in the path is the gate, and the page shows nothing an audience
 * would not already see on air. An unknown key is a 404, not a login redirect.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Broadcast overlay",
  robots: { index: false, follow: false },
};

export default async function BroadcastOverlayPage({
  params,
}: {
  params: Promise<{ sessionKey: string }>;
}) {
  const { sessionKey } = await params;
  const payload = await getStudioOverlayPayload(sessionKey);

  if (!payload) {
    notFound();
  }

  return <BroadcastOverlay sessionKey={sessionKey} initialPayload={payload} />;
}
