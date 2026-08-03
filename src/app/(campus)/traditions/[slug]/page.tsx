import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Image, Trophy, Video } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getTraditionBySlug, getTraditionSlugs } from "@/services/madonna-culture-service";

type TraditionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getTraditionSlugs().map((slug) => ({ slug }));
}

export default async function TraditionDetailPage({ params }: TraditionDetailPageProps) {
  const { slug } = await params;
  const tradition = getTraditionBySlug(slug);

  if (!tradition) {
    notFound();
  }

  return (
    <ShellPage
      title={`${tradition.emoji} ${tradition.name}`}
      description={tradition.tagline}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/traditions">
              <ArrowLeft className="size-3.5" />
              All traditions
            </Link>
          }
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="History" description={`A ${tradition.season} tradition at Madonna.`}>
            <p className="text-sm leading-relaxed text-foreground">{tradition.history}</p>
          </DashboardCard>

          <DashboardCard
            title="This Year"
            description={tradition.currentYear.dates}
            status={tradition.currentYear.theme ? { label: tradition.currentYear.theme, variant: "info" } : undefined}
          >
            <ul className="space-y-2">
              {tradition.currentYear.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-[#2F80ED]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </DashboardCard>

          {tradition.winners && tradition.winners.length > 0 ? (
            <DashboardCard title="Winners & Honors" icon={<Trophy className="size-5" />}>
              <ul className="space-y-2">
                {tradition.winners.map((w) => (
                  <li key={`${w.year}-${w.name}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div>
                      <p className="font-medium text-foreground">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.category}</p>
                    </div>
                    <span className="text-sm text-[#2F80ED]">{w.year}</span>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          ) : null}

          <DashboardCard title="Memories" description="Stories from Blue Dons past and present.">
            <ul className="space-y-3">
              {tradition.memories.map((mem) => (
                <li key={mem.quote} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-sm italic text-foreground">&ldquo;{mem.quote}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    — {mem.author}{mem.year ? ` · ${mem.year}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </div>

        <aside className="space-y-6">
          <DashboardCard title="Timeline" icon={<Clock className="size-5" />}>
            <ol className="space-y-3">
              {tradition.timeline.map((item) => (
                <li key={item.year} className="flex gap-3">
                  <span className="shrink-0 text-sm font-semibold text-[#2F80ED]">{item.year}</span>
                  <p className="text-sm text-muted-foreground">{item.event}</p>
                </li>
              ))}
            </ol>
          </DashboardCard>

          <DashboardCard title="Gallery" icon={<Image className="size-5" />}>
            <ul className="space-y-2">
              {tradition.gallery.map((photo) => (
                <li
                  key={photo.caption}
                  className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342]/10 to-[#2F80ED]/10"
                >
                  <div className="text-center">
                    <Image className="mx-auto size-6 text-muted-foreground" />
                    <p className="mt-1 text-xs font-medium text-foreground">{photo.caption}</p>
                    <p className="text-xs text-muted-foreground">{photo.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="Videos" icon={<Video className="size-5" />}>
            <ul className="space-y-2">
              {tradition.videos.map((video) => (
                <li key={video.title} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{video.title}</p>
                  <span className="text-xs text-muted-foreground">{video.duration}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </aside>
      </div>
    </ShellPage>
  );
}
