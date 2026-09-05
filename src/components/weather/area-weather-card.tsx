"use client";

import { Cloud } from "lucide-react";
import { useEffect, useState } from "react";

import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import type { CampusWeather } from "@/services/weather-service";

type AreaWeatherCardProps = {
  fallback: CampusWeather;
};

function snapshotFrom(weather: CampusWeather) {
  return weather.available ? weather : weather.lastKnown;
}

/**
 * Guest weather: ask the browser for a location, then fall back to Weirton.
 */
export function AreaWeatherCard({ fallback }: AreaWeatherCardProps) {
  const [weather, setWeather] = useState<CampusWeather>(fallback);
  const [source, setSource] = useState<"campus" | "area">("campus");
  const [status, setStatus] = useState<"idle" | "locating" | "ready">("idle");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("ready");
      return;
    }

    setStatus("locating");
    const timeout = window.setTimeout(() => setStatus("ready"), 8000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        window.clearTimeout(timeout);
        try {
          const params = new URLSearchParams({
            lat: String(position.coords.latitude),
            lng: String(position.coords.longitude),
            label: "Your area",
          });
          const response = await fetch(`/api/weather?${params.toString()}`, {
            cache: "no-store",
          });
          if (!response.ok) {
            setStatus("ready");
            return;
          }
          const next = (await response.json()) as CampusWeather;
          setWeather(next);
          setSource("area");
        } catch {
          // Keep the Madonna / Weirton fallback already on screen.
        } finally {
          setStatus("ready");
        }
      },
      () => {
        window.clearTimeout(timeout);
        setStatus("ready");
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 30 * 60 * 1000 },
    );

    return () => window.clearTimeout(timeout);
  }, []);

  const snapshot = snapshotFrom(weather);
  const place =
    source === "area"
      ? weather.available
        ? weather.locationName
        : "Your area"
      : `${CAMPUS_WEATHER_LOCATION.city}, ${CAMPUS_WEATHER_LOCATION.state}`;

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2F80ED]/10 text-[#2F80ED]">
          <Cloud className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
            Weather
          </p>
          {snapshot ? (
            <>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-[#0A2342] dark:text-white">
                {snapshot.temperatureF}°F
                <span className="ml-2 text-base font-medium text-muted-foreground">
                  {snapshot.conditionLabel}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {place}
                {status === "locating" ? " · Finding your area…" : null}
                {source === "campus" && status === "ready"
                  ? " · Madonna / Weirton area"
                  : null}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Wind {snapshot.windSpeedMph} mph · {snapshot.precipitationPercent}
                % precip
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {weather.available
                ? "Loading conditions…"
                : weather.message}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
