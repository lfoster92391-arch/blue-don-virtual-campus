import Link from "next/link";
import { Target } from "lucide-react";

import { ImpactProjectProposalForm } from "@/components/impact-project/impact-project-proposal-form";
import { ImpactProjectTracker } from "@/components/impact-project/impact-project-tracker";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  IMPACT_BEFORE_DIPLOMA_TAGLINE,
  IMPACT_PROJECT_EXAMPLES,
} from "@/config/impact-before-diploma";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getStudentImpactProject } from "@/services/impact-project-service";

export default async function ImpactProjectPage() {
  const user = await requireCompleteProfile();
  const project = await getStudentImpactProject(user.id);

  return (
    <ShellPage
      title="Impact Before Diploma"
      description={IMPACT_BEFORE_DIPLOMA_TAGLINE}
      actions={
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pathways">Future Center</Link>} />
      }
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Target className="size-4 text-[#D4A017]" />
        <span>Senior capstone requirement — proposal through completion</span>
      </div>

      {project ? (
        <ImpactProjectTracker project={project} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-[#0A2342] dark:text-white">Submit Your Proposal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe a meaningful project that leaves a lasting impact on campus or community.
            </p>
            <ImpactProjectProposalForm />
          </div>

          <DashboardCard title="Project Examples" description="Ideas from past seniors and advisors.">
            <ul className="space-y-3">
              {IMPACT_PROJECT_EXAMPLES.map((example) => (
                <li key={example.id} className="rounded-lg border border-border px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{example.title}</p>
                    <span className="shrink-0 text-xs text-[#2F80ED]">{example.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{example.description}</p>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </div>
      )}
    </ShellPage>
  );
}
