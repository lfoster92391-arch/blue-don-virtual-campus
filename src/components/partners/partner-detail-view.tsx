import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Globe,
  Handshake,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  COMMUNITY_CATEGORY_META,
  BUSINESS_CATEGORY_META,
  PARTNER_OPPORTUNITY_TYPE_EMOJI,
  PARTNER_OPPORTUNITY_TYPE_LABELS,
} from "@/config/partners";
import type { PartnerDetail } from "@/services/partner-service";

type PartnerDetailViewProps = {
  partner: PartnerDetail;
  backHref: string;
  backLabel: string;
};

export function PartnerDetailView({ partner, backHref, backLabel }: PartnerDetailViewProps) {
  const categoryLabel = partner.communityCategory
    ? COMMUNITY_CATEGORY_META[partner.communityCategory]
    : partner.businessCategory
      ? BUSINESS_CATEGORY_META[partner.businessCategory]
      : null;

  return (
    <div className="space-y-6">
      <Link href={backHref} className="text-sm font-medium text-[#2F80ED] hover:underline">
        ← {backLabel}
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#2F80ED]">
              {categoryLabel ? `${categoryLabel.emoji} ${categoryLabel.label}` : "Partner"}
            </p>
            <h2 className="text-2xl font-semibold text-[#0A2342] dark:text-white">{partner.name}</h2>
            {partner.description ? (
              <p className="max-w-2xl text-muted-foreground">{partner.description}</p>
            ) : null}
          </div>
          {partner.schoolApproved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2E8B57]/10 px-3 py-1 text-sm font-medium text-[#2E8B57]">
              <BadgeCheck className="size-4" aria-hidden="true" />
              School approved
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {partner.websiteUrl ? (
            <a
              href={partner.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-[#2F80ED]/40"
            >
              <Globe className="size-4" />
              Website
            </a>
          ) : null}
          {partner.contactEmail ? (
            <a
              href={`mailto:${partner.contactEmail}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-[#2F80ED]/40"
            >
              <Mail className="size-4" />
              {partner.contactEmail}
            </a>
          ) : null}
        </div>
      </div>

      {partner.opportunities.length > 0 ? (
        <DashboardCard
          title="Opportunities"
          description="Volunteer, shadow, internship, and career exploration openings."
          icon={<Handshake className="size-5" />}
        >
          <ul className="space-y-3">
            {partner.opportunities.map((opportunity) => (
              <li
                key={opportunity.id}
                className="rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {PARTNER_OPPORTUNITY_TYPE_EMOJI[opportunity.type]}{" "}
                      {opportunity.title}
                    </p>
                    <p className="text-xs text-[#2F80ED]">
                      {PARTNER_OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                    </p>
                  </div>
                  {opportunity.spots ? (
                    <span className="text-xs text-muted-foreground">
                      {opportunity.spots} spot{opportunity.spots === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
                {opportunity.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{opportunity.description}</p>
                ) : null}
                {opportunity.gradeLevels.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Grades: {opportunity.gradeLevels.join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard
          title="Contact"
          description="Reach out to coordinate visits, volunteering, or career talks."
          icon={<Building2 className="size-5" />}
        >
          <ul className="space-y-2 text-sm">
            {partner.contactName ? (
              <li className="text-foreground">{partner.contactName}</li>
            ) : null}
            {partner.contactPhone ? (
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                {partner.contactPhone}
              </li>
            ) : null}
            {partner.contactEmail ? (
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                {partner.contactEmail}
              </li>
            ) : null}
            {partner.address ? (
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                {partner.address}
              </li>
            ) : null}
          </ul>
        </DashboardCard>

        {partner.madonnaConnections.length > 0 ? (
          <DashboardCard
            title="Madonna connections"
            description="How this partner connects to campus programs and pathways."
            icon={<Handshake className="size-5" />}
          >
            <ul className="space-y-2">
              {partner.madonnaConnections.map((connection) => (
                <li key={connection} className="rounded-lg border border-border px-3 py-2 text-sm">
                  {connection}
                </li>
              ))}
            </ul>
          </DashboardCard>
        ) : null}

        {partner.serviceAreas.length > 0 ? (
          <DashboardCard
            title="Service opportunities"
            description="Ways students can serve alongside this community partner."
            icon={<Handshake className="size-5" />}
          >
            <ul className="space-y-2">
              {partner.serviceAreas.map((area) => (
                <li key={area} className="rounded-lg border border-border px-3 py-2 text-sm">
                  {area}
                </li>
              ))}
            </ul>
          </DashboardCard>
        ) : null}
      </div>
    </div>
  );
}
