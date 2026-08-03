import { RoleAssignmentForm } from "@/components/auth/role-assignment-form";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { canAccessAdmin, ROLE_LABELS } from "@/config/roles";
import { INTEGRATIONS } from "@/config/integrations";
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

        <DashboardCard
          title="Integrations"
          description="External system connections and sync status."
          status={{ label: "W10", variant: "info" }}
        >
          <ul className="space-y-3">
            {INTEGRATIONS.map((integration) => (
              <li
                key={integration.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div>
                  <p className="font-medium text-foreground">{integration.name}</p>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {integration.lastSyncLabel}
                    {integration.itemsSynced != null
                      ? ` · ${integration.itemsSynced} items`
                      : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    integration.status === "connected"
                      ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                      : integration.status === "syncing"
                        ? "bg-[#2F80ED]/10 text-[#2F80ED]"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {integration.status}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </ShellPage>
  );
}
