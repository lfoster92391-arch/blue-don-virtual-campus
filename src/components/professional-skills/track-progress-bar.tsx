"use client";

import { useState } from "react";

import { SkillChecklist } from "@/components/professional-skills/skill-checklist";
import type { ProfessionalSkillTrack } from "@/config/professional-skills";

type TrackProgressSectionProps = {
  track: ProfessionalSkillTrack;
};

export function TrackProgressSection({ track }: TrackProgressSectionProps) {
  const [progress, setProgress] = useState({ completed: 0, total: track.checklistSteps.length });
  const percent =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {progress.completed} of {progress.total} steps complete
          </span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#2F80ED] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <SkillChecklist
        slug={track.slug}
        steps={track.checklistSteps}
        onProgressChange={(completed, total) => setProgress({ completed, total })}
      />
    </div>
  );
}
