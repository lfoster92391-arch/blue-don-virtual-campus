import { PageDropdown } from "@/components/ui/page-dropdown";
import type { ReactNode } from "react";

type BriefingSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
};

/** Labeled daily-briefing dropdown — one job per section, opened in place. */
export function BriefingSection({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  defaultOpen,
  collapsible,
}: BriefingSectionProps) {
  return (
    <PageDropdown
      id={id}
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={actions}
      defaultOpen={defaultOpen}
      collapsible={collapsible}
      className={className}
    >
      {children}
    </PageDropdown>
  );
}
