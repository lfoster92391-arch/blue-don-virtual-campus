import Link from "next/link";
import { Megaphone } from "lucide-react";

import { CampusCampaignForm } from "@/components/fundraisers/campus-campaign-form";
import { CampusCampaignManageActions } from "@/components/fundraisers/campus-campaign-manage-actions";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { bannerToFormValues } from "@/lib/club-finance";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canPostCampusCampaign,
  isClubFundraiserStorageConfigured,
  listPostableOrganizations,
  listPublicCampusCampaigns,
} from "@/services/club-finance-service";

export const metadata = {
  title: "Fundraisers",
  description:
    "School, club, and class fundraisers posted for the whole Madonna community.",
};

export default async function FundraisersPage() {
  const user = await requireCompleteProfile();
  const [campaigns, hosts] = await Promise.all([
    listPublicCampusCampaigns({ take: 24 }),
    listPostableOrganizations(user.id, user.role),
  ]);

  const canPost =
    hosts.length > 0 &&
    (await canPostCampusCampaign(user.id, user.role, hosts[0].id));
  const manageableOrgIds = new Set(hosts.map((host) => host.id));
  const storageConfigured = isClubFundraiserStorageConfigured();

  return (
    <ShellPage
      title="Campus fundraisers"
      description="Posted for everybody — school home, Fan & Family, and this desk. Officers and faculty can add a flyer, prices, and the order window."
    >
      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No public fundraisers are up right now.
        </p>
      ) : (
        <ul className="grid gap-3">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="space-y-3">
              <Link
                href={campaign.href}
                className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
              >
                {campaign.flyerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={campaign.flyerUrl}
                    alt=""
                    className="size-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#2F80ED]/10 text-[#2F80ED]">
                    <Megaphone className="size-5" aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2F80ED]">
                    {campaign.kindLabel}
                  </p>
                  <p className="mt-1 font-semibold text-[#0A2342] dark:text-white">
                    {campaign.headline}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.organizationName}
                    {campaign.pricesText ? ` · ${campaign.pricesText}` : ""}
                  </p>
                </div>
              </Link>
              {manageableOrgIds.has(campaign.organizationId) ? (
                <CampusCampaignManageActions
                  campaign={bannerToFormValues(campaign)}
                  storageConfigured={storageConfigured}
                  returnTo="campus"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canPost ? (
        <DashboardCard
          title="Post a fundraiser or event"
          description="This title goes on school home and Fan & Family for everyone."
        >
          <CampusCampaignForm
            hosts={hosts}
            returnTo="campus"
            storageConfigured={storageConfigured}
          />
        </DashboardCard>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href="/home">Back to school home</Link>}
      />
    </ShellPage>
  );
}
