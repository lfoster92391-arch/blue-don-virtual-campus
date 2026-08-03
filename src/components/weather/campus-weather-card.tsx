import Link from "next/link";
import { Cloud } from "lucide-react";

import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import { cn } from "@/lib/utils";
import type { CampusWeather } from "@/services/weather-service";

type CampusWeatherCardProps = {
  weather: CampusWeather;
  className?: string;
};

function conditionTone(
  weather: CampusWeather,
): "success" | "warning" | "danger" | "muted" {
  if (!weather.available) return "muted";
  if (
    weather.athleticConditions === "excellent" ||
    weather.athleticConditions === "good"
  ) {
    return "success";
  }
  if (weather.athleticConditions === "fair") return "warning";
  return "danger";
}

const toneStyles = {
  success: "bg-[#2E8B57]/10 text-[#2E8B57]",
  warning: "bg-[#D4A017]/10 text-[#D4A017]",
  danger: "bg-[#C0392B]/10 text-[#C0392B]",
  muted: "bg-muted text-muted-foreground",
};

export function CampusWeatherCard({ weather, className }: CampusWeatherCardProps) {
  const snapshot = weather.available ? weather : weather.lastKnown;
  const tone = conditionTone(weather);

  return (
    <Link
      href="/weather"
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40",
        className,
      )}
      aria-label="Open Campus Weather Station"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2F80ED]/10">
        <Cloud className="size-5 text-[#2F80ED]" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
            Campus Weather
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              toneStyles[tone],
            )}
          >
            {snapshot?.athleticLabel ?? "Unavailable"}
          </span>
        </div>

        {snapshot ? (
          <>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {snapshot.temperatureF}°F · {snapshot.conditionLabel} · UV{" "}
              {snapshot.uvIndex}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {snapshot.recessLabel}
            </p>
          </>
        ) : (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {weather.available ? "Loading…" : weather.message}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">
          {CAMPUS_WEATHER_LOCATION.city}, {CAMPUS_WEATHER_LOCATION.state}
        </p>
        <p className="text-xs font-medium text-[#2F80ED] group-hover:underline">
          Full station →
        </p>
      </div>
    </Link>
  );
}
