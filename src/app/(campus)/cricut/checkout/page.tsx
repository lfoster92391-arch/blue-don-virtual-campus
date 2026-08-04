import Link from "next/link";

import { CricutCheckoutForm } from "@/components/cricut/cricut-checkout-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function CricutCheckoutPage() {
  const user = await requireCompleteProfile();
  const defaultContactName =
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "";

  return (
    <ShellPage
      title="Order form"
      description="Name, contact, quantity (via cart), pickup/ship notes, and customization — Cricut crew gets a Command Center alert."
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
        <CricutCheckoutForm
          defaultContactName={defaultContactName}
          defaultContactEmail={user.email ?? ""}
        />
      </div>
    </ShellPage>
  );
}
