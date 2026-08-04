import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getStudioConsoleSnapshot } from "@/services/broadcast-studio-service";
import { canManageCampusMedia } from "@/services/media-service";

export const runtime = "nodejs";

/**
 * Console refresh for the Broadcast Control Studio. Same-origin only — the
 * operator console polls this so the on-air lamp, program feed, countdown, run
 * of show, and score follow the database without a full page reload. Crew access
 * is re-checked on every request.
 *
 * `?gameId=` pins the readout to the game the operator picked in Game Control
 * instead of the automatic current/next choice.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user || !user.profileComplete || user.status !== "active") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (!(await canManageCampusMedia(user.id, user.role))) {
    return NextResponse.json(
      { error: "Only Broadcasting crew can read the studio console." },
      { status: 403 },
    );
  }

  const gameId = new URL(request.url).searchParams.get("gameId");

  return NextResponse.json(await getStudioConsoleSnapshot({ gameId }), {
    headers: { "Cache-Control": "no-store" },
  });
}
