"use client";

import { useState, useTransition } from "react";

import { HighlightSubmitForm } from "@/components/sports/sports-student-forms";
import { Button } from "@/components/ui/button";
import { deleteHighlightAction } from "@/features/sports-highlights/actions";
import type {
  SportView,
  SportsGameView,
  SportsHighlightView,
} from "@/services/sports-highlights-service";

export function HighlightManageActions({
  highlight,
  sports,
  games,
  storageConfigured,
  canManage,
}: {
  highlight: SportsHighlightView;
  sports: SportView[];
  games: SportsGameView[];
  storageConfigured: boolean;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        `Delete “${highlight.title}”? This removes the whole submission.`,
      )
    ) {
      return;
    }
    startTransition(() => {
      void deleteHighlightAction(highlight.id);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="min-h-10 w-full sm:w-auto"
          onClick={() => setEditing((open) => !open)}
        >
          {editing ? "Cancel edit" : "Edit"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="min-h-10 w-full sm:w-auto"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {editing ? (
        <HighlightSubmitForm
          key={highlight.id}
          sports={sports}
          games={games}
          storageConfigured={storageConfigured}
          canManage={canManage}
          highlight={highlight}
        />
      ) : null}
    </div>
  );
}
