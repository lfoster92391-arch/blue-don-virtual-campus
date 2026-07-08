import Link from "next/link";
import { notFound } from "next/navigation";

import { getInteractiveLab } from "@/components/labs/interactive/lab-registry";
import { LabSessionActions } from "@/components/labs/lab-session-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canUseLabs } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { LAB_DIFFICULTY_LABELS, LAB_SESSION_STATUS_LABELS } from "@/lib/mvp/constants";
import { getLabBySlug } from "@/services/lab-service";

type LabDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LabDetailPage({ params }: LabDetailPageProps) {
  const { slug } = await params;
  const user = await requireCompleteProfile();
  const lab = await getLabBySlug(slug, user.id);

  if (!lab) {
    notFound();
  }

  const activeSession = lab.userSessions.find((session) => session.status === "IN_PROGRESS");
  const InteractiveLab = getInteractiveLab(slug);

  return (
    <ShellPage
      title={lab.title}
      description={[LAB_DIFFICULTY_LABELS[lab.difficulty], lab.academyName].filter(Boolean).join(" · ")}
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/labs">Back to labs</Link>} />

      <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
        {lab.description ? <p className="text-sm leading-relaxed text-muted-foreground">{lab.description}</p> : null}
        {lab.equipment ? (
          <section>
            <h2 className="text-sm font-semibold">Equipment</h2>
            <p className="mt-1 text-sm text-muted-foreground">{lab.equipment}</p>
          </section>
        ) : null}
        {lab.safetyNotes ? (
          <section>
            <h2 className="text-sm font-semibold">Safety</h2>
            <p className="mt-1 text-sm text-muted-foreground">{lab.safetyNotes}</p>
          </section>
        ) : null}
        {canUseLabs(user.role) ? (
          <LabSessionActions labId={lab.id} slug={lab.slug} activeSession={activeSession} />
        ) : null}
      </div>

      {InteractiveLab ? (
        <section className="mt-8">
          <InteractiveLab />
        </section>
      ) : lab.launchUrl && !lab.launchUrl.startsWith(`/labs/${slug}`) ? (
        <div className="mt-8">
          <Button
            nativeButton={false}
            render={
              lab.launchUrl.startsWith("/") ? (
                <Link href={lab.launchUrl}>Open lab environment</Link>
              ) : (
                <a href={lab.launchUrl} target="_blank" rel="noopener noreferrer">
                  Open lab environment
                </a>
              )
            }
          />
        </div>
      ) : null}

      {lab.userSessions.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Your sessions</h2>
          <ul className="mt-4 space-y-2">
            {lab.userSessions.map((session) => (
              <li key={session.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                {LAB_SESSION_STATUS_LABELS[session.status]}
                {session.completedAt
                  ? ` · completed ${session.completedAt.toLocaleDateString()}`
                  : session.startedAt
                    ? ` · started ${session.startedAt.toLocaleDateString()}`
                    : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </ShellPage>
  );
}
