import { getCurrentWave, siteConfig } from "@/config/site";

export function CampusVersionBanner() {
  const wave = getCurrentWave();

  return (
    <div
      className="rounded-lg border border-[#2F80ED]/30 bg-[#2F80ED]/10 px-4 py-2 text-center text-sm text-[#0A2342] dark:text-white"
      data-campus-phase={siteConfig.phase}
      data-campus-wave={wave.id}
      data-campus-version={siteConfig.version}
    >
      <span className="font-medium">
        {wave.id} · {wave.label}
      </span>
      <span aria-hidden="true"> · </span>
      <span>14 Academies · Labs grouped by academy</span>
      <span aria-hidden="true"> · </span>
      <span className="text-muted-foreground">v{siteConfig.version}</span>
    </div>
  );
}
