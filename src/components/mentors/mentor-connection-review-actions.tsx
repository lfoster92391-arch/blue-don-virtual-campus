"use client";

import { useTransition } from "react";

import { reviewMentorConnectionAction } from "@/features/mentors/actions";
import { Button } from "@/components/ui/button";

export function MentorConnectionReviewActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewMentorConnectionAction(requestId, true);
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewMentorConnectionAction(requestId, false);
          })
        }
      >
        Decline
      </Button>
    </div>
  );
}
