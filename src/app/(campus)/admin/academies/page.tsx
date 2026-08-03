import Link from "next/link";
import { redirect } from "next/navigation";

import { PendingJoinRequests } from "@/components/academies/pending-join-requests";
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
        <div className="mt-8">
          <PendingJoinRequests pending={pending} showAcademyName />
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No pending membership requests.</p>
      )}
    </ShellPage>
  );
}
