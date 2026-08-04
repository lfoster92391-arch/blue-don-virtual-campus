import { NextResponse } from "next/server";

import { getStudioOverlayPayload } from "@/services/broadcast-studio-service";

export const runtime = "nodejs";

/**
 * What the OBS Browser Source polls, about once a second.
 *
 * Unauthenticated by necessity — OBS cannot hold a campus session — so the long
 * session key in the path is the whole gate, and the payload is deliberately
 * boring: operator-typed graphic copy plus a score that is already public on
 * `/sports`. An unknown key gets a flat 404 with no hint about how close it was.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionKey: string }> },
) {
  const { sessionKey } = await params;
  const payload = await getStudioOverlayPayload(sessionKey);

  if (!payload) {
    return NextResponse.json(
      { error: "Unknown overlay." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
