import Link from "next/link";
import { BookOpen, Cross, Lightbulb, Megaphone, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { CampusCampaignBanner } from "@/components/fundraisers/campus-campaign-banner";
import { BriefingSection } from "@/components/home/briefing-section";
import { SchoolCommunityPanels } from "@/components/home/school-community-panels";
import { AreaWeatherCard } from "@/components/weather/area-weather-card";
import { PreviewBanner } from "@/components/admin/preview-banner";
import { ViewAsHeaderControl } from "@/components/admin/view-as-header";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ShopComingSoonButton } from "@/components/shop/shop-coming-soon-button";
import { Button } from "@/components/ui/button";
import type { ViewAsPersona } from "@/config/view-as";
import { getDailyDiscovery, splitBrainGame } from "@/config/daily-discovery";
import { CAMPUS_FEED } from "@/config/campus-feed";
import { LOGIN_COPY } from "@/config/login-audience";
import { siteConfig } from "@/config/site";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type { SportsReportView } from "@/services/sports-highlights-service";
import type { CampusWeather } from "@/services/weather-service";
import type { SchoolCommunityData } from "@/components/home/school-community-panels";
import type { CampusCampaignBannerView } from "@/lib/club-finance";

export function GuestHome({
  dateLabel,
  weather,
  announcement,
  reports,
  community,
  campaigns = [],
  signedInHomeHref,
  previewPersona,
}: {
  dateLabel: string;
  weather: CampusWeather;
  announcement: BroadcastAnnouncementView | null;
  reports: SportsReportView[];
  community: SchoolCommunityData;
  campaigns?: CampusCampaignBannerView[];
  signedInHomeHref?: string | null;
  previewPersona?: ViewAsPersona | null;
}) {
  const discovery = getDailyDiscovery();
  const byKey = Object.fromEntries(discovery.map((item) => [item.key, item]));
  const newsPosts = CAMPUS_FEED.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {previewPersona === "guest" ? (
        <PreviewBanner persona="guest" />
      ) : null}
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" size="sm" href="/guest" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
                {siteConfig.institution}
              </p>
              <p className="text-sm font-medium text-[#0A2342] dark:text-white">
                {LOGIN_COPY.guestLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewPersona === "guest" ? <ViewAsHeaderControl /> : null}
            <Button
              variant="action"
              size="lg"
              className="h-11"
              nativeButton={false}
              render={<Link href="/madonna/participate">Participate</Link>}
            />
            <ShopComingSoonButton size="lg" className="h-11" />
            {previewPersona === "guest" ? null : signedInHomeHref ? (
              <Button
                variant="action"
                size="lg"
                className="h-11"
                nativeButton={false}
                render={<Link href={signedInHomeHref}>Your school home</Link>}
              />
            ) : (
              <Button
                variant="action"
                size="lg"
                className="h-11"
                nativeButton={false}
                render={
                  <Link href="/login?audience=school">Madonna School sign in</Link>
                }
              />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
        <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] via-[#0A2342] to-[#14365f] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
            Fan & Family · no school login
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Watch Madonna
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#C6CCD6] sm:text-base">
            Live games, highlights, weather for your area, and the day&apos;s
            campus news. School tools stay with Madonna School accounts.
          </p>
          <p className="mt-2 text-sm text-[#C6CCD6]/80">{dateLabel}</p>
        </header>

        <CampusCampaignBanner campaigns={campaigns} guest />

        <SchoolCommunityPanels
          data={community}
          showRequests={false}
          showPlayers={false}
          linkGames={false}
        />

        <BriefingSection
          id="fun-fact"
          eyebrow="Fun fact"
          title="Fun fact"
          description="Something surprising to share."
        >
          <DiscoveryCard
            item={byKey.fact}
            icon={<Lightbulb className="size-5" aria-hidden="true" />}
          />
        </BriefingSection>

        <AreaWeatherCard fallback={weather} />

        <BriefingSection
          id="daily-discovery"
          eyebrow="Discover"
          title="Daily discovery"
          description="A quick puzzle for the day."
        >
          <DiscoveryCard
            item={
              byKey.brain
                ? {
                    ...byKey.brain,
                    body: splitBrainGame(byKey.brain.body).prompt,
                  }
                : undefined
            }
            icon={<Sparkles className="size-5" aria-hidden="true" />}
          />
        </BriefingSection>

        <BriefingSection
          id="word-of-the-day"
          eyebrow="Word"
          title="Word of the Day"
        >
          <DiscoveryCard
            item={byKey.word}
            icon={<BookOpen className="size-5" aria-hidden="true" />}
          />
        </BriefingSection>

        <BriefingSection
          id="saint-of-the-day"
          eyebrow="Faith"
          title="Faith — Saint of the Day"
        >
          <DiscoveryCard
            item={byKey.saint}
            icon={<Cross className="size-5" aria-hidden="true" />}
          />
        </BriefingSection>

        <BriefingSection
          id="news"
          eyebrow="News"
          title="News from Madonna"
          description="Announcements and stories the school posts."
        >
          <div className="space-y-3">
            {announcement ? (
              <article className="rounded-xl border border-[#C9A227]/35 bg-gradient-to-br from-[#C9A227]/10 to-transparent p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
                  <Megaphone className="size-3.5" aria-hidden="true" />
                  Daily announcement
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[#0A2342] dark:text-white">
                  {announcement.title}
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {announcement.body}
                </p>
              </article>
            ) : null}

            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
                  {report.gameLabel ?? "Campus story"}
                </p>
                <h3 className="mt-1 font-semibold text-[#0A2342] dark:text-white">
                  {report.headline}
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {report.body}
                </p>
              </article>
            ))}

            {newsPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <p className="text-xs text-muted-foreground">
                  {post.source} · {post.timeLabel}
                </p>
                <h3 className="mt-1 font-semibold text-[#0A2342] dark:text-white">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>
              </article>
            ))}

            {!announcement && reports.length === 0 && newsPosts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
                No campus news posted yet. Check back when Broadcasting publishes.
              </p>
            ) : null}
          </div>
        </BriefingSection>
      </main>
    </div>
  );
}

function DiscoveryCard({
  item,
  icon,
}: {
  item?: { label: string; title: string; body: string };
  icon: ReactNode;
}) {
  if (!item) {
    return (
      <p className="text-sm text-muted-foreground">Nothing posted for today.</p>
    );
  }

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
            {item.label}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#0A2342] dark:text-white">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        </div>
      </div>
    </article>
  );
}
