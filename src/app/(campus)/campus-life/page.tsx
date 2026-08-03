import Link from "next/link";
import { Calendar, Flame, Handshake, Sun } from "lucide-react";

import { TodayInMadonnaHistoryWidget } from "@/components/culture/today-in-history-widget";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { CampusWeatherStation } from "@/components/weather/campus-weather-station";
import { Button } from "@/components/ui/button";
import {
  CAMPUS_TRADITIONS,
  SPIRIT_POINTS,
  TODAY_HAPPENINGS,
} from "@/config/campus-life-engine";
import { getModuleShell } from "@/config/module-shells";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getCampusWeather } from "@/services/weather-service";
import { listCommunityPartners } from "@/services/partner-service";
import { COMMUNITY_CATEGORY_META } from "@/config/partners";
import { getPartnerHref } from "@/config/partners";

export default async function CampusLifePage() {
  await requireCompleteProfile();
  const config = getModuleShell("campus-life")!;
  const weather = await getCampusWeather();
  const communityPartners = await listCommunityPartners();

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/weather">
                <Sun className="size-3.5" />
                Weather Station
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/community-impact">
                Community Impact
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/community-partners">
                <Handshake className="size-3.5" />
                Community Partners
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/events">
                <Calendar className="size-3.5" />
                Events
              </Link>
            }
          />
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Your spirit points</p>
          <p className="text-2xl font-semibold text-[#2F80ED]">{SPIRIT_POINTS.personal}</p>
          <p className="text-xs text-muted-foreground">
            Rank #{SPIRIT_POINTS.classRank} of {SPIRIT_POINTS.classTotal}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{SPIRIT_POINTS.houseName}</p>
          <p className="text-2xl font-semibold">{SPIRIT_POINTS.housePoints.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">House points</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-semibold">{TODAY_HAPPENINGS.length}</p>
          <p className="text-xs text-muted-foreground">happenings on campus</p>
        </div>
      </div>

      <TodayInMadonnaHistoryWidget />

      <DashboardCard
        title="Campus Weather"
        description="Live conditions for athletics, recess, and outdoor activities."
        icon={<Sun className="size-5" />}
        status={{ label: "Live", variant: "info" }}
      >
        <CampusWeatherStation weather={weather} />
      </DashboardCard>

      <DashboardCard
        title="Today on Campus"
        description="What's happening right now at Madonna."
        icon={<Sun className="size-5" />}
        status={{ label: "Campus Life v1", variant: "info" }}
      >
        <ul className="space-y-2">
          {TODAY_HAPPENINGS.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition-colors hover:border-[#2F80ED]/40"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{item.category}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.timeLabel}</span>
                </Link>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{item.category}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.timeLabel}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </DashboardCard>

      <DashboardCard
        title="Madonna Traditions"
        description="Spirit, faith, and community rituals that define our campus."
        icon={<Flame className="size-5" />}
        actions={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/traditions">Traditions Hub</Link>} />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPUS_TRADITIONS.map((tradition) => (
            <Link
              key={tradition.id}
              href="/traditions"
              className="rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40"
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{tradition.emoji}</span>
                <div>
                  <p className="font-medium text-foreground">{tradition.name}</p>
                  <p className="text-sm text-muted-foreground">{tradition.description}</p>
                  <p className="mt-1 text-xs text-[#2F80ED]">{tradition.season}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Community Partners"
        description="Hospitals, first responders, banks, churches, and local employers serving Madonna."
        icon={<Handshake className="size-5" />}
        actions={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/community-partners">Full directory</Link>} />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {communityPartners.slice(0, 4).map((partner) => (
            <Link
              key={partner.id}
              href={getPartnerHref(partner.slug, partner.partnerType)}
              className="rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40"
            >
              <p className="font-medium text-foreground">
                {partner.communityCategory
                  ? `${COMMUNITY_CATEGORY_META[partner.communityCategory].emoji} `
                  : ""}
                {partner.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{partner.description}</p>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
