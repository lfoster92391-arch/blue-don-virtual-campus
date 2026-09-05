import Link from "next/link";
import { Camera, Clapperboard, ClipboardList, Trophy, Users } from "lucide-react";

import { cn } from "@/lib/utils";

export const COACH_TABS = [
  { id: "film", label: "Film room", icon: Clapperboard },
  { id: "scores", label: "Scores & schedule", icon: Trophy },
  { id: "roster", label: "Roster", icon: Users },
  { id: "stats", label: "Stats", icon: ClipboardList },
  { id: "photos", label: "Player photos", icon: Camera },
] as const;

export type CoachTabId = (typeof COACH_TABS)[number]["id"];

export function isCoachTab(value: string | undefined): value is CoachTabId {
  return COACH_TABS.some((tab) => tab.id === value);
}

export function CoachSectionNav({
  active,
  sportSlug,
}: {
  active: CoachTabId;
  sportSlug?: string | null;
}) {
  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Coach workspace"
    >
      {COACH_TABS.map((tab) => {
        const params = new URLSearchParams();
        params.set("tab", tab.id);
        if (sportSlug) {
          params.set("sport", sportSlug);
        }
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={`/coach?${params.toString()}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#0A2342] text-white dark:bg-[#2F80ED]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
