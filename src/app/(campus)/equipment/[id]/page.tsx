import Link from "next/link";
import { notFound } from "next/navigation";

import { EquipmentManageActions } from "@/components/equipment/equipment-manage-actions";
import {
  EquipmentCategoryBadge,
  EquipmentStatusBadge,
} from "@/components/equipment/equipment-list";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  canManageEquipment,
  getEquipment,
} from "@/services/equipment-service";

type EquipmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const item = await getEquipment(id);

  if (!item) {
    notFound();
  }

  const context = {
    organizationId: item.organizationId ?? undefined,
  };

  const canManage = await canManageEquipment(user.id, user.role, context);

  const borrowers = canManage
    ? await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          displayName: true,
          firstName: true,
          lastName: true,
        },
        orderBy: [{ displayName: "asc" }],
        take: 100,
      })
    : [];

  const borrowerOptions = borrowers.map((borrower) => ({
    id: borrower.id,
    label:
      borrower.displayName ??
      [borrower.firstName, borrower.lastName].filter(Boolean).join(" ") ??
      borrower.id,
  }));

  return (
    <ShellPage
      title={item.name}
      description={`Asset ${item.assetTag}`}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/equipment">Back to inventory</Link>}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <EquipmentCategoryBadge category={item.category} />
        <EquipmentStatusBadge status={item.status} />
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <DetailField label="Location" value={item.location} />
        <DetailField label="Serial number" value={item.serialNumber ?? "—"} />
        <DetailField
          label="Assigned to"
          value={item.assignedToName ?? "—"}
        />
        <DetailField
          label="Organization"
          value={item.organizationName ?? "—"}
        />
        {item.checkedOutAt ? (
          <DetailField
            label="Checked out at"
            value={new Date(item.checkedOutAt).toLocaleString()}
          />
        ) : null}
      </dl>

      {item.notes ? (
        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
        </section>
      ) : null}

      {canManage ? (
        <div className="mt-6">
          <EquipmentManageActions
            equipmentId={item.id}
            status={item.status}
            borrowerOptions={borrowerOptions}
          />
        </div>
      ) : null}

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Checkout history</h2>
        {item.checkouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No checkout history yet.</p>
        ) : (
          <ul className="space-y-2">
            {item.checkouts.map((checkout) => (
              <li
                key={checkout.id}
                className="rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{checkout.userName}</p>
                  <span className="text-xs text-muted-foreground">
                    {checkout.returnedAt ? "Returned" : "Active"}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Out: {new Date(checkout.checkedOutAt).toLocaleString()}
                  {checkout.dueAt
                    ? ` · Due: ${new Date(checkout.dueAt).toLocaleDateString()}`
                    : ""}
                  {checkout.returnedAt
                    ? ` · Returned: ${new Date(checkout.returnedAt).toLocaleString()}`
                    : ""}
                </p>
                {checkout.notes ? (
                  <p className="mt-1 text-muted-foreground">{checkout.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </ShellPage>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
