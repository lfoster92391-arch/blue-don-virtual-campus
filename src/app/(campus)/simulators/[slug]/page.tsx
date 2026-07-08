import Link from "next/link";
import { notFound } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import { getInteractiveSimulator } from "@/components/simulators/interactive/simulator-registry";
import { SimulatorRunActions } from "@/components/simulators/simulator-run-actions";
import { Button } from "@/components/ui/button";
import { canUseSimulators } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { SIMULATOR_CATEGORY_LABELS } from "@/lib/mvp/constants";
import { getSimulatorBySlug } from "@/services/simulator-service";

type SimulatorDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SimulatorDetailPage({ params }: SimulatorDetailPageProps) {
  const { slug } = await params;
  const user = await requireCompleteProfile();
  const simulator = await getSimulatorBySlug(slug, user.id);

  if (!simulator) {
    notFound();
  }

  const InteractiveSimulator = getInteractiveSimulator(slug);

  return (
    <ShellPage
      title={simulator.title}
      description={[SIMULATOR_CATEGORY_LABELS[simulator.category], simulator.academyName]
        .filter(Boolean)
        .join(" · ")}
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/simulators">Back to simulators</Link>} />

      <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
        {simulator.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{simulator.description}</p>
        ) : null}
        {canUseSimulators(user.role) ? (
          <SimulatorRunActions
            simulatorId={simulator.id}
            slug={simulator.slug}
            launchUrl={simulator.launchUrl}
            showLaunch={!InteractiveSimulator}
          />
        ) : null}
      </div>

      {InteractiveSimulator ? (
        <section id="simulator" className="mt-8">
          <InteractiveSimulator />
        </section>
      ) : null}

      {simulator.userRuns.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Your runs</h2>
          <ul className="mt-4 space-y-2">
            {simulator.userRuns.map((run) => (
              <li key={run.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                Completed {run.completedAt.toLocaleDateString()}
                {run.score !== null ? ` · score ${run.score}` : ""}
                {run.durationMin !== null ? ` · ${run.durationMin} min` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </ShellPage>
  );
}
