"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { reviewChildClubRequestAction } from "@/features/digital-forms/actions";
import type { ChildClubRequest } from "@/services/digital-forms-service";

type ChildClubApprovalsProps = {
  requests: ChildClubRequest[];
};

export function ChildClubApprovals({ requests }: ChildClubApprovalsProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDecision(submissionId: string, approved: boolean) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await reviewChildClubRequestAction(submissionId, approved);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success ?? "Decision recorded.");
    });
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No club requests are waiting for your approval.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm text-[#2E8B57]">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ul className="space-y-3">
        {requests.map((request) => (
          <li
            key={request.submissionId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {request.studentName} · {request.academyName}
              </p>
              <p className="text-sm text-muted-foreground">
                Signed as {request.signatureName ?? "—"}
                {request.submittedAt
                  ? ` on ${new Date(request.submittedAt).toLocaleDateString()}`
                  : ""}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A017]/10 px-2 py-0.5 text-xs font-medium text-[#D4A017]">
                Waiting for your approval
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pending}
                onClick={() => handleDecision(request.submissionId, true)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => handleDecision(request.submissionId, false)}
              >
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
