"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { approveSubmissionAction } from "@/features/forms/actions";

type ApprovalActionsProps = {
  submissionId: string;
};

export function ApprovalActions({ submissionId }: ApprovalActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleApprove(approved: boolean) {
    startTransition(async () => {
      await approveSubmissionAction(submissionId, approved);
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => handleApprove(true)}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => handleApprove(false)}
      >
        Reject
      </Button>
    </div>
  );
}
