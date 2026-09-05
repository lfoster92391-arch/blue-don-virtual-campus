import Link from "next/link";
import { CalendarClock, Mail, MapPin, Package, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CampusCampaignBannerView } from "@/lib/club-finance";

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
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

export function CampusCampaignDetails({
  campaign,
  guest = false,
}: {
  campaign: CampusCampaignBannerView;
  guest?: boolean;
}) {
  const opens = formatWhen(campaign.orderOpensAt, true);
  const closes = formatWhen(campaign.orderClosesAt, true);
  const arrives = formatWhen(campaign.arrivesAt);

  return (
    <article className="space-y-5">
      {campaign.flyerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.flyerUrl}
          alt=""
          className="max-h-[28rem] w-full rounded-2xl object-cover"
        />
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F80ED]">
          {campaign.kindLabel}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#0A2342] dark:text-white">
          {campaign.headline}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hosted by{" "}
          {guest ? (
            <span className="font-medium">{campaign.organizationName}</span>
          ) : (
            <Link
              href={`/organizations/${campaign.organizationSlug}`}
              className="font-medium text-[#2F80ED] hover:underline"
            >
              {campaign.organizationName}
            </Link>
          )}
        </p>
      </div>

      {campaign.raisingFor ? (
        <p className="text-sm">
          <span className="font-medium">Raising for: </span>
          {campaign.raisingFor}
        </p>
      ) : null}
      {campaign.description ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {campaign.description}
        </p>
      ) : null}
      {campaign.pricesText ? (
        <p className="text-sm font-medium">{campaign.pricesText}</p>
      ) : null}

      <dl className="grid gap-3 sm:grid-cols-2">
        {opens ? (
          <div className="rounded-xl border border-border p-3">
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Ordering opens
            </dt>
            <dd className="mt-1 text-sm font-medium">{opens}</dd>
          </div>
        ) : null}
        {closes ? (
          <div className="rounded-xl border border-border p-3">
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Ordering closes
            </dt>
            <dd className="mt-1 text-sm font-medium">{closes}</dd>
          </div>
        ) : null}
        {arrives ? (
          <div className="rounded-xl border border-border p-3">
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Package className="size-3.5" aria-hidden="true" />
              Arrives
            </dt>
            <dd className="mt-1 text-sm font-medium">{arrives}</dd>
          </div>
        ) : null}
        {campaign.pickupLocation ? (
          <div className="rounded-xl border border-border p-3">
            <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              Pickup
            </dt>
            <dd className="mt-1 text-sm font-medium">{campaign.pickupLocation}</dd>
          </div>
        ) : null}
      </dl>

      {campaign.contactName || campaign.contactEmail || campaign.contactPhone ? (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="font-medium">Contact</p>
          {campaign.contactName ? (
            <p className="mt-1">{campaign.contactName}</p>
          ) : null}
          {campaign.contactEmail ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground">
              <Mail className="size-3.5" aria-hidden="true" />
              <a
                href={`mailto:${campaign.contactEmail}`}
                className="text-[#2F80ED] hover:underline"
              >
                {campaign.contactEmail}
              </a>
            </p>
          ) : null}
          {campaign.contactPhone ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5" aria-hidden="true" />
              <a
                href={`tel:${campaign.contactPhone}`}
                className="text-[#2F80ED] hover:underline"
              >
                {campaign.contactPhone}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      {campaign.linkUrl ? (
        <Button
          nativeButton={false}
          render={
            <Link href={campaign.linkUrl} target="_blank" rel="noopener noreferrer">
              Order / open link
            </Link>
          }
        />
      ) : null}
    </article>
  );
}
