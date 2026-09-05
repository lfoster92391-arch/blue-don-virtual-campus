import Link from "next/link";
import { Megaphone } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ShopComingSoonButton } from "@/components/shop/shop-coming-soon-button";
import { Button } from "@/components/ui/button";
import { LOGIN_COPY } from "@/config/login-audience";
import { siteConfig } from "@/config/site";
import { listPublicCampusCampaigns } from "@/services/club-finance-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fundraisers",
  description: "School, club, and class fundraisers for Madonna families.",
};

export default async function GuestFundraisersPage() {
  const campaigns = await listPublicCampusCampaigns({ take: 24 });

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
              render={<Link href="/guest">Fan & Family</Link>}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A2342] dark:text-white">
            Campus fundraisers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Posted for families — flyers, prices, and order windows.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No public fundraisers are up right now.
          </p>
        ) : (
          <ul className="grid gap-3">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href={`/guest/fundraisers/${campaign.id}`}
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
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
