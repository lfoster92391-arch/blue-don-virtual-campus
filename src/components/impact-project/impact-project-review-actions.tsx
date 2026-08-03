"use client";

import { useTransition } from "react";

import { IMPACT_PROJECT_STATUS_LABELS } from "@/config/impact-before-diploma";
import type { ImpactProjectStatus } from "@/config/impact-before-diploma";
import { updateImpactProjectStatusAction } from "@/features/impact-project/actions";
import type { ImpactProjectRecord } from "@/services/impact-project-service";
import { Button } from "@/components/ui/button";

const REVIEW_STATUSES: ImpactProjectStatus[] = [
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETE",
  "REJECTED",
];

type ImpactProjectReviewActionsProps = {
  project: ImpactProjectRecord;
};

export function ImpactProjectReviewActions({ project }: ImpactProjectReviewActionsProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {REVIEW_STATUSES.map((status) => (
        <Button
          key={status}
          size="sm"
          variant={project.status === status ? "default" : "outline"}
          disabled={pending || project.status === status}
          onClick={() =>
            startTransition(async () => {
              await updateImpactProjectStatusAction(project.id, status);
            })
          }
        >
          {IMPACT_PROJECT_STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
