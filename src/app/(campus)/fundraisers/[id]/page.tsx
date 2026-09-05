import Link from "next/link";
import { notFound } from "next/navigation";

import { CampusCampaignDetails } from "@/components/fundraisers/campus-campaign-details";
import { CampusCampaignManageActions } from "@/components/fundraisers/campus-campaign-manage-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { bannerToFormValues } from "@/lib/club-finance";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canPostCampusCampaign,
  getCampusCampaign,
  isClubFundraiserStorageConfigured,
} from "@/services/club-finance-service";

export default async function FundraiserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const campaign = await getCampusCampaign(id);

  if (!campaign) {
    notFound();
  }

  const canManage = await canPostCampusCampaign(
    user.id,
    user.role,
    campaign.organizationId,
  );

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
      {canManage ? (
        <div className="mt-6 border-t border-border pt-6">
          <CampusCampaignManageActions
            campaign={bannerToFormValues(campaign)}
            storageConfigured={isClubFundraiserStorageConfigured()}
            returnTo="campus"
          />
        </div>
      ) : null}
    </ShellPage>
  );
}
