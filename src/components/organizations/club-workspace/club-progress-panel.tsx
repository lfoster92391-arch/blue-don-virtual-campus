import { Check, Lock, Trophy } from "lucide-react";

import type { ClubTheme } from "@/config/club-workspaces";
import type { ClubProgress } from "@/services/club-xp-service";
import { cn } from "@/lib/utils";

type ClubProgressPanelProps = {
  clubName: string;
  progress: ClubProgress;
  theme: ClubTheme;
};

/**
 * Overview-tab hero for a club's OWN XP track: level badge, XP bar, and the
 * milestone checklist. Distinct from school-wide Rewards XP.
 */
export function ClubProgressPanel({
  clubName,
  progress,
  theme,
}: ClubProgressPanelProps) {
  return (
    <section
      className="rounded-xl border border-border p-6"
      style={{ backgroundColor: theme.soft }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: theme.accent }}
          >
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide opacity-90">
              Level
            </span>
            <span className="text-2xl font-bold leading-none">{progress.level}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.accent }}>
              Club Level · {progress.levelTitle}
            </p>
            <h3 className="text-lg font-semibold text-[#0A2342] dark:text-white">
              {clubName} XP
            </h3>
            <p className="text-sm text-muted-foreground">
              {progress.clubXp.toLocaleString()} club XP · own progression track
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Trophy className="size-3.5" style={{ color: theme.accent }} aria-hidden="true" />
            Milestones
          </p>
          <p className="mt-1 text-2xl font-bold text-[#0A2342] dark:text-white">
            {progress.completedMilestones}/{progress.totalMilestones}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Level {progress.level}</span>
          <span>
            {progress.xpToNextLevel.toLocaleString()} XP to Level {progress.level + 1}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-card">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress.levelProgressPct}%`,
              backgroundColor: theme.accent,
            }}
          />
        </div>
      </div>

      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {progress.milestones.map((milestone) => (
          <li
            key={milestone.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              milestone.completed
                ? "border-transparent bg-card"
                : "border-dashed border-border bg-card/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white",
              )}
              style={{
                backgroundColor: milestone.completed ? theme.accent : "transparent",
                border: milestone.completed ? "none" : "1px dashed var(--border)",
              }}
              aria-hidden="true"
            >
              {milestone.completed ? (
                <Check className="size-3.5" />
              ) : (
                <Lock className="size-3 text-muted-foreground" />
              )}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  milestone.completed
                    ? "text-[#0A2342] dark:text-white"
                    : "text-muted-foreground",
                )}
              >
                <span aria-hidden="true">{milestone.icon}</span>
                {milestone.name}
                <span className="ml-auto shrink-0 text-xs font-normal text-muted-foreground">
                  +{milestone.xp} XP
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {milestone.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
