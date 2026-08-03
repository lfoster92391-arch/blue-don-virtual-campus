import Link from "next/link";
import { ArrowRight, Briefcase, Compass } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { PROFESSIONAL_SKILLS_WAVE_LABEL } from "@/config/professional-skills";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getProfessionalSkillsHubData } from "@/services/professional-skills-service";

export default async function ProfessionalSkillsPage() {
  await requireCompleteProfile();
  const { tracks, totalTracks, totalSteps } = getProfessionalSkillsHubData();

  return (
    <ShellPage
      title="Professional Skills"
      description="Career-readiness tracks for resumes, interviews, business email, and customer service — part of the Future Center."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/pathways">
              <Compass className="size-3.5" />
              Future Center
            </Link>
          }
        />
      }
    >
      <div className="flex items-center gap-3 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-4">
        <Briefcase className="size-6 shrink-0 text-[#2F80ED]" />
        <p className="text-sm text-muted-foreground">
          Work through each track step by step. Check off tasks as you go — progress saves on this
          device. Practice with Blue Don AI when you are ready for feedback.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tracks</p>
          <p className="text-2xl font-semibold text-[#2F80ED]">{totalTracks}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Checklist steps</p>
          <p className="text-2xl font-semibold">{totalSteps}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">AI practice</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">4 modes</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tracks.map((track) => (
          <DashboardCard
            key={track.slug}
            title={`${track.icon} ${track.title}`}
            description={track.description}
            status={{ label: PROFESSIONAL_SKILLS_WAVE_LABEL.split(" · ")[0] ?? "W19", variant: "info" }}
            actions={
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={
                  <Link href={`/professional-skills/${track.slug}`}>
                    Open
                    <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
            }
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#2E8B57]">
              {track.xpOpportunityLabel}
            </p>
            <ul className="mt-3 space-y-1">
              {track.learningObjectives.slice(0, 2).map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-[#2F80ED]">•</span>
                  {objective}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {track.stepCount} steps · {track.templateCount} templates
            </p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/professional-skills/${track.slug}`}>Start track</Link>}
            />
          </DashboardCard>
        ))}
      </div>
    </ShellPage>
  );
}
