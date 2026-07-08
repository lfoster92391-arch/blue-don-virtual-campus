"use client";

import { useTransition } from "react";

import { reviewMembershipAction } from "@/features/academies/actions";
import { Button } from "@/components/ui/button";

export function MembershipReviewActions({
  membershipId,
}: {
  membershipId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewMembershipAction(membershipId, true);
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
            await reviewMembershipAction(membershipId, false);
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}
