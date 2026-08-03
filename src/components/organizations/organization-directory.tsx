import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getOrganizationHref } from "@/config/madonna-organizations";
import type { OrganizationGroup } from "@/services/org-service";

type OrganizationDirectoryProps = {
  groups: OrganizationGroup[];
  showDescriptions?: boolean;
};

export function OrganizationDirectory({
  groups,
  showDescriptions = true,
}: OrganizationDirectoryProps) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.category} aria-labelledby={`org-group-${group.category}`}>
          <div className="mb-4 space-y-1">
            <h2
              id={`org-group-${group.category}`}
              className="text-lg font-semibold text-[#0A2342] dark:text-white"
            >
              {group.emoji} {group.label}
            </h2>
            {showDescriptions ? (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            ) : null}
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.organizations.map((org) => {
              const href = getOrganizationHref(org);

              return (
                <li key={org.id} className="min-w-0">
                  <Link
                    href={href}
                    className="group flex h-full min-w-0 flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium break-words text-[#0A2342] group-hover:text-[#2F80ED] dark:text-white">
                        {org.name}
                      </p>
                      {org.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {org.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED]">
                      Open headquarters
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
