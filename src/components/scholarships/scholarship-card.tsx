import Link from "next/link";
import { ArrowRight, Calendar, ExternalLink } from "lucide-react";

import { SCHOLARSHIP_CATEGORY_LABELS } from "@/config/scholarships";
import type { ScholarshipMatch } from "@/lib/scholarship";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScholarshipCardProps = {
  scholarship: ScholarshipMatch;
  showMatch?: boolean;
};

function formatDeadline(deadline: string): string {
  const date = new Date(`${deadline}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ScholarshipCardView({ scholarship, showMatch = true }: ScholarshipCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
              scholarship.category === "local"
                ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                : "bg-[#2F80ED]/10 text-[#2F80ED]",
            )}
          >
            {SCHOLARSHIP_CATEGORY_LABELS[scholarship.category]}
          </span>
          <h3 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            {scholarship.title}
          </h3>
          <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
        </div>

        {showMatch && scholarship.qualifies ? (
          <div className="shrink-0 space-y-1 text-right">
            <div className="rounded-xl bg-[#C9A227]/15 px-3 py-2 text-center">
              <p className="text-lg font-bold text-[#0A2342] dark:text-white">
                {scholarship.matchScore}%
              </p>
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Match
              </p>
            </div>
            <span className="inline-flex rounded-full bg-[#2E8B57]/15 px-2 py-0.5 text-xs font-semibold text-[#2E8B57]">
              You qualify
            </span>
          </div>
        ) : showMatch ? (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Review requirements
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-2xl font-bold text-[#C9A227]">{scholarship.amountLabel}</p>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {scholarship.description}
      </p>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="size-4 shrink-0" aria-hidden="true" />
          <span>
            Deadline:{" "}
            <span className="font-medium text-foreground">{formatDeadline(scholarship.deadline)}</span>
          </span>
        </div>
      </dl>

      {showMatch && scholarship.qualifies && scholarship.matchReasons.length > 0 ? (
        <div className="mt-4 rounded-lg bg-[#2E8B57]/5 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E8B57]">
            Why you qualify
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {scholarship.matchReasons.slice(0, 3).map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={scholarship.detailHref}>View details</Link>}
        />
        {scholarship.qualifies ? (
          <Button
            size="sm"
            nativeButton={false}
            render={
              <a href={scholarship.externalUrl} target="_blank" rel="noopener noreferrer">
                Apply now
                <ExternalLink className="size-4" />
              </a>
            }
          />
        ) : (
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={
              <Link href={scholarship.detailHref}>
                See requirements
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        )}
      </div>
    </article>
  );
}
