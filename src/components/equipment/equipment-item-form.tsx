"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createEquipmentAction,
  type EquipmentActionState,
} from "@/features/equipment/actions";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_LABELS,
} from "@/lib/equipment/constants";

const initialState: EquipmentActionState = {};

type EquipmentItemFormProps = {
  organizationId?: string;
};

export function EquipmentItemForm({ organizationId }: EquipmentItemFormProps) {
  const [state, formAction, pending] = useActionState(
    createEquipmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Add equipment</p>

      {organizationId ? (
        <input type="hidden" name="organizationId" value={organizationId} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="assetTag" className="text-sm font-medium">
            Asset tag
          </label>
          <Input id="assetTag" name="assetTag" required placeholder="CB-204" />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" required placeholder="Chromebook 11" />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            {EQUIPMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EQUIPMENT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <Input id="location" name="location" required placeholder="IT Office" />
        </div>
        <div className="space-y-2">
          <label htmlFor="serialNumber" className="text-sm font-medium">
            Serial number (optional)
          </label>
          <Input id="serialNumber" name="serialNumber" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes (optional)
          </label>
          <Input id="notes" name="notes" />
        </div>
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add item"}
      </Button>
    </form>
  );
}
