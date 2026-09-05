import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import type { CampusRole } from "@/config/roles";
import { getSchoolYear } from "@/config/school-year";
import { listEventsForDay } from "@/services/event-service";
import { listFormsForUser } from "@/services/form-service";
import { getCampusWeather, type CampusWeather } from "@/services/weather-service";

export type HubDigest = {
  today: Date;
  dayName: string;
  dateLabel: string;
  schoolYear: string;
  isSchoolDay: boolean;
  weather: CampusWeather;
  eventCount: number;
  formsDueCount: number;
};

/**
 * Resolves the campus-local weekday (0–6) and minutes-since-midnight for a
 * given instant, using the campus timezone.
 */
function campusLocalParts(date: Date): { weekday: number; minutes: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const weekday = weekdayMap[lookup("weekday")] ?? date.getDay();
  const hourRaw = Number.parseInt(lookup("hour"), 10);
  const hour = Number.isNaN(hourRaw) || hourRaw === 24 ? 0 : hourRaw;
  const minute = Number.parseInt(lookup("minute"), 10) || 0;

  return { weekday, minutes: hour * 60 + minute };
}

function isSchoolDay(weekday: number): boolean {
  return weekday >= 1 && weekday <= 5;
}

export type HubDigestUser = {
  id: string;
  role: CampusRole;
} | null;

/**
 * Assembles today's School Hub digest: campus weather and (when a user is
 * provided and the database is configured) today's event count and the number
 * of forms still due.
 *
 * All live sources degrade gracefully to zero/seed values when the database or
 * weather API is unavailable, so the hub always renders.
 */
async function safeHubSideData<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[school-hub] ${label} failed:`, error);
    return fallback;
  }
}

function unavailableWeather(): CampusWeather {
  return {
    available: false,
    locationName: CAMPUS_WEATHER_LOCATION.name,
    message: "Weather data temporarily unavailable",
    lastKnown: null,
    fetchedAt: new Date().toISOString(),
  };
}

/** Offline / DB-down briefing shell so /home can still render. */
export function buildEmptyHubDigest(date: Date = new Date()): HubDigest {
  const { weekday } = campusLocalParts(date);

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
  }).format(date);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
  }).format(date);

  return {
    today: date,
    dayName,
    dateLabel,
    schoolYear: getSchoolYear(date),
    isSchoolDay: isSchoolDay(weekday),
    weather: unavailableWeather(),
    eventCount: 0,
    formsDueCount: 0,
  };
}

export async function getTodayHubDigest(
  user: HubDigestUser = null,
  date: Date = new Date(),
): Promise<HubDigest> {
  const { weekday } = campusLocalParts(date);

  const [weather, events, forms] = await Promise.all([
    safeHubSideData("weather", () => getCampusWeather(), unavailableWeather()),
    user
      ? safeHubSideData("events", () => listEventsForDay(user.id, date), [])
      : Promise.resolve([]),
    user
      ? safeHubSideData(
          "forms",
          () => listFormsForUser(user.id, user.role),
          [],
        )
      : Promise.resolve([]),
  ]);

  const formsDueCount = forms.filter((form) => {
    const submission = form.submission;
    if (!submission || !submission.signed) {
      return true;
    }
    if (form.approvalRequired && submission.approved === null) {
      return true;
    }
    if (submission.expiresAt && submission.expiresAt < date) {
      return true;
    }
    return false;
  }).length;

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
  }).format(date);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
  }).format(date);

  return {
    today: date,
    dayName,
    dateLabel,
    schoolYear: getSchoolYear(date),
    isSchoolDay: isSchoolDay(weekday),
    weather,
    eventCount: events.length,
    formsDueCount,
  };
}
