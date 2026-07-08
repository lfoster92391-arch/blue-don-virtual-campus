import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ClipboardList, GraduationCap, Trophy } from "lucide-react";

import { AcademyJoinButton } from "@/components/academies/academy-join-button";
import { AcademyEngineTabs } from "@/components/academy-engine/academy-engine-tabs";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  LEVEL_TIER_LABELS,
  getPathwayLabel,
} from "@/lib/academy-engine/constants";
import { formatDateLabel } from "@/lib/calendar/utils";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getAcademyEngineDetail } from "@/services/academy-engine-service";

type AcademyDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function AcademyDetailPage({
  params,
  searchParams,
}: AcademyDetailPageProps) {
  const { slug } = await params;
  const { tab = "overview" } = await searchParams;
  const user = await requireCompleteProfile();
  const academy = await getAcademyEngineDetail(slug, user.id);

  if (!academy) {
    notFound();
  }

  const activeTab = ["modules", "labs", "progress", "certifications"].includes(tab)
    ? tab
    : "overview";

  return (
    <ShellPage
      title={`${academy.icon ?? ""} ${academy.name}`.trim()}
      description={academy.description ?? "Madonna Education Network academy pathway."}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pathways">Career pathways</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/academies">All academies</Link>} />
        <AcademyJoinButton
          academyId={academy.id}
          slug={academy.slug}
          membershipStatus={(academy.membership?.status as "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED" | null) ?? null}
        />
      </div>

      {academy.pathways.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Pathways: {academy.pathways.map(getPathwayLabel).join(" · ")}
        </p>
      ) : null}

      {slug === "broadcast" ? (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-[#0A2342] p-5">
          <Image
            src="/icons/broadcast-logo.png"
            alt="Broadcast Academy"
            width={72}
            height={72}
            className="h-16 w-auto object-contain"
          />
          <div>
            <p className="font-semibold text-white">Broadcast Academy</p>
            <p className="text-sm text-[#C6CCD6]">
              Live production, media, and storytelling at Madonna High School.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <AcademyEngineTabs slug={slug} activeTab={activeTab} />
      </div>

      {activeTab === "overview" ? <OverviewTab academy={academy} /> : null}
      {activeTab === "modules" ? <ModulesTab academy={academy} /> : null}
      {activeTab === "labs" ? <LabsTab academy={academy} /> : null}
      {activeTab === "progress" ? <ProgressTab academy={academy} /> : null}
      {activeTab === "certifications" ? <CertificationsTab academy={academy} /> : null}
    </ShellPage>
  );
}

function OverviewTab({ academy }: { academy: Awaited<ReturnType<typeof getAcademyEngineDetail>> & object }) {
  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<GraduationCap className="size-4" />} label="Members" value={String(academy.memberCount)} />
        <StatCard icon={<Calendar className="size-4" />} label="Events" value={String(academy.eventCount)} />
        <StatCard icon={<ClipboardList className="size-4" />} label="Open assignments" value={String(academy.openAssignments)} />
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Upcoming events</h2>
        {academy.recentEvents.length > 0 ? (
          <ul className="space-y-2">
            {academy.recentEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-[#2F80ED]/40"
                >
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateLabel(event.startDate)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming events for this academy.</p>
        )}
      </section>

      {academy.videos.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Video library</h2>
          <ul className="mt-3 space-y-2">
            {academy.videos.map((video) => (
              <li key={video.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                <p className="font-medium">{video.title}</p>
                {video.description ? (
                  <p className="mt-1 text-muted-foreground">{video.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function ModulesTab({ academy }: { academy: NonNullable<Awaited<ReturnType<typeof getAcademyEngineDetail>>> }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Learning modules</h2>
      {academy.modules.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {academy.modules.map((module) => (
            <li key={module.id}>
              <Link
                href={`/academies/${academy.slug}/modules/${module.id}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{module.title}</p>
                    {module.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {module.lessonCount} lessons
                      {module.levelTier ? ` · ${LEVEL_TIER_LABELS[module.levelTier]}` : ""}
                    </p>
                  </div>
                  {module.progress ? (
                    <span className="text-sm font-medium text-[#2E8B57]">
                      {Math.round(module.progress.progressPct)}%
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Modules coming soon for this academy.</p>
      )}
    </section>
  );
}

function LabsTab({ academy }: { academy: NonNullable<Awaited<ReturnType<typeof getAcademyEngineDetail>>> }) {
  return (
    <section className="mt-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Labs & simulators</h2>
        <ul className="mt-4 space-y-2">
          {academy.labs.map((lab) => (
            <li key={lab.id}>
              <Link href={`/labs/${lab.slug}`} className="text-sm text-[#2F80ED] hover:underline">
                {lab.title}
              </Link>
            </li>
          ))}
          {academy.simulators.map((sim) => (
            <li key={sim.id}>
              <Link href={`/simulators/${sim.slug}`} className="text-sm text-[#2F80ED] hover:underline">
                {sim.title} (simulator)
              </Link>
            </li>
          ))}
          {academy.labs.length === 0 && academy.simulators.length === 0 ? (
            <li className="text-sm text-muted-foreground">No labs linked yet.</li>
          ) : null}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Mission labs</h2>
        <ul className="mt-4 space-y-2">
          {academy.missions.map((mission) => (
            <li key={mission.id}>
              <Link
                href={`/academies/${academy.slug}/missions/${mission.id}`}
                className="block rounded-lg border border-border px-4 py-3 hover:border-[#2F80ED]/40"
              >
                <p className="font-medium">{mission.title}</p>
                {mission.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>
                ) : null}
              </Link>
            </li>
          ))}
          {academy.missions.length === 0 ? (
            <li className="text-sm text-muted-foreground">Mission labs coming soon.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}

function ProgressTab({ academy }: { academy: NonNullable<Awaited<ReturnType<typeof getAcademyEngineDetail>>> }) {
  const progress = academy.studentProgress;

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Current level</p>
        <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">
          {progress ? LEVEL_TIER_LABELS[progress.currentLevel] : "Explorer"}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#2E8B57]"
            style={{ width: `${progress?.progressPct ?? 0}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {Math.round(progress?.progressPct ?? 0)}% academy progress · unlock next level after competency demonstrated
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Progression levels</h2>
        <ol className="mt-4 space-y-2">
          {academy.levels.map((level) => (
            <li
              key={level.id}
              className={`rounded-lg border px-4 py-3 ${
                progress?.currentLevel === level.tier
                  ? "border-[#2F80ED] bg-[#2F80ED]/5"
                  : "border-border"
              }`}
            >
              <p className="font-medium">{level.title}</p>
              {level.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Leaderboard</h2>
        {academy.leaderboard.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {academy.leaderboard.map((entry, i) => (
              <li key={entry.userId} className="flex justify-between rounded-lg border border-border px-4 py-2 text-sm">
                <span>
                  #{entry.rank ?? i + 1} {entry.displayName ?? "Student"}
                </span>
                <span className="font-medium">{entry.points} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Complete modules to appear on the leaderboard.</p>
        )}
      </div>
    </section>
  );
}

function CertificationsTab({ academy }: { academy: NonNullable<Awaited<ReturnType<typeof getAcademyEngineDetail>>> }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">Certifications</h2>
      <ul className="mt-4 space-y-3">
        {academy.certifications.map((cert) => (
          <li
            key={cert.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-semibold">{cert.title}</p>
              {cert.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{cert.description}</p>
              ) : null}
              {cert.levelTier ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {LEVEL_TIER_LABELS[cert.levelTier]}
                </p>
              ) : null}
            </div>
            {cert.earned ? (
              <span className="flex items-center gap-1 rounded-full bg-[#2E8B57]/10 px-2 py-1 text-xs font-medium text-[#2E8B57]">
                <Trophy className="size-3" /> Earned
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">In progress</span>
            )}
          </li>
        ))}
        {academy.certifications.length === 0 ? (
          <li className="text-sm text-muted-foreground">Certifications coming soon.</li>
        ) : null}
      </ul>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#0A2342] dark:text-white">{value}</p>
    </div>
  );
}
