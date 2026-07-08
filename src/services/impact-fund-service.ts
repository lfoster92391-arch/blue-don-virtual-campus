import { isDatabaseConfigured } from "@/config/env";
import type {
  ImpactFundProposalStatus,
  ImpactFundVoteChoice,
} from "@/generated/prisma/client";
import { IMPACT_FUND_BALANCE_CENTS } from "@/lib/mvp/constants";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type ImpactFundProposalListItem = {
  id: string;
  title: string;
  description: string;
  amountRequested: number;
  status: ImpactFundProposalStatus;
  academyName: string | null;
  submitterName: string;
  voteDeadline: Date | null;
  fundedAmount: number | null;
  voteSummary: {
    for: number;
    against: number;
    abstain: number;
  };
  updatedAt: Date;
};

export type ImpactFundProposalDetail = ImpactFundProposalListItem & {
  userVote: ImpactFundVoteChoice | null;
};

export type ImpactFundSummary = {
  balanceCents: number;
  allocatedCents: number;
  availableCents: number;
  openProposals: number;
  votingProposals: number;
};

export async function getImpactFundSummary(): Promise<ImpactFundSummary> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      balanceCents: IMPACT_FUND_BALANCE_CENTS,
      allocatedCents: 0,
      availableCents: IMPACT_FUND_BALANCE_CENTS,
      openProposals: 0,
      votingProposals: 0,
    };
  }

  const result = await withDatabase(async (prisma) =>
    Promise.all([
      prisma.impactFundProposal.aggregate({
        where: { status: "FUNDED" },
        _sum: { fundedAmount: true },
      }),
      prisma.impactFundProposal.count({
        where: { status: "SUBMITTED", archiveFlag: false },
      }),
      prisma.impactFundProposal.count({
        where: { status: "VOTING", archiveFlag: false },
      }),
    ]),
  );

  if (!result) {
    return {
      balanceCents: IMPACT_FUND_BALANCE_CENTS,
      allocatedCents: 0,
      availableCents: IMPACT_FUND_BALANCE_CENTS,
      openProposals: 0,
      votingProposals: 0,
    };
  }

  const [funded, submitted, voting] = result;

  const allocatedCents = funded?._sum.fundedAmount ?? 0;

  return {
    balanceCents: IMPACT_FUND_BALANCE_CENTS,
    allocatedCents,
    availableCents: IMPACT_FUND_BALANCE_CENTS - allocatedCents,
    openProposals: submitted ?? 0,
    votingProposals: voting ?? 0,
  };
}

export async function listPublicProposals(): Promise<ImpactFundProposalListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const proposals = await withDatabase((prisma) =>
    prisma.impactFundProposal.findMany({
      where: {
        archiveFlag: false,
        status: { notIn: ["DRAFT", "ARCHIVED"] },
      },
      include: proposalIncludes,
      orderBy: { updatedAt: "desc" },
    }),
  );

  return proposals?.map(mapProposalListItem) ?? [];
}

export async function listAllProposals(): Promise<ImpactFundProposalListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const proposals = await withDatabase((prisma) =>
    prisma.impactFundProposal.findMany({
      where: { archiveFlag: false },
      include: proposalIncludes,
      orderBy: { updatedAt: "desc" },
    }),
  );

  return proposals?.map(mapProposalListItem) ?? [];
}

export async function getProposalById(
  id: string,
  userId?: string,
  includeDraft = false,
): Promise<ImpactFundProposalDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const proposal = await withDatabase((prisma) =>
    prisma.impactFundProposal.findFirst({
      where: {
        id,
        archiveFlag: false,
        status: includeDraft ? undefined : { notIn: ["DRAFT", "ARCHIVED"] },
      },
      include: {
        ...proposalIncludes,
        votes: userId
          ? { where: { userId }, select: { choice: true }, take: 1 }
          : false,
      },
    }),
  );

  if (!proposal) {
    return null;
  }

  const userVote =
    userId && Array.isArray(proposal.votes) && proposal.votes[0]
      ? proposal.votes[0].choice
      : null;

  return {
    ...mapProposalListItem(proposal),
    userVote,
  };
}

export async function createImpactFundProposal(input: {
  title: string;
  description: string;
  amountRequested: number;
  academyId?: string;
  submittedById: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const proposal = await withDatabase((prisma) =>
    prisma.impactFundProposal.create({
      data: {
        title: input.title,
        description: input.description,
        amountRequested: input.amountRequested,
        academyId: input.academyId,
        submittedById: input.submittedById,
        status: "SUBMITTED",
      },
      select: { id: true },
    }),
  );

  return proposal?.id ?? null;
}

export async function updateProposalStatus(
  id: string,
  status: ImpactFundProposalStatus,
  options?: { voteDeadline?: Date; fundedAmount?: number },
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.impactFundProposal.update({
      where: { id },
      data: {
        status,
        voteDeadline: options?.voteDeadline,
        fundedAmount: options?.fundedAmount,
        archiveFlag: status === "ARCHIVED",
      },
    }),
  );

  return result !== null;
}

export async function castImpactFundVote(input: {
  proposalId: string;
  userId: string;
  choice: ImpactFundVoteChoice;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const proposal = await withDatabase((prisma) =>
    prisma.impactFundProposal.findFirst({
      where: { id: input.proposalId, status: "VOTING", archiveFlag: false },
      select: { id: true, voteDeadline: true },
    }),
  );

  if (!proposal) {
    return false;
  }

  if (proposal.voteDeadline && proposal.voteDeadline < new Date()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.impactFundVote.upsert({
      where: {
        proposalId_userId: {
          proposalId: input.proposalId,
          userId: input.userId,
        },
      },
      create: {
        proposalId: input.proposalId,
        userId: input.userId,
        choice: input.choice,
      },
      update: { choice: input.choice },
    }),
  );

  return result !== null;
}

const proposalIncludes = {
  academy: { select: { name: true } },
  submittedBy: {
    select: { displayName: true, firstName: true, lastName: true, email: true },
  },
  votes: { select: { choice: true } },
} as const;

function mapProposalListItem(proposal: {
  id: string;
  title: string;
  description: string;
  amountRequested: number;
  status: ImpactFundProposalStatus;
  voteDeadline: Date | null;
  fundedAmount: number | null;
  updatedAt: Date;
  academy: { name: string } | null;
  submittedBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  votes: { choice: ImpactFundVoteChoice }[];
}): ImpactFundProposalListItem {
  const submitterName =
    proposal.submittedBy.displayName ??
    [proposal.submittedBy.firstName, proposal.submittedBy.lastName]
      .filter(Boolean)
      .join(" ") ??
    proposal.submittedBy.email;

  const voteSummary = proposal.votes.reduce(
    (acc, vote) => {
      if (vote.choice === "FOR") acc.for += 1;
      if (vote.choice === "AGAINST") acc.against += 1;
      if (vote.choice === "ABSTAIN") acc.abstain += 1;
      return acc;
    },
    { for: 0, against: 0, abstain: 0 },
  );

  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    amountRequested: proposal.amountRequested,
    status: proposal.status,
    academyName: proposal.academy?.name ?? null,
    submitterName,
    voteDeadline: proposal.voteDeadline,
    fundedAmount: proposal.fundedAmount,
    voteSummary,
    updatedAt: proposal.updatedAt,
  };
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
