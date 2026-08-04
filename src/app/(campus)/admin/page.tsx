import Link from "next/link";
import {
  Archive,
  BarChart3,
  BookOpen,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck,
  FileText,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Handshake,
  Layers,
  Scale,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import {
  canAccessAdmin,
  canApproveForms,
  canManageUsers,
  canViewLeadershipAnalytics,
  canViewSuccessAnalytics,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getComplianceIssues,
  listArchivedForms,
  listPendingApprovals,
} from "@/services/form-service";
import { listPendingMemberships } from "@/services/academy-service";
import { countPendingPartners } from "@/services/business-partner-service";
import { countPendingCommunityPartners } from "@/services/partner-service";
import { countPendingMentorItems } from "@/services/mentor-network-service";
import { listPendingParents } from "@/services/parent-student-service";

type AdminSection = {
  title: string;
  description: string;
  href: string;
  icon: typeof Users;
  count: number | null;
};

export default async function AdminPage() {
  const user = await requireCompleteProfile();

  if (!canAccessAdmin(user.role) && !canApproveForms(user.role)) {
    redirect("/dashboard");
  }

  const canManageAccounts = canManageUsers(user.role);
  const showSuccessAnalytics = canViewSuccessAnalytics(user.role);
  const showLeadershipDashboard = canViewLeadershipAnalytics(user.role);

  if (FOCUSED_CLUBS_MODE) {
    const focusedSections: AdminSection[] = [
      ...(showLeadershipDashboard
        ? [
            {
              title: "Principal Dashboard",
              description:
                "Club funds, invoices, memberships, and school pulse",
              href: "/admin/leadership",
              icon: BarChart3,
              count: null,
            },
          ]
        : []),
      ...(canManageAccounts
        ? [
            {
              title: "Students",
              description:
                "Create students, assign clubs and roles, preview their view",
              href: "/admin/students",
              icon: Users,
              count: null,
            },
          ]
        : []),
    ];

    return (
      <ShellPage
        title="Admin"
        description="Students and leadership tools for Blue Don clubs."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {focusedSections.map((section) => {
            const Icon = section.icon;

            return (
              <DashboardCard
                key={section.title}
                title={section.title}
                description={section.description}
                icon={<Icon className="size-4" />}
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
                  Open this tool to manage campus operations.
                </p>
              </DashboardCard>
            );
          })}
        </div>
      </ShellPage>
    );
  }

  const [
    pendingApprovals,
    complianceIssues,
    archivedForms,
    pendingMemberships,
    pendingParents,
    pendingBusinessPartners,
    pendingCommunityPartners,
    pendingMentors,
  ] = await Promise.all([
    listPendingApprovals(),
    getComplianceIssues(),
    listArchivedForms(),
    listPendingMemberships(),
    listPendingParents(),
    countPendingPartners(),
    countPendingCommunityPartners(),
    countPendingMentorItems(),
  ]);

  const pendingPartners = pendingBusinessPartners + pendingCommunityPartners;

  const sections: AdminSection[] = [
    ...(showLeadershipDashboard
      ? [
          {
            title: "Principal Dashboard",
            description:
              "Leadership command center — club funds, invoices, memberships, and school pulse",
            href: "/admin/leadership",
            icon: BarChart3,
            count: null,
          },
        ]
      : []),
    ...(showSuccessAnalytics
      ? [
          {
            title: "Success Analytics",
            description:
              "Support students — celebrate wins and close opportunity gaps",
            href: "/counselor/analytics",
            icon: BarChart3,
            count: null,
          },
        ]
      : []),
    ...(canManageAccounts
      ? [
          {
            title: "Students control center",
            description:
              "Create students, assign clubs/roles, preview their view, reset passwords",
            href: "/admin/students",
            icon: Users,
            count: null,
          },
          {
            title: "All user accounts",
            description: "Campus-wide roles, passwords, and parent links",
            href: "/service-desk/users",
            icon: Users,
            count: null,
          },
          {
            title: "Parent approvals",
            description: "Approve parent accounts and link students",
            href: "/admin/parent-approvals",
            icon: UserCheck,
            count: pendingParents.length,
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
      title: "Forms Center",
      description: "Agreement completion rates and approval queues",
      href: "/admin/forms-center",
      icon: FileCheck,
      count: null,
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
      title: "Partners",
      description: "Approve business and community partner applications",
      href: "/admin/partners",
      icon: Building2,
      count: pendingPartners,
    },
    {
      title: "Mentor Network",
      description: "Approve mentor profiles and student connection requests",
      href: "/admin/mentors",
      icon: Handshake,
      count: pendingMentors.profiles + pendingMentors.connections,
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
