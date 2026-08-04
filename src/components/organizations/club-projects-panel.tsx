"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  createClubChecklistAction,
  createClubProjectAction,
  deleteClubChecklistAction,
  deleteClubProjectAction,
  toggleClubChecklistItemAction,
  updateClubProjectAction,
  type ClubProjectActionState,
} from "@/features/club-projects/actions";
import {
  CLUB_PROJECT_STATUS_LABELS,
  type ClubChecklistView,
  type ClubProjectView,
} from "@/lib/club-workspace-types";
import type { ClubProjectStatus } from "@/generated/prisma/client";

const initialState: ClubProjectActionState = {};

const STATUSES = Object.keys(
  CLUB_PROJECT_STATUS_LABELS,
) as ClubProjectStatus[];

export function ClubProjectsPanel({
  organizationId,
  organizationSlug,
  projects,
  canManage,
}: {
  organizationId: string;
  organizationSlug: string;
  projects: ClubProjectView[];
  canManage: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(
    createClubProjectAction,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateClubProjectAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Cricut projects"
        description="Track maker projects — title, description, status, and owner."
      >
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects yet.
            {canManage ? " Create the first project below." : null}
          </p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {CLUB_PROJECT_STATUS_LABELS[project.status]}
                    </p>
                    <h3 className="mt-1 font-semibold text-[#0A2342] dark:text-white">
                      {project.title}
                    </h3>
                    {project.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Owner: {project.ownerName ?? "Unassigned"}
                    </p>
                  </div>
                  {canManage ? (
                    <form action={deleteClubProjectAction}>
                      <input
                        type="hidden"
                        name="organizationId"
                        value={organizationId}
                      />
                      <input
                        type="hidden"
                        name="organizationSlug"
                        value={organizationSlug}
                      />
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Delete
                      </Button>
                    </form>
                  ) : null}
                </div>

                {canManage ? (
                  <form
                    action={updateAction}
                    className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2"
                  >
                    <input
                      type="hidden"
                      name="organizationId"
                      value={organizationId}
                    />
                    <input
                      type="hidden"
                      name="organizationSlug"
                      value={organizationSlug}
                    />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      name="title"
                      defaultValue={project.title}
                      required
                      className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm sm:col-span-2"
                    />
                    <textarea
                      name="description"
                      defaultValue={project.description ?? ""}
                      rows={2}
                      className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm sm:col-span-2"
                    />
                    <select
                      name="status"
                      defaultValue={project.status}
                      className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {CLUB_PROJECT_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="hidden"
                      name="ownerUserId"
                      value={project.ownerUserId ?? ""}
                    />
                    <Button type="submit" size="sm" disabled={updatePending}>
                      Update
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {updateState.error ? (
          <p className="mt-2 text-xs text-destructive">{updateState.error}</p>
        ) : null}
      </DashboardCard>

      {canManage ? (
        <DashboardCard title="New project" description="Officers can create and assign projects.">
          <form action={createAction} className="space-y-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input
              type="hidden"
              name="organizationSlug"
              value={organizationSlug}
            />
            <input
              name="title"
              required
              placeholder="Project title"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            />
            <textarea
              name="description"
              rows={3}
              placeholder="Description"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
            <select
              name="status"
              defaultValue="PLANNING"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {CLUB_PROJECT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={createPending}>
              {createPending ? "Saving…" : "Create project"}
            </Button>
            {createState.error ? (
              <p className="text-xs text-destructive">{createState.error}</p>
            ) : null}
            {createState.success ? (
              <p className="text-xs text-[#2E8B57]">{createState.success}</p>
            ) : null}
          </form>
        </DashboardCard>
      ) : null}
    </div>
  );
}

export function ClubChecklistsPanel({
  organizationId,
  organizationSlug,
  checklists,
  projects,
  canManage,
  canComplete,
}: {
  organizationId: string;
  organizationSlug: string;
  checklists: ClubChecklistView[];
  projects: ClubProjectView[];
  canManage: boolean;
  canComplete: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(
    createClubChecklistAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Checklists"
        description="Standalone or project-linked task lists. Members can mark items done."
      >
        {checklists.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No checklists yet.
            {canManage ? " Create one below." : null}
          </p>
        ) : (
          <ul className="space-y-5">
            {checklists.map((list) => (
              <li
                key={list.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[#0A2342] dark:text-white">
                      {list.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {list.projectTitle
                        ? `Tied to ${list.projectTitle}`
                        : "Standalone"}
                    </p>
                  </div>
                  {canManage ? (
                    <form action={deleteClubChecklistAction}>
                      <input
                        type="hidden"
                        name="organizationId"
                        value={organizationId}
                      />
                      <input
                        type="hidden"
                        name="organizationSlug"
                        value={organizationSlug}
                      />
                      <input
                        type="hidden"
                        name="checklistId"
                        value={list.id}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Delete
                      </Button>
                    </form>
                  ) : null}
                </div>
                <ul className="mt-3 space-y-2">
                  {list.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      {canComplete ? (
                        <form action={toggleClubChecklistItemAction}>
                          <input
                            type="hidden"
                            name="organizationId"
                            value={organizationId}
                          />
                          <input
                            type="hidden"
                            name="organizationSlug"
                            value={organizationSlug}
                          />
                          <input type="hidden" name="itemId" value={item.id} />
                          <input
                            type="hidden"
                            name="done"
                            value={item.done ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="mt-0.5 flex size-4 items-center justify-center rounded border border-border"
                            aria-label={
                              item.done ? "Mark incomplete" : "Mark complete"
                            }
                          >
                            {item.done ? "✓" : ""}
                          </button>
                        </form>
                      ) : (
                        <span className="mt-0.5 flex size-4 items-center justify-center rounded border border-border text-xs">
                          {item.done ? "✓" : ""}
                        </span>
                      )}
                      <span
                        className={
                          item.done
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }
                      >
                        {item.title}
                        {item.done && item.doneByName ? (
                          <span className="ml-2 text-xs no-underline">
                            ({item.doneByName})
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {canManage ? (
        <DashboardCard
          title="New checklist"
          description="Add items one per line. Optionally tie the list to a project."
        >
          <form action={createAction} className="space-y-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input
              type="hidden"
              name="organizationSlug"
              value={organizationSlug}
            />
            <input
              name="title"
              required
              placeholder="Checklist title"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            />
            <select
              name="projectId"
              defaultValue=""
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Standalone (no project)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <textarea
              name="items"
              rows={5}
              placeholder={"Cut vinyl\nWeed design\nPress HTV"}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm" disabled={createPending}>
              {createPending ? "Saving…" : "Create checklist"}
            </Button>
            {createState.error ? (
              <p className="text-xs text-destructive">{createState.error}</p>
            ) : null}
            {createState.success ? (
              <p className="text-xs text-[#2E8B57]">{createState.success}</p>
            ) : null}
          </form>
        </DashboardCard>
      ) : null}
    </div>
  );
}
