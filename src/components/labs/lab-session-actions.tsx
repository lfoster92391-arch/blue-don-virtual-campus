"use client";

import { useTransition } from "react";

import { completeLabSessionAction, startLabSessionAction } from "@/features/labs/actions";
import { Button } from "@/components/ui/button";
import type { LabSessionStatus } from "@/generated/prisma/client";

export function LabSessionActions({
  labId,
  slug,
  activeSession,
}: {
  labId: string;
  slug: string;
  activeSession?: { id: string; status: LabSessionStatus };
}) {
  const [pending, startTransition] = useTransition();

  if (activeSession?.status === "IN_PROGRESS") {
    return (
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await completeLabSessionAction(activeSession.id, slug);
          })
        }
      >
        {pending ? "Saving…" : "Mark session complete"}
      </Button>
    );
  }

  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await startLabSessionAction(labId, slug);
        })
      }
    >
      {pending ? "Starting…" : "Start lab session"}
    </Button>
  );
}
