import { ExternalLink, UtensilsCrossed } from "lucide-react";

import {
  FUEL_THE_DONS_BLURB,
  FUEL_THE_DONS_HOST,
  FUEL_THE_DONS_NAME,
  FUEL_THE_DONS_URL,
} from "@/config/fuel-the-dons";
import { cn } from "@/lib/utils";

/** Inline text link — for prose and lists. */
export function FuelTheDonsLink({ label }: { label?: string }) {
  return (
    <a
      href={FUEL_THE_DONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-[#2F80ED] underline underline-offset-4"
    >
      {label ?? FUEL_THE_DONS_NAME}
      <ExternalLink className="size-3.5" aria-hidden="true" />
      <span className="sr-only">(opens {FUEL_THE_DONS_HOST} in a new tab)</span>
    </a>
  );
}

/**
 * The standing lunch entry point. One row, clearly marked as leaving campus,
 * used anywhere a student or parent would have looked for a lunch menu.
 */
export function FuelTheDonsRow({
  className,
  description = FUEL_THE_DONS_BLURB,
}: {
  className?: string;
  description?: string;
}) {
  return (
    <a
      href={FUEL_THE_DONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-colors hover:border-[#2F80ED]/40",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2E8B57]/10 text-[#2E8B57]">
        <UtensilsCrossed className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#0A2342] dark:text-white">
            Lunch menu &amp; ordering
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <ExternalLink className="size-3" aria-hidden="true" />
            {FUEL_THE_DONS_HOST}
          </span>
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
      <span className="text-sm font-semibold text-[#2F80ED] group-hover:underline">
        Open {FUEL_THE_DONS_NAME}
      </span>
    </a>
  );
}
