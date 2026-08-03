"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink, Link2, QrCode } from "lucide-react";
import Link from "next/link";

import { CAREER_PORTFOLIO_TAGLINE } from "@/config/career-portfolio";
import { toggleCareerPortfolioPublicAction } from "@/features/career-portfolio/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CareerPortfolioHeroProps = {
  displayName: string;
  shareUrl: string;
  slug: string;
  isPublic: boolean;
  completionPercent: number;
  classLabel: string;
  academyLabel: string | null;
  preview?: boolean;
};

export function CareerPortfolioHero({
  displayName,
  shareUrl,
  slug,
  isPublic,
  completionPercent,
  classLabel,
  academyLabel,
  preview = false,
}: CareerPortfolioHeroProps) {
  const [copied, setCopied] = useState(false);
  const [publicState, setPublicState] = useState(isPublic);
  const [pending, startTransition] = useTransition();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleTogglePublic() {
    const next = !publicState;
    startTransition(async () => {
      const result = await toggleCareerPortfolioPublicAction(next);
      if (!result.error) {
        setPublicState(next);
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2F80ED]/30 bg-gradient-to-br from-[#0A2342] via-[#0F2F52] to-[#0A2342] p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C6CCD6]">
            Career Portfolio
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">{displayName}</h2>
          <p className="text-lg text-[#D4A017]">{CAREER_PORTFOLIO_TAGLINE}</p>
          <p className="text-sm text-[#C6CCD6]">
            {classLabel}
            {academyLabel ? ` · ${academyLabel}` : ""}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#2F80ED] transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs text-[#C6CCD6]">{completionPercent}% complete</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex size-24 items-center justify-center rounded-lg bg-white">
            <QrCode className="size-16 text-[#0A2342]" aria-hidden />
          </div>
          <p className="max-w-[200px] break-all text-center font-mono text-xs text-[#C6CCD6]">
            {shareUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          className="bg-[#2F80ED] text-white hover:bg-[#2F80ED]/90"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy my link
            </>
          )}
        </Button>

        {!preview ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              nativeButton={false}
              render={
                <Link href={`/p/${slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Preview public page
                </Link>
              }
            />
            <button
              type="button"
              disabled={pending}
              onClick={handleTogglePublic}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                publicState
                  ? "border-[#2E8B57]/50 bg-[#2E8B57]/20 text-white"
                  : "border-white/30 bg-white/5 text-[#C6CCD6] hover:bg-white/10",
              )}
            >
              <Link2 className="size-3.5" />
              {pending ? "Saving…" : publicState ? "Public" : "Private — click to publish"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
