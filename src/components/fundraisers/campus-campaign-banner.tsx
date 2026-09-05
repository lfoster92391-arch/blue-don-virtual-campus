import Link from "next/link";
import { CalendarClock, MapPin, Megaphone, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CampusCampaignBannerView } from "@/lib/club-finance";
import { cn } from "@/lib/utils";

function formatWhen(iso: string | null, withTime = false): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function orderWindowLabel(campaign: CampusCampaignBannerView): string | null {
  const opens = formatWhen(campaign.orderOpensAt, true);
  const closes = formatWhen(campaign.orderClosesAt, true);
  if (opens && closes) {
    return `Order ${opens} – ${closes}`;
  }
  if (closes) {
    return `Order by ${closes}`;
  }
  if (opens) {
    return `Ordering opens ${opens}`;
  }
  return null;
}

export function CampusCampaignBanner({
  campaigns,
  guest = false,
  className,
}: {
  campaigns: CampusCampaignBannerView[];
  guest?: boolean;
  className?: string;
}) {
  if (campaigns.length === 0) {
    return null;
  }

  const featured = campaigns[0];
  const rest = campaigns.slice(1, 3);

  return (
    <section
      aria-label="Campus fundraisers and events"
      className={cn(
        "overflow-hidden rounded-2xl border border-[#2F80ED]/35 bg-gradient-to-br from-[#2F80ED]/12 via-card to-[#0A2342]/5 shadow-sm",
        className,
      )}
    >
      <CampaignHeadline campaign={featured} guest={guest} featured />
      {rest.length > 0 ? (
        <ul className="divide-y divide-[#2F80ED]/15 border-t border-[#2F80ED]/20">
          {rest.map((campaign) => (
            <li key={campaign.id}>
              <CampaignHeadline campaign={campaign} guest={guest} />
            </li>
          ))}
        </ul>
      ) : null}
      {campaigns.length > 1 && !guest ? (
        <div className="border-t border-[#2F80ED]/20 px-5 py-3 sm:px-6">
          <Link
            href="/fundraisers"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            See all campus fundraisers
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function CampaignHeadline({
  campaign,
  guest,
  featured = false,
}: {
  campaign: CampusCampaignBannerView;
  guest: boolean;
  featured?: boolean;
}) {
  const windowLabel = orderWindowLabel(campaign);
  const arrives = formatWhen(campaign.arrivesAt);
  const detailHref = guest ? campaign.linkUrl : campaign.href;
  const orderHref = campaign.linkUrl;

  return (
    <article
      className={
        featured
          ? "flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:gap-6 sm:px-6 sm:py-6"
          : "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
      }
    >
      {campaign.flyerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.flyerUrl}
          alt=""
          className={
            featured
              ? "h-40 w-full rounded-xl object-cover sm:h-36 sm:w-36"
              : "h-20 w-full rounded-lg object-cover sm:h-16 sm:w-16"
          }
        />
      ) : (
        <span
          className={
            featured
              ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#2F80ED]/15 text-[#2F80ED]"
              : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2F80ED]/15 text-[#2F80ED]"
          }
          aria-hidden="true"
        >
          <Megaphone className={featured ? "size-6" : "size-4"} />
        </span>
      )}

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F80ED]">
          {campaign.kindLabel}
          {campaign.organizationName ? ` · ${campaign.organizationName}` : ""}
        </p>
        {detailHref ? (
          <h2
            className={
              featured
                ? "text-2xl font-semibold tracking-tight text-[#0A2342] dark:text-white sm:text-3xl"
                : "text-lg font-semibold text-[#0A2342] dark:text-white"
            }
          >
            <Link href={detailHref} className="hover:underline">
              {campaign.headline}
            </Link>
          </h2>
        ) : (
          <h2
            className={
              featured
                ? "text-2xl font-semibold tracking-tight text-[#0A2342] dark:text-white sm:text-3xl"
                : "text-lg font-semibold text-[#0A2342] dark:text-white"
            }
          >
            {campaign.headline}
          </h2>
        )}

        {featured && campaign.raisingFor ? (
          <p className="text-sm text-muted-foreground">
            Raising for {campaign.raisingFor}
          </p>
        ) : null}
        {featured && campaign.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {campaign.description}
          </p>
        ) : null}
        {featured && campaign.pricesText ? (
          <p className="text-sm font-medium text-[#0A2342] dark:text-white">
            {campaign.pricesText}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {windowLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {windowLabel}
            </span>
          ) : null}
          {arrives ? (
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5" aria-hidden="true" />
              Arrives {arrives}
            </span>
          ) : null}
          {campaign.pickupLocation ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {campaign.pickupLocation}
            </span>
          ) : null}
        </div>
      </div>

      {orderHref || (!guest && campaign.href) ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          {orderHref ? (
            <Button
              size={featured ? "lg" : "sm"}
              nativeButton={false}
              render={
                <Link href={orderHref} target="_blank" rel="noopener noreferrer">
                  Order / open link
                </Link>
              }
            />
          ) : null}
          {!guest ? (
            <Button
              size={featured ? "lg" : "sm"}
              variant={orderHref ? "outline" : "default"}
              nativeButton={false}
              render={<Link href={campaign.href}>Details</Link>}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
