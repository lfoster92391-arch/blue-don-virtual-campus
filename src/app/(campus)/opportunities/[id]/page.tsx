import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  ListChecks,
  Mail,
  MapPin,
} from "lucide-react";

import { ExpressInterestButton } from "@/components/opportunities/express-interest-button";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  formatOpportunityDeadline,
  isOpportunityDeadlinePassed,
  OPPORTUNITY_TYPE_LABELS,
} from "@/config/opportunities";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getOpportunity } from "@/services/opportunity-service";
import { cn } from "@/lib/utils";

type OpportunityDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params;
  await requireCompleteProfile();
  const result = await getOpportunity(id);

  if (!result) {
    notFound();
  }

  const { opportunity } = result;
  const closed = isOpportunityDeadlinePassed(opportunity.deadline);

  return (
    <ShellPage
      title={opportunity.title}
      description={opportunity.organization}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/opportunities">Back to Opportunity Center</Link>}
        />
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[#2F80ED]/30 bg-gradient-to-br from-[#2F80ED]/10 via-[#C9A227]/5 to-transparent p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[#2F80ED]/10 px-2.5 py-0.5 text-xs font-medium text-[#2F80ED]">
                  {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                </span>
                <span className="inline-flex rounded-full bg-[#2E8B57]/10 px-2.5 py-0.5 text-xs font-medium text-[#2E8B57]">
                  {opportunity.payLabel}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#0A2342] dark:text-white">
                {opportunity.title}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {opportunity.description}
              </p>
              <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0" aria-hidden="true" />
                  <span className="font-medium text-foreground">{opportunity.organization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {opportunity.location}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                  <span className={cn(closed && "text-destructive")}>
                    {closed ? "Closed" : formatOpportunityDeadline(opportunity.deadline)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 shrink-0" aria-hidden="true" />
                  {opportunity.commitment} · Grade {opportunity.gradeMin}+
                </div>
              </dl>
            </div>

            <div className="flex shrink-0 flex-col gap-2 lg:items-end">
              <ExpressInterestButton opportunityId={opportunity.id} size="lg" />
              {opportunity.externalUrl ? (
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a
                      href={opportunity.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit site
                      <ExternalLink className="size-4" />
                    </a>
                  }
                />
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ListChecks className="size-4" aria-hidden="true" />
              What you&apos;d do
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {opportunity.responsibilities.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2E8B57]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              What you need
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {opportunity.requirements.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#2F80ED]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            How to apply · next steps
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {opportunity.howToApply}
          </p>
          {opportunity.contact ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>
                Follow up with{" "}
                <span className="font-medium text-foreground">{opportunity.contact.name}</span>
                {opportunity.contact.email ? (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={`mailto:${opportunity.contact.email}`}
                      className="text-[#2F80ED] underline-offset-4 hover:underline"
                    >
                      {opportunity.contact.email}
                    </a>
                  </>
                ) : null}
              </span>
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <ExpressInterestButton opportunityId={opportunity.id} size="sm" />
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/pathways">Explore related pathways</Link>}
            />
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/opportunities">Back to all opportunities</Link>}
            />
          </div>
        </section>
      </div>
    </ShellPage>
  );
}
