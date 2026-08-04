import Link from "next/link";
import { notFound } from "next/navigation";

import { CricutProjectPanels } from "@/components/cricut/cricut-project-panels";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { CRICUT_PROJECT_DIFFICULTY_LABELS } from "@/config/cricut-projects";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canListCricutProjectForSale,
  getCricutProjectBuild,
  getCricutProjectIdea,
} from "@/services/cricut-project-service";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function CricutProjectDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const { view } = await searchParams;

  const idea = await getCricutProjectIdea(id);
  if (!idea) {
    notFound();
  }

  const [build, canList] = await Promise.all([
    getCricutProjectBuild(user.id, idea.id),
    canListCricutProjectForSale(user.id, user.role),
  ]);

  return (
    <ShellPage
      title={idea.title}
      description={idea.summary}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/projects">All projects</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Shop</Link>}
          />
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-md bg-[#DB2777]/10 px-2 py-0.5 font-medium text-[#DB2777]">
          {CRICUT_PROJECT_DIFFICULTY_LABELS[idea.difficulty]}
        </span>
        {idea.dollarStoreTag ? (
          <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
            {idea.dollarStoreTag}
          </span>
        ) : null}
        {idea.timeMinutes ? (
          <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
            About {idea.timeMinutes} min
          </span>
        ) : null}
        {idea.isStarter ? (
          <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
            Starter idea
          </span>
        ) : null}
      </div>

      <CricutProjectPanels
        idea={idea}
        build={build}
        canList={canList}
        initialView={view === "sell" ? "sell" : "make"}
      />
    </ShellPage>
  );
}
