import type { DashboardMetric } from "@/lib/dashboard/mock-data";

type DashboardMetricsProps = {
  metrics: DashboardMetric[];
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <section aria-label="Campus metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#0A2342] dark:text-white">
            {metric.value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{metric.hint}</p>
        </div>
      ))}
    </section>
  );
}
