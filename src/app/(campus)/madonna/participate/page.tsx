import Link from "next/link";
import { ArrowRight, Headphones, Megaphone, Trophy, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MadonnaSectionNav } from "@/components/madonna/madonna-hub-panels";
import { ShellPage } from "@/components/layout/shell-page";
import { AnnouncementSubmitForm } from "@/components/media/broadcast-suite-panels";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { requireCompleteProfile } from "@/lib/auth/session";

export const metadata = {
  title: "Participate at Madonna",
  description:
    "Submit an announcement, cover a game, join a club, or ask the help desk for something.",
};

export default async function MadonnaParticipatePage() {
  const user = await requireCompleteProfile();
  const isParent = user.role === "parent";

  return (
    <ShellPage
      title="Participate"
      description={
        isParent
          ? "How your student gets on air, on the field, or into a club — and where to ask for help."
          : "Ways to get on air, get covered, and get involved. Everything here reaches a real person."
      }
    >
      <MadonnaSectionNav active="participate" />

      <DashboardCard
        title="Submit an announcement"
        description="Ask Broadcasting to read something on the daily show — a club meeting, a fundraiser, a result."
        icon={<Megaphone className="size-5" />}
      >
        <AnnouncementSubmitForm />
        <p className="mt-3 text-xs text-muted-foreground">
          Submissions land in the Broadcasting control room. The crew decides
          what makes the rundown — nothing goes on air automatically.
        </p>
      </DashboardCard>

      <DashboardCard
        title="Cover a game"
        description="Write up a game or send in a photo or clip. Student coverage runs on the Sports pages once the desk publishes it."
        icon={<Trophy className="size-5" />}
        actions={
          <Link
            href="/madonna/sports"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Sports
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          The submit forms live at the bottom of the Sports section — pick the
          game, write your report or attach a highlight, and the sports desk
          reviews it before it publishes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/madonna/sports"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            Write a game report
          </Link>
          <Link
            href="/madonna/sports/reel"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            Highlight reel
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Join a club"
        description="The three clubs running right now. Each page has its own way in."
        icon={<Users className="size-5" />}
        actions={
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
          >
            All clubs
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {FOCUS_CLUBS.map((club) => (
            <Link
              key={club.slug}
              href={club.href}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: club.accent }}
              >
                {club.tagline}
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-semibold text-[#0A2342] dark:text-white">
                {club.name}
                <ArrowRight
                  className="size-3.5 text-[#2F80ED] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {club.description}
              </p>
            </Link>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Ask for something"
        description="A broken laptop, a login problem, or a question nobody has answered."
        icon={<Headphones className="size-5" />}
      >
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/service-desk"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            IT Help Desk
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/madonna/broadcast"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            Watch Blue Don Live
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
