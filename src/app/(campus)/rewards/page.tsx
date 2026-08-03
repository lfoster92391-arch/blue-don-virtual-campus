import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { BADGES, REWARDS_SUMMARY, XP_LEDGER } from "@/config/rewards-engine";
import { getModuleShell } from "@/config/module-shells";

export default function RewardsPage() {
  const config = getModuleShell("rewards")!;
  const progressPct = Math.round(
    (REWARDS_SUMMARY.currentLevelXp / REWARDS_SUMMARY.nextLevelXp) * 100,
  );

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Level {REWARDS_SUMMARY.level}
        </span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total XP</p>
          <p className="text-2xl font-semibold text-[#2F80ED]">
            {REWARDS_SUMMARY.totalXp.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{REWARDS_SUMMARY.levelLabel}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Blue Don Coins</p>
          <p className="text-2xl font-semibold text-[#D4A017]">
            {REWARDS_SUMMARY.coinsBalance}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Badges earned</p>
          <p className="text-2xl font-semibold">
            {BADGES.filter((b) => b.earned).length} / {BADGES.length}
          </p>
        </div>
      </div>

      <DashboardCard
        title="Level Progress"
        progress={{ value: progressPct, label: `Level ${REWARDS_SUMMARY.level} → ${REWARDS_SUMMARY.level + 1}` }}
      >
        <p className="text-sm text-muted-foreground">
          {REWARDS_SUMMARY.currentLevelXp.toLocaleString()} / {REWARDS_SUMMARY.nextLevelXp.toLocaleString()} XP to next level
        </p>
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="XP Ledger"
          description="Recent experience point transactions."
          status={{ label: "Rewards v1", variant: "info" }}
        >
          <ul className="space-y-2">
            {XP_LEDGER.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.source} · {entry.dateLabel}
                  </p>
                </div>
                <span className="font-semibold text-[#2F80ED]">+{entry.amount}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Badges" description="Achievements unlocked across campus.">
          <div className="grid gap-3 sm:grid-cols-2">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-lg border px-3 py-2.5 ${
                  badge.earned
                    ? "border-border bg-card"
                    : "border-dashed border-border opacity-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{badge.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.earned && badge.earnedLabel ? (
                      <p className="mt-1 text-xs text-[#2E8B57]">{badge.earnedLabel}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <Button
        variant="outline"
        nativeButton={false}
        render={
          <Link href="/corner">
            Blue Don Shop
            <ArrowRight className="size-4" />
          </Link>
        }
      />
    </ShellPage>
  );
}
