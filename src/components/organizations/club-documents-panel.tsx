"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  createClubDocumentAction,
  deleteClubDocumentAction,
  updateClubDocumentAction,
  type ClubDocumentActionState,
} from "@/features/club-documents/actions";
import {
  CLUB_DOCUMENT_TYPE_LABELS,
  type ClubDocumentView,
} from "@/lib/club-workspace-types";
import type { ClubDocumentType } from "@/generated/prisma/client";

const initialState: ClubDocumentActionState = {};

const DOC_TYPES = Object.keys(
  CLUB_DOCUMENT_TYPE_LABELS,
) as ClubDocumentType[];

export function ClubDocumentsPanel({
  organizationId,
  organizationSlug,
  documents,
  canEdit,
}: {
  organizationId: string;
  organizationSlug: string;
  documents: ClubDocumentView[];
  canEdit: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(
    createClubDocumentAction,
    initialState,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateState, updateAction, updatePending] = useActionState(
    updateClubDocumentAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Club documents"
        description="Bylaws, constitution, and other group documents for IT Club."
      >
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents yet.
            {canEdit
              ? " Create bylaws or a constitution below."
              : " Officers will publish documents here."}
          </p>
        ) : (
          <ul className="space-y-4">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {CLUB_DOCUMENT_TYPE_LABELS[doc.docType]}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[#0A2342] dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Updated{" "}
                      {doc.updatedAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {doc.createdByName}
                    </p>
                  </div>
                  {canEdit ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditingId(editingId === doc.id ? null : doc.id)
                        }
                      >
                        {editingId === doc.id ? "Close" : "Edit"}
                      </Button>
                      <form action={deleteClubDocumentAction}>
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
                          name="documentId"
                          value={doc.id}
                        />
                        <Button type="submit" size="sm" variant="outline">
                          Delete
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </div>

                {doc.body ? (
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {doc.body}
                  </div>
                ) : null}
                {doc.fileUrl ? (
                  <p className="mt-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#2F80ED] hover:underline"
                    >
                      Open attached file
                    </a>
                  </p>
                ) : null}

                {canEdit && editingId === doc.id ? (
                  <form action={updateAction} className="mt-4 space-y-3 border-t border-border pt-4">
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
                    <input type="hidden" name="documentId" value={doc.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        name="title"
                        defaultValue={doc.title}
                        required
                        className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                      />
                      <select
                        name="docType"
                        defaultValue={doc.docType}
                        className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                      >
                        {DOC_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {CLUB_DOCUMENT_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      name="body"
                      defaultValue={doc.body ?? ""}
                      rows={8}
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                      placeholder="Document text"
                    />
                    <input
                      name="fileUrl"
                      defaultValue={doc.fileUrl ?? ""}
                      placeholder="Optional file URL"
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                    />
                    <Button type="submit" size="sm" disabled={updatePending}>
                      {updatePending ? "Saving…" : "Save changes"}
                    </Button>
                    {updateState.error ? (
                      <p className="text-xs text-destructive">
                        {updateState.error}
                      </p>
                    ) : null}
                    {updateState.success ? (
                      <p className="text-xs text-[#2E8B57]">
                        {updateState.success}
                      </p>
                    ) : null}
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {canEdit ? (
        <DashboardCard
          title="Add document"
          description="President, Vice President, and Secretary can publish bylaws, constitution, and related materials."
        >
          <form action={createAction} className="space-y-3">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input
              type="hidden"
              name="organizationSlug"
              value={organizationSlug}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="title"
                required
                placeholder="Document title"
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              />
              <select
                name="docType"
                defaultValue="BYLAWS"
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                {DOC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {CLUB_DOCUMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              name="body"
              rows={8}
              placeholder="Paste or write the document text…"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
            <input
              name="fileUrl"
              placeholder="Optional link to a file (Google Doc, PDF, etc.)"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            />
            <Button type="submit" size="sm" disabled={createPending}>
              {createPending ? "Saving…" : "Publish document"}
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
