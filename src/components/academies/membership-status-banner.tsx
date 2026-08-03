import type { AcademyJoinPipelineStatus } from "@/services/academy-service";

const STAGE_STYLES: Record<
  AcademyJoinPipelineStatus["stage"],
  { className: string; stepClassName: string }
> = {
  none: {
    className: "border-border bg-muted/40",
    stepClassName: "text-muted-foreground",
  },
  waiting_parent: {
    className: "border-[#D4A017]/30 bg-[#D4A017]/10",
    stepClassName: "text-[#D4A017]",
  },
  advisor_review: {
    className: "border-[#2F80ED]/30 bg-[#2F80ED]/10",
    stepClassName: "text-[#2F80ED]",
  },
  active: {
    className: "border-[#2E8B57]/30 bg-[#2E8B57]/10",
    stepClassName: "text-[#2E8B57]",
  },
  declined: {
    className: "border-destructive/30 bg-destructive/10",
    stepClassName: "text-destructive",
  },
};

const PIPELINE_STEPS = [
  { key: "requested", label: "Requested" },
  { key: "parent", label: "Parent" },
  { key: "advisor", label: "Advisor" },
  { key: "active", label: "Active" },
] as const;

function stepState(
  pipeline: AcademyJoinPipelineStatus,
  step: (typeof PIPELINE_STEPS)[number]["key"],
): "complete" | "current" | "upcoming" | "failed" {
  const { stage, failedStep } = pipeline;

  if (stage === "declined") {
    if (step === "requested") {
      return "complete";
    }
    if (failedStep === "parent" && step === "parent") {
      return "failed";
    }
    if (failedStep === "advisor" && step === "advisor") {
      return "failed";
    }
    if (failedStep === "advisor" && step === "parent") {
      return "complete";
    }
    return "upcoming";
  }

  if (stage === "none") {
    return "upcoming";
  }

  if (stage === "waiting_parent") {
    if (step === "requested") return "complete";
    if (step === "parent") return "current";
    return "upcoming";
  }

  if (stage === "advisor_review") {
    if (step === "requested" || step === "parent") return "complete";
    if (step === "advisor") return "current";
    return "upcoming";
  }

  if (stage === "active") {
    return "complete";
  }

  return "upcoming";
}

type MembershipStatusBannerProps = {
  academyName: string;
  pipeline: AcademyJoinPipelineStatus;
};

export function MembershipStatusBanner({
  academyName,
  pipeline,
}: MembershipStatusBannerProps) {
  if (pipeline.stage === "none") {
    return null;
  }

  const styles = STAGE_STYLES[pipeline.stage];

  return (
    <section
      className={`mt-4 rounded-xl border p-4 ${styles.className}`}
      aria-label={`${academyName} membership status`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
            Your application: {pipeline.stageLabel}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{pipeline.detail}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${styles.stepClassName} bg-white/60 dark:bg-black/20`}
        >
          {pipeline.stageLabel}
        </span>
      </div>

      <ol className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        {PIPELINE_STEPS.map((step, index) => {
          const state = stepState(pipeline, step.key);
          return (
            <li key={step.key} className="flex items-center gap-2">
              <span
                className={
                  state === "complete"
                    ? "text-[#2E8B57]"
                    : state === "current"
                      ? styles.stepClassName
                      : state === "failed"
                        ? "text-destructive"
                        : "text-muted-foreground"
                }
              >
                {state === "complete" ? "✓" : state === "failed" ? "✕" : `${index + 1}.`}{" "}
                {step.label}
              </span>
              {index < PIPELINE_STEPS.length - 1 ? (
                <span className="text-muted-foreground" aria-hidden="true">
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
