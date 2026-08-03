import { CloudSun } from "lucide-react";

import { CampusWeatherStation } from "@/components/weather/campus-weather-station";
import { ShellPage } from "@/components/layout/shell-page";
import { CAMPUS_WEATHER_LABELS } from "@/config/campus-weather";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getCampusWeather } from "@/services/weather-service";

export default async function WeatherPage() {
  await requireCompleteProfile();
  const weather = await getCampusWeather();

  return (
    <ShellPage
      title={CAMPUS_WEATHER_LABELS.stationTitle}
      description={CAMPUS_WEATHER_LABELS.stationDescription}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <CloudSun className="size-3.5" aria-hidden="true" />
          Live via {CAMPUS_WEATHER_LABELS.source}
        </span>
      }
    >
      <CampusWeatherStation weather={weather} />
    </ShellPage>
  );
}
