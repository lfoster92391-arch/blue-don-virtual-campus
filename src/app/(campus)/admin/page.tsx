import Link from "next/link";
import {
  Archive,
  BookOpen,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Layers,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canAccessAdmin, canApproveForms, canManageUsers } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getComplianceIssues,
  listArchivedForms,
  listPendingApprovals,
} from "@/services/form-service";
import { listPendingMemberships } from "@/services/academy-service";

export default async function AdminPage() {
  const user = await requireCompleteProfile();

  if (!canAccessAdmin(user.role) && !canApproveForms(user.role)) {
    redirect("/dashboard");
  }

  const [pendingApprovals, complianceIssues, archivedForms, pendingMemberships] =
    await Promise.all([
      listPendingApprovals(),
      getComplianceIssues(),
      listArchivedForms(),
      listPendingMemberships(),
    ]);

  const canManageAccounts = canManageUsers(user.role);

  const sections = [
    ...(canManageAccounts
      ? [
          {
            title: "User accounts",
            description: "Manage roles and reset passwords",
            href: "/service-desk/users",
            icon: Users,
            count: null,
          },
        ]
      : []),
    {
      title: "Form templates",
      description: "Create, publish, and archive campus forms",
      href: "/admin/forms",
      icon: FileText,
      count: null,
    },
    {
      title: "Approvals queue",
      description: "Review signed submissions awaiting action",
      href: "/admin/approvals",
      icon: ClipboardCheck,
      count: pendingApprovals.length,
    },
    {
      title: "Compliance",
      description: "Missing, unsigned, and expired form tracking",
      href: "/admin/compliance",
      icon: ShieldCheck,
      count: complianceIssues.length,
    },
    {
      title: "Academy memberships",
      description: "Review student academy join requests",
      href: "/admin/academies",
      icon: GraduationCap,
      count: pendingMemberships.length,
    },
    {
      title: "Learning modules",
      description: "Academy Engine module catalog",
      href: "/admin/academy-engine/modules",
      icon: Layers,
      count: null,
    },
    {
      title: "Certifications",
      description: "Academy Engine certification tracks",
      href: "/admin/academy-engine/certifications",
      icon: GraduationCap,
      count: null,
    },
    {
      title: "Knowledge Vault",
      description: "Publish campus guides and resources",
      href: "/admin/knowledge",
      icon: BookOpen,
      count: null,
    },
    {
      title: "Labs",
      description: "Virtual lab environments and sessions",
      href: "/admin/labs",
      icon: FlaskConical,
      count: null,
    },
    {
      title: "Simulators",
      description: "Interactive simulation modules",
      href: "/admin/simulators",
      icon: Gamepad2,
      count: null,
    },
    {
      title: "Impact Fund",
      description: "Review proposals and allocate grants",
      href: "/admin/impact-fund",
      icon: CircleDollarSign,
      count: null,
    },
    {
      title: "Constitution",
      description: "Campus governance charter and policies",
      href: "/admin/constitution",
      icon: Scale,
      count: null,
    },
    {
      title: "Archive",
      description: "Retired forms retained for records",
      href: "/admin/forms?archived=1",
      icon: Archive,
      count: archivedForms.length,
    },
  ];

  return (
    <ShellPage
      title="Governance Center"
      description="Operate Blue Don programs — forms, approvals, compliance, and campus policy."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <DashboardCard
              key={section.title}
              title={section.title}
              description={section.description}
              icon={<Icon className="size-4" />}
              status={
                section.count !== null && section.count > 0
                  ? { label: `${section.count} open`, variant: "warning" }
                  : undefined
              }
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={section.href}>Open</Link>}
                />
              }
            >
              <p className="text-sm text-muted-foreground">
                {section.count !== null
                  ? `${section.count} item${section.count === 1 ? "" : "s"} need attention`
                  : "Manage campus governance workflows from this hub."}
              </p>
            </DashboardCard>
          );
        })}
      </div>
    </ShellPage>
  );
}
