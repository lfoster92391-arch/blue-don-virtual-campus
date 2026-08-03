import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { SchoolApprovedBadge } from "@/components/mentors/school-approved-badge";
import { MENTOR_CATEGORY_LABELS } from "@/config/mentor-network";
import type { MentorSummary } from "@/services/mentor-network-service";

export function MentorCard({ mentor }: { mentor: MentorSummary }) {
  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#2F80ED]/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
            {MENTOR_CATEGORY_LABELS[mentor.category]}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground group-hover:text-[#2F80ED]">
            {mentor.name}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {mentor.title} · {mentor.organization}
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
          <GraduationCap className="size-5" />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{mentor.bio}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SchoolApprovedBadge />
        {mentor.expertiseTags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
