import Link from "next/link";
import { redirect } from "next/navigation";

import { MentorConnectionReviewActions } from "@/components/mentors/mentor-connection-review-actions";
import { MentorProfileReviewActions } from "@/components/mentors/mentor-profile-review-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  MENTOR_APPROVAL_COPY,
  MENTOR_CATEGORY_LABELS,
} from "@/config/mentor-network";
import {
  canApproveMentorProfiles,
  canReviewMentorConnections,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  listPendingMentorConnections,
  listPendingMentorProfiles,
} from "@/services/mentor-network-service";

export default async function AdminMentorsPage() {
  const user = await requireCompleteProfile();

  if (!canApproveMentorProfiles(user.role) && !canReviewMentorConnections(user.role)) {
    redirect("/mentors");
  }

  const [pendingProfiles, pendingConnections] = await Promise.all([
    canApproveMentorProfiles(user.role) ? listPendingMentorProfiles() : [],
    canReviewMentorConnections(user.role) ? listPendingMentorConnections() : [],
  ]);

  return (
    <ShellPage
      title="Mentor Network Administration"
      description="Approve mentor profiles and review student connection requests."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin">Governance center</Link>} />

      {canApproveMentorProfiles(user.role) ? (
        <section className="mt-8 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
              Pending mentor profiles
            </h2>
            <p className="text-sm text-muted-foreground">
              {MENTOR_APPROVAL_COPY.adminProfileIntro}
            </p>
          </div>

          {pendingProfiles.length > 0 ? (
            <ul className="space-y-3">
              {pendingProfiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {MENTOR_CATEGORY_LABELS[profile.category]} · {profile.title} at{" "}
                      {profile.organization}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <MentorProfileReviewActions profileId={profile.id} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pending mentor profiles.</p>
          )}
        </section>
      ) : null}

      {canReviewMentorConnections(user.role) ? (
        <section className="mt-10 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
              Pending connection requests
            </h2>
            <p className="text-sm text-muted-foreground">
              {MENTOR_APPROVAL_COPY.adminConnectionIntro}
            </p>
          </div>

          {pendingConnections.length > 0 ? (
            <ul className="space-y-3">
              {pendingConnections.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {request.student.displayName ?? request.student.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested mentorship with {request.mentorProfile.name} (
                      {MENTOR_CATEGORY_LABELS[request.mentorProfile.category]})
                    </p>
                    <p className="mt-2 text-sm text-foreground">{request.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <MentorConnectionReviewActions requestId={request.id} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pending connection requests.</p>
          )}
        </section>
      ) : null}
    </ShellPage>
  );
}
