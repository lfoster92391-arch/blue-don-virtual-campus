export type AcademyGroupMeta = {
  academyId: string | null;
  academyName: string;
  academyIcon: string | null;
  academyColor: string | null;
  academySortOrder: number;
};

export type AcademyGrouped<T> = AcademyGroupMeta & {
  items: T[];
};

export const CAMPUS_WIDE_GROUP: AcademyGroupMeta = {
  academyId: null,
  academyName: "Campus-wide",
  academyIcon: "🏫",
  academyColor: null,
  academySortOrder: Number.MAX_SAFE_INTEGER,
};

export type AcademyGroupable = {
  academyId: string | null;
  academyName: string | null;
  academyIcon: string | null;
  academyColor: string | null;
  academySortOrder: number;
};

export function groupByAcademy<T extends AcademyGroupable>(items: T[]): AcademyGrouped<T>[] {
  const groups = new Map<string, AcademyGrouped<T>>();

  for (const item of items) {
    const key = item.academyId ?? "__campus_wide__";
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(key, {
      academyId: item.academyId,
      academyName: item.academyName ?? CAMPUS_WIDE_GROUP.academyName,
      academyIcon: item.academyIcon ?? (item.academyId ? null : CAMPUS_WIDE_GROUP.academyIcon),
      academyColor: item.academyColor,
      academySortOrder: item.academyId ? item.academySortOrder : CAMPUS_WIDE_GROUP.academySortOrder,
      items: [item],
    });
  }

  return [...groups.values()].sort((a, b) => {
    if (a.academySortOrder !== b.academySortOrder) {
      return a.academySortOrder - b.academySortOrder;
    }
    return a.academyName.localeCompare(b.academyName);
  });
}
