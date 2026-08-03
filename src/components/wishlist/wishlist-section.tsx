import { ExternalLink, Gift } from "lucide-react";

import { WishlistItemActions } from "@/components/wishlist/wishlist-item-actions";
import { WishlistItemForm } from "@/components/wishlist/wishlist-item-form";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import type { WishlistItemView } from "@/services/wishlist-service";

type WishlistSectionProps = {
  title?: string;
  description?: string;
  items: WishlistItemView[];
  canManage: boolean;
  academyId?: string;
  academySlug?: string;
  organizationId?: string;
  organizationSlug?: string;
};

export function WishlistSection({
  title = "Class wishlist",
  description = "Supplies and resources families can support. Links may point to Amazon or any approved store.",
  items,
  canManage,
  academyId,
  academySlug,
  organizationId,
  organizationSlug,
}: WishlistSectionProps) {
  const needed = items.filter((item) => !item.fulfilled);
  const fulfilled = items.filter((item) => item.fulfilled);

  return (
    <section id="wishlist" className="scroll-mt-24">
      <DashboardCard
        title={title}
        description={description}
        icon={<Gift className="size-4" aria-hidden="true" />}
      >
        {needed.length === 0 && fulfilled.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No wishlist items yet.
            {canManage ? " Add Amazon or custom links below." : ""}
          </p>
        ) : (
          <ul className="space-y-3">
            {needed.map((item) => (
              <WishlistRow key={item.id} item={item} canManage={canManage} />
            ))}
            {fulfilled.length > 0 ? (
              <li className="pt-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fulfilled
                </p>
                <ul className="space-y-3 opacity-80">
                  {fulfilled.map((item) => (
                    <WishlistRow key={item.id} item={item} canManage={canManage} />
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
        )}

        {canManage ? (
          <div className="mt-6">
            <WishlistItemForm
              academyId={academyId}
              academySlug={academySlug}
              organizationId={organizationId}
              organizationSlug={organizationSlug}
            />
          </div>
        ) : null}
      </DashboardCard>
    </section>
  );
}

function WishlistRow({
  item,
  canManage,
}: {
  item: WishlistItemView;
  canManage: boolean;
}) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{item.title}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            {item.linkType === "AMAZON" ? "Amazon" : "Link"}
          </span>
          {item.fulfilled ? (
            <span className="rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
              Fulfilled
            </span>
          ) : null}
        </div>
        {item.description ? (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        ) : null}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#2F80ED] hover:underline"
        >
          View item
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
      {canManage ? <WishlistItemActions itemId={item.id} fulfilled={item.fulfilled} /> : null}
    </li>
  );
}
