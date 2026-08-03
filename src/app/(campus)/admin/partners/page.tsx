import Link from "next/link";
import { redirect } from "next/navigation";

import { PartnerReviewActions } from "@/components/business-partners/partner-review-actions";
import { CommunityPartnerApprovalActions } from "@/components/partners/community-partner-approval-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  COMMUNITY_CATEGORY_META,
  PARTNER_TYPE_LABELS,
} from "@/config/partners";
import { canApprovePartners } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPendingPartners as listPendingBusinessPartners } from "@/services/business-partner-service";
import { listPendingCommunityPartners } from "@/services/partner-service";

export default async function AdminPartnersPage() {
  const user = await requireCompleteProfile();

  if (!canApprovePartners(user.role)) {
    redirect("/partners");
  }

  const [pendingBusiness, pendingCommunity] = await Promise.all([
    listPendingBusinessPartners(),
    listPendingCommunityPartners(),
  ]);

  return (
    <ShellPage
      title="Partner approvals"
      description="Review business and community partner applications before they appear on campus."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Business partners</h2>
        {pendingBusiness.length > 0 ? (
          <ul className="space-y-3">
            {pendingBusiness.map((partner) => (
              <li
                key={partner.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {PARTNER_TYPE_LABELS.BUSINESS} · {partner.industry}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {partner.description}
                  </p>
                </div>
                <PartnerReviewActions partnerId={partner.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No pending business partner applications.</p>
        )}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold">Community partners</h2>
        {pendingCommunity.length > 0 ? (
          <ul className="space-y-3">
            {pendingCommunity.map((partner) => {
              const categoryLabel = partner.communityCategory
                ? COMMUNITY_CATEGORY_META[partner.communityCategory].label
                : "Community";

              return (
                <li
                  key={partner.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {PARTNER_TYPE_LABELS.COMMUNITY} · {categoryLabel}
                    </p>
                    {partner.description ? (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {partner.description}
                      </p>
                    ) : null}
                    {partner.contactEmail ? (
                      <p className="mt-1 text-xs text-muted-foreground">{partner.contactEmail}</p>
                    ) : null}
                  </div>
                  <CommunityPartnerApprovalActions partnerId={partner.id} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No pending community partner applications.</p>
        )}
      </section>
    </ShellPage>
  );
}
