"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PROFESSIONAL_SKILLS_PROGRESS_KEY,
  parseProfessionalSkillsProgress,
} from "@/services/professional-skills-service";
import type { ChecklistStep } from "@/config/professional-skills";
import type { ProfessionalSkillSlug } from "@/config/professional-skills";

type SkillChecklistProps = {
  slug: ProfessionalSkillSlug;
  steps: ChecklistStep[];
  onProgressChange?: (completedCount: number, total: number) => void;
};

export function SkillChecklist({ slug, steps, onProgressChange }: SkillChecklistProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(PROFESSIONAL_SKILLS_PROGRESS_KEY);
    const progress = parseProfessionalSkillsProgress(raw);
    setCompletedIds(progress[slug] ?? []);
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    onProgressChange?.(
      steps.filter((step) => completedIds.includes(step.id)).length,
      steps.length,
    );
  }, [completedIds, hydrated, onProgressChange, steps]);

  const toggleStep = useCallback(
    (stepId: string, checked: boolean) => {
      setCompletedIds((prev) => {
        const next = checked
          ? [...new Set([...prev, stepId])]
          : prev.filter((id) => id !== stepId);

        const raw = localStorage.getItem(PROFESSIONAL_SKILLS_PROGRESS_KEY);
        const progress = parseProfessionalSkillsProgress(raw);
        progress[slug] = next;
        localStorage.setItem(
          PROFESSIONAL_SKILLS_PROGRESS_KEY,
          JSON.stringify(progress),
        );

        return next;
      });
    },
    [slug],
  );

  if (!hydrated) {
    return (
      <ul className="space-y-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 opacity-60"
          >
            <span className="mt-0.5 size-4 shrink-0 rounded border border-input" />
            <div>
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {steps.map((step) => {
        const checked = completedIds.includes(step.id);
        return (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
              checked ? "border-[#2E8B57]/30 bg-[#2E8B57]/5" : "border-border"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              aria-label={`Mark ${step.title} complete`}
              className="mt-1 size-4 shrink-0 rounded border-input"
              onChange={(event) => toggleStep(step.id, event.target.checked)}
            />
            <div>
              <p
                className={`text-sm font-medium ${
                  checked ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
