"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";

import { useCricutCart } from "@/components/cricut/cricut-cart-context";
import {
  CricutCustomizationFields,
  type CricutCustomizationDraft,
} from "@/components/cricut/cricut-customization-fields";
import { Button } from "@/components/ui/button";
import {
  CRICUT_DEFAULT_PRINT_FONT,
  sanitizeCricutPrintName,
} from "@/config/cricut-customization";
import { formatShopPrice } from "@/config/cricut-shop";
import { uploadCricutCustomDesignAction } from "@/features/cricut-shop/actions";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";
import type { CricutShopItemView } from "@/services/cricut-shop-service";

export function CricutBuyActions({
  item,
  storageConfigured,
}: {
  item: CricutShopItemView;
  storageConfigured?: boolean;
}) {
  const cart = useCricutCart();
  const router = useRouter();
  const sold = item.status === "SOLD";
  const showcaseOnly = !item.availableToSell;
  const canOrder = !sold && !showcaseOnly;
  const designInputRef = useRef<HTMLInputElement>(null);
  const photoGuard = useUploadGuard({ inputRef: designInputRef });
  const [custom, setCustom] = useState<CricutCustomizationDraft>({
    sportSlug: "",
    printName: "",
    fontKey: CRICUT_DEFAULT_PRINT_FONT,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photosReady = storageConfigured ?? true;

  async function buildCartPayload() {
    const printName = sanitizeCricutPrintName(custom.printName);
    let designImageUrl: string | null = null;
    let designStoragePath: string | null = null;
    const file = designInputRef.current?.files?.[0];
    if (file && file.size > 0) {
      if (photoGuard.error) {
        throw new Error(photoGuard.error);
      }
      const formData = new FormData();
      formData.set("photo", file);
      const uploaded = await uploadCricutCustomDesignAction({}, formData);
      if (uploaded.error || !uploaded.imageUrl) {
        throw new Error(uploaded.error ?? "Unable to upload the custom design.");
      }
      designImageUrl = uploaded.imageUrl;
      designStoragePath = uploaded.storagePath ?? null;
    }

    return {
      itemId: item.id,
      title: item.title,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
      sportSlug: custom.sportSlug || null,
      printName,
      fontKey: item.customizable ? custom.fontKey : null,
      designImageUrl,
      designStoragePath,
    };
  }

  async function handleAddToCart() {
    setError(null);
    setBusy(true);
    try {
      cart.addItem(await buildCartPayload(), 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add to cart.");
    } finally {
      setBusy(false);
    }
  }

  async function handleOrderNow() {
    setError(null);
    setBusy(true);
    try {
      cart.replaceWithBuyNow(await buildCartPayload(), 1);
      router.push("/cricut/checkout?buyNow=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setBusy(false);
    }
  }

  if (sold) {
    return (
      <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        This item has been sold.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold text-[#0A2342] dark:text-white">
        {formatShopPrice(item.priceCents)}
      </p>

      {item.customizable ? (
        <CricutCustomizationFields
          value={custom}
          onChange={setCustom}
          designInputRef={designInputRef}
          photoGuard={photoGuard}
          storageConfigured={photosReady}
          idPrefix={`cricut-item-${item.id}`}
        />
      ) : null}

      {showcaseOnly ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Catalog showcase — not currently available to order. Your
          customization stays here so you can copy it onto a design idea, or
          use it when this item goes on sale.
        </p>
      ) : null}

      {canOrder ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            size="lg"
            disabled={busy || photoGuard.preparing}
            onClick={() => void handleAddToCart()}
          >
            <ShoppingBag className="size-4" />
            {busy ? "Saving…" : "Add to cart"}
          </Button>
          <Button
            className="flex-1"
            size="lg"
            variant="outline"
            disabled={busy || photoGuard.preparing}
            onClick={() => void handleOrderNow()}
          >
            <Zap className="size-4" />
            Order now
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<a href="/cricut/designs">Submit a design idea</a>}
        />
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {canOrder ? (
        <p className="text-xs text-muted-foreground">
          Customization rides with the cart into checkout — Cricut crew sees
          sport, name, font, and any uploaded design. Pickup at Madonna is
          free · shipping from Weirton is extra.
        </p>
      ) : null}
    </div>
  );
}
