"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BadgeCheck } from "lucide-react";

import {
  BUSINESS_CATEGORY_META,
  COMMUNITY_CATEGORY_META,
  getPartnerHref,
  PARTNER_TYPE_LABELS,
} from "@/config/partners";
import type { PartnerType } from "@/generated/prisma/client";
import type { PartnerListItem } from "@/services/partner-service";

type PartnerBrowseTabsProps = {
  activeType: PartnerType;
  businessPartners: PartnerListItem[];
  communityPartners: PartnerListItem[];
};

export function PartnerBrowseTabs({
  activeType,
  businessPartners,
  communityPartners,
}: PartnerBrowseTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setType(type: PartnerType) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type.toLowerCase());
    router.push(`/partners?${params.toString()}`);
  }

  const partners = activeType === "BUSINESS" ? businessPartners : communityPartners;

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
        {(["BUSINESS", "COMMUNITY"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setType(type)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeType === type
                ? "bg-card text-[#0A2342] shadow-sm dark:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {PARTNER_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {activeType === "COMMUNITY" ? (
        <p className="text-sm text-muted-foreground">
          Browse by category on the{" "}
          <Link href="/community-partners" className="font-medium text-[#2F80ED] hover:underline">
            Community Partners directory
          </Link>
          .
        </p>
      ) : null}

      {partners.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <li key={partner.id}>
              <Link
                href={getPartnerHref(partner.slug, partner.partnerType)}
                className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-[#0A2342] group-hover:text-[#2F80ED] dark:text-white">
                      {getCategoryLabel(partner)}
                      {partner.name}
                    </p>
                    {partner.schoolApproved ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
                        <BadgeCheck className="size-3" aria-hidden="true" />
                        Approved
                      </span>
                    ) : null}
                  </div>
                  {partner.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {partner.description}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED]">
                  View partner
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No {PARTNER_TYPE_LABELS[activeType].toLowerCase()} partners yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approved partners will appear here after school review.
          </p>
        </div>
      )}
    </div>
  );
}

function getCategoryLabel(partner: PartnerListItem): string {
  if (partner.communityCategory) {
    const meta = COMMUNITY_CATEGORY_META[partner.communityCategory];
    return `${meta.emoji} `;
  }
  if (partner.businessCategory) {
    const meta = BUSINESS_CATEGORY_META[partner.businessCategory];
    return `${meta.emoji} `;
  }
  return "";
}
