"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  claimAssignmentAction,
  updateAssignmentStatusAction,
} from "@/features/assignments/actions";
import type { AssignmentStatus } from "@/generated/prisma/client";

type AssignmentStatusActionsProps = {
  assignmentId: string;
  status: AssignmentStatus;
};

export function AssignmentStatusActions({
  assignmentId,
  status,
}: AssignmentStatusActionsProps) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(() => {
      void action();
    });
  }

  if (status === "COMPLETED" || status === "SUBMITTED") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => claimAssignmentAction(assignmentId))}
        >
          Start
        </Button>
      ) : null}
      {status === "IN_PROGRESS" ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            run(() => updateAssignmentStatusAction(assignmentId, "SUBMITTED"))
          }
        >
          Submit
        </Button>
      ) : null}
    </div>
  );
}
