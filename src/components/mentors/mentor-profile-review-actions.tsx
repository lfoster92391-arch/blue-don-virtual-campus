"use client";

import { useTransition } from "react";

import { reviewMentorProfileAction } from "@/features/mentors/actions";
import { Button } from "@/components/ui/button";

export function MentorProfileReviewActions({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewMentorProfileAction(profileId, true);
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
            await reviewMentorProfileAction(profileId, false);
          })
        }
      >
        Decline
      </Button>
    </div>
  );
}
