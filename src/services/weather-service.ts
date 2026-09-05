import { unstable_cache } from "next/cache";

import {
  ATHLETIC_CONDITION_LABELS,
  CAMPUS_WEATHER_LOCATION,
  CAMPUS_WEATHER_THRESHOLDS,
  RECESS_RECOMMENDATION_LABELS,
  type AthleticCondition,
  type RecessRecommendation,
} from "@/config/campus-weather";

export type CampusWeatherSnapshot = {
  locationName: string;
  temperatureF: number;
  humidityPercent: number;
  windSpeedMph: number;
  precipitationPercent: number;
  conditionLabel: string;
  conditionCode: number;
  uvIndex: number;
  uvLabel: string;
  airQualityIndex: number | null;
  airQualityLabel: string;
  sunrise: string;
  sunset: string;
  athleticConditions: AthleticCondition;
  athleticLabel: string;
  recessRecommendation: RecessRecommendation;
  recessLabel: string;
  fetchedAt: string;
  available: true;
};

export type CampusWeatherUnavailable = {
  available: false;
  locationName: string;
  message: string;
  lastKnown: CampusWeatherSnapshot | null;
  fetchedAt: string;
};

export type CampusWeather = CampusWeatherSnapshot | CampusWeatherUnavailable;

type OpenMeteoForecastResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    precipitation?: number;
  };
  hourly?: {
    time?: string[];
    uv_index?: number[];
    precipitation_probability?: number[];
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
    uv_index_max?: number[];
  };
};

type OpenMeteoAirQualityResponse = {
  current?: {
    us_aqi?: number;
    pm2_5?: number;
  };
};

let lastKnownSnapshot: CampusWeatherSnapshot | null = null;

const WMO_WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function weatherCodeLabel(code: number): string {
  return WMO_WEATHER_LABELS[code] ?? "Variable conditions";
}

function uvLabel(uv: number): string {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

function aqiLabel(aqi: number | null): string {
  if (aqi === null) return "Unavailable";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

function formatLocalTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
  }).format(new Date(iso));
}

