import Link from "next/link";
import { notFound } from "next/navigation";

import { PortfolioPublishButton } from "@/components/portfolio/portfolio-publish-button";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_TYPE_LABELS } from "@/lib/mvp/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getPortfolioItem } from "@/services/portfolio-service";

type PortfolioDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const item = await getPortfolioItem(id, user.id);

  if (!item) {
    notFound();
  }

  return (
    <ShellPage title={item.title} description={PORTFOLIO_TYPE_LABELS[item.type]}>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/portfolio">Back to portfolio</Link>} />
        {item.status === "DRAFT" ? <PortfolioPublishButton itemId={item.id} /> : null}
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Status</dt>
          <dd className="mt-1 capitalize">{item.status.toLowerCase()}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Points</dt>
          <dd className="mt-1">{item.points}</dd>
        </div>
        {item.academy ? (
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Academy</dt>
            <dd className="mt-1">
              <Link href={`/academies/${item.academy.slug}`} className="text-[#2F80ED] hover:underline">
                {item.academy.name}
              </Link>
            </dd>
          </div>
        ) : null}
        {item.event ? (
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Linked event</dt>
            <dd className="mt-1">
              <Link href={`/events/${item.event.id}`} className="text-[#2F80ED] hover:underline">
                {item.event.title}
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>

      {item.description ? (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      ) : null}

      {item.evidenceUrl ? (
        <p className="mt-4">
          <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="text-sm text-[#2F80ED] hover:underline">
            View evidence
          </a>
        </p>
      ) : null}
    </ShellPage>
  );
}
