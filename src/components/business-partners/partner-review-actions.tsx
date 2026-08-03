"use client";

import { useTransition } from "react";

import { reviewPartnerAction } from "@/features/business-partners/actions";
import { Button } from "@/components/ui/button";

export function PartnerReviewActions({ partnerId }: { partnerId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewPartnerAction(partnerId, true);
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
            await reviewPartnerAction(partnerId, false);
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}
