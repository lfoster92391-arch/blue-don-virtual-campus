import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Briefcase, Shield } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { AI_CAPABILITIES, AI_DISCLOSURE_POINTS } from "@/config/ai-engine";
import { PROFESSIONAL_SKILL_TRACKS } from "@/config/professional-skills";
import { getDigitalAgreement } from "@/config/digital-agreements";
import { getModuleShell } from "@/config/module-shells";

type AiPageProps = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function AiPage({ searchParams }: AiPageProps) {
  const { topic } = await searchParams;
  const config = getModuleShell("ai")!;
  const aiAgreement = getDigitalAgreement("ai-assistant-disclosure");
  const practiceTrack = topic
    ? PROFESSIONAL_SKILL_TRACKS.find((track) => track.aiTopic === topic)
    : undefined;

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Bot className="size-3.5" aria-hidden="true" />
          Scoped Assistant
        </span>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-4">
        <Shield className="size-6 shrink-0 text-[#2F80ED]" />
        <div>
          <p className="font-medium text-foreground">AI Assistant Disclosure</p>
          <p className="text-sm text-muted-foreground">
            {aiAgreement?.purpose ??
              "Blue Don AI is a scoped campus assistant. Parent acknowledgment is required before first use."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Status: {aiAgreement?.status ?? "planned"} · Annual agreement
          </p>
        </div>
      </div>

      {practiceTrack ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-4">
          <Briefcase className="size-6 shrink-0 text-[#2E8B57]" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              Practice mode: {practiceTrack.title}
            </p>
            <p className="text-sm text-muted-foreground">{practiceTrack.description}</p>
            <Button
              className="mt-3"
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/professional-skills/${practiceTrack.slug}`}>
                  Open {practiceTrack.title} track
                  <ArrowRight className="size-3.5" />
                </Link>
              }
            />
          </div>
        </div>
      ) : null}

      <DashboardCard
        title="Career & Professional Skills"
        description="Practice resume writing, interviews, email, and customer service with scoped AI modes."
        icon={<Briefcase className="size-5" />}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {PROFESSIONAL_SKILL_TRACKS.map((track) => (
            <Link
              key={track.slug}
              href={`/ai?topic=${track.aiTopic}`}
              className={`rounded-lg border px-3 py-2.5 transition-colors hover:border-[#2F80ED]/40 ${
                topic === track.aiTopic
                  ? "border-[#2F80ED]/50 bg-[#2F80ED]/5"
                  : "border-border"
              }`}
            >
              <p className="text-sm font-medium text-foreground">
                {track.icon} {track.title}
              </p>
              <p className="text-xs text-muted-foreground">topic={track.aiTopic}</p>
            </Link>
          ))}
        </div>
        <Button
          className="mt-3"
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/professional-skills">
              View all Professional Skills tracks
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </DashboardCard>

      <DashboardCard
        title="Disclosure & Safety"
        description="How Blue Don AI works and what it can access."
        icon={<Shield className="size-5" />}
        status={{ label: "W16", variant: "info" }}
      >
        <ul className="space-y-3">
          {AI_DISCLOSURE_POINTS.map((point) => (
            <li key={point.id} className="rounded-lg border border-border px-3 py-2.5">
              <p className="font-medium text-foreground">{point.title}</p>
              <p className="text-sm text-muted-foreground">{point.body}</p>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <DashboardCard
        title="Capabilities"
        description="Scoped modes available in the campus assistant."
        icon={<BookOpen className="size-5" />}
      >
        <ul className="space-y-2">
          {AI_CAPABILITIES.map((cap) => (
            <li
              key={cap.id}
              className={`flex items-start justify-between rounded-lg border px-3 py-2 ${
                cap.enabled ? "border-border" : "border-dashed border-border opacity-50"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{cap.name}</p>
                <p className="text-xs text-muted-foreground">{cap.description}</p>
                <p className="mt-0.5 text-xs text-[#2F80ED]">{cap.scope}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  cap.enabled
                    ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {cap.enabled ? "on" : "off"}
              </span>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
        <Bot className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-3 font-medium text-foreground">Assistant chat coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete the AI Assistant Disclosure form to be notified when chat launches.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/forms-center/ai-assistant-disclosure">
              Complete AI Assistant Disclosure
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      </div>
    </ShellPage>
  );
}
