import { Cloud } from "lucide-react";

import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import type { CampusWeather } from "@/services/weather-service";

export function CampusHeroWeather({
  weather,
}: {
  weather: CampusWeather;
}) {
  const snapshot = weather.available ? weather : weather.lastKnown;

  return (
    <div className="mt-5 rounded-xl border border-white/15 bg-white/8 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#C9A227]">
          <Cloud className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
            Weather
          </p>
          {snapshot ? (
            <>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">
                {snapshot.temperatureF}°F
                <span className="ml-2 text-sm font-medium text-[#C6CCD6]">
                  {snapshot.conditionLabel}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-[#C6CCD6]/90">
                {CAMPUS_WEATHER_LOCATION.city}, {CAMPUS_WEATHER_LOCATION.state}
                {` · Wind ${snapshot.windSpeedMph} mph · ${snapshot.precipitationPercent}% precip`}
              </p>
            </>
          ) : (
            <p className="mt-0.5 text-sm text-[#C6CCD6]">
              {weather.available ? "Loading conditions…" : weather.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
