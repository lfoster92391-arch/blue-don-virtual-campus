import Link from "next/link";
import { GraduationCap, Heart, Lightbulb, Quote, Star, Users } from "lucide-react";

import type { GraduateLegacyData } from "@/config/graduate-legacy";
import { GRADUATE_LEGACY_TAGLINE } from "@/config/graduate-legacy";
import { siteConfig } from "@/config/site";

type GraduateLegacyDisplayProps = {
  legacy: GraduateLegacyData;
  preview?: boolean;
};

export function GraduateLegacyDisplay({ legacy, preview }: GraduateLegacyDisplayProps) {
  return (
    <div className="space-y-8">
      <header className="overflow-hidden rounded-2xl border border-[#D4A017]/30 bg-gradient-to-br from-[#0A2342] to-[#0A2342]/90 p-8 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#D4A017]">
          {GRADUATE_LEGACY_TAGLINE}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{legacy.displayName}</h1>
        <p className="mt-1 flex items-center gap-2 text-lg text-white/80">
          <GraduationCap className="size-5 text-[#D4A017]" />
          Class of {legacy.classYear}
        </p>
        {legacy.college ? (
          <p className="mt-3 text-sm text-[#D4A017]">Next: {legacy.college}</p>
        ) : null}
        {preview ? (
          <p className="mt-4 text-xs text-white/60">Preview — only you can see this until published.</p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Organizations" icon={<Users className="size-5" />}>
          <ul className="space-y-1">
            {legacy.organizations.map((org) => (
              <li key={org} className="text-sm text-foreground">• {org}</li>
            ))}
          </ul>
        </Section>

        <Section title="Achievements" icon={<Star className="size-5" />}>
          <ul className="space-y-1">
            {legacy.achievements.map((item) => (
              <li key={item} className="text-sm text-foreground">• {item}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Projects" icon={<Lightbulb className="size-5" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {legacy.projects.map((project) => (
            <div key={project.title} className="rounded-lg border border-border p-4">
              <p className="font-medium text-foreground">{project.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {legacy.favoriteMemory ? (
        <blockquote className="rounded-xl border border-[#2F80ED]/20 bg-[#2F80ED]/5 p-6">
          <Quote className="size-5 text-[#2F80ED]" />
          <p className="mt-3 text-sm italic text-foreground">&ldquo;{legacy.favoriteMemory}&rdquo;</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">Favorite Memory</p>
        </blockquote>
      ) : null}

      {legacy.advice ? (
        <Section title="Advice for Future Blue Dons" icon={<Heart className="size-5" />}>
          <p className="text-sm text-foreground">{legacy.advice}</p>
        </Section>
      ) : null}

      {legacy.legacyMessage ? (
        <Section title="Leave a Legacy" icon={<GraduationCap className="size-5" />}>
          <p className="text-sm text-foreground">{legacy.legacyMessage}</p>
        </Section>
      ) : null}

      {legacy.alumniOptIn ? (
        <p className="rounded-lg border border-[#2E8B57]/30 bg-[#2E8B57]/5 px-4 py-3 text-sm text-foreground">
          ✓ Opted in to the Madonna alumni network
        </p>
      ) : null}

      {legacy.careerPortfolioSlug ? (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/p/${legacy.careerPortfolioSlug}`}
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            View career portfolio →
          </Link>
        </div>
      ) : null}

      {!preview ? (
        <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {siteConfig.institution} · {siteConfig.shortName}
        </footer>
      ) : null}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[#D4A017]">{icon}</span>
        <h2 className="font-semibold text-[#0A2342] dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}
