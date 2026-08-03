import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";

import type { BusinessPartnerSummary } from "@/services/business-partner-service";

export function PartnerCard({ partner }: { partner: BusinessPartnerSummary }) {
  return (
    <Link
      href={`/business-partners/${partner.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#2F80ED]/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
            {partner.industry}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground group-hover:text-[#2F80ED]">
            {partner.name}
          </h2>
        </div>
        {partner.logoUrl ? (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
            <Briefcase className="size-5" />
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{partner.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {partner.address ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {partner.address.split(",")[0]}
          </span>
        ) : null}
        <span className="rounded-full bg-[#2F80ED]/10 px-2 py-0.5 font-medium text-[#2F80ED]">
          {partner.opportunityCount} opportunit{partner.opportunityCount === 1 ? "y" : "ies"}
        </span>
      </div>
    </Link>
  );
}
