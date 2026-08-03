import {
  Heart,
  Laptop,
  Radio,
  DollarSign,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import type { CommunityImpactStat } from "@/config/community-impact";
import {
  formatImpactStat,
  type CommunityImpactDashboard,
} from "@/services/community-impact-service";

const ICON_MAP = {
  service: Heart,
  money: DollarSign,
  repair: Laptop,
  broadcast: Radio,
  meals: UtensilsCrossed,
  projects: Users,
} as const;

type CommunityImpactDisplayProps = {
  dashboard: CommunityImpactDashboard;
};

function StatCard({ stat }: { stat: CommunityImpactStat }) {
  const Icon = ICON_MAP[stat.icon];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#0A2342] to-[#0A2342]/95 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
      <div className="absolute -right-4 -top-4 size-24 rounded-full bg-[#D4A017]/10" />
      <Icon className="size-6 text-[#D4A017]" />
      <p className="mt-4 text-3xl font-bold tracking-tight text-[#D4A017] sm:text-4xl">
        {formatImpactStat(stat)}
      </p>
      <p className="mt-1 text-base font-semibold">{stat.label}</p>
      <p className="mt-2 text-sm text-white/70">{stat.description}</p>
    </article>
  );
}

export function CommunityImpactDisplay({ dashboard }: CommunityImpactDisplayProps) {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#D4A017]">
          Madonna Community Impact
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0A2342] dark:text-white sm:text-5xl">
          {dashboard.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {dashboard.subheadline}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Updated for {dashboard.lastUpdated}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {dashboard.highlights.map((highlight) => (
          <article
            key={highlight.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="font-semibold text-[#0A2342] dark:text-white">
              {highlight.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{highlight.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
