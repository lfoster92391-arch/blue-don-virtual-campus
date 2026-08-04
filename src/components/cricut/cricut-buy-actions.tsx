"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";

import { useCricutCart } from "@/components/cricut/cricut-cart-context";
import { Button } from "@/components/ui/button";
import { formatShopPrice } from "@/config/cricut-shop";
import type { CricutShopItemView } from "@/services/cricut-shop-service";

export function CricutBuyActions({ item }: { item: CricutShopItemView }) {
  const cart = useCricutCart();
  const router = useRouter();
  const sold = item.status === "SOLD";
  const showcaseOnly = !item.availableToSell;

  if (sold) {
    return (
      <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        This item has been sold.
      </p>
    );
  }

  if (showcaseOnly) {
    return (
      <div className="space-y-3">
        <p className="text-2xl font-bold text-[#0A2342] dark:text-white">
          {formatShopPrice(item.priceCents)}
        </p>
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Catalog showcase — not currently available to order. Submit a design
          idea if you’d like something similar made.
        </p>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<a href="/cricut/designs">Submit a design idea</a>}
        />
      </div>
    );
  }

  const payload = {
    itemId: item.id,
    title: item.title,
    priceCents: item.priceCents,
    imageUrl: item.imageUrl,
  };

  return (
    <div className="space-y-3">
      <p className="text-2xl font-bold text-[#0A2342] dark:text-white">
        {formatShopPrice(item.priceCents)}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1"
          size="lg"
          onClick={() => {
            cart.addItem(payload, 1);
          }}
        >
          <ShoppingBag className="size-4" />
          Add to cart
        </Button>
        <Button
          className="flex-1"
          size="lg"
          variant="outline"
          onClick={() => {
            cart.replaceWithBuyNow(payload, 1);
            router.push("/cricut/checkout?buyNow=1");
          }}
        >
          <Zap className="size-4" />
          Order now
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Fill the order form at checkout — Cricut crew gets a Command Center
        alert. Pickup at Madonna is free · shipping from Weirton is extra.
      </p>
    </div>
  );
}
