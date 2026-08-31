import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CircleDollarSign,
  Eye,
  Users,
} from "lucide-react";

import { AdminComposeStudentMessage } from "@/components/admin/admin-compose-student-message";
import { CreateStudentForm } from "@/components/admin/create-student-form";
import { StudentAdminRow } from "@/components/admin/student-admin-row";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { isSupabaseAdminConfigured } from "@/config/env";
import { canManageUsers, canViewLeadershipAnalytics } from "@/config/roles";
import {
  startClubPreviewAction,
  startParentPreviewAction,
} from "@/features/admin/preview-actions";
import { requireCompleteProfile } from "@/lib/auth/session";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import { listStudentsForAdmin } from "@/services/student-admin-service";

export default async function AdminStudentsPage() {
  const user = await requireCompleteProfile();

  if (!canManageUsers(user.role)) {
    redirect("/admin");
  }

  const students = await listStudentsForAdmin();
  const passwordManagementEnabled = isSupabaseAdminConfigured();
  const showLeadership = canViewLeadershipAnalytics(user.role);

  const focusOrgs =
    isPrismaReady()
      ? ((await withDatabase((prisma) =>
          prisma.organization.findMany({
            where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
            select: { id: true, slug: true, name: true },
            orderBy: { sortOrder: "asc" },
          }),
        )) ?? [])
      : [];

  return (
    <ShellPage
      title="Students control center"
      description="Create accounts, assign club roles, message students, preview what they see, and reset passwords."
      actions={
        <div className="flex flex-wrap gap-2">
          {showLeadership ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href="/admin/leadership">
                  <BarChart3 className="size-4" />
                  Principal Dashboard
                </Link>
              }
            />
          ) : null}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/organizations/it-club?tab=finances">
                <CircleDollarSign className="size-4" />
                IT Finances
              </Link>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/admin">
                <ArrowLeft className="size-4" />
                Admin hub
              </Link>
            }
          />
        </div>
      }
    >
      {!passwordManagementEnabled ? (
        <div className="rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Password create/reset needs the Supabase service role
          </p>
          <p className="mt-1">
            Set <code>SUPABASE_SERVICE_ROLE_KEY</code> to create logins and reset
            passwords. Club assignments still work without it.
          </p>
        </div>
      ) : null}

      <CreateStudentForm />

      {focusOrgs.length > 0 ? (
        <section className="mt-8">
          <AdminComposeStudentMessage
            organizations={focusOrgs}
            students={students.map((s) => ({
              userId: s.id,
              displayName: s.displayName,
              memberships: s.memberships,
            }))}
          />
        </section>
      ) : null}

      <section className="mt-8 space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Eye className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Preview by club
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          See the scoped nav for a single club without picking a student. Exit
          anytime from the yellow banner.
        </p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_CLUBS.map((club) => (
            <form key={club.slug} action={startClubPreviewAction}>
              <input type="hidden" name="clubSlug" value={club.slug} />
              <Button type="submit" size="sm" variant="outline">
                Preview {club.name}
              </Button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Eye className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Preview the parent view
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Open the Parent Portal as a family sees it, without linking a student
          to your account. A sample student stands in for a real child, and
          nothing you do while previewing saves.
        </p>
        <form action={startParentPreviewAction}>
          <Button type="submit" size="sm" variant="outline">
            <Eye className="size-4" />
            Preview as parent
          </Button>
        </form>
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Students ({students.length})
          </h2>
        </div>

        {students.length > 0 ? (
          <ul className="space-y-3">
            {students.map((student) => (
              <StudentAdminRow
                key={student.id}
                userId={student.id}
                displayName={student.displayName}
                email={student.email}
                status={student.status}
                initials={student.initials}
                role={student.role}
                memberships={student.memberships}
                passwordManagementEnabled={passwordManagementEnabled}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium text-foreground">No students yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create the first student account above.
            </p>
          </div>
        )}
      </section>
    </ShellPage>
  );
}
