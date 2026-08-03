import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { MentorRequestForm } from "@/components/mentors/mentor-request-form";
import { SchoolApprovedBadge } from "@/components/mentors/school-approved-badge";
import { Button } from "@/components/ui/button";
import {
  MENTOR_CATEGORY_DESCRIPTIONS,
  MENTOR_CATEGORY_LABELS,
} from "@/config/mentor-network";
import { canRequestMentorConnection } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getMentorById,
  getStudentConnectionStatus,
} from "@/services/mentor-network-service";

type MentorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MentorDetailPage({ params }: MentorDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const mentor = await getMentorById(id);

  if (!mentor) {
    notFound();
  }

  const connectionStatus = canRequestMentorConnection(user.role)
    ? await getStudentConnectionStatus(user.id, mentor.id)
    : null;

  return (
    <ShellPage
      title={mentor.name}
      description={`${mentor.title} · ${mentor.organization}`}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/mentors">
              <ArrowLeft className="size-3.5" />
              All mentors
            </Link>
          }
        />
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <SchoolApprovedBadge />
          <span className="rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-xs font-medium text-[#2F80ED]">
            {MENTOR_CATEGORY_LABELS[mentor.category]}
          </span>
        </div>

        <DashboardCard title="About this mentor">
          <p className="text-sm leading-relaxed text-muted-foreground">{mentor.bio}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {MENTOR_CATEGORY_DESCRIPTIONS[mentor.category]}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mentor.expertiseTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </DashboardCard>

        {canRequestMentorConnection(user.role) ? (
          <DashboardCard
            title="Request mentorship"
            description="Campus staff reviews every connection to ensure safe, appropriate matches."
          >
            <MentorRequestForm
              mentorProfileId={mentor.id}
              connectionStatus={connectionStatus}
            />
          </DashboardCard>
        ) : (
          <DashboardCard title="Student connections">
            <p className="text-sm text-muted-foreground">
              Madonna students can request mentorship connections from this profile. Sign in with a
              student account to connect.
            </p>
          </DashboardCard>
        )}
      </div>
    </ShellPage>
  );
}
