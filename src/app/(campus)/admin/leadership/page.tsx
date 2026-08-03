import Link from "next/link";
import { redirect } from "next/navigation";

import { LeadershipAnalyticsDashboard } from "@/components/leadership/leadership-analytics-dashboard";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canAccessAdmin, canViewLeadershipAnalytics } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getLeadershipAnalytics } from "@/services/leadership-analytics-service";

export default async function LeadershipAnalyticsPage() {
  const user = await requireCompleteProfile();

  if (!canViewLeadershipAnalytics(user.role)) {
    redirect("/home");
  }

  const data = await getLeadershipAnalytics();

  return (
    <ShellPage
      title="Principal Dashboard"
      description="Leadership command center — fundraising, service hours, student body pulse, and campus-wide activity."
      actions={
        <div className="flex flex-wrap gap-2">
          {canAccessAdmin(user.role) ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin">Governance Center</Link>}
            />
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/counselor/analytics">Success Analytics</Link>}
          />
        </div>
      }
    >
      <LeadershipAnalyticsDashboard data={data} />
    </ShellPage>
  );
}
