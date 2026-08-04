"use client";

import Link from "next/link";
import { CheckSquare, TriangleAlert } from "lucide-react";

import { updateClubTaskStatusAction } from "@/features/club-tasks/actions";
import {
  CLUB_STUDENT_TASK_STATUS_LABELS,
  type ClubStudentTaskView,
} from "@/lib/command-center";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommandCenterTasksProps = {
  tasks: ClubStudentTaskView[];
};

const NEXT_STATUS: Record<
  ClubStudentTaskView["status"],
  ClubStudentTaskView["status"] | null
> = {
  NOT_STARTED: "IN_PROGRESS",
  IN_PROGRESS: "SUBMITTED",
  SUBMITTED: "COMPLETED",
  COMPLETED: null,
};

export function CommandCenterTasks({ tasks }: CommandCenterTasksProps) {
  const pastDue = tasks.filter((t) => t.isPastDue);
  const upcoming = tasks.filter((t) => !t.isPastDue);

  return (
    <section
      aria-labelledby="cc-tasks-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <CheckSquare className="size-5 text-[#0A2342] dark:text-white" />
        <h2
          id="cc-tasks-heading"
          className="text-lg font-semibold text-[#0A2342] dark:text-white"
        >
          My Tasks
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Assigned by your club President or Vice President.
      </p>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No open tasks right now.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {pastDue.length > 0 ? (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#C0392B]">
                <TriangleAlert className="size-3.5" />
                Past due
              </p>
              <ul className="space-y-2">
                {pastDue.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </ul>
            </div>
          ) : null}
          {upcoming.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Coming up
              </p>
              <ul className="space-y-2">
                {upcoming.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function TaskRow({ task }: { task: ClubStudentTaskView }) {
  const next = NEXT_STATUS[task.status];

  return (
    <li
      className={cn(
        "rounded-xl border px-4 py-3",
        task.isPastDue
          ? "border-[#C0392B]/30 bg-[#C0392B]/5"
          : "border-border",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-foreground">{task.title}</p>
          <p className="text-sm text-muted-foreground">
            {task.organizationName}
            {" · "}
            {CLUB_STUDENT_TASK_STATUS_LABELS[task.status]}
            {task.dueAt
              ? ` · due ${new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(task.dueAt))}`
              : ""}
          </p>
          {task.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {task.description}
            </p>
          ) : null}
          <Link
            href={`/organizations/${task.organizationSlug}`}
            className="mt-1 inline-block text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Open club
          </Link>
        </div>
        {next ? (
          <form action={updateClubTaskStatusAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <input
              type="hidden"
              name="organizationSlug"
              value={task.organizationSlug}
            />
            <input type="hidden" name="status" value={next} />
            <Button type="submit" size="sm" variant="outline">
              Mark {CLUB_STUDENT_TASK_STATUS_LABELS[next].toLowerCase()}
            </Button>
          </form>
        ) : null}
      </div>
    </li>
  );
}
