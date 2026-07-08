import { Activity, ClipboardCheck, Shield, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";

type AdminPlaceholderWidgetProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

function AdminPlaceholderWidget({
  title,
  description,
  icon: Icon,
}: AdminPlaceholderWidgetProps) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground">
          Detailed {title.toLowerCase()} data ships in a later phase. Campus
          operations remain available from Governance and existing admin routes.
        </p>
      </div>
    </DashboardCard>
  );
}

export function AdminSystemHealthWidget() {
  return (
    <AdminPlaceholderWidget
      title="System Health"
      description="Integrations and background jobs"
      icon={Activity}
    />
  );
}

export function AdminComplianceWidget() {
  return (
    <AdminPlaceholderWidget
      title="Compliance Summary"
      description="Forms and agreements status"
      icon={ClipboardCheck}
    />
  );
}

export function AdminEnrollmentWidget() {
  return (
    <AdminPlaceholderWidget
      title="Enrollment Snapshot"
      description="Active users by role"
      icon={Users}
    />
  );
}

export function AdminModerationWidget() {
  return (
    <AdminPlaceholderWidget
      title="Moderation Queue"
      description="Feed and media flags"
      icon={Shield}
    />
  );
}
