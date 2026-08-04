"use client";

import { useActionState } from "react";
import { CheckSquare } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  assignClubTaskAction,
  deleteClubTaskAction,
  updateClubTaskStatusAction,
  type ClubTaskActionState,
} from "@/features/club-tasks/actions";
import {
  CLUB_STUDENT_TASK_STATUS_LABELS,
  type ClubStudentTaskView,
} from "@/lib/command-center";

const initialState: ClubTaskActionState = {};

type MemberOption = {
  userId: string;
  displayName: string;
};

type ClubTasksPanelProps = {
  organizationId: string;
  organizationSlug: string;
  clubName: string;
  members: MemberOption[];
  tasks: ClubStudentTaskView[];
  canAssign: boolean;
};

export function ClubTasksPanel({
  organizationId,
  organizationSlug,
  clubName,
  members,
  tasks,
  canAssign,
}: ClubTasksPanelProps) {
  const [state, action, pending] = useActionState(
    assignClubTaskAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <DashboardCard
        title="My Tasks (club)"
        description={`Assigned work for ${clubName} members. Students update status from Command Center.`}
        icon={<CheckSquare className="size-5" />}
      >
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.assigneeName} ·{" "}
                    {CLUB_STUDENT_TASK_STATUS_LABELS[task.status]}
                    {task.isPastDue ? " · past due" : ""}
                    {task.dueAt
                      ? ` · due ${new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(task.dueAt))}`
                      : ""}
                  </p>
                </div>
                {canAssign ? (
                  <div className="flex flex-wrap gap-2">
                    <form action={updateClubTaskStatusAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input
                        type="hidden"
                        name="organizationSlug"
                        value={organizationSlug}
                      />
                      <input type="hidden" name="status" value="COMPLETED" />
                      <Button type="submit" size="sm" variant="outline">
                        Complete
                      </Button>
                    </form>
                    <form action={deleteClubTaskAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input
                        type="hidden"
                        name="organizationSlug"
                        value={organizationSlug}
                      />
                      <Button type="submit" size="sm" variant="ghost">
                        Remove
                      </Button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {canAssign ? (
        <DashboardCard
          title="Assign task"
          description="President and Vice President can push tasks to members."
        >
          <form action={action} className="grid gap-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input
              type="hidden"
              name="organizationSlug"
              value={organizationSlug}
            />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Title</span>
              <input
                name="title"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Prep materials for Friday meeting"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Description</span>
              <textarea
                name="description"
                rows={2}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Due</span>
              <input
                name="dueAt"
                type="datetime-local"
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="wholeClub" />
              Assign to whole club
            </label>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Assignees</legend>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {members.map((member) => (
                  <label
                    key={member.userId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="assigneeIds"
                      value={member.userId}
                    />
                    {member.displayName}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Assigning…" : "Assign task"}
              </Button>
              {state.error ? (
                <p className="mt-2 text-sm text-destructive">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="mt-2 text-sm text-[#2E8B57]">{state.success}</p>
              ) : null}
            </div>
          </form>
        </DashboardCard>
      ) : null}
    </div>
  );
}
