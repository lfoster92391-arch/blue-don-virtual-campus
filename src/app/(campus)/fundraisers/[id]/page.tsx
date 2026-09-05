import Link from "next/link";
import { notFound } from "next/navigation";

import { CampusCampaignDetails } from "@/components/fundraisers/campus-campaign-details";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getCampusCampaign } from "@/services/club-finance-service";

export default async function FundraiserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCompleteProfile();
  const { id } = await params;
  const campaign = await getCampusCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <ShellPage
      title={campaign.headline}
      description={`${campaign.organizationName} · ${campaign.kindLabel}`}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/fundraisers">All fundraisers</Link>}
        />
      }
    >
      <CampusCampaignDetails campaign={campaign} />
    </ShellPage>
  );
}
