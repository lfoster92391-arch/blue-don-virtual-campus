import Link from "next/link";
import { redirect } from "next/navigation";

import { AcademyGroupedSection } from "@/components/academy/academy-grouped-section";
import { LabAdminActions } from "@/components/labs/lab-admin-actions";
import { LabCreateForm } from "@/components/labs/lab-create-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageLabs } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { groupByAcademy } from "@/lib/academy/group-by-academy";
import { LAB_DIFFICULTY_LABELS, LAB_STATUS_LABELS } from "@/lib/mvp/constants";
import { listAcademies } from "@/services/event-service";
import { listAllLabs } from "@/services/lab-service";

export default async function AdminLabsPage() {
  const user = await requireCompleteProfile();

  if (!canManageLabs(user.role)) {
    redirect("/labs");
  }

  const [labs, academies] = await Promise.all([listAllLabs(), listAcademies()]);
  const groups = groupByAcademy(labs);

  return (
    <ShellPage title="Manage Labs" description="Create, activate, and archive campus lab environments.">
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">New lab</h2>
        <LabCreateForm academies={academies} />
      </section>

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
                <li key={lab.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="font-medium">{lab.title}</p>
                    <p className="text-sm text-muted-foreground">
                      /labs/{lab.slug} · {LAB_STATUS_LABELS[lab.status]} · {LAB_DIFFICULTY_LABELS[lab.difficulty]}
                    </p>
                  </div>
                  <LabAdminActions labId={lab.id} slug={lab.slug} status={lab.status} />
                </li>
              ))}
            </ul>
          </AcademyGroupedSection>
        ))}
      </div>
    </ShellPage>
  );
}
