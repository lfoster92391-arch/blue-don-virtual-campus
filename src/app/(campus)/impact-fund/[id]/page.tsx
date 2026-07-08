import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ImpactFundVoteActions } from "@/components/impact-fund/impact-fund-vote-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  canManageImpactFund,
  canViewImpactFund,
  canVoteImpactFund,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { IMPACT_FUND_STATUS_LABELS } from "@/lib/mvp/constants";
import { formatCurrency, getProposalById } from "@/services/impact-fund-service";

type ImpactFundDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ImpactFundDetailPage({ params }: ImpactFundDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();

  if (!canViewImpactFund(user.role)) {
    redirect("/dashboard");
  }

  const proposal = await getProposalById(
    id,
    user.id,
    canManageImpactFund(user.role),
  );

  if (!proposal) {
    notFound();
  }

  return (
    <ShellPage
      title={proposal.title}
      description={`${formatCurrency(proposal.amountRequested)} · ${IMPACT_FUND_STATUS_LABELS[proposal.status]}`}
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/impact-fund">Back to Impact Fund</Link>} />

      <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{proposal.description}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Submitted by</dt>
            <dd className="mt-1">{proposal.submitterName}</dd>
          </div>
          {proposal.academyName ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Academy</dt>
              <dd className="mt-1">{proposal.academyName}</dd>
            </div>
          ) : null}
          {proposal.voteDeadline ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Vote deadline</dt>
              <dd className="mt-1">{proposal.voteDeadline.toLocaleDateString()}</dd>
            </div>
          ) : null}
          {proposal.fundedAmount !== null ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Funded amount</dt>
              <dd className="mt-1">{formatCurrency(proposal.fundedAmount)}</dd>
            </div>
          ) : null}
        </dl>

        {proposal.status === "VOTING" ? (
          <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
            <p>
              {proposal.voteSummary.for} for · {proposal.voteSummary.against} against ·{" "}
              {proposal.voteSummary.abstain} abstain
            </p>
          </div>
        ) : null}

        <ImpactFundVoteActions
          proposalId={proposal.id}
          status={proposal.status}
          userVote={proposal.userVote}
          amountRequested={proposal.amountRequested}
          canManage={canManageImpactFund(user.role)}
          canVote={canVoteImpactFund(user.role)}
        />
      </div>
    </ShellPage>
  );
}
