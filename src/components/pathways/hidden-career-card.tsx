"use client";

import Link from "next/link";
import { ChevronDown, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";

import type { HiddenCareer } from "@/config/hidden-careers";
import { HIDDEN_CAREER_CATEGORY_LABELS } from "@/config/hidden-careers";
import { cn } from "@/lib/utils";

type HiddenCareerCardProps = {
  career: HiddenCareer;
  highlighted?: boolean;
};

export function HiddenCareerCard({ career, highlighted = false }: HiddenCareerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      id={`career-${career.id}`}
      className={cn(
        "rounded-xl border bg-card shadow-sm transition-colors",
        highlighted
          ? "border-[#D4A017] ring-2 ring-[#D4A017]/40"
          : "border-border hover:border-[#2F80ED]/30",
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[#0A2342] dark:text-white">{career.title}</h3>
            {career.isHiddenGem ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#D4A017]/15 px-2 py-0.5 text-xs font-medium text-[#9A7B0A] dark:text-[#D4A017]">
                <Sparkles className="size-3" />
                Hidden gem
              </span>
            ) : null}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {HIDDEN_CAREER_CATEGORY_LABELS[career.category]}
            </span>
          </div>
          <p className="text-sm italic text-[#2F80ED]">{career.hook}</p>
          {!expanded ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{career.whatTheyDo}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "mt-1 size-5 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What they actually do
            </h4>
            <p className="mt-1 text-sm text-foreground">{career.whatTheyDo}</p>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Why it exists here
            </h4>
            <p className="mt-1 text-sm text-foreground">{career.localDemand}</p>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Education & training
            </h4>
            <p className="mt-1 text-sm text-foreground">{career.educationRequired}</p>
          </section>

          <section>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <MapPin className="size-3.5" />
              Local programs near you
            </h4>
            <ul className="mt-2 space-y-2">
              {career.localPrograms.map((program) => (
                <li
                  key={`${program.school}-${program.program}`}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-foreground">{program.school}</p>
                  <p className="text-muted-foreground">{program.program}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              How to explore at Madonna
            </h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-foreground">
              {career.internshipPath.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          {career.salaryNote ? (
            <section className="rounded-lg border border-[#2E8B57]/30 bg-[#2E8B57]/5 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E8B57]">
                Pay & outlook
              </p>
              <p className="mt-1 text-sm text-foreground">{career.salaryNote}</p>
            </section>
          ) : null}

          {career.relatedLinks && career.relatedLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {career.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-[#2F80ED]/30 px-3 py-1 text-xs font-medium text-[#2F80ED] transition-colors hover:bg-[#2F80ED]/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
