import Link from "next/link";
import { Calendar, CheckCircle2, ExternalLink, XCircle } from "lucide-react";

import { SCHOLARSHIP_CATEGORY_LABELS } from "@/config/scholarships";
import type { ScholarshipMatch } from "@/lib/scholarship";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScholarshipDetailHeroProps = {
  match: ScholarshipMatch;
};

function formatDeadline(deadline: string): string {
  const date = new Date(`${deadline}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function RequirementItem({
  label,
  met,
  detail,
}: {
  label: string;
  met: boolean;
  detail?: string;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2E8B57]" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className={cn(met ? "text-foreground" : "text-muted-foreground")}>
        {label}
        {detail ? <span className="block text-xs text-muted-foreground">{detail}</span> : null}
      </span>
    </li>
  );
}

export function ScholarshipDetailHero({ match }: ScholarshipDetailHeroProps) {
  const req = match.requirements;
  const requirements: { label: string; met: boolean; detail?: string }[] = [];

  if (req.gradeMin !== undefined) {
    requirements.push({
      label: `Grade ${req.gradeMin}+ required`,
      met: match.qualifies || match.matchReasons.some((r) => r.includes("grade")),
    });
  }

  if (req.gpaMin !== undefined) {
    requirements.push({
      label: `Minimum GPA: ${req.gpaMin}`,
      met: match.matchReasons.some((r) => r.toLowerCase().includes("gpa")),
    });
  }

  if (req.classOf?.length) {
    requirements.push({
      label: `Class of ${req.classOf.join(", ")}`,
      met: match.matchReasons.some((r) => r.includes("Class of")),
    });
  }

  if (req.clubs?.length) {
    requirements.push({
      label: `Club membership: ${req.clubs.join(", ")}`,
      met: match.matchReasons.some((r) => r.includes("You are in")),
    });
  }

  if (req.serviceHoursMin !== undefined) {
    requirements.push({
      label: `At least ${req.serviceHoursMin} service hours`,
      met: match.matchReasons.some((r) => r.includes("service hours")),
    });
  }

  if (req.athletics) {
    requirements.push({
      label: "Madonna athletics participation",
      met: match.matchReasons.some((r) => r.includes("athlete") || r.includes("compete")),
    });
  }

  if (req.faith) {
    requirements.push({
      label: "Faith-based campus involvement",
      met: match.matchReasons.some((r) => r.includes("faith")),
    });
  }

  if (req.stem) {
    requirements.push({
      label: "STEM academy or club involvement",
      met: match.matchReasons.some((r) => r.toLowerCase().includes("stem") || r.includes("academy")),
    });
  }

  if (req.leadership) {
    requirements.push({
      label: "Campus leadership role",
      met: match.matchReasons.some((r) => r.includes("leadership")),
    });
  }

  if (req.essayRequired) {
    requirements.push({
      label: "Personal essay required",
      met: true,
      detail: "Prepare your essay before applying.",
    });
  }

  return (
    <div className="space-y-6">
      <section
        className={cn(
          "rounded-xl border p-6",
          match.qualifies
            ? "border-[#2E8B57]/40 bg-gradient-to-br from-[#2E8B57]/10 via-[#C9A227]/5 to-transparent"
            : "border-border bg-muted/20",
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-[#2F80ED]/10 px-2.5 py-0.5 text-xs font-medium text-[#2F80ED]">
              {SCHOLARSHIP_CATEGORY_LABELS[match.category]}
            </span>
            <h2 className="text-2xl font-bold text-[#0A2342] dark:text-white">{match.title}</h2>
            <p className="text-sm text-muted-foreground">{match.provider}</p>
            <p className="text-3xl font-bold text-[#C9A227]">{match.amountLabel}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {match.description}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" aria-hidden="true" />
              Deadline: {formatDeadline(match.deadline)}
            </p>
          </div>

          {match.qualifies ? (
            <div className="shrink-0 space-y-3 lg:text-right">
              <div className="inline-flex rounded-xl bg-[#C9A227]/15 px-4 py-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#0A2342] dark:text-white">
                    {match.matchScore}%
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Match
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[#2E8B57]">Good News — You qualify!</p>
              <Button
                size="lg"
                className="bg-[#2E8B57] hover:bg-[#2E8B57]/90"
                nativeButton={false}
                render={
                  <a href={match.externalUrl} target="_blank" rel="noopener noreferrer">
                    Apply Now
                    <ExternalLink className="size-4" />
                  </a>
                }
              />
            </div>
          ) : (
            <div className="shrink-0 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Review the requirements below to see what you can work toward.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Requirements checklist
          </h3>
          <ul className="mt-4 space-y-3">
            {requirements.length > 0 ? (
              requirements.map((item) => (
                <RequirementItem
                  key={item.label}
                  label={item.label}
                  met={item.met}
                  detail={item.detail}
                />
              ))
            ) : (
              <li className="text-sm text-muted-foreground">Open to eligible Madonna students.</li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {match.qualifies ? "You qualify because…" : "How to qualify"}
          </h3>
          {match.qualifies ? (
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {match.matchReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span className="text-[#2E8B57]">✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {match.matchReasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/scholarships">Back to Scholarship Center</Link>}
            />
            {match.qualifies ? (
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <a href={match.externalUrl} target="_blank" rel="noopener noreferrer">
                    Apply on provider site
                    <ExternalLink className="size-4" />
                  </a>
                }
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
