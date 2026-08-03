"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FOCUS_CLUB_ROLE_LABELS,
  focusClubName,
  focusClubRoleLabel,
} from "@/config/focus-club-access";
import { FOCUS_CLUBS, type FocusClubSlug } from "@/config/focused-clubs";
import { ORG_MEMBERSHIP_ROLES, type OrgMembershipRole } from "@/config/roles";
import {
  assignClubMembershipAction,
  removeClubMembershipAction,
  type MembershipActionState,
} from "@/features/admin/membership-actions";
import type { FocusClubMembershipSummary } from "@/services/org-membership-service";

const initialState: MembershipActionState = {};

type AssignClubFormProps = {
  userId: string;
  memberships: FocusClubMembershipSummary[];
};

export function AssignClubForm({ userId, memberships }: AssignClubFormProps) {
  const [clubSlug, setClubSlug] = useState<FocusClubSlug>(FOCUS_CLUBS[0].slug);
  const [assignState, assignAction, assignPending] = useActionState(
    assignClubMembershipAction,
    initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeClubMembershipAction,
    initialState,
  );

  const roleOptions = useMemo(
    () =>
      ORG_MEMBERSHIP_ROLES.map((role) => ({
        value: role,
        label: FOCUS_CLUB_ROLE_LABELS[clubSlug][role],
      })),
    [clubSlug],
  );

  const existing = memberships.find((m) => m.slug === clubSlug);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Assign to club
      </p>

      {memberships.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {memberships.map((membership) => (
            <li
              key={membership.slug}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs"
            >
              <span className="font-medium text-foreground">
                {membership.name}
              </span>
              <span className="text-muted-foreground">
                {focusClubRoleLabel(membership.slug, membership.orgRole)}
              </span>
              <form action={removeAction}>
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="clubSlug" value={membership.slug} />
                <button
                  type="submit"
                  disabled={removePending}
                  className="text-destructive hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Not assigned to IT, Broadcasting, or Cricut yet.
        </p>
      )}

      <form action={assignAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="userId" value={userId} />
        <div className="space-y-1">
          <label
            htmlFor={`club-${userId}`}
            className="sr-only"
          >
            Club
          </label>
          <select
            id={`club-${userId}`}
            name="clubSlug"
            value={clubSlug}
            onChange={(event) =>
              setClubSlug(event.target.value as FocusClubSlug)
            }
            disabled={assignPending}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {FOCUS_CLUBS.map((club) => (
              <option key={club.slug} value={club.slug}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor={`org-role-${userId}`} className="sr-only">
            Club role
          </label>
          <select
            id={`org-role-${userId}`}
            name="orgRole"
            defaultValue={"member" satisfies OrgMembershipRole}
            disabled={assignPending}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" disabled={assignPending}>
          {assignPending
            ? "Saving..."
            : existing
              ? "Update role"
              : `Add to ${focusClubName(clubSlug)}`}
        </Button>
      </form>

      {assignState.error ? (
        <p className="text-xs text-destructive">{assignState.error}</p>
      ) : null}
      {assignState.success ? (
        <p className="text-xs text-[#2E8B57]">{assignState.success}</p>
      ) : null}
      {removeState.error ? (
        <p className="text-xs text-destructive">{removeState.error}</p>
      ) : null}
      {removeState.success ? (
        <p className="text-xs text-[#2E8B57]">{removeState.success}</p>
      ) : null}
    </div>
  );
}
