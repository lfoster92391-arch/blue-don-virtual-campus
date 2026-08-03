import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import type {
  OrganizationDiscoveryCard,
  OrganizationMatch,
} from "@/lib/organization-discovery";
import { Button } from "@/components/ui/button";

const APPLICATION_BADGE: Record<
  NonNullable<OrganizationDiscoveryCard["applicationStatus"]>,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-[#D4A017]/10 text-[#D4A017]" },
  ACTIVE: { label: "Member", className: "bg-[#2E8B57]/10 text-[#2E8B57]" },
  REJECTED: { label: "Declined", className: "bg-destructive/10 text-destructive" },
  INACTIVE: { label: "Inactive", className: "bg-muted text-muted-foreground" },
};

type OrganizationDiscoveryCardProps = {
  organization: OrganizationDiscoveryCard | OrganizationMatch;
  showMatch?: boolean;
  hideJoinAction?: boolean;
};

function isMatch(
  org: OrganizationDiscoveryCard | OrganizationMatch,
): org is OrganizationMatch {
  return "matchScore" in org;
}

export function OrganizationDiscoveryCardView({
  organization,
  showMatch = false,
  hideJoinAction = false,
}: OrganizationDiscoveryCardProps) {
  const match = isMatch(organization) ? organization : null;
  const applicationBadge =
    organization.applicationStatus && organization.applicationStatus in APPLICATION_BADGE
      ? APPLICATION_BADGE[organization.applicationStatus]
      : null;

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="shrink-0 text-3xl" aria-hidden="true">
            {organization.icon}
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="text-lg font-semibold break-words text-[#0A2342] dark:text-white">
              {organization.name}
            </h3>
            <p className="text-sm font-medium break-words text-[#2F80ED]">
              {organization.tagline}
            </p>
          </div>
        </div>
        {showMatch && match ? (
          <div className="shrink-0 rounded-xl bg-[#C9A227]/15 px-3 py-2 text-center">
            <p className="text-lg font-bold text-[#0A2342] dark:text-white">
              {match.matchScore}%
            </p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              Match
            </p>
          </div>
        ) : applicationBadge ? (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${applicationBadge.className}`}
          >
            {applicationBadge.label}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{organization.pitch}</p>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">{organization.memberCount}</span>{" "}
            members
          </span>
        </div>
        {organization.meetingSchedule ? (
          <div>
            <dt className="sr-only">Next meeting</dt>
            <dd className="text-muted-foreground">{organization.meetingSchedule}</dd>
          </div>
        ) : null}
        {organization.advisor ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Advisor
            </dt>
            <dd>{organization.advisor}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Skills you&apos;ll learn
        </p>
        <div className="flex flex-wrap gap-1.5">
          {organization.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {showMatch && match && match.matchReasons.length > 0 ? (
        <div className="mt-4 rounded-lg bg-[#2F80ED]/5 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            Why?
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {match.matchReasons.map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" nativeButton={false} render={
          <Link href={organization.learnMoreHref}>
            {hideJoinAction ? "View club details" : "Learn more"}
          </Link>
        } />
        {!hideJoinAction && organization.invitationRequired ? (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Invitation required
          </span>
        ) : !hideJoinAction && organization.joinHref ? (
          <Button size="sm" nativeButton={false} render={
            <Link href={organization.joinHref}>
              Join
              <ArrowRight className="size-4" />
            </Link>
          } />
        ) : null}
      </div>
    </article>
  );
}
