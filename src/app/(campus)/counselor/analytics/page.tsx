import Link from "next/link";
import { redirect } from "next/navigation";

import { SuccessAnalyticsDashboard } from "@/components/success-analytics/success-analytics-dashboard";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canAccessAdmin, canViewSuccessAnalytics } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getSuccessAnalytics } from "@/services/success-analytics-service";

export default async function CounselorAnalyticsPage() {
  const user = await requireCompleteProfile();

  if (!canViewSuccessAnalytics(user.role)) {
    redirect("/home");
  }

  const data = await getSuccessAnalytics();

  return (
    <ShellPage
      title="Success Analytics"
      description="Support every student — celebrate wins and close gaps together."
      actions={
        canAccessAdmin(user.role) ? (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/students">Students</Link>}
          />
        ) : undefined
      }
    >
      <SuccessAnalyticsDashboard data={data} />
    </ShellPage>
  );
}
