"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FORM_WORKFLOW } from "@/lib/forms/constants";
import {
  archiveFormAction,
  updateFormStatusAction,
} from "@/features/forms/actions";
import type { FormStatus } from "@/generated/prisma/client";

type AdminFormStatusActionsProps = {
  formId: string;
  currentStatus: FormStatus;
  archiveFlag: boolean;
};

export function AdminFormStatusActions({
  formId,
  currentStatus,
  archiveFlag,
}: AdminFormStatusActionsProps) {
  const [pending, startTransition] = useTransition();

  const currentIndex = FORM_WORKFLOW.indexOf(currentStatus);
  const nextStatus =
    currentIndex >= 0 && currentIndex < FORM_WORKFLOW.length - 2
      ? FORM_WORKFLOW[currentIndex + 1]
      : null;

  function handleStatus(status: FormStatus) {
    startTransition(async () => {
      await updateFormStatusAction(formId, status);
    });
  }

  function handleArchive() {
    startTransition(async () => {
      await archiveFormAction(formId);
    });
  }

  if (archiveFlag) {
    return (
      <p className="text-sm text-muted-foreground">
        This form is archived. Records are retained; no hard delete.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatus && nextStatus !== "ARCHIVED" ? (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => handleStatus(nextStatus)}
        >
          Move to {nextStatus.toLowerCase().replace("_", " ")}
        </Button>
      ) : null}
      {currentStatus === "PUBLISHED" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => handleStatus("COMPLETE")}
        >
          Mark complete
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={handleArchive}
      >
        Archive
      </Button>
    </div>
  );
}
