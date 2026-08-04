import Link from "next/link";
import { ArrowRight, Cpu, ExternalLink, Gift, Radio, Scissors, type LucideIcon } from "lucide-react";

import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { getCricutAmazonWishlistUrl } from "@/services/cricut-shop-service";
import type { CampusUser } from "@/types/auth";

const CLUB_ICONS: Record<string, LucideIcon> = {
  "it-club": Cpu,
  broadcasting: Radio,
  "cricut-club": Scissors,
};

function getGreeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

type FocusClubsHeroProps = {
  user: CampusUser;
};

/** Focused-mode home hero — three club destinations as the primary surface. */
export async function FocusClubsHero({ user }: FocusClubsHeroProps) {
  const preferredName =
    user.firstName ?? user.displayName.split(" ")[0] ?? user.displayName;
  const hour = new Date().getHours();
  const cricutWishlistUrl = await getCricutAmazonWishlistUrl();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] to-[#0A2342]/90 px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8"
      aria-labelledby="focus-clubs-heading"
    >
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-[#C6CCD6]">Madonna High School · Clubs</p>
          <h1
            id="focus-clubs-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {getGreeting(hour)}, {preferredName}
          </h1>
          <p className="max-w-2xl text-sm text-[#C6CCD6] sm:text-base">
            Choose your club — IT, Broadcasting, or Cricut. Club finances live
            under IT Club; calendar and media are inside each club.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {FOCUS_CLUBS.map((club) => {
            const Icon = CLUB_ICONS[club.slug] ?? Cpu;

            return (
              <li key={club.slug}>
                <Link
                  href={club.href}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <span
                    className="flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${club.accent}33` }}
                  >
                    <Icon
                      className="size-5"
                      style={{ color: club.accent }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="space-y-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold tracking-tight">
                        {club.name}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                    </span>
                    <span className="block text-xs text-[#C6CCD6]">
                      {club.tagline}
                    </span>
                    <span className="block text-sm text-white/80">
                      {club.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {cricutWishlistUrl ? (
          <div className="flex flex-col gap-3 rounded-xl border border-[#FF9900]/40 bg-[#FF9900]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Gift className="mt-0.5 size-5 shrink-0 text-[#FFB84D]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Support Cricut Club</p>
                <p className="text-xs text-white/70">
                  Donate supplies via the Amazon wishlist — vinyl, blanks, and blades.
                </p>
              </div>
            </div>
            <Link
              href={cricutWishlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF9900] px-3 py-1.5 text-sm font-medium text-[#0A2342] hover:bg-[#E88B00]"
            >
              Open wishlist
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[#2F80ED]/20 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-1/3 size-36 rounded-full bg-[#E11D48]/15 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}
