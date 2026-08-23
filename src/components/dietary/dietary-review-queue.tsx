"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { DietarySummary } from "@/components/dietary/dietary-summary";
import { Button } from "@/components/ui/button";
import {
  acceptAllDietaryRequestsAction,
  acceptDietaryRequestAction,
  declineDietaryRequestAction,
} from "@/features/dietary/actions";
import type { DietaryRequestView } from "@/services/dietary-service";

type DietaryReviewQueueProps = {
  requests: DietaryRequestView[];
};

export function DietaryReviewQueue({ requests }: DietaryReviewQueueProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string; success?: string }>) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success ?? "Done.");
    });
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-3">
        {message ? (
          <p className="rounded-lg bg-[#2E8B57]/10 px-3 py-2 text-sm text-[#2E8B57]">
            {message}
          </p>
        ) : null}
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <CheckCircle2
            className="mx-auto mb-2 size-5 text-[#2E8B57]"
            aria-hidden="true"
          />
          <p className="font-medium text-foreground">
            No dietary forms waiting for review
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Newly submitted allergy and restriction forms land here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-lg bg-[#2E8B57]/10 px-3 py-2 text-sm text-[#2E8B57]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {requests.length} form{requests.length === 1 ? "" : "s"} waiting.
          Accepting applies the allergies and restrictions straight to the
          student account.
        </p>
        <Button
          disabled={pending}
          onClick={() => run(() => acceptAllDietaryRequestsAction())}
        >
          {pending ? "Working…" : "Accept all & apply"}
        </Button>
      </div>

      <ul className="space-y-3">
        {requests.map((request) => (
          <li
            key={request.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">
                  {request.studentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted by {request.submittedByName} on{" "}
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    run(() => acceptDietaryRequestAction(request.id))
                  }
                >
                  Accept & apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    run(() => declineDietaryRequestAction(request.id))
                  }
                >
                  Decline
                </Button>
              </div>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <DietarySummary
                allergens={request.allergens}
                restrictions={request.restrictions}
                notes={request.notes}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
