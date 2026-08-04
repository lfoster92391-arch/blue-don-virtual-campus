import { NextResponse } from "next/server";

import { STUDIO_BRIDGE_POLL_INTERVAL_MS } from "@/config/broadcast-studio";
import {
  authorizeBridgeRequest,
  claimStudioCommands,
} from "@/services/studio-bridge-service";

export const runtime = "nodejs";

/**
 * Command pull for the Studio Bridge agent.
 *
 * The campus cannot reach the Studio B PC through the school NAT, so the agent
 * comes to us: it polls this route with the shared bridge token, and each poll
 * doubles as the heartbeat the console reads for CONNECTED / DISCONNECTED.
 * Commands come back claimed — the agent is expected to report the outcome to
 * `POST /api/studio/bridge/state`.
 *
 * This is agent-only. Crew read studio state through
 * `/api/broadcast/studio/state`, which is session-gated instead.
 */
export async function GET(request: Request) {
  const auth = authorizeBridgeRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const bridgeKey =
    new URL(request.url).searchParams.get("bridge") ??
    request.headers.get("x-studio-bridge-key") ??
    "";

  const claimed = await claimStudioCommands({
    bridgeKey,
    tokenHash: auth.tokenHash,
  });

  if (!claimed) {
    return NextResponse.json(
      { error: "Studio bridge storage is unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      bridge: claimed.bridgeKey,
      pollIntervalMs: STUDIO_BRIDGE_POLL_INTERVAL_MS,
      commands: claimed.commands,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
