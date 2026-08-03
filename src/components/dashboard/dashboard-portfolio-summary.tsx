import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { PortfolioSummary } from "@/services/portfolio-service";

type DashboardPortfolioSummaryProps = {
  summary: PortfolioSummary;
};

export function DashboardPortfolioSummary({
  summary,
}: DashboardPortfolioSummaryProps) {
  const portfolioHighlights = [
    { label: "Projects", value: String(summary.projects) },
    { label: "Certifications", value: String(summary.certifications) },
    { label: "Service pts", value: String(summary.serviceHours) },
  ];

  return (
    <DashboardCard
      title="Portfolio Summary"
      description="Your growth and achievements"
      icon={<Trophy className="size-4" />}
      status={{
        label: summary.totalItems > 0 ? "Active" : "Empty",
        variant: "default",
      }}
      progress={{
        value: summary.completionPercent,
        label: "Portfolio completion",
      }}
      actions={
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/career-portfolio">
              One link
              <ChevronRight className="size-4" />
            </Link>
          }
        />
      }
      expandable
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {portfolioHighlights.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-center"
            >
              <p className="text-lg font-semibold text-[#0A2342] dark:text-white">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        {summary.totalItems === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              Start building your story
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add projects, certifications, and service evidence to your portfolio.
            </p>
          </div>
        ) : null}
      </div>
    </DashboardCard>
  );
}
