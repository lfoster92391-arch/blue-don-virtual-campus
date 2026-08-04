import Link from "next/link";
import { Sparkles } from "lucide-react";

import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CricutProjectCard } from "@/components/cricut/cricut-project-card";
import { CricutProjectIdeaForm } from "@/components/cricut/cricut-project-idea-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CRICUT_CLUB_SLUG } from "@/config/cricut-shop";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  CRICUT_BUILD_STATUS_LABELS,
  canManageCricutProjects,
  listCricutProjectBuildsForUser,
  listCricutProjectIdeas,
} from "@/services/cricut-project-service";
import { getCricutAmazonWishlistUrl } from "@/services/cricut-shop-service";

export default async function CricutProjectsPage() {
  const user = await requireCompleteProfile();
  const [ideas, builds, wishlistUrl, canManage] = await Promise.all([
    listCricutProjectIdeas({ includeInactive: false }),
    listCricutProjectBuildsForUser(user.id),
    getCricutAmazonWishlistUrl(),
    canManageCricutProjects(user.id, user.role),
  ]);

  const startedIdeaIds = new Set(
    builds.filter((build) => build.status !== "ABANDONED").map((b) => b.ideaId),
  );
  const activeBuilds = builds.filter(
    (build) => build.status === "PLANNED" || build.status === "IN_PROGRESS",
  );

  return (
    <ShellPage
      title="Easy cheap creations"
      description="Dollar-store Cricut projects — what you need, how to make it, what it costs, and what it sells for."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut">Hub</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Shop</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/organizations/${CRICUT_CLUB_SLUG}`}>Club home</Link>
            }
          />
        </div>
      }
    >
      <CricutAmazonWishlistBanner url={wishlistUrl} className="mb-6" compact />

      {activeBuilds.length > 0 ? (
        <DashboardCard
          title="On my make list"
          description="Projects you started — pick up where you left off."
          className="mb-8"
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {activeBuilds.slice(0, 6).map((build) => (
              <li key={build.id}>
                <Link
                  href={`/cricut/projects/${build.ideaId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-[#DB2777]/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {build.ideaTitle}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {CRICUT_BUILD_STATUS_LABELS[build.status]} ·{" "}
                      {build.completedSteps.length}/{build.stepCount} steps
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-[#DB2777]">
                    Open
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Project options</h2>
            <p className="text-sm text-muted-foreground">
              {ideas.length} cheap builds
            </p>
          </div>

          {ideas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              No projects in the catalog yet — officers can add the first one.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ideas.map((idea) => (
                <li key={idea.id}>
                  <CricutProjectCard
                    idea={idea}
                    started={startedIdeaIds.has(idea.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage ? (
          <aside className="h-fit rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-[#DB2777]" aria-hidden="true" />
              Add a project
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">
              President / VP — supplies, steps, cost, and sell price
            </p>
            <CricutProjectIdeaForm />
          </aside>
        ) : null}
      </div>
    </ShellPage>
  );
}
