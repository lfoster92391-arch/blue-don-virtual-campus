import { NextResponse } from "next/server";

import {
  getCampusWeather,
  getWeatherForCoordinates,
} from "@/services/weather-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseCoordinate(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Guest-area weather. Pass lat/lng for the browser location; omit them to
 * get the Weirton / Madonna station fallback.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = parseCoordinate(searchParams.get("lat"));
  const longitude = parseCoordinate(searchParams.get("lng"));
  const label = searchParams.get("label")?.trim() || "Your area";

  const weather =
    latitude !== null && longitude !== null
      ? await getWeatherForCoordinates(latitude, longitude, label)
      : await getCampusWeather();

  return NextResponse.json(weather, {
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  });
}
