import Link from "next/link";
import { BookOpen, ChevronRight, ClipboardList } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { DashboardAssignment } from "@/lib/dashboard/mock-data";

type DashboardAssignmentsProps = {
  assignments: DashboardAssignment[];
};

export function DashboardAssignments({ assignments }: DashboardAssignmentsProps) {
  const hasAssignments = assignments.length > 0;

  return (
    <DashboardCard
      title="Assignments"
      description="Due dates and coursework"
      icon={<ClipboardList className="size-4" />}
      status={{ label: hasAssignments ? "Active" : "Empty", variant: "default" }}
      actions={
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/assignments">
              View all
              <ChevronRight className="size-4" />
            </Link>
          }
        />
      }
      expandable
    >
      {hasAssignments ? (
        <ul className="space-y-3">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{assignment.title}</p>
                <p className="text-sm text-muted-foreground">{assignment.course}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {assignment.dueLabel}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
            <BookOpen className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No assignments due yet
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Event-linked assignments and academy deadlines appear here as they
              are published.
            </p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