function currentHourlyIndex(times: string[] | undefined, referenceIso: string): number {
  if (!times?.length) return 0;
  const reference = new Date(referenceIso).getTime();
  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (let index = 0; index < times.length; index += 1) {
    const delta = Math.abs(new Date(times[index]!).getTime() - reference);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function deriveAthleticConditions(input: {
  tempF: number;
  precipPercent: number;
  windMph: number;
  uv: number;
  aqi: number | null;
}): AthleticCondition {
  const { athletic } = CAMPUS_WEATHER_THRESHOLDS;
  let score = 0;

  if (
    input.tempF >= athletic.tempIdealMinF &&
    input.tempF <= athletic.tempIdealMaxF
  ) {
    score += 2;
  } else if (
    input.tempF >= athletic.tempFairMinF &&
    input.tempF <= athletic.tempFairMaxF
  ) {
    score += 1;
  }

  if (input.precipPercent >= athletic.precipPoorPercent) score -= 2;
  else if (input.precipPercent >= athletic.precipFairPercent) score -= 1;

  if (input.windMph >= athletic.windPoorMph) score -= 2;
  else if (input.windMph >= athletic.windFairMph) score -= 1;

  if (input.uv >= athletic.uvPoor) score -= 2;
  else if (input.uv >= athletic.uvFair) score -= 1;

  if (input.aqi !== null) {
    if (input.aqi >= athletic.aqiPoor) score -= 2;
    else if (input.aqi >= athletic.aqiFair) score -= 1;
  }

  if (score >= 3) return "excellent";
  if (score >= 1) return "good";
  if (score >= -1) return "fair";
  return "poor";
}

function deriveRecessRecommendation(input: {
  tempF: number;
  precipPercent: number;
  windMph: number;
  uv: number;
  aqi: number | null;
}): RecessRecommendation {
  const { recess } = CAMPUS_WEATHER_THRESHOLDS;

  if (
    input.precipPercent >= recess.precipIndoorPercent ||
    input.tempF < recess.tempCautionMinF - 5 ||
    input.tempF > recess.tempCautionMaxF + 5 ||
    input.uv >= recess.uvIndoor ||
    (input.aqi !== null && input.aqi >= recess.aqiIndoor)
  ) {
    return "indoor-required";
  }

  if (
    input.precipPercent >= recess.precipCautionPercent ||
    input.tempF < recess.tempCautionMinF ||
    input.tempF > recess.tempCautionMaxF ||
    input.windMph >= recess.windCautionMph ||
    input.uv >= recess.uvCaution ||
    (input.aqi !== null && input.aqi >= recess.aqiCaution)
  ) {
    return "indoor-recommended";
  }

  if (
    input.tempF >= recess.tempGreatMinF &&
    input.tempF <= recess.tempGreatMaxF &&
    input.precipPercent < recess.precipCautionPercent
  ) {
    return "great-outdoors";
  }

  return "caution";
}

type WeatherQueryLocation = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

async function fetchOpenMeteoForecast(
  location: WeatherQueryLocation = CAMPUS_WEATHER_LOCATION,
): Promise<OpenMeteoForecastResponse> {
  const { latitude, longitude, timezone } = location;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
    current:
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
    hourly: "uv_index,precipitation_probability",
    daily: "sunrise,sunset,uv_index_max",
    forecast_days: "1",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    {
      next: { revalidate: CAMPUS_WEATHER_THRESHOLDS.revalidateSeconds },
    },
  );

  if (!response.ok) {
    throw new Error(`Forecast API failed: ${response.status}`);
  }

  return response.json() as Promise<OpenMeteoForecastResponse>;
}

async function fetchOpenMeteoAirQuality(
  location: WeatherQueryLocation = CAMPUS_WEATHER_LOCATION,
): Promise<OpenMeteoAirQualityResponse> {
  const { latitude, longitude, timezone } = location;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
    current: "us_aqi,pm2_5",
  });

  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`,
    {
      next: { revalidate: CAMPUS_WEATHER_THRESHOLDS.revalidateSeconds },
    },
  );

  if (!response.ok) {
    throw new Error(`Air quality API failed: ${response.status}`);
  }

  return response.json() as Promise<OpenMeteoAirQualityResponse>;
}

function buildSnapshot(
  forecast: OpenMeteoForecastResponse,
  airQuality: OpenMeteoAirQualityResponse,
  locationName: string = CAMPUS_WEATHER_LOCATION.name,
): CampusWeatherSnapshot {
  const current = forecast.current ?? {};
  const referenceTime = current.time ?? new Date().toISOString();
  const hourlyIndex = currentHourlyIndex(forecast.hourly?.time, referenceTime);

  const temperatureF = Math.round(current.temperature_2m ?? 0);
  const humidityPercent = Math.round(current.relative_humidity_2m ?? 0);
  const windSpeedMph = Math.round(current.wind_speed_10m ?? 0);
  const conditionCode = current.weather_code ?? 0;
  const precipFromHourly =
    forecast.hourly?.precipitation_probability?.[hourlyIndex] ?? 0;
  const precipitationPercent = Math.round(precipFromHourly);
  const uvFromHourly = forecast.hourly?.uv_index?.[hourlyIndex];
  const uvFromDaily = forecast.daily?.uv_index_max?.[0];
  const uvIndex = Math.round(uvFromHourly ?? uvFromDaily ?? 0);
  const airQualityIndex =
    airQuality.current?.us_aqi !== undefined
      ? Math.round(airQuality.current.us_aqi)
      : null;

  const athleticConditions = deriveAthleticConditions({
    tempF: temperatureF,
    precipPercent: precipitationPercent,
    windMph: windSpeedMph,
    uv: uvIndex,
    aqi: airQualityIndex,
  });

  const recessRecommendation = deriveRecessRecommendation({
    tempF: temperatureF,
    precipPercent: precipitationPercent,
    windMph: windSpeedMph,
    uv: uvIndex,
    aqi: airQualityIndex,
  });

  const sunriseIso = forecast.daily?.sunrise?.[0] ?? referenceTime;
  const sunsetIso = forecast.daily?.sunset?.[0] ?? referenceTime;

  return {
    locationName,
    temperatureF,
    humidityPercent,
    windSpeedMph,
    precipitationPercent,
    conditionLabel: weatherCodeLabel(conditionCode),
    conditionCode,
    uvIndex,
    uvLabel: uvLabel(uvIndex),
    airQualityIndex,
    airQualityLabel: aqiLabel(airQualityIndex),
    sunrise: formatLocalTime(sunriseIso),
    sunset: formatLocalTime(sunsetIso),
    athleticConditions,
    athleticLabel: ATHLETIC_CONDITION_LABELS[athleticConditions],
    recessRecommendation,
    recessLabel: RECESS_RECOMMENDATION_LABELS[recessRecommendation],
    fetchedAt: new Date().toISOString(),
    available: true,
  };
}

async function fetchCampusWeatherUncached(): Promise<CampusWeather> {
  try {
    const [forecast, airQuality] = await Promise.all([
      fetchOpenMeteoForecast(),
      fetchOpenMeteoAirQuality(),
    ]);

    const snapshot = buildSnapshot(forecast, airQuality);
    lastKnownSnapshot = snapshot;
    return snapshot;
  } catch {
    return {
      available: false,
      locationName: CAMPUS_WEATHER_LOCATION.name,
      message: "Weather data temporarily unavailable",
      lastKnown: lastKnownSnapshot,
      fetchedAt: new Date().toISOString(),
    };
  }
}

const getCachedCampusWeather = unstable_cache(
  fetchCampusWeatherUncached,
  ["campus-weather", "weirton-wv"],
  { revalidate: CAMPUS_WEATHER_THRESHOLDS.revalidateSeconds },
);

export async function getCampusWeather(): Promise<CampusWeather> {
  try {
    return await getCachedCampusWeather();
  } catch (error) {
    console.error("[weather] getCampusWeather failed:", error);
    return {
      available: false,
      locationName: CAMPUS_WEATHER_LOCATION.name,
      message: "Weather data temporarily unavailable",
      lastKnown: lastKnownSnapshot,
      fetchedAt: new Date().toISOString(),
    };
  }
}

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Live conditions for an arbitrary point (guest “weather for their area”).
 * Invalid coordinates fall back to the Weirton / Madonna station.
 */
export async function getWeatherForCoordinates(
  latitude: number,
  longitude: number,
  locationName = "Your area",
): Promise<CampusWeather> {
  if (!isValidCoordinate(latitude, longitude)) {
    return getCampusWeather();
  }

  const location: WeatherQueryLocation = {
    name: locationName,
    latitude,
    longitude,
    timezone: "auto",
  };

  try {
    const [forecast, airQuality] = await Promise.all([
      fetchOpenMeteoForecast(location),
      fetchOpenMeteoAirQuality(location),
    ]);
    return buildSnapshot(forecast, airQuality, locationName);
  } catch (error) {
    console.error("[weather] getWeatherForCoordinates failed:", error);
    return getCampusWeather();
  }
}

export type CampusWeatherAlert = {
  severity: "info" | "watch" | "warning";
  title: string;
  message: string;
};

const SEVERE_WEATHER_CODES = new Set([65, 75, 82, 86, 95, 96, 99]);

/**
 * Condition-based campus alerts for the home briefing. Prefer NWS/API alerts
 * when wired; until then derive messaging from Open-Meteo conditions and
 * athletic/recess guidance.
 */
export function getCampusWeatherAlerts(
  weather: CampusWeather,
): CampusWeatherAlert[] {
  if (!weather.available) {
    return [
      {
        severity: "info",
        title: "Weather unavailable",
        message:
          weather.message ||
          "Live conditions for Weirton are temporarily unavailable.",
      },
    ];
  }

  const alerts: CampusWeatherAlert[] = [];

  if (SEVERE_WEATHER_CODES.has(weather.conditionCode)) {
    alerts.push({
      severity: "warning",
      title: "Severe weather conditions",
      message: `${weather.conditionLabel} in Weirton — follow office guidance for outdoor activities and dismissal.`,
    });
  } else if (weather.precipitationPercent >= 70) {
    alerts.push({
      severity: "watch",
      title: "High chance of precipitation",
      message: `${weather.precipitationPercent}% chance of precipitation — bring a jacket and plan indoor alternatives.`,
    });
  }

  if (weather.recessRecommendation === "indoor-required") {
    alerts.push({
      severity: "warning",
      title: "Indoor recess recommended",
      message: weather.recessLabel,
    });
  } else if (weather.recessRecommendation === "indoor-recommended") {
    alerts.push({
      severity: "watch",
      title: "Outdoor caution",
      message: weather.recessLabel,
    });
  }

  if (weather.athleticConditions === "poor") {
    alerts.push({
      severity: "watch",
      title: "Athletic conditions poor",
      message:
        "Outdoor athletics may be limited — check with coaches before practice or games.",
    });
  }

  if (weather.airQualityIndex !== null && weather.airQualityIndex >= 150) {
    alerts.push({
      severity: "warning",
      title: "Air quality alert",
      message: `Air quality is ${weather.airQualityLabel} (AQI ${weather.airQualityIndex}). Limit prolonged outdoor activity.`,
    });
  }

  return alerts;
}

/** Exported for unit-style verification of guidance rules */
export const __weatherTestUtils = {
  deriveAthleticConditions,
  deriveRecessRecommendation,
  weatherCodeLabel,
};
