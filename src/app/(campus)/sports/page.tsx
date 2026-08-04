import Link from "next/link";
import { Trophy } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { SportsAudienceSections } from "@/components/sports/sports-sections";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageSportsDesk,
  getSportsHubData,
  isSportsImageStorageConfigured,
} from "@/services/sports-highlights-service";

type SportsPageProps = {
  searchParams: Promise<{ sport?: string }>;
};

export default async function SportsPage({ searchParams }: SportsPageProps) {
  // Audience surface — any signed-in campus user can watch and submit.
  const user = await requireCompleteProfile();
  const { sport } = await searchParams;

  const [data, canManage] = await Promise.all([
    getSportsHubData(sport ?? null),
    canManageSportsDesk(user.id, user.role),
  ]);

  return (
    <ShellPage
      title="Blue Don Sports"
      description="Scores, highlights, schedules, and student coverage from the Broadcasting sports desk."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2342]/10 px-3 py-1 text-xs font-medium text-[#0A2342] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
            <Trophy className="size-3.5" aria-hidden="true" />
            Campus audience
          </span>
          {canManage ? (
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href="/organizations/broadcasting?tab=sports-desk">
                  Sports desk
                </Link>
              }
            />
          ) : null}
        </div>
      }
    >
      <SportsAudienceSections
        data={data}
        basePath="/sports"
        storageConfigured={isSportsImageStorageConfigured()}
        canManage={canManage}
      />
    </ShellPage>
  );
}
