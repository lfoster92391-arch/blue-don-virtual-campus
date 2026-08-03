"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  approveCommunityPartnerAction,
  rejectCommunityPartnerAction,
} from "@/features/partners/actions";

type CommunityPartnerApprovalActionsProps = {
  partnerId: string;
};

export function CommunityPartnerApprovalActions({
  partnerId,
}: CommunityPartnerApprovalActionsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await approveCommunityPartnerAction(partnerId);
          });
        }}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await rejectCommunityPartnerAction(partnerId);
          });
        }}
      >
        Reject
      </Button>
    </div>
  );
}
