"use client";

import { useTransition } from "react";

import {
  castImpactFundVoteAction,
  openImpactFundVotingAction,
  updateImpactFundProposalStatusAction,
} from "@/features/impact-fund/actions";
import { Button } from "@/components/ui/button";
import type { ImpactFundProposalStatus, ImpactFundVoteChoice } from "@/generated/prisma/client";

export function ImpactFundVoteActions({
  proposalId,
  status,
  userVote,
  amountRequested,
  canManage,
  canVote,
}: {
  proposalId: string;
  status: ImpactFundProposalStatus;
  userVote: ImpactFundVoteChoice | null;
  amountRequested: number;
  canManage: boolean;
  canVote: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function vote(choice: ImpactFundVoteChoice) {
    startTransition(async () => {
      await castImpactFundVoteAction(proposalId, choice);
    });
  }

  return (
    <div className="space-y-4">
      {canVote && status === "VOTING" ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending || userVote === "FOR"} onClick={() => vote("FOR")}>Vote for</Button>
          <Button size="sm" variant="outline" disabled={pending || userVote === "AGAINST"} onClick={() => vote("AGAINST")}>Vote against</Button>
          <Button size="sm" variant="ghost" disabled={pending || userVote === "ABSTAIN"} onClick={() => vote("ABSTAIN")}>Abstain</Button>
          {userVote ? <p className="w-full text-sm text-muted-foreground">Your vote: {userVote.toLowerCase()}</p> : null}
        </div>
      ) : null}

      {canManage ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {status === "SUBMITTED" ? (
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await openImpactFundVotingAction(proposalId);
                })
              }
            >
              Open voting
            </Button>
          ) : null}
          {status === "VOTING" ? (
            <>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await updateImpactFundProposalStatusAction(proposalId, "APPROVED");
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
                    await updateImpactFundProposalStatusAction(proposalId, "REJECTED");
                  })
                }
              >
                Reject
              </Button>
            </>
          ) : null}
          {status === "APPROVED" ? (
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await updateImpactFundProposalStatusAction(
                    proposalId,
                    "FUNDED",
                    amountRequested,
                  );
                })
              }
            >
              Mark funded
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
