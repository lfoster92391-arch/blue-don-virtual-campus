import { IMPACT_PROJECT_STATUS_LABELS } from "@/config/impact-before-diploma";
import type { ImpactProjectRecord } from "@/services/impact-project-service";
import { getImpactProjectProgress } from "@/services/impact-project-service";
import { cn } from "@/lib/utils";

type ImpactProjectTrackerProps = {
  project: ImpactProjectRecord;
};

export function ImpactProjectTracker({ project }: ImpactProjectTrackerProps) {
  const progress = getImpactProjectProgress(project.status);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#D4A017]">
              Impact Before Diploma
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0A2342] dark:text-white">
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
          </div>
          <span className="rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
            {IMPACT_PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Journey progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#D4A017] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <ol className="space-y-3">
        {project.milestones.map((milestone, index) => {
          const completed = Boolean(milestone.completedAt);
          const isCurrent = project.milestones.findIndex((m) => !m.completedAt) === index;

          return (
            <li
              key={milestone.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3",
                completed
                  ? "border-[#2E8B57]/30 bg-[#2E8B57]/5"
                  : isCurrent
                    ? "border-[#D4A017]/40 bg-[#D4A017]/5"
                    : "border-border",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  completed
                    ? "bg-[#2E8B57] text-white"
                    : isCurrent
                      ? "bg-[#D4A017] text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{milestone.label}</p>
                {milestone.completedAt ? (
                  <p className="text-xs text-muted-foreground">
                    {new Date(milestone.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
