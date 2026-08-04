"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { Mail } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import {
  sendStudentMessageAction,
  type StudentMessageActionState,
} from "@/features/student-messages/actions";
import type { FocusClubMembershipSummary } from "@/services/org-membership-service";

const initialState: StudentMessageActionState = {};

type StudentOption = {
  userId: string;
  displayName: string;
  memberships: FocusClubMembershipSummary[];
};

type AdminComposeMessageProps = {
  students: StudentOption[];
  organizations: { id: string; slug: string; name: string }[];
};

export function AdminComposeStudentMessage({
  students,
  organizations,
}: AdminComposeMessageProps) {
  const [state, action, pending] = useActionState(
    sendStudentMessageAction,
    initialState,
  );
  const [clubSlug, setClubSlug] = useState(organizations[0]?.slug ?? "");

  const org = organizations.find((o) => o.slug === clubSlug);
  const filteredStudents = useMemo(() => {
    if (!clubSlug) return students;
    return students.filter((s) =>
      s.memberships.some((m) => m.slug === clubSlug),
    );
  }, [students, clubSlug]);

  if (organizations.length === 0) {
    return null;
  }

  return (
    <DashboardCard
      title="Message students"
      description="Send advisor requests with action buttons. Students see them on Home → Command Center."
      icon={<Mail className="size-5" />}
    >
      <form action={action} className="grid gap-3">
        <input type="hidden" name="organizationId" value={org?.id ?? ""} />
        <input type="hidden" name="organizationSlug" value={clubSlug} />
        <input type="hidden" name="kind" value="ADVISOR_REQUEST" />
        <input type="hidden" name="actionPreset" value="link" />

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Club</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={clubSlug}
            onChange={(e) => setClubSlug(e.target.value)}
          >
            {organizations.map((o) => (
              <option key={o.id} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder="Your Advisor has sent you a project request — Cricut Club!"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Details</span>
          <textarea
            name="body"
            rows={2}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Deep link (Check it out)</span>
          <input
            name="href"
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder={`/organizations/${clubSlug}`}
            defaultValue={`/organizations/${clubSlug}`}
          />
        </label>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="includeViewLater" defaultChecked />
            View Later
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="includeAddToCalendar" />
            Add to calendar
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="wholeClub" />
            Whole club
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Calendar start</span>
            <input
              name="calendarStart"
              type="datetime-local"
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Calendar end</span>
            <input
              name="calendarEnd"
              type="datetime-local"
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
        </div>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">
            Recipients ({filteredStudents.length} in club)
          </legend>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {filteredStudents.map((student) => (
              <label
                key={student.userId}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="recipientIds"
                  value={student.userId}
                />
                {student.displayName}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Button type="submit" size="sm" disabled={pending || !org}>
            {pending ? "Sending…" : "Send message"}
          </Button>
          {state.error ? (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="mt-2 text-sm text-[#2E8B57]">{state.success}</p>
          ) : null}
        </div>
      </form>
    </DashboardCard>
  );
}

export function focusClubOrgsFromMemberships(
  memberships: FocusClubMembershipSummary[],
): { id: string; slug: string; name: string }[] {
  const bySlug = new Map<string, { id: string; slug: string; name: string }>();
  for (const m of memberships) {
    bySlug.set(m.slug, {
      id: m.organizationId,
      slug: m.slug,
      name: m.name,
    });
  }
  for (const club of FOCUS_CLUBS) {
    if (!bySlug.has(club.slug)) {
      // filled from DB orgs on server
    }
  }
  return [...bySlug.values()];
}
