import Link from "next/link";
import { CircleDollarSign } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  canManageImpactFund,
  canProposeImpactFund,
  canViewImpactFund,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { IMPACT_FUND_STATUS_LABELS } from "@/lib/mvp/constants";
import {
  formatCurrency,
  getImpactFundSummary,
  listPublicProposals,
} from "@/services/impact-fund-service";
import { redirect } from "next/navigation";

export default async function ImpactFundPage() {
  const user = await requireCompleteProfile();

  if (!canViewImpactFund(user.role)) {
    redirect("/dashboard");
  }

  const [summary, proposals] = await Promise.all([
    getImpactFundSummary(),
    listPublicProposals(),
  ]);

  return (
    <ShellPage
      title="Impact Fund"
      description="Student-led micro-grants for academy projects and campus service initiatives."
    >
      <div className="flex flex-wrap gap-2">
        {canProposeImpactFund(user.role) ? (
          <Button size="sm" nativeButton={false} render={<Link href="/impact-fund/new">Submit proposal</Link>} />
        ) : null}
        {canManageImpactFund(user.role) ? (
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/impact-fund">Manage fund</Link>} />
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Fund balance" value={formatCurrency(summary.balanceCents)} />
        <Metric label="Allocated" value={formatCurrency(summary.allocatedCents)} />
        <Metric label="Available" value={formatCurrency(summary.availableCents)} />
      </div>

      {proposals.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {proposals.map((proposal) => (
            <li key={proposal.id}>
              <Link
                href={`/impact-fund/${proposal.id}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
              >
                <CircleDollarSign className="mt-0.5 size-5 text-[#0A2342] dark:text-white" />
                <div>
                  <p className="font-medium">{proposal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(proposal.amountRequested)} · {IMPACT_FUND_STATUS_LABELS[proposal.status]}
                    {proposal.academyName ? ` · ${proposal.academyName}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                  {proposal.status === "VOTING" ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {proposal.voteSummary.for} for · {proposal.voteSummary.against} against
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No proposals yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Students and advisors can submit project proposals for campus voting and funding.
          </p>
        </div>
      )}
    </ShellPage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
