import Link from "next/link";
import { redirect } from "next/navigation";

import { MembershipReviewActions } from "@/components/academies/membership-review-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageAcademy } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPendingMemberships } from "@/services/academy-service";

export default async function AdminAcademiesPage() {
  const user = await requireCompleteProfile();

  if (!canManageAcademy(user.role)) {
    redirect("/academies");
  }

  const pending = await listPendingMemberships();

  return (
    <ShellPage
      title="Academy Memberships"
      description="Review student requests to join academy pathways."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      {pending.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {pending.map((membership) => (
            <li
              key={membership.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">
                  {membership.user.displayName ?? membership.user.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requested {membership.academy.name}
                </p>
              </div>
              <MembershipReviewActions membershipId={membership.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No pending membership requests.</p>
      )}
    </ShellPage>
  );
}
