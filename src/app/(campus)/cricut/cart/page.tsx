import Link from "next/link";

import { CricutCartView } from "@/components/cricut/cricut-cart-view";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function CricutCartPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Cricut cart"
      description="Review quantities, then checkout for pickup or shipping."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/cricut/shop">Continue shopping</Link>}
        />
      }
    >
      <CricutCartView />
    </ShellPage>
  );
}
