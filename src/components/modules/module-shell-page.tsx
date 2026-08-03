import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

import type { ModuleShellConfig } from "@/config/module-shells";
import { siteConfig } from "@/config/site";
import { phaseToWave } from "@/config/waves";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";

type ModuleShellPageProps = {
  config: ModuleShellConfig;
};

export function ModuleShellPage({ config }: ModuleShellPageProps) {
  const currentWave = phaseToWave(siteConfig.phase);

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Construction className="size-3.5" aria-hidden="true" />
          Phase {config.phase}
        </span>
      }
    >
      <DashboardCard
        title={`Coming in Phase ${config.phase}`}
        description={`This destination is part of the Blue Don Digital Campus migration (currently ${currentWave.id} · ${currentWave.label}). The shell is live; features ship in focused waves per the System Blueprint.`}
        status={{ label: config.pillar, variant: "info" }}
      >
        <div className="space-y-4">
          {config.relatedLinks && config.relatedLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {config.relatedLinks.map((link) => (
                <Button key={link.href} variant="outline" size="sm" nativeButton={false} render={
                  <Link href={link.href}>
                    {link.label}
                    <ArrowRight className="size-3.5" />
                  </Link>
                } />
              ))}
            </div>
          ) : null}
          <Button nativeButton={false} render={
            <Link href="/home">
              Back to Home
              <ArrowRight className="size-4" />
            </Link>
          } />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
