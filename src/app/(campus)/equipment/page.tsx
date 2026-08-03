import Link from "next/link";
import { Mail, Package, Settings } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  EquipmentFiltersBar,
  EquipmentList,
} from "@/components/equipment/equipment-list";
import { ShellPage } from "@/components/layout/shell-page";
import { ItHelpDeskPanel } from "@/components/service-desk/it-help-desk-panel";
import { Button } from "@/components/ui/button";
import { buildItHelpDeskMailto } from "@/config/it-help-desk";
import {
  EQUIPMENT_CATEGORY_LABELS,
} from "@/lib/equipment/constants";
import type { EquipmentCategory, EquipmentStatus } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageAnyEquipment,
  getEquipmentStats,
  getItClubOrganization,
  listEquipment,
} from "@/services/equipment-service";

type EquipmentPageProps = {
  searchParams: Promise<{
    category?: string;
    status?: string;
    search?: string;
  }>;
};

export default async function EquipmentPage({ searchParams }: EquipmentPageProps) {
  const user = await requireCompleteProfile();
  const params = await searchParams;
  const itClub = await getItClubOrganization();

  const filters = {
    category: params.category as EquipmentCategory | undefined,
    status: params.status as EquipmentStatus | undefined,
    search: params.search,
  };

  const [items, stats, canManage] = await Promise.all([
    listEquipment(filters),
    getEquipmentStats(),
    canManageAnyEquipment(user.id, user.role),
  ]);

  return (
    <ShellPage
      title="Equipment Tracking"
      description="Campus inventory managed by IT Club — cameras, Chromebooks, projectors, and more."
      actions={
        <div className="flex flex-wrap gap-2">
          {itClub ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/organizations/${itClub.slug}`}>IT Club</Link>
              }
            />
          ) : null}
          {canManage ? (
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href="/equipment/manage">
                  <Settings className="size-4" />
                  Manage inventory
                </Link>
              }
            />
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total items" value={stats.total} />
        <StatCard label="Available" value={stats.available} />
        <StatCard label="Checked out" value={stats.checkedOut} />
        <StatCard label="In repair" value={stats.repair} />
        <StatCard label="Retired" value={stats.retired} />
      </div>

      <ItHelpDeskPanel variant="compact" />

      <DashboardCard
        title="Device issue?"
        description="Report broken or missing equipment through the help desk."
        icon={<Mail className="size-5" />}
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={
              <a href={buildItHelpDeskMailto({ subject: "Equipment issue" })}>
                Report equipment issue
              </a>
            }
          />
        }
      >
        <p className="text-sm text-muted-foreground">
          Include the device model, serial number, and location when emailing the help desk.
        </p>
      </DashboardCard>

      <DashboardCard
        title="Inventory"
        description="Browse campus equipment. IT Club officers maintain records and checkouts."
        icon={<Package className="size-5" />}
      >
        <div className="space-y-4">
          <EquipmentFiltersBar
            currentCategory={params.category}
            currentStatus={params.status}
            currentSearch={params.search}
          />

          {stats.total > 0 ? (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {Object.entries(stats.byCategory)
                .filter(([, count]) => count > 0)
                .map(([category, count]) => (
                  <span key={category} className="rounded-full bg-muted px-2 py-1">
                    {EQUIPMENT_CATEGORY_LABELS[category as EquipmentCategory]}: {count}
                  </span>
                ))}
            </div>
          ) : null}

          <EquipmentList items={items} />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
