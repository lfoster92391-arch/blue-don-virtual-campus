import Link from "next/link";

import type { EquipmentCategory, EquipmentStatus } from "@/generated/prisma/client";
import {
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_VARIANTS,
} from "@/lib/equipment/constants";
import type { EquipmentListItem } from "@/services/equipment-service";

const STATUS_CLASSES: Record<"success" | "warning" | "info" | "muted", string> = {
  success: "bg-[#2E8B57]/10 text-[#2E8B57]",
  warning: "bg-[#D4A017]/10 text-[#D4A017]",
  info: "bg-[#2F80ED]/10 text-[#2F80ED]",
  muted: "bg-muted text-muted-foreground",
};

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const variant = EQUIPMENT_STATUS_VARIANTS[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[variant]}`}
    >
      {EQUIPMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function EquipmentCategoryBadge({ category }: { category: EquipmentCategory }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {EQUIPMENT_CATEGORY_LABELS[category]}
    </span>
  );
}

type EquipmentListProps = {
  items: EquipmentListItem[];
};

export function EquipmentList({ items }: EquipmentListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No equipment matches your filters.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/equipment/${item.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 transition-colors hover:border-[#2F80ED]/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.name}</p>
                <EquipmentCategoryBadge category={item.category} />
                <EquipmentStatusBadge status={item.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {item.assetTag} · {item.location}
                {item.assignedToName ? ` · ${item.assignedToName}` : ""}
              </p>
            </div>
            {item.serialNumber ? (
              <p className="text-xs text-muted-foreground">S/N {item.serialNumber}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

type EquipmentFiltersBarProps = {
  currentCategory?: string;
  currentStatus?: string;
  currentSearch?: string;
  basePath?: string;
};

export function EquipmentFiltersBar({
  currentCategory,
  currentStatus,
  currentSearch,
  basePath = "/equipment",
}: EquipmentFiltersBarProps) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="search" className="text-xs text-muted-foreground">
          Search
        </label>
        <input
          id="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Name, tag, location…"
          className="flex h-9 min-w-[12rem] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="category" className="text-xs text-muted-foreground">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={currentCategory ?? ""}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">All categories</option>
          {Object.entries(EQUIPMENT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="status" className="text-xs text-muted-foreground">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus ?? ""}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="h-9 rounded-md bg-[#0A2342] px-4 text-sm font-medium text-white dark:bg-white dark:text-[#0A2342]"
      >
        Filter
      </button>
      {(currentCategory || currentStatus || currentSearch) && (
        <Link href={basePath} className="text-sm text-[#2F80ED] hover:underline">
          Clear
        </Link>
      )}
    </form>
  );
}
