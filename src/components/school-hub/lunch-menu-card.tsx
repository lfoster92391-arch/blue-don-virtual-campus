import { Leaf, UtensilsCrossed } from "lucide-react";

import type { HubLunch } from "@/services/school-hub-service";

type LunchMenuCardProps = {
  lunch: HubLunch;
};

function LunchDetail({
  menu,
  compact = false,
}: {
  menu: NonNullable<HubLunch["today"]>;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
        {menu.entree}
      </p>
      <p className="text-sm text-muted-foreground">{menu.sides.join(" · ")}</p>
      {!compact ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
            <Leaf className="size-3" aria-hidden="true" />
            {menu.vegetarian}
          </span>
          <span className="rounded-full bg-[#D4A017]/10 px-2 py-0.5 text-xs font-medium text-[#D4A017]">
            {menu.dessert}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function LunchMenuCard({ lunch }: LunchMenuCardProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
          Today&apos;s lunch
        </p>
        {lunch.today ? (
          <LunchDetail menu={lunch.today} />
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">
            <UtensilsCrossed className="size-4" aria-hidden="true" />
            Cafeteria closed today.
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tomorrow
        </p>
        {lunch.tomorrow ? (
          <LunchDetail menu={lunch.tomorrow} compact />
        ) : (
          <p className="text-sm text-muted-foreground">
            {lunch.tomorrowIsWeekend
              ? "No service — weekend."
              : "Menu to be announced."}
          </p>
        )}
      </div>
    </div>
  );
}
