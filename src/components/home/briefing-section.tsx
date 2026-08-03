import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BriefingSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Labeled daily-briefing block — one job per section, Madonna navy/gold accents. */
export function BriefingSection({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: BriefingSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-24 border-t border-[#0A2342]/10 pt-8 first:border-t-0 first:pt-0 dark:border-white/10",
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="text-xl font-semibold tracking-tight text-[#0A2342] dark:text-white"
          >
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
