import Link from "next/link";
import { redirect } from "next/navigation";

import { EquipmentItemForm } from "@/components/equipment/equipment-item-form";
import { EquipmentList } from "@/components/equipment/equipment-list";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageEquipment,
  getItClubOrganization,
  listEquipment,
} from "@/services/equipment-service";

export default async function EquipmentManagePage() {
  const user = await requireCompleteProfile();
  const itClub = await getItClubOrganization();

  const context = {
    organizationId: itClub?.id,
    academyId: itClub?.academyId ?? undefined,
  };

  const canManage = await canManageEquipment(user.id, user.role, context);

  if (!canManage) {
    redirect("/equipment");
  }

  const items = await listEquipment({ organizationId: itClub?.id });

  return (
    <ShellPage
      title="Manage Equipment"
      description="IT Club inventory — add items, check out devices, and mark repairs."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/equipment">View catalog</Link>}
        />
      }
    >
      <EquipmentItemForm organizationId={itClub?.id} />

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Current inventory</h2>
        <EquipmentList items={items} />
      </section>
    </ShellPage>
  );
}
