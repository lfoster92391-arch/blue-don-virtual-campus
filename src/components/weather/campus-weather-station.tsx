import {
  Cloud,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";

import {
  CAMPUS_WEATHER_LOCATION,
  type AthleticCondition,
  type RecessRecommendation,
} from "@/config/campus-weather";
import { cn } from "@/lib/utils";
import type { CampusWeather } from "@/services/weather-service";

type MetricProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
};

function Metric({ icon, label, value, detail }: MetricProps) {
  return (
    <div className="rounded-lg border border-border px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-semibold text-[#0A2342] dark:text-white">{value}</p>
      {detail ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

type GuidanceCardProps = {
  title: string;
  value: string;
  detail: string;
  tone: "success" | "warning" | "danger" | "info";
};

const guidanceStyles = {
  success: "border-[#2E8B57]/30 bg-[#2E8B57]/5",
  warning: "border-[#D4A017]/30 bg-[#D4A017]/5",
  danger: "border-[#C0392B]/30 bg-[#C0392B]/5",
  info: "border-[#2F80ED]/30 bg-[#2F80ED]/5",
};

function GuidanceCard({ title, value, detail, tone }: GuidanceCardProps) {
  return (
    <div className={cn("rounded-xl border px-4 py-4", guidanceStyles[tone])}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-xl font-semibold text-[#0A2342] dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function athleticTone(condition: AthleticCondition): GuidanceCardProps["tone"] {
  if (condition === "excellent" || condition === "good") return "success";
  if (condition === "fair") return "warning";
  return "danger";
}

function recessTone(
  recommendation: RecessRecommendation,
): GuidanceCardProps["tone"] {
  if (recommendation === "great-outdoors") return "success";
  if (recommendation === "caution") return "warning";
  if (recommendation === "indoor-recommended") return "info";
  return "danger";
}

export function CampusWeatherStation({ weather }: { weather: CampusWeather }) {
  const snapshot = weather.available ? weather : weather.lastKnown;

  if (!snapshot) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
        <Cloud className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-[#0A2342] dark:text-white">
          Weather unavailable
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {weather.available ? "No data returned." : weather.message}
        </p>
      </div>
    );
  }

  const updatedAt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
  }).format(new Date(snapshot.fetchedAt));

  return (
    <div className="space-y-6">
      {!weather.available ? (
        <div className="rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-3 text-sm text-[#0A2342] dark:text-white">
          Showing last known conditions. {weather.message}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-gradient-to-br from-[#2F80ED]/10 via-card to-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {CAMPUS_WEATHER_LOCATION.name} · {CAMPUS_WEATHER_LOCATION.city},{" "}
              {CAMPUS_WEATHER_LOCATION.state}
            </p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-[#0A2342] dark:text-white">
              {snapshot.temperatureF}°F
            </p>
            <p className="mt-1 text-lg text-muted-foreground">{snapshot.conditionLabel}</p>
          </div>
          <p className="text-sm text-muted-foreground">Updated {updatedAt}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Thermometer className="size-4" aria-hidden="true" />}
          label="Humidity"
          value={`${snapshot.humidityPercent}%`}
        />
        <Metric
          icon={<Wind className="size-4" aria-hidden="true" />}
          label="Wind"
          value={`${snapshot.windSpeedMph} mph`}
        />
        <Metric
          icon={<Droplets className="size-4" aria-hidden="true" />}
          label="Precip chance"
          value={`${snapshot.precipitationPercent}%`}
        />
        <Metric
          icon={<Sun className="size-4" aria-hidden="true" />}
          label="UV Index"
          value={`${snapshot.uvIndex}`}
          detail={snapshot.uvLabel}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          icon={<Sunrise className="size-4" aria-hidden="true" />}
          label="Sunrise"
          value={snapshot.sunrise}
        />
        <Metric
          icon={<Sunset className="size-4" aria-hidden="true" />}
          label="Sunset"
          value={snapshot.sunset}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-[#0A2342] dark:text-white">Air quality</p>
        <p className="mt-1 text-2xl font-semibold text-[#0A2342] dark:text-white">
          {snapshot.airQualityIndex !== null
            ? `AQI ${snapshot.airQualityIndex}`
            : "Unavailable"}
        </p>
        <p className="text-sm text-muted-foreground">{snapshot.airQualityLabel}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GuidanceCard
          title="Athletic conditions"
          value={snapshot.athleticLabel}
          detail="Outdoor practice guidance for coaches and athletes."
          tone={athleticTone(snapshot.athleticConditions)}
        />
        <GuidanceCard
          title="Recess recommendation"
          value={snapshot.recessLabel}
          detail="Guidance for younger grades and general outdoor campus time."
          tone={recessTone(snapshot.recessRecommendation)}
        />
      </div>
    </div>
  );
}
