import {
  getClassWorkspace,
  getClubWorkspace,
  getSportWorkspace,
} from "@/config/club-workspaces";

import { FeatureGrid } from "./feature-grid";
import { ItToolkitHub } from "./it-toolkit-hub";
import { SignatureToolCard } from "./signature-tool";

function WorkspaceIntro({ text, accent }: { text: string; accent: string }) {
  return (
    <div
      className="rounded-xl border border-border px-5 py-4"
      style={{ borderLeftColor: accent, borderLeftWidth: 4 }}
    >
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

/** `?tab=workspace` panel for a CLUB org — signature tool + feature grid. */
export function ClubWorkspacePanel({ slug }: { slug: string }) {
  const workspace = getClubWorkspace(slug);
  return (
    <div className="space-y-6">
      <WorkspaceIntro text={workspace.intro} accent={workspace.theme.accent} />
      {slug === "it-club" ? <ItToolkitHub accent={workspace.theme.accent} /> : null}
      <SignatureToolCard
        tool={workspace.signature}
        accent={workspace.theme.accent}
        soft={workspace.theme.soft}
      />
      <FeatureGrid features={workspace.features} accent={workspace.theme.accent} />
    </div>
  );
}

/** Grade-specific workspace for a CLASS org. */
export function ClassWorkspacePanel({ slug }: { slug: string }) {
  const workspace = getClassWorkspace(slug);
  if (!workspace) {
    return null;
  }
  return (
    <div className="space-y-6">
      <section
        className="flex flex-col gap-4 rounded-xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ backgroundColor: workspace.soft }}
      >
        <p className="max-w-xl text-base font-medium text-[#0A2342] dark:text-white">
          {workspace.headline}
        </p>
        {workspace.hero ? (
          <div className="rounded-xl bg-card px-5 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {workspace.hero.label}
            </p>
            <p className="mt-1 text-2xl font-bold" style={{ color: workspace.accent }}>
              {workspace.hero.value}
            </p>
          </div>
        ) : null}
      </section>
      <FeatureGrid features={workspace.features} accent={workspace.accent} />
    </div>
  );
}

/** Sport-specific workspace for a TEAM org. */
export function AthleticsWorkspacePanel({ slug }: { slug: string }) {
  const workspace = getSportWorkspace(slug);
  return (
    <div className="space-y-6">
      <WorkspaceIntro text={workspace.intro} accent={workspace.accent} />
      <FeatureGrid features={workspace.features} accent={workspace.accent} />
    </div>
  );
}
