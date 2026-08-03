import Link from "next/link";
import { Suspense } from "react";
import { GraduationCap, Sparkles } from "lucide-react";

import { ScholarshipExplorer } from "@/components/scholarships/scholarship-explorer";
import { ScholarshipGoodNewsHero } from "@/components/scholarships/scholarship-good-news-hero";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { SCHOLARSHIPS, type ScholarshipCategory } from "@/config/scholarships";
import { requireCompleteProfile } from "@/lib/auth/session";
import { maybeMarkScholarshipsInProgress } from "@/services/college-readiness-service";
import { matchScholarshipsForUser } from "@/services/scholarship-service";

type ScholarshipsPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
};

export default async function ScholarshipsPage({ searchParams }: ScholarshipsPageProps) {
  const user = await requireCompleteProfile();
  const params = await searchParams;

  await maybeMarkScholarshipsInProgress(user.id);

  const { matches, qualifiedCount } = await matchScholarshipsForUser(user.id, {
    category: params.category as ScholarshipCategory | undefined,
    search: params.search,
  });

  return (
    <ShellPage
      title="Scholarship Center"
      description="Blue Don matches your profile to local and national scholarships — grade, GPA, clubs, service, athletics, faith, and career interests."
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
            render={<Link href="/career-portfolio">Career Portfolio</Link>}
          />
        </div>
      }
    >
      <div className="space-y-8">
        <ScholarshipGoodNewsHero qualifiedCount={qualifiedCount} />

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <Sparkles className="size-5 text-[#2F80ED]" aria-hidden="true" />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{SCHOLARSHIPS.length}</span> scholarships
            in catalog ·{" "}
            <span className="font-semibold text-[#2E8B57]">{qualifiedCount}</span> matched to your
            profile
          </p>
          <GraduationCap className="ml-auto size-5 text-[#C9A227]" aria-hidden="true" />
        </div>

        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading scholarship matches…</p>
          }
        >
          <ScholarshipExplorer
            matches={matches}
            qualifiedCount={qualifiedCount}
            initialCategory={params.category}
            initialSearch={params.search}
          />
        </Suspense>
      </div>
    </ShellPage>
  );
}
