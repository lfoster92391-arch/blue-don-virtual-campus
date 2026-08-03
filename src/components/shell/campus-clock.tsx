"use client";

import { useEffect, useState } from "react";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function CampusClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="hidden min-w-[9rem] text-right text-sm lg:block">
      <p className="font-medium text-foreground">
        {now ? formatDate(now) : "\u00A0"}
      </p>
      <p className="text-muted-foreground">{now ? formatTime(now) : "\u00A0"}</p>
    </div>
  );
}
