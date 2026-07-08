"use client";

import { useTransition } from "react";

import { publishPortfolioItemAction } from "@/features/portfolio/actions";
import { Button } from "@/components/ui/button";

export function PortfolioPublishButton({ itemId }: { itemId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await publishPortfolioItemAction(itemId);
        })
      }
    >
      {pending ? "Publishing…" : "Publish item"}
    </Button>
  );
}
