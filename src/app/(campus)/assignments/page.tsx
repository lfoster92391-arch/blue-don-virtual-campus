import Link from "next/link";

import { AssignmentStatusActions } from "@/components/assignments/assignment-status-actions";
import { ShellPage } from "@/components/layout/shell-page";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAssignmentsForUser } from "@/services/assignment-service";

export default async function AssignmentsPage() {
  const user = await requireCompleteProfile();
  const assignments = await listAssignmentsForUser(user.id, {
    includeUnassigned: true,
  });

  const dueThisWeek = assignments.filter((a) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    return a.dueDate <= weekEnd;
  });

  return (
    <ShellPage
      title="Assignments"
      description="Track coursework, event tasks, and academy deadlines."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-semibold">{assignments.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Due this week</p>
          <p className="text-2xl font-semibold text-[#D4A017]">{dueThisWeek.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">—</p>
        </div>
      </div>

      {assignments.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.academyName ?? "Campus"}
                    {assignment.eventTitle ? ` · ${assignment.eventTitle}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due {assignment.dueLabel} · {assignment.points} pts
                  </p>
                  {assignment.eventId ? (
                    <Link
                      href={`/events/${assignment.eventId}`}
                      className="mt-2 inline-block text-sm text-[#2F80ED] hover:underline"
                    >
                      View event
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs uppercase text-muted-foreground">
                    {assignment.status.toLowerCase().replace("_", " ")}
                  </span>
                  <AssignmentStatusActions
                    assignmentId={assignment.id}
                    status={assignment.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No assignments yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Event-linked and academy assignments appear here when published.
          </p>
          <Link href="/events" className="mt-4 inline-block text-sm text-[#2F80ED] hover:underline">
            Browse events
          </Link>
        </div>
      )}
    </ShellPage>
  );
}
