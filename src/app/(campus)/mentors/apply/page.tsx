import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { MentorApplyForm } from "@/components/mentors/mentor-apply-form";
import { Button } from "@/components/ui/button";
import { MENTOR_APPROVAL_COPY } from "@/config/mentor-network";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function MentorApplyPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Become a Mentor"
      description="Alumni, local businesses, college students, and industry professionals can apply to mentor Madonna students."
      actions={
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/mentors">Browse mentors</Link>} />
      }
    >
      <DashboardCard title="Mentor application">
        <p className="mb-6 text-sm text-muted-foreground">
          {MENTOR_APPROVAL_COPY.profilePending} Teachers are added by administration; alumni and
          community partners may apply here.
        </p>
        <MentorApplyForm />
      </DashboardCard>
    </ShellPage>
  );
}
