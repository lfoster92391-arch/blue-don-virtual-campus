"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  canManageImpactFund,
  canProposeImpactFund,
  canVoteImpactFund,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import type { ImpactFundProposalStatus, ImpactFundVoteChoice } from "@/generated/prisma/client";
import {
  castImpactFundVote,
  createImpactFundProposal,
  updateProposalStatus,
} from "@/services/impact-fund-service";

export type ImpactFundActionState = {
  error?: string;
  success?: string;
  proposalId?: string;
};

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(20, "Please describe your proposal"),
  amountRequested: z.coerce.number().int().min(1, "Minimum request is $1"),
  academyId: z.string().optional(),
});

function revalidateImpactFundPaths(proposalId?: string) {
  revalidatePath("/impact-fund");
  revalidatePath("/admin/impact-fund");
  if (proposalId) {
    revalidatePath(`/impact-fund/${proposalId}`);
  }
}

export async function createImpactFundProposalAction(
  _prev: ImpactFundActionState,
  formData: FormData,
): Promise<ImpactFundActionState> {
  const user = await requireCompleteProfile();

  if (!canProposeImpactFund(user.role)) {
    return { error: "You do not have permission to submit proposals." };
  }

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    amountRequested: formData.get("amountRequested"),
    academyId: formData.get("academyId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid proposal data." };
  }

  const proposalId = await createImpactFundProposal({
    title: parsed.data.title,
    description: parsed.data.description,
    amountRequested: parsed.data.amountRequested * 100,
    academyId: parsed.data.academyId,
    submittedById: user.id,
  });

  if (!proposalId) {
    return { error: "Unable to submit proposal." };
  }

  revalidateImpactFundPaths(proposalId);
  return { success: "Proposal submitted for review.", proposalId };
}

export async function openImpactFundVotingAction(
  proposalId: string,
  daysOpen = 7,
): Promise<ImpactFundActionState> {
  const user = await requireCompleteProfile();

  if (!canManageImpactFund(user.role)) {
    return { error: "You do not have permission to open voting." };
  }

  const voteDeadline = new Date();
  voteDeadline.setDate(voteDeadline.getDate() + daysOpen);

  const success = await updateProposalStatus(proposalId, "VOTING", { voteDeadline });

  if (!success) {
    return { error: "Unable to open voting." };
  }

  revalidateImpactFundPaths(proposalId);
  return { success: "Voting is now open." };
}

export async function updateImpactFundProposalStatusAction(
  proposalId: string,
  status: ImpactFundProposalStatus,
  fundedAmount?: number,
): Promise<ImpactFundActionState> {
  const user = await requireCompleteProfile();

  if (!canManageImpactFund(user.role)) {
    return { error: "You do not have permission to manage proposals." };
  }

  const success = await updateProposalStatus(proposalId, status, {
    fundedAmount: status === "FUNDED" ? fundedAmount : undefined,
  });

  if (!success) {
    return { error: "Unable to update proposal status." };
  }

  revalidateImpactFundPaths(proposalId);
  return { success: `Proposal marked ${status.toLowerCase()}.` };
}

export async function castImpactFundVoteAction(
  proposalId: string,
  choice: ImpactFundVoteChoice,
): Promise<ImpactFundActionState> {
  const user = await requireCompleteProfile();

  if (!canVoteImpactFund(user.role)) {
    return { error: "You do not have permission to vote." };
  }

  const success = await castImpactFundVote({
    proposalId,
    userId: user.id,
    choice,
  });

  if (!success) {
    return { error: "Unable to cast vote. Voting may be closed." };
  }

  revalidateImpactFundPaths(proposalId);
  return { success: "Vote recorded." };
}
