import type { ReactNode } from "react";

import type { AcademyGroupMeta } from "@/lib/academy/group-by-academy";

type AcademyGroupedSectionProps = AcademyGroupMeta & {
  children: ReactNode;
  itemCount?: number;
};

export function AcademyGroupedSection({
  academyName,
  academyIcon,
  children,
  itemCount,
}: AcademyGroupedSectionProps) {
  const heading = `${academyIcon ? `${academyIcon} ` : ""}${academyName}`.trim();

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">{heading}</h2>
        {itemCount !== undefined ? (
          <p className="text-sm text-muted-foreground">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
