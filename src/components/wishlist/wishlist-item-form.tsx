"use client";

import { useActionState } from "react";

import { createWishlistItemAction } from "@/features/wishlist/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WishlistItemFormProps = {
  academyId?: string;
  academySlug?: string;
  organizationId?: string;
  organizationSlug?: string;
};

export function WishlistItemForm({
  academyId,
  academySlug,
  organizationId,
  organizationSlug,
}: WishlistItemFormProps) {
  const [state, formAction, pending] = useActionState(createWishlistItemAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-dashed border-border bg-muted/30 p-4">
      {academyId ? <input type="hidden" name="academyId" value={academyId} /> : null}
      {academySlug ? <input type="hidden" name="academySlug" value={academySlug} /> : null}
      {organizationId ? <input type="hidden" name="organizationId" value={organizationId} /> : null}
      {organizationSlug ? (
        <input type="hidden" name="organizationSlug" value={organizationSlug} />
      ) : null}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Item name
        </label>
        <Input id="title" name="title" required placeholder="Wireless microphone" />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Quantity, size, or why the class needs this."
          className="min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          Link
        </label>
        <Input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://www.amazon.com/... or any store link"
        />
        <p className="text-xs text-muted-foreground">
          Paste an Amazon wishlist/product link or any custom URL for families and sponsors.
        </p>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add to wishlist"}
      </Button>
    </form>
  );
}
