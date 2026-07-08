import Link from "next/link";
import { redirect } from "next/navigation";

import { ImpactFundVoteActions } from "@/components/impact-fund/impact-fund-vote-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageImpactFund } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { IMPACT_FUND_STATUS_LABELS } from "@/lib/mvp/constants";
import {
  formatCurrency,
  getImpactFundSummary,
  listAllProposals,
} from "@/services/impact-fund-service";

export default async function AdminImpactFundPage() {
  const user = await requireCompleteProfile();

  if (!canManageImpactFund(user.role)) {
    redirect("/impact-fund");
  }

  const [summary, proposals] = await Promise.all([
    getImpactFundSummary(),
    listAllProposals(),
  ]);

  return (
    <ShellPage title="Manage Impact Fund" description="Review proposals, open voting, and allocate campus micro-grants.">
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Metric label="Balance" value={formatCurrency(summary.balanceCents)} />
        <Metric label="Allocated" value={formatCurrency(summary.allocatedCents)} />
        <Metric label="Awaiting review" value={String(summary.openProposals)} />
        <Metric label="Open voting" value={String(summary.votingProposals)} />
      </div>

      <ul className="mt-8 space-y-3">
        {proposals.map((proposal) => (
          <li key={proposal.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/impact-fund/${proposal.id}`} className="font-medium hover:underline">
                  {proposal.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(proposal.amountRequested)} · {IMPACT_FUND_STATUS_LABELS[proposal.status]} ·{" "}
                  {proposal.submitterName}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ImpactFundVoteActions
                proposalId={proposal.id}
                status={proposal.status}
                userVote={null}
                amountRequested={proposal.amountRequested}
                canManage
                canVote={false}
              />
            </div>
          </li>
        ))}
      </ul>
    </ShellPage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
