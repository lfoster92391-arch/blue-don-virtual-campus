import Link from "next/link";
import { redirect } from "next/navigation";

import { ImpactProjectReviewActions } from "@/components/impact-project/impact-project-review-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { IMPACT_PROJECT_STATUS_LABELS } from "@/config/impact-before-diploma";
import { canManageImpactFund } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listImpactProjectsForReview } from "@/services/impact-project-service";

export default async function AdminImpactProjectsPage() {
  const user = await requireCompleteProfile();

  if (!canManageImpactFund(user.role)) {
    redirect("/impact-project");
  }

  const projects = await listImpactProjectsForReview();

  return (
    <ShellPage
      title="Review Impact Projects"
      description="Approve senior capstone proposals and track progress through completion."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      {projects.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.studentName} · {IMPACT_PROJECT_STATUS_LABELS[project.status]}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <ImpactProjectReviewActions project={project} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No impact projects yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Senior proposals will appear here for advisor review.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
