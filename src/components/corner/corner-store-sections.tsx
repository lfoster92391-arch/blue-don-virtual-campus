import Link from "next/link";
import { Plus, ShoppingBag, Store, Tag } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ItemCard } from "@/components/corner/item-card";
import { ListingForm } from "@/components/corner/listing-form";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/config/corner-store";
import type { CornerStoreItemView } from "@/services/corner-store-service";

type CornerStoreSectionsProps = {
  items: CornerStoreItemView[];
  myItems: CornerStoreItemView[];
  canList: boolean;
  storageConfigured: boolean;
  organizations: { id: string; name: string }[];
};

export function CornerStoreSections({
  items,
  myItems,
  canList,
  storageConfigured,
  organizations,
}: CornerStoreSectionsProps) {
  return (
    <>
      {canList ? (
        <DashboardCard
          title="Sell an item"
          description="Snap a photo, set your price, and reach the whole campus."
          icon={<Plus className="size-5" />}
          status={{ label: "New listing", variant: "info" }}
          expandable
          defaultExpanded={myItems.length === 0 && items.length === 0}
        >
          <ListingForm
            storageConfigured={storageConfigured}
            organizations={organizations}
          />
        </DashboardCard>
      ) : (
        <DashboardCard
          title="Welcome to Blue Don Corner"
          description="The campus marketplace for spirit wear, tickets, and student goods."
          icon={<Store className="size-5" />}
        >
          <p className="text-sm text-muted-foreground">
            Browse listings below. Students, clubs, and staff can post items to sell —
            sign in with a student or staff account to list your own.
          </p>
        </DashboardCard>
      )}

      <DashboardCard
        title="Marketplace"
        description="Everything students and clubs are selling right now."
        icon={<ShoppingBag className="size-5" />}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
              <Tag className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">The corner is quiet… for now</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                No items are listed yet. {canList ? "Be the first to post something for the campus." : "Check back soon as students and clubs add listings."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </DashboardCard>

      {canList && myItems.length > 0 ? (
        <DashboardCard
          title="My listings"
          description="Items you've posted to the corner."
          icon={<Tag className="size-5" />}
        >
          <ul className="divide-y divide-border">
            {myItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.priceCents)} ·{" "}
                    <span className="capitalize">{item.status.toLowerCase()}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/corner/${item.id}`}>View</Link>}
                />
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}
    </>
  );
}
