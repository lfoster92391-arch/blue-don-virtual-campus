"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusVariant = "default" | "success" | "warning" | "info";

type DashboardCardProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: { label: string; variant?: StatusVariant };
  actions?: React.ReactNode;
  progress?: { value: number; label: string };
  expandable?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
};

const statusStyles: Record<StatusVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-[#2E8B57]/10 text-[#2E8B57]",
  warning: "bg-[#D4A017]/10 text-[#D4A017]",
  info: "bg-[#2F80ED]/10 text-[#2F80ED]",
};

export function DashboardCard({
  title,
  description,
  icon,
  status,
  actions,
  progress,
  expandable = false,
  defaultExpanded = true,
  children,
  className,
}: DashboardCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[#0A2342] dark:text-white">
                {title}
              </h2>
              {status ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    statusStyles[status.variant ?? "default"],
                  )}
                >
                  {status.label}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          {expandable ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse section" : "Expand section"}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </Button>
          ) : null}
        </div>
      </header>

      {progress ? (
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress.label}</span>
            <span>{progress.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#2F80ED] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
        </div>
      ) : null}

      {expanded ? (
        <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
      ) : null}
    </article>
  );
}
