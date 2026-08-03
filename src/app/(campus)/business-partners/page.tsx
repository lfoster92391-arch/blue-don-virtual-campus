import Link from "next/link";
import { Building2, Handshake, Plus } from "lucide-react";

import { PartnerCard } from "@/components/business-partners/partner-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listApprovedPartners } from "@/services/business-partner-service";

export default async function BusinessPartnersDirectoryPage() {
  await requireCompleteProfile();
  const partners = await listApprovedPartners();

  const industries = [...new Set(partners.map((p) => p.industry))].sort();

  return (
    <ShellPage
      title="Business Partners"
      description="Local employers connected to Madonna — internships, job shadowing, career information, and hiring needs across the Ohio Valley."
      actions={
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href="/business-partners/apply">
              <Plus className="size-3.5" />
              Apply as a partner
            </Link>
          }
        />
      }
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/mentors">Mentor Network</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pathways">Future Center</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/partners">All partners</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/opportunities">Opportunity Center</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/community">Community</Link>} />
      </div>

      <DashboardCard
        title="Ohio Valley Employers"
        description={`${partners.length} approved partners · ${industries.length} industries`}
        icon={<Handshake className="size-5" />}
        status={{ label: "W13", variant: "info" }}
      >
        <p className="text-sm text-muted-foreground">
          Madonna alumni work at many of these businesses. Explore each partner page for internships,
          shadow days, hiring needs, and career pathways in your community.
        </p>
      </DashboardCard>

      {partners.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <Building2 className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No approved partners yet. Local businesses can apply to join the directory.
          </p>
          <Button size="sm" nativeButton={false} render={<Link href="/business-partners/apply">Apply now</Link>} />
        </div>
      )}
    </ShellPage>
  );
}
