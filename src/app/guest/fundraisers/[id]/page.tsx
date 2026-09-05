import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { CampusCampaignDetails } from "@/components/fundraisers/campus-campaign-details";
import { ShopComingSoonButton } from "@/components/shop/shop-coming-soon-button";
import { Button } from "@/components/ui/button";
import { LOGIN_COPY } from "@/config/login-audience";
import { siteConfig } from "@/config/site";
import { getCampusCampaign } from "@/services/club-finance-service";

export const dynamic = "force-dynamic";

export default async function GuestFundraiserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampusCampaign(id, { publicOnly: true });

  if (!campaign) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" size="sm" href="/guest" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
                {siteConfig.institution}
              </p>
              <p className="text-sm font-medium text-[#0A2342] dark:text-white">
                {LOGIN_COPY.guestLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="action"
              size="lg"
              className="h-11"
              nativeButton={false}
              render={<Link href="/madonna/participate">Participate</Link>}
            />
            <ShopComingSoonButton size="lg" className="h-11" />
            <Button
              variant="outline"
              size="lg"
              className="h-11"
              nativeButton={false}
              render={<Link href="/guest/fundraisers">All fundraisers</Link>}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <CampusCampaignDetails campaign={campaign} guest />
      </main>
    </div>
  );
}
