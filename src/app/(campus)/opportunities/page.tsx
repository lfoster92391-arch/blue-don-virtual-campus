import Link from "next/link";
import { Suspense } from "react";
import { Briefcase, DollarSign, Info, MapPin, Sparkles } from "lucide-react";

import { OpportunityExplorer } from "@/components/opportunities/opportunity-explorer";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import type { OpportunityType } from "@/config/opportunities";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getOpportunityCatalog } from "@/services/opportunity-service";

type OpportunitiesPageProps = {
  searchParams: Promise<{
    type?: string;
    search?: string;
  }>;
};

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  await requireCompleteProfile();
  const params = await searchParams;

  const catalog = await getOpportunityCatalog({
    type: params.type as OpportunityType | undefined,
    search: params.search,
  });

  return (
    <ShellPage
      title="Opportunity Center"
      description="Don't wait for opportunities — discover them. Internships, jobs, volunteer work, job shadows, and summer programs across the Ohio Valley, matched to Madonna students."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/pathways">Future Center</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/scholarships">Scholarships</Link>}
          />
        </div>
      }
    >
      <div className="space-y-8">
        {catalog.isSample ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/5 px-4 py-3 text-sm">
            <Info className="mt-0.5 size-5 shrink-0 text-[#C9A227]" aria-hidden="true" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Sample preview.</span> These are
              realistic Ohio Valley examples so you can see how the Opportunity Center works. The
              Future Center replaces them with the school&apos;s real partner opportunities before
              launch.
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Briefcase className="size-5 text-[#2F80ED]" aria-hidden="true" />}
            value={catalog.totalCount}
            label="Opportunities"
          />
          <StatCard
            icon={<MapPin className="size-5 text-[#2E8B57]" aria-hidden="true" />}
            value={catalog.openCount}
            label="Open now"
          />
          <StatCard
            icon={<DollarSign className="size-5 text-[#C9A227]" aria-hidden="true" />}
            value={catalog.paidCount}
            label="Paid / stipend"
          />
        </div>

        <Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading opportunities…</p>}
        >
          <OpportunityExplorer
            opportunities={catalog.opportunities}
            initialType={params.type}
            initialSearch={params.search}
          />
        </Suspense>

        <section className="rounded-xl border border-border bg-muted/20 px-5 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-[#2F80ED]" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[#0A2342] dark:text-white">
                Have an opportunity to share?
              </h2>
              <p className="text-sm text-muted-foreground">
                Employers, alumni, and staff can list internships, jobs, and shadowing through the
                Future Center and Business Partner portal. Approved postings show up here for
                students.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/business-partners">Become a partner</Link>}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/mentors">Find a mentor</Link>}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </ShellPage>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      {icon}
      <div>
        <p className="text-xl font-bold text-[#0A2342] dark:text-white">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
