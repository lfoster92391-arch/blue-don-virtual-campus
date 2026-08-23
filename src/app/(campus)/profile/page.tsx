import Link from "next/link";
import { QrCode } from "lucide-react";

import { DietarySummary } from "@/components/dietary/dietary-summary";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/config/roles";
import { LEVEL_TIER_LABELS } from "@/lib/academy-engine/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getStudentProgressProfile } from "@/services/academy-engine-service";
import { getDietaryProfile } from "@/services/dietary-service";

export default async function ProfilePage() {
  const user = await requireCompleteProfile();
  const [progress, dietary] = await Promise.all([
    getStudentProgressProfile(user.id),
    getDietaryProfile(user.id),
  ]);

  return (
    <ShellPage
      title="Profile"
      description="Your campus identity, academy progress, and achievements."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/pass">
              <QrCode className="size-3.5" />
              Blue Don Pass
            </Link>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField label="Display name" value={user.displayName} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Role" value={ROLE_LABELS[user.role]} />
        <ProfileField label="Status" value={user.status} />
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Cafeteria & dietary
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/lunch">Cafeteria lunch</Link>}
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Accepted by the school office and honored by the cafeteria.
        </p>
        <div className="mt-4">
          <DietarySummary
            allergens={dietary?.allergens ?? []}
            restrictions={dietary?.restrictions ?? []}
            notes={dietary?.notes}
            appliedByName={dietary?.appliedByName}
            appliedAt={dietary?.appliedAt}
          />
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          Student Progress Profile
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <ProfileField label="Overall progress" value={`${progress.overallProgressPct}%`} />
          <ProfileField label="Certifications" value={String(progress.certificationCount)} />
          <ProfileField
            label="Modules completed"
            value={`${progress.modulesCompleted} / ${progress.modulesTotal}`}
          />
          <ProfileField label="Volunteer hours" value={String(progress.volunteerHours)} />
        </div>

        {progress.academyProgress.length > 0 ? (
          <ul className="mt-6 space-y-2">
            {progress.academyProgress.map((academy) => (
              <li key={academy.academyId}>
                <Link
                  href={`/academies/${academy.academySlug}?tab=progress`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-[#2F80ED]/40"
                >
                  <span className="flex items-center gap-2 font-medium">
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
            Join an academy from{" "}
            <Link href="/pathways" className="text-[#2F80ED] hover:underline">
              Career Pathways
            </Link>{" "}
            to begin tracking progress.
          </p>
        )}
      </section>
    </ShellPage>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
