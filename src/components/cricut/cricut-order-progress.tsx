import { Check } from "lucide-react";

import {
  CRICUT_ORDER_PROGRESS_STEPS,
  orderProgressIndex,
} from "@/config/cricut-shop";
import { cn } from "@/lib/utils";

export function CricutOrderProgress({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  if (status === "CANCELLED") {
    return (
      <p
        className={cn(
          "rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive",
          className,
        )}
      >
        This order was cancelled.
      </p>
    );
  }

  const current = orderProgressIndex(status);

  return (
    <ol
      className={cn("grid gap-2 sm:grid-cols-4", className)}
      aria-label="Order progress"
    >
      {CRICUT_ORDER_PROGRESS_STEPS.map((step, index) => {
        const done = index <= current;
        const active = index === current;
        return (
          <li
            key={step.key}
            className={cn(
              "relative flex flex-col gap-2 rounded-xl border px-3 py-3",
              done
                ? "border-[#DB2777]/40 bg-[#DB2777]/5"
                : "border-border bg-muted/20",
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                done
                  ? "bg-[#DB2777] text-white"
                  : "bg-muted text-muted-foreground",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done && index < current ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {index < CRICUT_ORDER_PROGRESS_STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute -right-1 top-6 hidden h-0.5 w-2 sm:block",
                  index < current ? "bg-[#DB2777]" : "bg-border",
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
