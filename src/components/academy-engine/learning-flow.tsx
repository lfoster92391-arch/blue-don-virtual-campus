import Link from "next/link";
import { Bot, BookOpen, FlaskConical, Trophy } from "lucide-react";

import {
  LEARNING_FLOW_STEPS,
  LEARNING_STEP_LABELS,
  LEVEL_TIER_LABELS,
} from "@/lib/academy-engine/constants";
import type { ModuleDetail } from "@/services/academy-engine-service";
import { Button } from "@/components/ui/button";

type LearningFlowProps = {
  module: ModuleDetail;
};

export function LearningFlow({ module }: LearningFlowProps) {
  const progressPct = module.progress?.progressPct ?? 0;
  const currentStep = module.progress?.currentStep;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Module progress</p>
            <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">
              {Math.round(progressPct)}%
            </p>
          </div>
          {module.levelTier ? (
            <span className="rounded-full bg-[#2F80ED]/10 px-3 py-1 text-sm font-medium text-[#2F80ED]">
              {LEVEL_TIER_LABELS[module.levelTier]}
            </span>
          ) : null}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#2E8B57] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Learning flow</h2>
        <ol className="mt-4 space-y-2">
          {LEARNING_FLOW_STEPS.map((step, index) => {
            const lesson = module.lessons.find((l) => l.stepType === step);
            const video = step === "WATCH" ? module.videos[0] : null;
            const labLink = module.labLinks.find((l) => l.stepType === step);
            const simLink = module.simulatorLinks.find((s) => s.stepType === step);
            const assessment =
              step === "PRACTICAL_EXAM"
                ? module.assessments.find((a) => a.type === "PRACTICAL_EXAM")
                : step === "LEARN"
                  ? module.assessments.find((a) => a.type === "KNOWLEDGE_CHECK")
                  : null;

            const isCurrent = currentStep === step;
            const hasContent = lesson || video || labLink || simLink || assessment;

            return (
              <li
                key={step}
                className={`rounded-lg border px-4 py-3 ${
                  isCurrent ? "border-[#2F80ED] bg-[#2F80ED]/5" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0A2342]/10 text-xs font-semibold text-[#0A2342] dark:bg-white/10 dark:text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{LEARNING_STEP_LABELS[step]}</p>
                    {lesson?.content ? (
                      <p className="mt-1 text-sm text-muted-foreground">{lesson.content}</p>
                    ) : lesson?.title ? (
                      <p className="mt-1 text-sm text-muted-foreground">{lesson.title}</p>
                    ) : !hasContent ? (
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        Complete prior steps to unlock this activity.
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {labLink ? (
                        <Button
                          size="sm"
                          variant="outline"
                          nativeButton={false}
                          render={
                            <Link href={`/labs/${labLink.lab.slug}`}>
                              <FlaskConical className="mr-1 size-3.5" />
                              {labLink.lab.title}
                            </Link>
                          }
                        />
                      ) : null}
                      {simLink ? (
                        <Button
                          size="sm"
                          variant="outline"
                          nativeButton={false}
                          render={
                            <Link href={`/simulators/${simLink.simulator.slug}`}>
                              {simLink.simulator.title}
                            </Link>
                          }
                        />
                      ) : null}
                      {assessment ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                          <BookOpen className="size-3" />
                          {assessment.title} (placeholder)
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-xl border border-dashed border-[#2F80ED]/40 bg-[#2F80ED]/5 p-5">
        <div className="flex items-start gap-3">
          <Bot className="size-5 shrink-0 text-[#2F80ED]" />
          <div>
            <h3 className="font-semibold text-[#0A2342] dark:text-white">AI Coaching</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalized coaching for this module will appear here. Structure is ready for
              future AI integration — ask questions, get hints, and review competency gaps.
            </p>
            <Button size="sm" variant="outline" className="mt-3" disabled>
              Open AI Coach (coming soon)
            </Button>
          </div>
        </div>
      </section>

      <div className="flex gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href={`/academies/${module.academySlug}?tab=modules`}>
              Back to modules
            </Link>
          }
        />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/portfolio"><Trophy className="mr-1 size-4" />Portfolio</Link>}
        />
      </div>
    </div>
  );
}
