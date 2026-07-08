"use client";

import { useTransition } from "react";

import { updateLabStatusAction } from "@/features/labs/actions";
import { Button } from "@/components/ui/button";
import type { LabStatus } from "@/generated/prisma/client";

export function LabAdminActions({
  labId,
  slug,
  status,
}: {
  labId: string;
  slug: string;
  status: LabStatus;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: LabStatus) {
    startTransition(async () => {
      await updateLabStatusAction(labId, slug, next);
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "ACTIVE" ? (
        <Button size="sm" disabled={pending} onClick={() => setStatus("ACTIVE")}>Activate</Button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("ARCHIVED")}>Archive</Button>
      ) : null}
    </div>
  );
}
