"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  checkoutEquipmentAction,
  markRepairAction,
  returnEquipmentAction,
  type EquipmentActionState,
} from "@/features/equipment/actions";
import type { EquipmentStatus } from "@/generated/prisma/client";

type EquipmentManageActionsProps = {
  equipmentId: string;
  status: EquipmentStatus;
  borrowerOptions: { id: string; label: string }[];
};

export function EquipmentManageActions({
  equipmentId,
  status,
  borrowerOptions,
}: EquipmentManageActionsProps) {
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<EquipmentActionState>) {
    startTransition(async () => {
      await action();
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Manager actions</p>

      {status === "AVAILABLE" ? (
        <form
          action={(formData) => {
            formData.set("equipmentId", equipmentId);
            startTransition(async () => {
              await checkoutEquipmentAction({}, formData);
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm text-muted-foreground">
              Check out to
            </label>
            <select
              id="userId"
              name="userId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Select borrower…</option>
              {borrowerOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="dueAt" className="text-sm text-muted-foreground">
              Due date (optional)
            </label>
            <input
              id="dueAt"
              name="dueAt"
              type="date"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            Check out
          </Button>
        </form>
      ) : null}

      {status === "CHECKED_OUT" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => runAction(() => returnEquipmentAction(equipmentId))}
        >
          Mark returned
        </Button>
      ) : null}

      {status !== "REPAIR" && status !== "RETIRED" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => runAction(() => markRepairAction(equipmentId))}
        >
          Send to repair
        </Button>
      ) : null}
    </div>
  );
}
