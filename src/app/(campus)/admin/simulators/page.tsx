import Link from "next/link";
import { redirect } from "next/navigation";

import { AcademyGroupedSection } from "@/components/academy/academy-grouped-section";
import { ShellPage } from "@/components/layout/shell-page";
import { SimulatorAdminActions } from "@/components/simulators/simulator-admin-actions";
import { SimulatorCreateForm } from "@/components/simulators/simulator-create-form";
import { Button } from "@/components/ui/button";
import { canManageSimulators } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { SIMULATOR_CATEGORY_LABELS, SIMULATOR_STATUS_LABELS } from "@/lib/mvp/constants";
import { groupByAcademy } from "@/lib/academy/group-by-academy";
import { listAcademies } from "@/services/event-service";
import { listAllSimulators } from "@/services/simulator-service";

export default async function AdminSimulatorsPage() {
  const user = await requireCompleteProfile();

  if (!canManageSimulators(user.role)) {
    redirect("/simulators");
  }

  const [simulators, academies] = await Promise.all([
    listAllSimulators(),
    listAcademies(),
  ]);
  const groups = groupByAcademy(simulators);

  return (
    <ShellPage title="Manage Simulators" description="Create, activate, and archive campus simulation modules.">
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">New simulator</h2>
        <SimulatorCreateForm academies={academies} />
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
              {group.items.map((simulator) => (
                <li key={simulator.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="font-medium">{simulator.title}</p>
                    <p className="text-sm text-muted-foreground">
                      /simulators/{simulator.slug} · {SIMULATOR_STATUS_LABELS[simulator.status]} ·{" "}
                      {SIMULATOR_CATEGORY_LABELS[simulator.category]}
                    </p>
                  </div>
                  <SimulatorAdminActions simulatorId={simulator.id} slug={simulator.slug} status={simulator.status} />
                </li>
              ))}
            </ul>
          </AcademyGroupedSection>
        ))}
      </div>
    </ShellPage>
  );
}
