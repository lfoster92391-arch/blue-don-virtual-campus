import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { CAREER_PATHWAYS, getPathwayLabel } from "@/lib/academy-engine/constants";
import type { PathwayDashboard } from "@/services/academy-engine-service";

type PathwayCardProps = {
  dashboard: PathwayDashboard;
};

export function PathwayCard({ dashboard }: PathwayCardProps) {
  const meta = CAREER_PATHWAYS.find((p) => p.value === dashboard.pathway);

  return (
    <DashboardCard
      title={meta?.label ?? getPathwayLabel(dashboard.pathway)}
      description={meta?.description ?? "Career pathway at Madonna Education Network."}
      icon={<GraduationCap className="size-4" />}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Academies
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {dashboard.academies.map((academy) => (
              <li key={academy.id}>
                <Link
                  href={`/academies/${academy.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-[#2F80ED]/40"
                >
                  <span>{academy.icon ?? "🎓"}</span>
                  {academy.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {dashboard.recommendedLabs.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recommended labs
            </p>
            <ul className="mt-2 space-y-1">
              {dashboard.recommendedLabs.map((lab) => (
                <li key={lab.id}>
                  <Link
                    href={`/labs/${lab.slug}`}
                    className="text-sm text-[#2F80ED] hover:underline"
                  >
                    {lab.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dashboard.recommendedCerts.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Certifications
            </p>
            <ul className="mt-2 space-y-1">
              {dashboard.recommendedCerts.map((cert) => (
                <li key={cert.id} className="text-sm text-muted-foreground">
                  {cert.title} · {cert.academyName}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dashboard.recommendedMissions.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mission labs
            </p>
            <ul className="mt-2 space-y-1">
              {dashboard.recommendedMissions.map((mission) => (
                <li key={mission.id}>
                  <Link
                    href={`/academies/${mission.academySlug}/missions/${mission.id}`}
                    className="text-sm text-[#2F80ED] hover:underline"
                  >
                    {mission.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/academies">
              Explore all academies
              <ArrowRight className="ml-1 size-4" />
            </Link>
          }
        />
      </div>
    </DashboardCard>
  );
}
