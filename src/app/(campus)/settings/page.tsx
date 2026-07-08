import { RoleAssignmentForm } from "@/components/auth/role-assignment-form";
import { ShellPage } from "@/components/layout/shell-page";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { canAccessAdmin, ROLE_LABELS } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireCompleteProfile();

  return (
    <ShellPage
      title="Settings"
      description="Manage your campus experience and display preferences."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium text-foreground">Theme</h2>
              <p className="text-sm text-muted-foreground">
                Light mode is the primary campus experience. Dark and system
                modes are also supported.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-medium text-foreground">Access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current role:{" "}
            <span className="font-medium text-foreground">
              {ROLE_LABELS[user.role]}
            </span>
          </p>
        </div>

        {canAccessAdmin(user.role) ? <RoleAssignmentForm /> : null}
      </div>
    </ShellPage>
  );
}
