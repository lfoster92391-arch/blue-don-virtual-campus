"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageDropdownProps = {
  id?: string;
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/**
 * In-place labeled dropdown. Stays on the page (native details/summary) —
 * not a hover mega-menu that disappears.
 */
export function PageDropdown({
  id,
  title,
  description,
  eyebrow,
  actions,
  children,
  defaultOpen = false,
  className,
}: PageDropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <details
      id={id}
      className={cn(
        "group scroll-mt-24 rounded-2xl border border-border bg-card/70 shadow-sm",
        className,
      )}
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4 sm:items-center sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1 space-y-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="text-lg font-semibold tracking-tight text-[#0A2342] dark:text-white"
          >
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[#0A2342] dark:text-white">
          <ChevronDown
            className="size-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </span>
      </summary>
      {actions ? (
        <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-5">{actions}</div>
      ) : null}
      <div className="border-t border-border px-4 py-4 sm:px-5">{children}</div>
    </details>
  );
}
