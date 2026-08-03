"use client";

import { useTransition } from "react";

import {
  deleteWishlistItemAction,
  toggleWishlistItemAction,
} from "@/features/wishlist/actions";
import { Button } from "@/components/ui/button";

export function WishlistItemActions({
  itemId,
  fulfilled,
}: {
  itemId: string;
  fulfilled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="xs"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await toggleWishlistItemAction(itemId, !fulfilled);
          })
        }
      >
        {fulfilled ? "Mark needed" : "Mark fulfilled"}
      </Button>
      <Button
        size="xs"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteWishlistItemAction(itemId);
          })
        }
      >
        Remove
      </Button>
    </div>
  );
}
