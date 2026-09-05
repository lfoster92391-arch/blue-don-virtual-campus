import Link from "next/link";
import { Building2 } from "lucide-react";

import { PartnerApplyForm } from "@/components/business-partners/partner-apply-form";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function BusinessPartnerApplyPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Become a Business Partner"
      description="Local businesses in the Ohio Valley can join Madonna's partner directory — showcase internships, job shadowing, hiring needs, and career pathways for students."
      actions={
        <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/business-partners">Business partners directory</Link>} />
      }
    >
      <DashboardCard
        title="Partner application"
        description="Submit your business for review. Approved partners receive a dedicated page on the Madonna campus site."
        icon={<Building2 className="size-5" />}
      >
        <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
          <li>• Showcase internships, job shadowing, and hiring needs</li>
          <li>• Highlight Madonna alumni on your team</li>
          <li>• Connect with students exploring careers in your industry</li>
        </ul>
        <PartnerApplyForm />
      </DashboardCard>
    </ShellPage>
  );
}
