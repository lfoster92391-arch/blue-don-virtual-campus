"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  updateCricutWishlistUrlAction,
  type CricutShopActionState,
} from "@/features/cricut-shop/actions";

const initialState: CricutShopActionState = {};

export function CricutWishlistSettingsForm({
  currentUrl,
}: {
  currentUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateCricutWishlistUrlAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Amazon wishlist URL</span>
        <input
          name="amazonWishlistUrl"
          type="url"
          defaultValue={currentUrl ?? ""}
          placeholder="https://www.amazon.com/hz/wishlist/ls/…"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Shown on Cricut landings (overview, shop, hub). Leave blank to use{" "}
        <code className="rounded bg-muted px-1">CRICUT_AMAZON_WISHLIST_URL</code>{" "}
        if set.
      </p>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save wishlist URL"}
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
