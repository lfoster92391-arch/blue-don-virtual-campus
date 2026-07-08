import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { LEVEL_TIER_LABELS } from "@/lib/academy-engine/constants";
import type { StudentProgressProfile } from "@/services/academy-engine-service";

type StudentProgressWidgetProps = {
  profile: StudentProgressProfile;
};

export function StudentProgressWidget({ profile }: StudentProgressWidgetProps) {
  return (
    <DashboardCard
      title="Academy Progress"
      description="Unified progress across Madonna Education Network academies"
      expandable
      defaultExpanded
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Overall progress" value={`${profile.overallProgressPct}%`} />
        <Metric label="Certifications" value={String(profile.certificationCount)} />
        <Metric label="Modules completed" value={`${profile.modulesCompleted}/${profile.modulesTotal}`} />
        <Metric label="Volunteer hours" value={String(profile.volunteerHours)} />
      </div>

      {profile.academyProgress.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {profile.academyProgress.slice(0, 5).map((academy) => (
            <li key={academy.academyId}>
              <Link
                href={`/academies/${academy.academySlug}?tab=progress`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 transition-colors hover:border-[#2F80ED]/40"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span>{academy.icon ?? "🎓"}</span>
                  {academy.academyName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {LEVEL_TIER_LABELS[academy.currentLevel]} · {Math.round(academy.progressPct)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Join an academy and start a module to track progress here.
        </p>
      )}

      <Link
        href="/pathways"
        className="mt-4 inline-block text-sm font-medium text-[#2F80ED] hover:underline"
      >
        View career pathways →
      </Link>
    </DashboardCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#0A2342] dark:text-white">{value}</p>
    </div>
  );
}
