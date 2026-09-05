"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCricutCart } from "@/components/cricut/cricut-cart-context";
import { Button } from "@/components/ui/button";
import {
  cricutFontFamily,
  summarizeCricutCustomization,
} from "@/config/cricut-customization";
import {
  CRICUT_PICKUP,
  CRICUT_SHIPPING,
  CRICUT_SHIP_FROM,
  formatShopPrice,
  shippingCentsFor,
} from "@/config/cricut-shop";
import {
  placeCricutOrderAction,
  type CricutShopActionState,
} from "@/features/cricut-shop/actions";

const initialState: CricutShopActionState = {};

export function CricutCheckoutForm({
  defaultContactName = "",
  defaultContactEmail = "",
}: {
  defaultContactName?: string;
  defaultContactEmail?: string;
}) {
  const cart = useCricutCart();
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "SHIP">("PICKUP");
  const [state, formAction, pending] = useActionState(
    placeCricutOrderAction,
    initialState,
  );

  const shippingCents = shippingCentsFor(fulfillment);
  const totalCents = cart.subtotalCents + shippingCents;

  useEffect(() => {
    if (state.orderId) {
      cart.clear();
      router.push(`/cricut/orders/${state.orderId}`);
    }
  }, [state.orderId, cart, router]);

  if (cart.lines.length === 0 && !state.orderId) {
    return (
      <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
        <p className="font-medium">Your cart is empty</p>
        <Button
          className="mt-4"
          size="sm"
          nativeButton={false}
          render={<Link href="/cricut/shop">Browse Cricut Shop</Link>}
        />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="cartJson"
        value={JSON.stringify(
          cart.lines.map((l) => ({
            itemId: l.itemId,
            quantity: l.quantity,
            sportSlug: l.sportSlug,
            printName: l.printName,
            fontKey: l.fontKey,
            designImageUrl: l.designImageUrl,
            designStoragePath: l.designStoragePath,
            size: l.size,
            buyerNote: l.buyerNote,
          })),
        )}
      />

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Items &amp; customization</h2>
        <ul className="space-y-3 text-sm">
          {cart.lines.map((line) => {
            const summary = summarizeCricutCustomization({
              sportSlug: line.sportSlug,
              printName: line.printName,
              fontKey: line.fontKey,
              hasDesign: Boolean(line.designImageUrl),
              size: line.size,
              buyerNote: line.buyerNote,
            });
            return (
              <li key={line.lineKey} className="flex gap-3">
                {line.designImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.designImageUrl}
                    alt=""
                    className="size-12 rounded-md object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {line.quantity}× {line.title}
                  </p>
                  {line.printName ? (
                    <p
                      className="truncate text-lg leading-none text-[#0A2342] dark:text-white"
                      style={{ fontFamily: cricutFontFamily(line.fontKey) }}
                    >
                      {line.printName}
                    </p>
                  ) : null}
                  {summary ? (
                    <p className="text-xs text-muted-foreground">{summary}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No personalization on this line
                    </p>
                  )}
                </div>
                <span className="shrink-0">
                  {formatShopPrice(line.priceCents * line.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Contact</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Name</span>
            <input
              name="contactName"
              required
              defaultValue={defaultContactName}
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="Your name"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="contactEmail"
              type="email"
              defaultValue={defaultContactEmail}
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="you@madonna.edu"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Phone</span>
            <input
              name="contactPhone"
              type="tel"
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="Optional"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Fulfillment</legend>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-[#DB2777] has-[:checked]:bg-[#DB2777]/5">
          <input
            type="radio"
            name="fulfillment"
            value="PICKUP"
            checked={fulfillment === "PICKUP"}
            onChange={() => setFulfillment("PICKUP")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{CRICUT_PICKUP.label}</span>
            <span className="block text-sm text-muted-foreground">
              {CRICUT_PICKUP.blurb}
            </span>
            <span className="mt-1 block text-sm font-semibold text-[#2E8B57]">
              Free
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-[#DB2777] has-[:checked]:bg-[#DB2777]/5">
          <input
            type="radio"
            name="fulfillment"
            value="SHIP"
            checked={fulfillment === "SHIP"}
            onChange={() => setFulfillment("SHIP")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Ship to address</span>
            <span className="block text-sm text-muted-foreground">
              {CRICUT_SHIPPING.label} · {CRICUT_SHIPPING.estimatedDays}
            </span>
            <span className="mt-1 block text-sm font-semibold">
              +{formatShopPrice(CRICUT_SHIPPING.standardFlatCents)}
            </span>
          </span>
        </label>
      </fieldset>

      {fulfillment === "SHIP" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Ships from {CRICUT_SHIP_FROM.label}
          </p>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Full name</span>
            <input
              name="shipName"
              required
              defaultValue={defaultContactName}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Address line 1</span>
            <input
              name="shipLine1"
              required
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-medium">Address line 2</span>
            <input
              name="shipLine2"
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">City</span>
            <input
              name="shipCity"
              required
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">State</span>
            <input
              name="shipState"
              required
              maxLength={2}
              placeholder="WV"
              className="rounded-md border border-border bg-background px-3 py-2 uppercase"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">ZIP</span>
            <input
              name="shipPostal"
              required
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
        </div>
      ) : null}

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Pickup / ship notes</span>
        <textarea
          name="notes"
          rows={2}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Pickup window, locker, porch instructions…"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Extra customization notes</span>
        <textarea
          name="customizationNotes"
          rows={3}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Anything not covered on the line — colors, wrap notes…"
        />
      </label>

      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatShopPrice(cart.subtotalCents)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Shipping</span>
          <span>
            {shippingCents === 0 ? "Free" : formatShopPrice(shippingCents)}
          </span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatShopPrice(totalCents)}</span>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending order…" : "Submit order"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}
    </form>
  );
}
