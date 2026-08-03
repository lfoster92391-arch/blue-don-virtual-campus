import Link from "next/link";
import { Handshake, Plus, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { MentorExplorer } from "@/components/mentors/mentor-explorer";
import { Button } from "@/components/ui/button";
import { MENTOR_APPROVAL_COPY } from "@/config/mentor-network";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listApprovedMentors } from "@/services/mentor-network-service";

export default async function MentorsPage() {
  await requireCompleteProfile();
  const mentors = await listApprovedMentors();

  const categories = [...new Set(mentors.map((mentor) => mentor.category))];

  return (
    <ShellPage
      title="Mentor Network"
      description="School-approved mentors — teachers, alumni, local businesses, college students, and industry professionals ready to guide Madonna students."
      actions={
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href="/mentors/apply">
              <Plus className="size-3.5" />
              Become a mentor
            </Link>
          }
        />
      }
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pathways">Future Center</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/partners">Business Partners</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/opportunities">Opportunity Center</Link>} />
      </div>

      <DashboardCard
        title="School-approved mentors"
        description={`${mentors.length} mentors · ${categories.length} categories`}
        icon={<Users className="size-5" />}
        status={{ label: "Mentor Network", variant: "info" }}
      >
        <p className="text-sm text-muted-foreground">{MENTOR_APPROVAL_COPY.browseIntro}</p>
      </DashboardCard>

      {mentors.length > 0 ? (
        <MentorExplorer mentors={mentors} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <Handshake className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No approved mentors yet. Alumni and local professionals can apply to join the network.
          </p>
          <Button size="sm" nativeButton={false} render={<Link href="/mentors/apply">Apply to mentor</Link>} />
        </div>
      )}
    </ShellPage>
  );
}
