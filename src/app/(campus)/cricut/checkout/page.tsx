import Link from "next/link";

import { CricutCheckoutForm } from "@/components/cricut/cricut-checkout-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function CricutCheckoutPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Checkout"
      description="Pick up at Madonna High School (Weirton) or add shipping from Weirton, WV."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/cricut/cart">Back to cart</Link>}
        />
      }
    >
      <div className="mx-auto max-w-xl">
        <CricutCheckoutForm />
      </div>
    </ShellPage>
  );
}
