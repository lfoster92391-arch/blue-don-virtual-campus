import Link from "next/link";
import { ArrowRight, Heart, Landmark, Star } from "lucide-react";

import { MadonnaHistoryTimeline } from "@/components/culture/madonna-history-timeline";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getMadonnaTimeline } from "@/config/madonna-timeline";
import { getWhyMadonna } from "@/services/madonna-culture-service";

export default function WhyMadonnaPage() {
  const content = getWhyMadonna();
  const timeline = getMadonnaTimeline();

  return (
    <ShellPage
      title={content.headline}
      description={content.subheadline}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/traditions/open-house">
              Virtual tour
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      }
    >
      <DashboardCard
        title="Our Story · 1955 → 2026"
        description={`${timeline.length} milestones of Blue Don & Lady Don athletics, arts, faith, and school life`}
        icon={<Landmark className="size-5" />}
        status={{ label: "Since 1955", variant: "info" }}
      >
        <p className="mb-5 text-sm text-muted-foreground">
          Weirton Madonna High School officially opened in the summer of 1955 and was
          dedicated on August 15, 1955. Tap any date to read that chapter of the Blue Don
          and Lady Don story like a news clipping — the timeline begins with the original
          school building. Seasons, titles, and dates are sample entries for the school to
          verify against its archives.
        </p>
        <MadonnaHistoryTimeline entries={timeline} />
      </DashboardCard>

      <DashboardCard title="Testimonials" icon={<Star className="size-5" />}>
        <ul className="grid gap-4 sm:grid-cols-3">
          {content.testimonials.map((t) => (
            <li key={t.author} className="rounded-lg border border-border p-4">
              <p className="text-sm italic text-foreground">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-sm font-medium text-foreground">{t.author}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Faith Formation" icon={<Heart className="size-5" />}>
          <ul className="space-y-2">
            {content.highlights.faith.map((item) => (
              <li key={item} className="text-sm text-foreground">• {item}</li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Academic Excellence">
          <ul className="space-y-2">
            {content.highlights.academics.map((item) => (
              <li key={item} className="text-sm text-foreground">• {item}</li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Athletics">
          <ul className="space-y-2">
            {content.highlights.athletics.map((item) => (
              <li key={item} className="text-sm text-foreground">• {item}</li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Clubs & Activities">
          <ul className="space-y-2">
            {content.highlights.clubs.map((item) => (
              <li key={item} className="text-sm text-foreground">• {item}</li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <DashboardCard title="College Placement">
        <ul className="space-y-2">
          {content.highlights.collegePlacement.map((item) => (
            <li key={item} className="text-sm text-foreground">• {item}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pathways">Future Center</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/business-partners">Business Partners</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/find-your-place">Find Your Place</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/community-impact">Community Impact</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/madonna-world">Alumni worldwide</Link>} />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
