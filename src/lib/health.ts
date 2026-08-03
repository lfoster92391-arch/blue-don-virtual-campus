import {
  isDatabaseConfigured,
  isSupabaseConfigured,
} from "@/config/env";
import { getCurrentWave, siteConfig } from "@/config/site";
import { withDatabase } from "@/lib/prisma";

export async function getHealthStatus() {
  const base = {
    status: "ok" as const,
    service: "blue-don-virtual-campus",
    version: siteConfig.version,
    phase: siteConfig.phase,
    wave: getCurrentWave().id,
    timestamp: new Date().toISOString(),
    checks: {
      app: "healthy" as const,
      database: isDatabaseConfigured() ? ("configured" as const) : ("not_configured" as const),
      supabase: isSupabaseConfigured() ? ("configured" as const) : ("not_configured" as const),
    },
  };

  if (!isDatabaseConfigured()) {
    return base;
  }

  const counts = await withDatabase(async (prisma) => {
    const [academies, labs, simulators, modules] = await Promise.all([
      prisma.academy.count(),
      prisma.lab.count({ where: { status: "ACTIVE", archiveFlag: false } }),
      prisma.simulator.count({ where: { status: "ACTIVE", archiveFlag: false } }),
      prisma.learningModule.count(),
    ]);

    return { academies, labs, simulators, modules };
  }).catch((error) => {
    console.error("[health] Database count query failed:", error);
    return null;
  });

  const reachable = counts !== null;

  return {
    ...base,
    checks: {
      ...base.checks,
      database: reachable ? ("reachable" as const) : ("unreachable" as const),
    },
    content: counts ?? { academies: null, labs: null, simulators: null, modules: null },
  };
}
