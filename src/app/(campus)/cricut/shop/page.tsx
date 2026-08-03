import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CricutListingForm } from "@/components/cricut/cricut-listing-form";
import { CricutProductCard } from "@/components/cricut/cricut-product-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { CRICUT_CLUB_SLUG, CRICUT_SHIPPING } from "@/config/cricut-shop";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageCricutShop,
  getCricutOrganization,
  isCricutShopStorageConfigured,
  listCricutShopItems,
} from "@/services/cricut-shop-service";

type PageProps = {
  searchParams: Promise<{ ordered?: string }>;
};

export default async function CricutShopPage({ searchParams }: PageProps) {
  const user = await requireCompleteProfile();
  const { ordered } = await searchParams;
  const [items, org] = await Promise.all([
    listCricutShopItems(),
    getCricutOrganization(),
  ]);

  const canSell = org
    ? await canManageCricutShop(user.id, user.role, org.id)
    : false;

  return (
    <ShellPage
      title="Cricut Club Shop"
      description="Handmade spirit wear and maker goods — pickup at Madonna or ship from Weirton, WV."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/cart">Cart</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/organizations/${CRICUT_CLUB_SLUG}`}>
                Club home
              </Link>
            }
          />
        </div>
      }
    >
      {ordered ? (
        <p className="mb-6 rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/10 px-4 py-3 text-sm text-[#2E8B57]">
          Order placed ({ordered.slice(0, 8)}…). Cricut Club will confirm
          pickup or shipment.
        </p>
      ) : null}

      <p className="mb-6 text-sm text-muted-foreground">
        Shipping is extra: {CRICUT_SHIPPING.label} (
        {(CRICUT_SHIPPING.standardFlatCents / 100).toFixed(2)} USD flat ·{" "}
        {CRICUT_SHIPPING.estimatedDays}). Pickup at Madonna is free.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              No items listed yet.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <li key={item.id}>
                  <CricutProductCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {canSell ? (
          <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="size-4 text-[#DB2777]" />
              Sell an item
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">
              Leads, officers, advisors, and admins
            </p>
            <CricutListingForm
              storageConfigured={isCricutShopStorageConfigured()}
            />
          </aside>
        ) : null}
      </div>
    </ShellPage>
  );
}
