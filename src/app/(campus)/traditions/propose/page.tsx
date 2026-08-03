import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TraditionProposeForm } from "@/components/culture/tradition-propose-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getApprovedTraditionProposals } from "@/services/madonna-culture-service";

export default function TraditionProposePage() {
  const approved = getApprovedTraditionProposals();

  return (
    <ShellPage
      title="Traditions Builder"
      description="Propose new campus traditions and explore the approved archive."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/traditions">
              <ArrowLeft className="size-3.5" />
              Traditions Hub
            </Link>
          }
        />
      }
    >
      <TraditionProposeForm approvedProposals={approved} />
    </ShellPage>
  );
}
