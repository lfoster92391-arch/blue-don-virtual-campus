import Link from "next/link";
import { redirect } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageAcademy } from "@/config/roles";
import { MODULE_STATUS_LABELS, LEVEL_TIER_LABELS } from "@/lib/academy-engine/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAllModulesForAdmin } from "@/services/academy-engine-service";

export default async function AdminAcademyModulesPage() {
  const user = await requireCompleteProfile();

  if (!canManageAcademy(user.role)) {
    redirect("/academies");
  }

  const modules = await listAllModulesForAdmin();

  return (
    <ShellPage
      title="Manage Learning Modules"
      description="Academy Engine — create and publish learning modules across Madonna Education Network academies."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <ul className="mt-8 space-y-3">
        {modules.map((module) => (
          <li
            key={module.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{module.title}</p>
              <p className="text-sm text-muted-foreground">
                {module.academy.name} · /academies/{module.academy.slug}/modules/{module.id} ·{" "}
                {MODULE_STATUS_LABELS[module.status]} · {module._count.lessons} lessons
                {module.level ? ` · ${LEVEL_TIER_LABELS[module.level.tier]}` : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link href={`/academies/${module.academy.slug}/modules/${module.id}`}>
                  Preview
                </Link>
              }
            />
          </li>
        ))}
        {modules.length === 0 ? (
          <li className="text-sm text-muted-foreground">No modules yet. Run db:seed to load sample content.</li>
        ) : null}
      </ul>
    </ShellPage>
  );
}
