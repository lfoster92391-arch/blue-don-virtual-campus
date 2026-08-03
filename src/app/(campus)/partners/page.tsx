import Link from "next/link";
import { Building2, Handshake, Landmark } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function PartnersHubPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Partners"
      description="Business and community organizations connected to Madonna — internships, service, career talks, and more."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title="Business Partners"
          description="Local employers offering internships, job shadowing, hiring needs, and career pathways."
          icon={<Building2 className="size-5" />}
        >
          <p className="text-sm text-muted-foreground">
            Explore Ohio Valley businesses like Dan&apos;s Plumbing, Hancock Regional Medical Center, and more.
          </p>
          <Button
            className="mt-4"
            size="sm"
            nativeButton={false}
            render={<Link href="/business-partners">Browse business partners</Link>}
          />
        </DashboardCard>

        <DashboardCard
          title="Community Partners"
          description="Hospitals, fire departments, churches, and service organizations across the tri-state."
          icon={<Landmark className="size-5" />}
        >
          <p className="text-sm text-muted-foreground">
            Volunteer, job shadow, and service opportunities with community organizations.
          </p>
          <Button
            className="mt-4"
            size="sm"
            nativeButton={false}
            render={<Link href="/community-partners">Browse community partners</Link>}
          />
        </DashboardCard>
      </div>

      <DashboardCard
        title="Get involved"
        icon={<Handshake className="size-5" />}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/business-partners/apply">Apply as a business partner</Link>} />
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/pathways">Future Center</Link>} />
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/mentors">Mentor Network</Link>} />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
