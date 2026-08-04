import Link from "next/link";
import { ArrowRight, CircleDollarSign } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { requireCompleteProfile } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  canViewClubFinances,
  formatCents,
  getClubFinanceSnapshot,
} from "@/services/club-finance-service";
import type { ClubFinanceSnapshot } from "@/lib/club-finance";

export default async function FinancesHubPage() {
  const user = await requireCompleteProfile();

  const orgs = await prisma.organization.findMany({
    where: { slug: { in: [...FOCUS_CLUBS.map((c) => c.slug)] } },
    select: { id: true, slug: true, name: true },
  });

  const bySlug = new Map(orgs.map((o) => [o.slug, o]));
  const snapshots = (
    await Promise.all(
      FOCUS_CLUBS.map(async (club) => {
        const org = bySlug.get(club.slug);
        if (!org) {
          return null;
        }
        const canView = await canViewClubFinances(user.id, user.role, org.id);
        if (!canView) {
          return null;
        }
        return {
          club,
          snapshot: (await getClubFinanceSnapshot(
            org.id,
          )) as ClubFinanceSnapshot | null,
        };
      }),
    )
  ).filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <ShellPage
      title="Club Finances"
      description="Balances, ledgers, and fundraisers for clubs you can access as an officer or administrator."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <CircleDollarSign className="size-3.5" aria-hidden="true" />
          Focus clubs
        </span>
      }
    >
      {snapshots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Club financials are available to Presidents, Vice Presidents,
          Secretaries, and campus administrators.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {snapshots.map(({ club, snapshot }) => (
            <DashboardCard
              key={club.slug}
              title={club.name}
              description={
                snapshot
                  ? `${snapshot.entries.length} ledger entries · ${snapshot.fundraisers.length} fundraisers`
                  : "Organization not seeded yet — run db:seed"
              }
              status={
                snapshot
                  ? {
                      label: formatCents(snapshot.balanceCents),
                      variant:
                        snapshot.balanceCents >= 0 ? "success" : "warning",
                    }
                  : { label: "—", variant: "default" }
              }
            >
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <Link href={`/organizations/${club.slug}?tab=finances`}>
                    Open ledger
                    <ArrowRight className="size-4" />
                  </Link>
                }
              />
            </DashboardCard>
          ))}
        </div>
      )}
    </ShellPage>
  );
}
