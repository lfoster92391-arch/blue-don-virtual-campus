import Link from "next/link";
import { redirect } from "next/navigation";

import { ImpactFundProposalForm } from "@/components/impact-fund/impact-fund-proposal-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canProposeImpactFund } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAcademies } from "@/services/event-service";

export default async function NewImpactFundProposalPage() {
  const user = await requireCompleteProfile();

  if (!canProposeImpactFund(user.role)) {
    redirect("/impact-fund");
  }

  const academies = await listAcademies();

  return (
    <ShellPage
      title="Submit Impact Fund Proposal"
      description="Propose a campus or academy project for community review and funding."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/impact-fund">Back to Impact Fund</Link>} />
      <div className="mt-6 max-w-xl rounded-xl border border-border bg-card p-5">
        <ImpactFundProposalForm academies={academies} />
      </div>
    </ShellPage>
  );
}
