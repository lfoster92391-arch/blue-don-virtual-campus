import { NextResponse } from "next/server";

import { getPublicLiveWatchPayload } from "@/services/phone-live-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public on-air snapshot for the watch page player.
 * No stream keys, no crew controls — title, hosted embed, or phone segment URLs.
 */
export async function GET() {
  const payload = await getPublicLiveWatchPayload();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
