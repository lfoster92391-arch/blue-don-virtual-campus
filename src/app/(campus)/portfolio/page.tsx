import Link from "next/link";
import { Link2, Plus, Trophy } from "lucide-react";

import { PortfolioCreateForm } from "@/components/portfolio/portfolio-create-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_TYPE_LABELS } from "@/lib/mvp/constants";
import { canEditPortfolio } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPortfolioItems, getPortfolioSummary } from "@/services/portfolio-service";
import { listAcademies } from "@/services/event-service";

export default async function PortfolioPage() {
  const user = await requireCompleteProfile();
  const [items, summary, academies] = await Promise.all([
    listPortfolioItems(user.id),
    getPortfolioSummary(user.id),
    listAcademies(),
  ]);
  const canEdit = canEditPortfolio(user.role);

  return (
    <ShellPage
      title="Portfolio"
      description="Showcase projects, certifications, service work, and leadership evidence."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/career-portfolio">
              Career Portfolio
              <Link2 className="size-3.5" />
            </Link>
          }
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Items" value={String(summary.totalItems)} />
        <Metric label="Published" value={String(summary.publishedItems)} />
        <Metric label="Projects" value={String(summary.projects)} />
        <Metric label="Service pts" value={String(summary.serviceHours)} />
      </div>

      {canEdit ? (
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Plus className="size-4" />
            Add portfolio item
          </h2>
          <PortfolioCreateForm academies={academies} />
        </section>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/portfolio/${item.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
              >
                <div className="flex items-start gap-3">
                  <Trophy className="mt-0.5 size-5 text-[#D4A017]" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {PORTFOLIO_TYPE_LABELS[item.type]}
                      {item.academyName ? ` · ${item.academyName}` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-sm capitalize text-muted-foreground">
                  {item.status.toLowerCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">Start building your portfolio</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add projects, certifications, and service evidence to track your growth.
          </p>
        </div>
      )}
    </ShellPage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">{value}</p>
    </div>
  );
}
