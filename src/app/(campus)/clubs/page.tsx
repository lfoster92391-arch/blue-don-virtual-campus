import Link from "next/link";
import { ArrowRight, Cpu, Radio, Scissors, type LucideIcon } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { requireCompleteProfile } from "@/lib/auth/session";

const CLUB_ICONS: Record<string, LucideIcon> = {
  "it-club": Cpu,
  broadcasting: Radio,
  "cricut-club": Scissors,
};

export default async function ClubsHubPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Clubs"
      description="IT Club, Broadcasting, and Cricut Club — the three primary destinations on Blue Don."
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {FOCUS_CLUBS.map((club) => {
          const Icon = CLUB_ICONS[club.slug] ?? Cpu;

          return (
            <li key={club.slug}>
              <Link
                href={club.href}
                className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5"
              >
                <span
                  className="flex size-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${club.accent}18` }}
                >
                  <Icon
                    className="size-5"
                    style={{ color: club.accent }}
                    aria-hidden="true"
                  />
                </span>
                <span className="space-y-1.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-lg font-semibold text-[#0A2342] dark:text-white">
                      {club.name}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#2F80ED]" />
                  </span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {club.tagline}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {club.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </ShellPage>
  );
}
