"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BadgeCheck } from "lucide-react";

import {
  COMMUNITY_CATEGORY_META,
  COMMUNITY_CATEGORY_ORDER,
  getPartnerHref,
} from "@/config/partners";
import type { CommunityCategory } from "@/generated/prisma/client";
import type { PartnerCategoryGroup, PartnerListItem } from "@/services/partner-service";

type PartnerDirectoryProps = {
  groups: PartnerCategoryGroup[];
  partners?: PartnerListItem[];
  activeCategory?: CommunityCategory | null;
  basePath?: string;
};

export function PartnerDirectory({
  groups,
  partners = [],
  activeCategory = null,
  basePath = "/community-partners",
}: PartnerDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setCategory(category: CommunityCategory | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={activeCategory === null}
          onClick={() => setCategory(null)}
          label="All categories"
        />
        {COMMUNITY_CATEGORY_ORDER.map((category) => {
          const meta = COMMUNITY_CATEGORY_META[category];
          return (
            <FilterChip
              key={category}
              active={activeCategory === category}
              onClick={() => setCategory(category)}
              label={`${meta.emoji} ${meta.label}`}
            />
          );
        })}
      </div>

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.category} aria-labelledby={`partner-group-${group.category}`}>
              <div className="mb-4 space-y-1">
                <h2
                  id={`partner-group-${group.category}`}
                  className="text-lg font-semibold text-[#0A2342] dark:text-white"
                >
                  {group.emoji} {group.label}
                </h2>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.partners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : partners.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No community partners found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different category filter or check back after new partners are approved.
          </p>
        </div>
      )}
    </div>
  );
}

function PartnerCard({ partner }: { partner: PartnerListItem }) {
  const href = getPartnerHref(partner.slug, partner.partnerType);
  const categoryMeta = partner.communityCategory
    ? COMMUNITY_CATEGORY_META[partner.communityCategory]
    : null;

  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-[#0A2342] group-hover:text-[#2F80ED] dark:text-white">
              {categoryMeta ? `${categoryMeta.emoji} ` : ""}
              {partner.name}
            </p>
            {partner.schoolApproved ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
                <BadgeCheck className="size-3" aria-hidden="true" />
                School approved
              </span>
            ) : null}
          </div>
          {partner.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{partner.description}</p>
          ) : null}
          {partner.opportunityCount > 0 ? (
            <p className="text-xs text-[#2F80ED]">
              {partner.opportunityCount} open opportunit
              {partner.opportunityCount === 1 ? "y" : "ies"}
            </p>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED]">
          View partner
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-[#2F80ED] bg-[#2F80ED]/10 text-[#2F80ED]"
          : "border-border bg-card text-muted-foreground hover:border-[#2F80ED]/40"
      }`}
    >
      {label}
    </button>
  );
}
