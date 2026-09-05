"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCricutCart } from "@/components/cricut/cricut-cart-context";
import { Button } from "@/components/ui/button";
import {
  cricutFontFamily,
  cricutSportLabel,
  summarizeCricutCustomization,
} from "@/config/cricut-customization";
import { formatShopPrice } from "@/config/cricut-shop";

export function CricutCartView() {
  const cart = useCricutCart();

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 font-medium">Cart is empty</p>
        <Button
          className="mt-4"
          size="sm"
          nativeButton={false}
          render={<Link href="/cricut/shop">Shop Cricut Club</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {cart.lines.map((line) => {
          const summary = summarizeCricutCustomization({
            sportSlug: line.sportSlug,
            printName: line.printName,
            fontKey: line.fontKey,
            hasDesign: Boolean(line.designImageUrl),
          });
          return (
            <li
              key={line.lineKey}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
            >
              {line.designImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={line.designImageUrl}
                  alt=""
                  className="size-14 rounded-md object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{line.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatShopPrice(line.priceCents)} each
                </p>
                {line.printName ? (
                  <p
                    className="mt-1 truncate text-lg leading-none text-[#0A2342] dark:text-white"
                    style={{ fontFamily: cricutFontFamily(line.fontKey) }}
                  >
                    {line.printName}
                  </p>
                ) : null}
                {summary ? (
                  <p className="mt-1 text-xs text-muted-foreground">{summary}</p>
                ) : null}
                {cricutSportLabel(line.sportSlug) && !summary ? (
                  <p className="text-xs text-muted-foreground">
                    {cricutSportLabel(line.sportSlug)}
                  </p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm">
                Qty
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={line.quantity}
                  onChange={(e) =>
                    cart.setQty(line.lineKey, Number(e.target.value) || 1)
                  }
                  className="w-16 rounded-md border border-border bg-background px-2 py-1"
                />
              </label>
              <p className="w-20 text-right font-semibold">
                {formatShopPrice(line.priceCents * line.quantity)}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => cart.removeItem(line.lineKey)}
              >
                Remove
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-lg font-semibold">
          Subtotal {formatShopPrice(cart.subtotalCents)}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/cricut/checkout">Checkout</Link>}
        />
      </div>
    </div>
  );
}
