"use client";

import Link from "next/link";

import type { CampusRole } from "@/config/roles";
import { isFacultyClubLookupRole } from "@/config/roles";
import type { StudentContext, StudentOrgLink } from "@/services/student-context-service";
import { cn } from "@/lib/utils";

type NavMembershipSectionsProps = {
  context: StudentContext;
  role: CampusRole;
  onNavigate?: () => void;
};

function Section({
  title,
  items,
  viewAllHref,
  onNavigate,
}: {
  title: string;
  items: StudentOrgLink[];
  viewAllHref: string;
  onNavigate?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-1">
      <p className="px-3 text-xs font-medium uppercase tracking-wide text-white/50">
        {title}
      </p>
      {items.slice(0, 5).map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#C6CCD6]",
            "hover:bg-white/10 hover:text-white",
          )}
        >
          <span className="shrink-0" aria-hidden="true">
            {item.icon}
          </span>
          <span className="truncate">{item.name}</span>
        </Link>
      ))}
      {items.length > 5 ? (
        <Link
          href={viewAllHref}
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#7FB2F0] hover:text-white"
        >
          + View all
        </Link>
      ) : null}
    </div>
  );
}

export function NavMembershipSections({
  context,
  role,
  onNavigate,
}: NavMembershipSectionsProps) {
  const facultyLookup = isFacultyClubLookupRole(role);
  const hasAny =
    context.clubs.length > 0 ||
    context.teams.length > 0 ||
    context.classes.length > 0;

  if (!hasAny) {
    return (
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="px-3 text-xs font-medium uppercase tracking-wide text-white/50">
          {facultyLookup ? "Campus Clubs" : "My Communities"}
        </p>
        <p className="mt-2 px-3 text-xs leading-relaxed text-[#C6CCD6]">
          {facultyLookup
            ? "Browse every club to answer student questions together."
            : "You haven't joined anything yet."}
        </p>
        <Link
          href="/find-your-place"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-[#7FB2F0] hover:text-white"
        >
          {facultyLookup ? "Browse all clubs →" : "Find your first club →"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-2">
      {facultyLookup ? (
        <div className="mb-2 px-3">
          <Link
            href="/find-your-place"
            onClick={onNavigate}
            className="flex items-center gap-1 rounded-lg py-2 text-xs font-medium text-[#7FB2F0] hover:text-white"
          >
            Browse all clubs →
          </Link>
        </div>
      ) : null}
      <Section
        title={facultyLookup ? "My advised clubs" : "My Clubs"}
        items={context.clubs}
        viewAllHref="/find-your-place"
        onNavigate={onNavigate}
      />
      <Section
        title="My Teams"
        items={context.teams}
        viewAllHref="/athletics"
        onNavigate={onNavigate}
      />
      <Section
        title="My Class"
        items={context.classes}
        viewAllHref="/find-your-place"
        onNavigate={onNavigate}
      />
    </div>
  );
}
