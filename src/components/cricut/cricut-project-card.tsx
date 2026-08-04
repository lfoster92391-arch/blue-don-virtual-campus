import Link from "next/link";
import { Clock, Scissors } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CRICUT_PROJECT_DIFFICULTY_LABELS,
  cricutProjectMargin,
} from "@/config/cricut-projects";
import { formatShopPrice } from "@/config/cricut-shop";
import type { CricutProjectIdeaView } from "@/services/cricut-project-service";

export function CricutProjectCard({
  idea,
  started,
}: {
  idea: CricutProjectIdeaView;
  started?: boolean;
}) {
  const { profitCents } = cricutProjectMargin(
    idea.estimatedCostCents,
    idea.suggestedSellPriceCents,
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-[#DB2777]/40">
      <div className="relative aspect-[5/2] w-full overflow-hidden bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5">
        {idea.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={idea.imageUrl}
            alt={idea.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Scissors className="size-8 opacity-40" aria-hidden="true" />
          </div>
        )}
        {started ? (
          <span className="absolute right-2 top-2 rounded-md bg-[#2E8B57]/90 px-2 py-0.5 text-xs font-medium text-white">
            On my list
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-md bg-[#DB2777]/10 px-2 py-0.5 font-medium text-[#DB2777]">
            {CRICUT_PROJECT_DIFFICULTY_LABELS[idea.difficulty]}
          </span>
          {idea.dollarStoreTag ? (
            <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
              {idea.dollarStoreTag}
            </span>
          ) : null}
          {idea.timeMinutes ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3" aria-hidden="true" />
              {idea.timeMinutes} min
            </span>
          ) : null}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold leading-snug">{idea.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {idea.summary}
          </p>
        </div>

        <dl className="mt-auto grid grid-cols-3 gap-2 rounded-lg bg-muted/50 px-3 py-2 text-center text-xs">
          <div>
            <dt className="text-muted-foreground">Costs</dt>
            <dd className="font-semibold">
              {formatShopPrice(idea.estimatedCostCents)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sells for</dt>
            <dd className="font-semibold text-[#DB2777]">
              {formatShopPrice(idea.suggestedSellPriceCents)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Profit</dt>
            <dd className="font-semibold text-[#2E8B57]">
              {formatShopPrice(profitCents)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/cricut/projects/${idea.id}`}>Make this</Link>
            }
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/cricut/projects/${idea.id}?view=sell`}>
                Sell this
              </Link>
            }
          />
        </div>
      </div>
    </article>
  );
}
