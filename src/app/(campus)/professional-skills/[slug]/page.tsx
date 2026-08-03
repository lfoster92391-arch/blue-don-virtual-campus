import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { TemplateBlock } from "@/components/professional-skills/template-block";
import { TrackProgressSection } from "@/components/professional-skills/track-progress-bar";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { PROFESSIONAL_SKILLS_WAVE_LABEL } from "@/config/professional-skills";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getProfessionalSkillSlugs,
  getProfessionalSkillTrackDetail,
} from "@/services/professional-skills-service";

type ProfessionalSkillDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProfessionalSkillSlugs().map((slug) => ({ slug }));
}

export default async function ProfessionalSkillDetailPage({
  params,
}: ProfessionalSkillDetailPageProps) {
  await requireCompleteProfile();
  const { slug } = await params;
  const track = getProfessionalSkillTrackDetail(slug);

  if (!track) {
    notFound();
  }

  return (
    <ShellPage
      title={`${track.icon} ${track.title}`}
      description={track.description}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/professional-skills">
              <ArrowLeft className="size-3.5" />
              All tracks
            </Link>
          }
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[#2E8B57]/10 px-3 py-1 text-xs font-medium text-[#2E8B57]">
          {track.xpOpportunityLabel}
        </span>
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href={`/ai?topic=${track.aiTopic}`}>
              <Bot className="size-3.5" />
              Practice with Blue Don AI
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DashboardCard
            title="Step-by-step checklist"
            description="Complete each step to build this skill. Progress saves on this device."
            status={{ label: PROFESSIONAL_SKILLS_WAVE_LABEL.split(" · ")[0] ?? "W19", variant: "info" }}
          >
            <TrackProgressSection track={track} />
          </DashboardCard>

          <DashboardCard
            title="Templates & outlines"
            description="Copy and adapt these starting points for your own work."
          >
            <div className="space-y-4">
              {track.templates.map((template) => (
                <TemplateBlock key={template.id} template={template} />
              ))}
            </div>
          </DashboardCard>

          <DashboardCard
            title="Practice prompts"
            description="Try these on your own, then use Blue Don AI for feedback."
          >
            <ul className="space-y-3">
              {track.practicePrompts.map((item) => (
                <li key={item.id} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">{item.prompt}</p>
                  {item.hint ? (
                    <p className="mt-1 text-xs text-muted-foreground">Hint: {item.hint}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/ai?topic=${track.aiTopic}`}>
                  <Bot className="size-3.5" />
                  Practice with Blue Don AI
                </Link>
              }
            />
          </DashboardCard>
        </div>

        <aside className="space-y-6">
          <DashboardCard title="Learning objectives">
            <ul className="space-y-2">
              {track.learningObjectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-[#2F80ED]">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="Resources">
            <ul className="space-y-2">
              {track.resources.map((resource) => (
                <li key={resource.id}>
                  <Link
                    href={resource.href}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:border-[#2F80ED]/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                    {resource.external ? (
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </aside>
      </div>
    </ShellPage>
  );
}
