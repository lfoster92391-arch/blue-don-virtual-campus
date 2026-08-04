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
 */
export async function GET() {
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

  return NextResponse.json(await getStudioConsoleSnapshot(), {
    headers: { "Cache-Control": "no-store" },
  });
}
