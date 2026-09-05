import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound, Users } from "lucide-react";

import { ResetPasswordFields } from "@/components/admin/reset-password-fields";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseAdminConfigured } from "@/config/env";
import {
  CAMPUS_ROLES,
  ROLE_LABELS,
  canManageUsers,
  type CampusRole,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { searchCampusUsers } from "@/services/user-service";

const ROLE_FILTERS: Array<{ value: "" | CampusRole; label: string }> = [
  { value: "", label: "All roles" },
  { value: "student", label: ROLE_LABELS.student },
  { value: "teacher", label: ROLE_LABELS.teacher },
  { value: "staff", label: ROLE_LABELS.staff },
  { value: "parent", label: ROLE_LABELS.parent },
  { value: "advisor", label: ROLE_LABELS.advisor },
  { value: "counselor", label: ROLE_LABELS.counselor },
  { value: "coach", label: ROLE_LABELS.coach },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "alumni", label: ROLE_LABELS.alumni },
  { value: "sponsor", label: ROLE_LABELS.sponsor },
];

function isCampusRole(value: string | undefined): value is CampusRole {
  return Boolean(value && (CAMPUS_ROLES as string[]).includes(value));
}

type AdminPasswordsPageProps = {
  searchParams: Promise<{ q?: string; role?: string }>;
};

export default async function AdminPasswordsPage({
  searchParams,
}: AdminPasswordsPageProps) {
  const user = await requireCompleteProfile();

  if (!canManageUsers(user.role)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const role = isCampusRole(params.role) ? params.role : undefined;
  const passwordManagementEnabled = isSupabaseAdminConfigured();
  const searched = Boolean(query || role);
  const matches = searched
    ? await searchCampusUsers({ query, role, take: 40 })
    : [];

  return (
    <ShellPage
      title="Reset passwords"
      description="Look up a student, teacher, staff member, parent, or any campus user and set a new password they can use immediately."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/students">Students</Link>}
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
            Password reset needs the Supabase service role
          </p>
          <p className="mt-1">
            Set <code>SUPABASE_SERVICE_ROLE_KEY</code> on the server. This page
            never exposes that key to the browser.
          </p>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Find a user
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by name or email. Filter by role to narrow students, staff,
          teachers, or parents.
        </p>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem_auto]" method="get">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Name or email"
            aria-label="Search name or email"
          />
          <select
            name="role"
            defaultValue={role ?? ""}
            aria-label="Role"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {ROLE_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="action">
            Find users
          </Button>
        </form>
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            {searched ? `Results (${matches.length})` : "Search to begin"}
          </h2>
        </div>

        {!searched ? (
          <p className="text-sm text-muted-foreground">
            Enter a name, email, or role to look up an account.
          </p>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium text-foreground">No matching users</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another name, email, or role filter.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {matches.map((campusUser) => (
              <li
                key={campusUser.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#0A2342] text-xs font-semibold text-white">
                      {campusUser.initials}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {campusUser.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {campusUser.email}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {ROLE_LABELS[campusUser.role]}
                  </span>
                </div>
                <div className="mt-4">
                  <ResetPasswordFields
                    userId={campusUser.id}
                    enabled={passwordManagementEnabled}
                    compact
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ShellPage>
  );
}
