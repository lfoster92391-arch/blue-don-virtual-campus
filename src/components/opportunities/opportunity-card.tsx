import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, MapPin } from "lucide-react";

import {
  formatOpportunityDeadline,
  isOpportunityDeadlinePassed,
  OPPORTUNITY_TYPE_LABELS,
  type Opportunity,
} from "@/config/opportunities";
import { ExpressInterestButton } from "@/components/opportunities/express-interest-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OpportunityCardProps = {
  opportunity: Opportunity;
};

const PAY_STYLES: Record<Opportunity["pay"], string> = {
  paid: "bg-[#2E8B57]/10 text-[#2E8B57]",
  stipend: "bg-[#C9A227]/15 text-[#C9A227]",
  unpaid: "bg-muted text-muted-foreground",
};

export function OpportunityCardView({ opportunity }: OpportunityCardProps) {
  const closed = isOpportunityDeadlinePassed(opportunity.deadline);
  const detailHref = `/opportunities/${opportunity.id}`;

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[#2F80ED]/10 px-2.5 py-0.5 text-xs font-medium text-[#2F80ED]">
              {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                PAY_STYLES[opportunity.pay],
              )}
            >
              {opportunity.payLabel}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            {opportunity.title}
          </h3>
        </div>
      </div>

      <dl className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="font-medium text-foreground">{opportunity.organization}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span>{opportunity.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className={cn(closed && "text-destructive")}>
            {closed ? "Closed" : formatOpportunityDeadline(opportunity.deadline)}
          </span>
        </div>
      </dl>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {opportunity.description}
      </p>

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {opportunity.commitment} · Grade {opportunity.gradeMin}+
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={
            <Link href={detailHref}>
              View details
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <ExpressInterestButton opportunityId={opportunity.id} size="sm" />
      </div>
    </article>
  );
}
