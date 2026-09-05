import { CalendarDays, Sun } from "lucide-react";

import { CampusHeroWeather } from "@/components/weather/campus-hero-weather";
import { ROLE_LABELS } from "@/config/roles";
import { getCampusWeather } from "@/services/weather-service";
import type { CampusUser } from "@/types/auth";

function getGreeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type DashboardHeroProps = {
  user: CampusUser;
};

export async function DashboardHero({ user }: DashboardHeroProps) {
  const now = new Date();
  const preferredName = user.firstName ?? user.displayName.split(" ")[0] ?? user.displayName;

  const weather = await getCampusWeather();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] to-[#0A2342]/90 px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-[#C6CCD6]">
            <Sun className="size-4" aria-hidden="true" />
            Today on Campus
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {getGreeting(now.getHours())}, {preferredName} 👋
          </h1>
          <p className="max-w-xl text-sm text-[#C6CCD6] sm:text-base">
            {ROLE_LABELS[user.role]} · Your daily command center for classes,
            deadlines, events, and progress at Madonna High School.
          </p>
          <CampusHeroWeather weather={weather} />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
          <CalendarDays className="size-4 shrink-0 text-[#C6CCD6]" aria-hidden="true" />
          <time dateTime={now.toISOString()}>{formatToday(now)}</time>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[#2F80ED]/20 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}
