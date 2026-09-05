import Link from "next/link";

import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CricutListingForm } from "@/components/cricut/cricut-listing-form";
import { CricutProductCard } from "@/components/cricut/cricut-product-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { CRICUT_CLUB_SLUG, CRICUT_SHIPPING } from "@/config/cricut-shop";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canCreateCricutListing,
  canManageCricutShop,
  getCricutAmazonWishlistUrl,
  getCricutOrganization,
  isCricutShopStorageConfigured,
  listCricutShopItems,
} from "@/services/cricut-shop-service";
import { CRICUT_SHOP_ITEM_KINDS } from "@/config/cricut-product-kinds";
import {
  setCricutItemKindAction,
  toggleCricutItemCustomizableAction,
  toggleCricutItemSellableAction,
} from "@/features/cricut-shop/actions";
import { ShoppingBag } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ ordered?: string }>;
};

export default async function CricutShopPage({ searchParams }: PageProps) {
  const user = await requireCompleteProfile();
  const { ordered } = await searchParams;
  const [items, org, wishlistUrl] = await Promise.all([
    listCricutShopItems({ manageView: true }),
    getCricutOrganization(),
    getCricutAmazonWishlistUrl(),
  ]);

  const canSell = org
    ? await canCreateCricutListing(user.id, user.role, org.id)
    : false;
  const canManage = org
    ? await canManageCricutShop(user.id, user.role, org.id)
    : false;

  const catalogItems = items.filter(
    (i) => i.status === "ACTIVE" || canManage,
  );

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
            render={<Link href="/cricut">Hub</Link>}
          />
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
      <CricutAmazonWishlistBanner url={wishlistUrl} className="mb-6" compact />

      {ordered ? (
        <p className="mb-6 rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/10 px-4 py-3 text-sm text-[#2E8B57]">
          Order placed.{" "}
          <Link
            href={`/cricut/orders/${ordered}`}
            className="font-medium underline"
          >
            Track progress
          </Link>
        </p>
      ) : null}

      <p className="mb-6 text-sm text-muted-foreground">
        Shipping is extra: {CRICUT_SHIPPING.label} (
        {(CRICUT_SHIPPING.standardFlatCents / 100).toFixed(2)} USD flat ·{" "}
        {CRICUT_SHIPPING.estimatedDays}). Pickup at Madonna is free.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          {catalogItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              No items listed yet.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalogItems.map((item) => (
                <li key={item.id} className="space-y-2">
                  <CricutProductCard item={item} />
                  {canSell && !item.isSample && !item.imageUrl ? (
                    <Button
                      size="sm"
                      className="w-full"
                      nativeButton={false}
                      render={<Link href={`/cricut/shop/${item.id}`}>Add photo</Link>}
                    />
                  ) : null}
                  {canManage && !item.isSample ? (
                    <div className="grid gap-2">
                      <form action={setCricutItemKindAction} className="grid gap-1">
                        <input type="hidden" name="itemId" value={item.id} />
                        <select
                          name="kind"
                          defaultValue={item.kind}
                          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                        >
                          {CRICUT_SHOP_ITEM_KINDS.map((entry) => (
                            <option key={entry.key} value={entry.key}>
                              {entry.label}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="outline" className="w-full">
                          Save type
                        </Button>
                      </form>
                      <form action={toggleCricutItemSellableAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input
                          type="hidden"
                          name="availableToSell"
                          value={item.availableToSell ? "false" : "true"}
                        />
                        <Button type="submit" size="sm" variant="outline" className="w-full">
                          {item.availableToSell
                            ? "Mark showcase only"
                            : "Make available to sell"}
                        </Button>
                      </form>
                      <form action={toggleCricutItemCustomizableAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input
                          type="hidden"
                          name="customizable"
                          value={item.customizable ? "false" : "true"}
                        />
                        <Button type="submit" size="sm" variant="outline" className="w-full">
                          {item.customizable
                            ? "Turn off customization"
                            : "Allow customization"}
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {canSell ? (
          <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="size-4 text-[#DB2777]" />
              Add a product
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground">
              Members &amp; officers — product type, photo, price, sell
              toggle, and customization
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
