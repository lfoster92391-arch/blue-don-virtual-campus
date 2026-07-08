"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";

export type StepFlowStep = {
  id: string;
  title: string;
  instruction: string;
  taskLabel: string;
  hint?: string;
};

type StepFlowLabProps = {
  title: string;
  description: string;
  steps: StepFlowStep[];
  completionMessage?: string;
};

export function StepFlowLab({
  title,
  description,
  steps,
  completionMessage = "Lab complete — great work!",
}: StepFlowLabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const currentStep = steps[currentIndex];
  const allDone = completed.size === steps.length;

  function toggleStep(stepId: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-5">
      <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 flex gap-1">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`h-1.5 flex-1 rounded-full ${
              completed.has(step.id)
                ? "bg-[#2E8B57]"
                : i === currentIndex
                  ? "bg-[#2F80ED]"
                  : "bg-muted"
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Step {currentIndex + 1} of {steps.length}
      </p>

      {currentStep ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <p className="font-medium">{currentStep.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{currentStep.instruction}</p>
          {currentStep.hint ? (
            <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Hint: {currentStep.hint}
            </p>
          ) : null}
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-3 hover:bg-muted/50">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={completed.has(currentStep.id)}
              onChange={() => toggleStep(currentStep.id)}
            />
            <span className="text-sm">{currentStep.taskLabel}</span>
          </label>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <Button
          size="sm"
          disabled={currentIndex >= steps.length - 1}
          onClick={() => setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))}
        >
          Next step
        </Button>
      </div>

      <ul className="mt-6 space-y-2">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-center gap-2 text-sm">
            {completed.has(step.id) ? (
              <CheckCircle2 className="size-4 shrink-0 text-[#2E8B57]" />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground" />
            )}
            <button
              type="button"
              className={`text-left ${i === currentIndex ? "font-medium text-[#2F80ED]" : "text-muted-foreground"}`}
              onClick={() => setCurrentIndex(i)}
            >
              {step.title}
            </button>
          </li>
        ))}
      </ul>

      {allDone ? (
        <p className="mt-4 rounded-lg bg-[#2E8B57]/10 px-4 py-3 text-sm font-medium text-[#2E8B57]">
          {completionMessage}
        </p>
      ) : null}
    </div>
  );
}
