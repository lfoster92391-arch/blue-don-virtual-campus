import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import { AdminUserRow } from "@/components/admin/admin-user-row";
import { ServiceDeskUserCreate } from "@/components/service-desk/user-create-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { isSupabaseAdminConfigured } from "@/config/env";
import { canManageUsers } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listCampusUsers } from "@/services/user-service";
import { listStudentOptions } from "@/services/parent-student-service";

export default async function ServiceDeskUsersPage() {
  const user = await requireCompleteProfile();

  if (!canManageUsers(user.role)) {
    redirect("/service-desk");
  }

  const [users, students] = await Promise.all([
    listCampusUsers(),
    listStudentOptions(),
  ]);
  const accountManagementEnabled = isSupabaseAdminConfigured();

  return (
    <ShellPage
      title="Account management"
      description="Create campus logins and manage roles and passwords for students, staff, and families."
      actions={
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/service-desk">
              <ArrowLeft className="size-4" />
              Back to Service Desk
            </Link>
          }
        />
      }
    >
      {!accountManagementEnabled ? (
        <div className="rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Account creation and password resets are disabled
          </p>
          <p className="mt-1">
            Set <code>SUPABASE_SERVICE_ROLE_KEY</code> in the server environment
            to enable creating accounts and resetting passwords. Role changes still
            work without it.
          </p>
        </div>
      ) : null}

      <ServiceDeskUserCreate />

      <section className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Campus accounts ({users.length})
          </h2>
        </div>

        {users.length > 0 ? (
          <ul className="space-y-3">
            {users.map((campusUser) => (
              <AdminUserRow
                key={campusUser.id}
                userId={campusUser.id}
                displayName={campusUser.displayName}
                email={campusUser.email}
                role={campusUser.role}
                status={campusUser.status}
                initials={campusUser.initials}
                passwordManagementEnabled={accountManagementEnabled}
                students={students}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium text-foreground">No accounts yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create the first campus account above.
            </p>
          </div>
        )}
      </section>
    </ShellPage>
  );
}
