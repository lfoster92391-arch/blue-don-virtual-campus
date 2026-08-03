import Link from "next/link";
import { redirect } from "next/navigation";

import { PartnerReviewActions } from "@/components/business-partners/partner-review-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canAccessAdmin } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPendingPartners } from "@/services/business-partner-service";

export default async function AdminBusinessPartnersPage() {
  const user = await requireCompleteProfile();

  if (!canAccessAdmin(user.role)) {
    redirect("/business-partners");
  }

  const pending = await listPendingPartners();

  return (
    <ShellPage
      title="Business Partner Approvals"
      description="Review local business applications before they appear in the business partners directory."
    >
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/partners">Community & business partners</Link>} />
      </div>

      {pending.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {pending.map((partner) => (
            <li
              key={partner.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{partner.name}</p>
                <p className="text-sm text-[#2F80ED]">{partner.industry}</p>
                <p className="mt-2 text-sm text-muted-foreground">{partner.description}</p>
                {partner.address ? (
                  <p className="mt-1 text-xs text-muted-foreground">{partner.address}</p>
                ) : null}
                {partner.website ? (
                  <p className="mt-1 text-xs text-muted-foreground">{partner.website}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {new Date(partner.createdAt).toLocaleString()}
                </p>
              </div>
              <PartnerReviewActions partnerId={partner.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No pending business partner applications.</p>
      )}
    </ShellPage>
  );
}
