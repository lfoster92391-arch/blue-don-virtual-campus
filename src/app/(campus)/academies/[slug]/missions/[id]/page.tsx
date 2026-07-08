import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Target } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { LEVEL_TIER_LABELS } from "@/lib/academy-engine/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getMissionDetail } from "@/services/academy-engine-service";

type MissionDetailPageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const { slug, id } = await params;
  await requireCompleteProfile();
  const mission = await getMissionDetail(slug, id);

  if (!mission) {
    notFound();
  }

  return (
    <ShellPage
      title={mission.title}
      description={mission.description ?? `Mission lab in ${mission.academyName}`}
    >
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/academies/${slug}?tab=labs`}>Back to academy labs</Link>}
      />

      <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
        {mission.levelTier ? (
          <span className="inline-block rounded-full bg-[#2F80ED]/10 px-3 py-1 text-sm font-medium text-[#2F80ED]">
            {LEVEL_TIER_LABELS[mission.levelTier]}
          </span>
        ) : null}

        {mission.objectives.length > 0 ? (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Target className="size-5" />
              Mission objectives
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {mission.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {mission.lab ? (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FlaskConical className="size-5" />
              Linked lab
            </h2>
            <Button
              className="mt-3"
              nativeButton={false}
              render={<Link href={`/labs/${mission.lab.slug}`}>{mission.lab.title}</Link>}
            />
          </section>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No lab linked yet — check back after the next content pass.
          </p>
        )}
      </div>
    </ShellPage>
  );
}
