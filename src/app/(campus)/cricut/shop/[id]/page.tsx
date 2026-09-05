import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageIcon } from "lucide-react";

import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CricutBuyActions } from "@/components/cricut/cricut-buy-actions";
import { CricutProductPhotoForm } from "@/components/cricut/cricut-product-photo-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { toggleCricutItemCustomizableAction } from "@/features/cricut-shop/actions";
import {
  canCreateCricutListing,
  canManageCricutShop,
  getCricutAmazonWishlistUrl,
  getCricutOrganization,
  getCricutShopItem,
  isCricutShopStorageConfigured,
} from "@/services/cricut-shop-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CricutProductPage({ params }: PageProps) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const [item, wishlistUrl, org] = await Promise.all([
    getCricutShopItem(id),
    getCricutAmazonWishlistUrl(),
    getCricutOrganization(),
  ]);

  if (!item) {
    notFound();
  }

  const canUploadPhoto =
    org && !item.isSample
      ? await canCreateCricutListing(user.id, user.role, org.id)
      : false;
  const canManage =
    org && !item.isSample
      ? await canManageCricutShop(user.id, user.role, org.id)
      : false;

  return (
    <ShellPage
      title={item.title}
      description="Cricut Club Shop"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">All items</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/cart">Cart</Link>}
          />
        </div>
      }
    >
      <CricutAmazonWishlistBanner url={wishlistUrl} className="mb-6" compact />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5">
          <div className="relative aspect-square">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-16 opacity-40" />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {item.description ? (
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No description yet.</p>
          )}
          <p className="text-sm text-muted-foreground">Listed by {item.sellerName}</p>
          <CricutBuyActions
            item={item}
            storageConfigured={isCricutShopStorageConfigured()}
          />
          {canManage ? (
            <form
              action={toggleCricutItemCustomizableAction}
              className="rounded-xl border border-border p-4"
            >
              <input type="hidden" name="itemId" value={item.id} />
              <input
                type="hidden"
                name="customizable"
                value={item.customizable ? "false" : "true"}
              />
              <p className="text-sm font-medium">
                {item.customizable
                  ? "Shoppers can customize this item"
                  : "Customization is off for this item"}
              </p>
              <Button type="submit" size="sm" className="mt-2">
                {item.customizable
                  ? "Turn off customization"
                  : "Allow customization"}
              </Button>
            </form>
          ) : null}
          {canUploadPhoto ? (
            <CricutProductPhotoForm
              itemId={item.id}
              hasImage={Boolean(item.imageUrl)}
              storageConfigured={isCricutShopStorageConfigured()}
            />
          ) : null}
        </div>
      </div>
    </ShellPage>
  );
}
