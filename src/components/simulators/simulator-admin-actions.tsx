"use client";

import { useTransition } from "react";

import { updateSimulatorStatusAction } from "@/features/simulators/actions";
import { Button } from "@/components/ui/button";
import type { SimulatorStatus } from "@/generated/prisma/client";

export function SimulatorAdminActions({
  simulatorId,
  slug,
  status,
}: {
  simulatorId: string;
  slug: string;
  status: SimulatorStatus;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: SimulatorStatus) {
    startTransition(async () => {
      await updateSimulatorStatusAction(simulatorId, slug, next);
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
