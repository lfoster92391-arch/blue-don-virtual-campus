import Link from "next/link";
import { PartyPopper, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type ScholarshipGoodNewsHeroProps = {
  qualifiedCount: number;
};

export function ScholarshipGoodNewsHero({ qualifiedCount }: ScholarshipGoodNewsHeroProps) {
  if (qualifiedCount <= 0) {
    return (
      <section className="rounded-xl border border-border bg-muted/30 p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="size-8 shrink-0 text-[#2F80ED]" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#0A2342] dark:text-white">
              Build your scholarship profile
            </h2>
            <p className="text-sm text-muted-foreground">
              Join clubs, log service hours, and explore academies — Blue Don will match you with
              opportunities as your profile grows.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/find-your-place">Find your place</Link>}
              />
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/academies">Explore academies</Link>}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-[#2E8B57]/40 bg-gradient-to-br from-[#2E8B57]/15 via-[#C9A227]/10 to-[#2E8B57]/5 p-6 sm:p-8">
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-[#C9A227]/20 blur-2xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#C9A227]/20">
            <PartyPopper className="size-7 text-[#C9A227]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2E8B57]">
              Good News!
            </p>
            <h2 className="text-2xl font-bold text-[#0A2342] dark:text-white sm:text-3xl">
              You qualify for {qualifiedCount} Scholarship{qualifiedCount === 1 ? "" : "s"}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Blue Don analyzed your grade, GPA, clubs, service hours, athletics, faith activities,
              and academy pathways to find scholarships you can apply for today.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="shrink-0 bg-[#2E8B57] hover:bg-[#2E8B57]/90"
          nativeButton={false}
          render={
            <a href="#matched-scholarships">
              Apply Now
            </a>
          }
        />
      </div>
    </section>
  );
}
