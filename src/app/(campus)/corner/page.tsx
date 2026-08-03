import { CircleDollarSign } from "lucide-react";

import { CornerStoreSections } from "@/components/corner/corner-store-sections";
import { ShellPage } from "@/components/layout/shell-page";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canListInCornerStore,
  isCornerStorageConfigured,
  listCornerItems,
  listSellableOrganizations,
  listSellerItems,
} from "@/services/corner-store-service";

export default async function CornerPage() {
  const user = await requireCompleteProfile();
  const canList = canListInCornerStore(user.role);

  const [items, myItems, organizations] = await Promise.all([
    listCornerItems(),
    canList ? listSellerItems(user.id) : Promise.resolve([]),
    canList ? listSellableOrganizations(user.id) : Promise.resolve([]),
  ]);

  return (
    <ShellPage
      title="Blue Don Corner"
      description="The campus marketplace — spirit wear, tickets, handmade goods, and more from Madonna students and clubs."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <CircleDollarSign className="size-3.5" aria-hidden="true" />
          Corner Store
        </span>
      }
    >
      <CornerStoreSections
        items={items}
        myItems={myItems}
        canList={canList}
        storageConfigured={isCornerStorageConfigured()}
        organizations={organizations}
      />
    </ShellPage>
  );
}
