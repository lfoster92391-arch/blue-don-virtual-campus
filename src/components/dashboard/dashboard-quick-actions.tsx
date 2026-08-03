import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CircleDollarSign,
  ClipboardList,
  Compass,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Headphones,
  Scale,
  Settings,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { canAccessAdmin, canApproveForms, isFacultyClubLookupRole } from "@/config/roles";
import type { CampusUser } from "@/types/auth";
import { canAccessParentPortal } from "@/services/parent-student-service";
import { cn } from "@/lib/utils";

type QuickAction = {
  label: string;
  description: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  phase?: string;
};

type DashboardQuickActionsProps = {
  user: CampusUser;
  hasLinkedStudents?: boolean;
};

export function DashboardQuickActions({
  user,
  hasLinkedStudents = false,
}: DashboardQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      label: "My Profile",
      description: "View your campus identity",
      href: "/profile",
      icon: User,
      enabled: true,
    },
    {
      label: "Settings",
      description: "Account and preferences",
      href: "/settings",
      icon: Settings,
      enabled: true,
    },
    {
      label: "Career Pathways",
      description: "Explore destinations and recommended labs",
      href: "/pathways",
      icon: Compass,
      enabled: true,
    },
    {
      label: "Scholarships",
      description: "Matched awards you may qualify for",
      href: "/scholarships",
      icon: Sparkles,
      enabled: true,
    },
    {
      label: "Academies",
      description: "Madonna Education Network pathways",
      href: "/academies",
      icon: GraduationCap,
      enabled: true,
    },
    {
      label: "Calendar",
      description: "Schedules and deadlines",
      href: "/calendar",
      icon: Calendar,
      enabled: true,
    },
    {
      label: "Forms",
      description: "Agreements and onboarding",
      href: "/forms",
      icon: ClipboardList,
      enabled: true,
    },
    {
      label: "Assignments",
      description: "Coursework and submissions",
      href: "/assignments",
      icon: ClipboardList,
      enabled: true,
    },
    {
      label: "Portfolio",
      description: "Achievements and projects",
      href: "/portfolio",
      icon: Trophy,
      enabled: true,
    },
    {
      label: "Checklists",
      description: "Event and academy task lists",
      href: "/checklists",
      icon: ClipboardList,
      enabled: true,
    },
    {
      label: "Service Desk",
      description: "Get help from campus support",
      href: "/service-desk",
      icon: Headphones,
      enabled: true,
    },
    {
      label: "Knowledge Vault",
      description: "Guides and campus resources",
      href: "/knowledge",
      icon: BookOpen,
      enabled: true,
    },
    {
      label: "Labs",
      description: "Hands-on virtual lab environments",
      href: "/labs",
      icon: FlaskConical,
      enabled: true,
    },
    {
      label: "Simulators",
      description: "Interactive learning simulations",
      href: "/simulators",
      icon: Gamepad2,
      enabled: true,
    },
    {
      label: "Impact Fund",
      description: "Student-led project grants",
      href: "/impact-fund",
      icon: CircleDollarSign,
      enabled: true,
    },
  ];

  if (canAccessAdmin(user.role)) {
    actions.splice(2, 0, {
      label: "Governance",
      description: "Forms, approvals, and compliance",
      href: "/admin",
      icon: Scale,
      enabled: true,
    });
  } else if (canApproveForms(user.role)) {
    actions.splice(2, 0, {
      label: "Approvals",
      description: "Review signed submissions",
      href: "/admin/approvals",
      icon: Scale,
      enabled: true,
    });
  }

  if (canAccessParentPortal(user.role, hasLinkedStudents)) {
    actions.splice(1, 0, {
      label: "Parent Portal",
      description: "Family form status",
      href: "/parent",
      icon: User,
      enabled: true,
    });
  }

  if (isFacultyClubLookupRole(user.role)) {
    actions.splice(1, 0, {
      label: "Clubs & Organizations",
      description: "Browse every club to answer student questions",
      href: "/find-your-place",
      icon: GraduationCap,
      enabled: true,
    });
  }

  if (user.role === "teacher") {
    actions.splice(2, 0, {
      label: "Class wishlists",
      description: "Manage classroom supply requests",
      href: "/teacher/wishlists",
      icon: ClipboardList,
      enabled: true,
    });
  }

  return (
    <DashboardCard
      title="Quick Actions"
      description="Jump to what you need"
      expandable
      defaultExpanded
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  action.enabled
                    ? "bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 text-left">
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                {!action.enabled && action.phase ? (
                  <p className="mt-1 text-xs text-[#2F80ED]">{action.phase}</p>
                ) : null}
              </div>
            </>
          );

          if (action.enabled && action.href) {
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto w-full justify-start gap-3 px-3 py-3 text-left whitespace-normal"
                nativeButton={false}
                render={<Link href={action.href}>{content}</Link>}
              />
            );
          }

          return (
            <div
              key={action.label}
              className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 opacity-80"
              aria-disabled="true"
            >
              {content}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
