import Link from "next/link";
import { Gamepad2 } from "lucide-react";

import { AcademyGroupedSection } from "@/components/academy/academy-grouped-section";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageSimulators } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { SIMULATOR_CATEGORY_LABELS } from "@/lib/mvp/constants";
import { listActiveSimulatorsGroupedByAcademy } from "@/services/simulator-service";

export default async function SimulatorsPage() {
  const user = await requireCompleteProfile();
  const groups = await listActiveSimulatorsGroupedByAcademy();
  const totalSimulators = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <ShellPage
      title="Simulators"
      description="Interactive simulations for STEM, business, media, and service learning."
    >
      {canManageSimulators(user.role) ? (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/simulators">Manage simulators</Link>} />
      ) : null}

      {totalSimulators > 0 ? (
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
                  <li key={simulator.id}>
                    <Link
                      href={`/simulators/${simulator.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
                    >
                      <Gamepad2 className="mt-0.5 size-5 text-[#0A2342] dark:text-white" />
                      <div>
                        <p className="font-medium">{simulator.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {SIMULATOR_CATEGORY_LABELS[simulator.category]}
                        </p>
                        {simulator.description ? (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{simulator.description}</p>
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
          <p className="font-medium">No simulators available yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Advisors and administrators can publish simulation modules from the admin console.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
