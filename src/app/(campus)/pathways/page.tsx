import Link from "next/link";
import { Compass } from "lucide-react";

import { PathwayCard } from "@/components/academy-engine/pathway-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { CAREER_PATHWAYS } from "@/lib/academy-engine/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPathwayDashboards } from "@/services/academy-engine-service";

export default async function PathwaysPage() {
  const user = await requireCompleteProfile();
  const dashboards = await listPathwayDashboards(user.id);

  const ordered = CAREER_PATHWAYS.map((pathway) =>
    dashboards.find((d) => d.pathway === pathway.value),
  ).filter((d): d is NonNullable<typeof d> => d !== undefined);

  return (
    <ShellPage
      title="Career Pathway Dashboard"
      description="Choose your destination. Madonna Education Network recommends labs, certifications, projects, and leadership opportunities across all academies."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/academies">All academies</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard">Dashboard</Link>} />
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-4">
        <Compass className="size-6 shrink-0 text-[#2F80ED]" />
        <p className="text-sm text-muted-foreground">
          One Academy Engine powers all pathways. Content changes; architecture stays the same.
          Progression: Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {ordered.map((dashboard) => (
          <PathwayCard key={dashboard.pathway} dashboard={dashboard} />
        ))}
      </div>
    </ShellPage>
  );
}
