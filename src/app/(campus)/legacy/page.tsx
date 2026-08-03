import Link from "next/link";
import { Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getLegacyProjects } from "@/services/madonna-culture-service";

export default function LegacyPage() {
  const projects = getLegacyProjects();

  return (
    <ShellPage
      title="Legacy Projects"
      description="Class gifts and lasting contributions that shape Madonna for generations."
      actions={
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/my-journey">My Journey</Link>} />
      }
    >
      <div className="space-y-6">
        {projects.map((project) => (
          <DashboardCard
            key={project.id}
            title={`Class of ${project.classYear} — ${project.title}`}
            description={`${project.photoCount} photos in gallery`}
            icon={<Users className="size-5" />}
          >
            <p className="text-sm text-foreground">{project.description}</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contributors</p>
                <ul className="mt-1 space-y-0.5">
                  {project.contributors.map((name) => (
                    <li key={name} className="text-sm text-foreground">• {name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Timeline</p>
                <ol className="mt-1 space-y-1">
                  {project.timeline.map((step) => (
                    <li key={step.label} className="text-sm text-foreground">
                      <span className="font-medium text-[#2F80ED]">{step.dateLabel}</span>
                      {" — "}
                      {step.label}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342]/10 to-[#2F80ED]/10">
              <p className="text-xs text-muted-foreground">Project photo gallery placeholder</p>
            </div>
          </DashboardCard>
        ))}
      </div>
    </ShellPage>
  );
}
