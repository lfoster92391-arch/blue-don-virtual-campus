import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { AcademyGroupedSection } from "@/components/academy/academy-grouped-section";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageLabs } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { LAB_DIFFICULTY_LABELS } from "@/lib/mvp/constants";
import { listActiveLabsGroupedByAcademy } from "@/services/lab-service";

export default async function LabsPage() {
  const user = await requireCompleteProfile();
  const groups = await listActiveLabsGroupedByAcademy();
  const totalLabs = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <ShellPage
      title="Labs"
      description="Hands-on virtual lab environments for academy pathways and campus innovation."
    >
      {canManageLabs(user.role) ? (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/labs">Manage labs</Link>} />
      ) : null}

      {totalLabs > 0 ? (
        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <AcademyGroupedSection
              key={group.academyId ?? "campus-wide"}
              academyId={group.academyId}
              academyName={group.academyName}
              academyIcon={group.academyIcon}
              academyColor={group.academyColor}
              academySortOrder={group.academySortOrder}
              itemCount={group.items.length}
            >
              <ul className="space-y-3">
                {group.items.map((lab) => (
                  <li key={lab.id}>
                    <Link
                      href={`/labs/${lab.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
                    >
                      <FlaskConical className="mt-0.5 size-5 text-[#0A2342] dark:text-white" />
                      <div>
                        <p className="font-medium">{lab.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {LAB_DIFFICULTY_LABELS[lab.difficulty]}
                        </p>
                        {lab.description ? (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{lab.description}</p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </AcademyGroupedSection>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No labs available yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Advisors and administrators can publish lab environments from the admin console.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
