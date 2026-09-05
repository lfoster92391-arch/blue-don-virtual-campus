"use client";

import { useActionState, useTransition } from "react";

import { ImageField } from "@/components/sports/form-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BROADCAST_BOOKING_SERVICE_LABELS,
  BROADCAST_BOOKING_STATUS_LABELS,
  BROADCAST_JOIN_STATUS_LABELS,
  BROADCAST_JOIN_TRACK_LABELS,
  BROADCAST_PRODUCTION_ROLE_LABELS,
  BROADCAST_SUBMISSION_STATUS_LABELS,
  JOIN_PORTAL_INSTRUCTIONS,
  type BroadcastBookingServiceKey,
  type BroadcastJoinTrackKey,
  type BroadcastProductionRoleKey,
} from "@/config/broadcast-production";
import {
  addEquipmentItemAction,
  removeCrewCreditAction,
  submitAnnouncementRequestAction,
  submitBookingRequestAction,
  submitJoinApplicationAction,
  toggleEquipmentAction,
  updateBookingStatusAction,
  updateJoinApplicationAction,
  updateSubmissionStatusAction,
  upsertCrewCreditAction,
  type BroadcastActionState,
} from "@/features/broadcast-production/actions";
import { formatCampusDate, formatCampusDateTime } from "@/lib/datetime/campus-local";
import type {
  BroadcastAnnouncementSubmissionView,
  BroadcastBookingView,
  BroadcastCrewCreditView,
  BroadcastEquipmentView,
  BroadcastJoinApplicationView,
} from "@/services/broadcast-production-service";

const initial: BroadcastActionState = {};

export function BookingRequestForm() {
  const [state, formAction, pending] = useActionState(
    submitBookingRequestAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Request film coverage, photography, or a live stream for your club,
        team, or campus event. Broadcasting crew is notified on Command Center.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Club or team" name="clubOrTeam" required placeholder="Soccer · Student Council" />
        <Field label="Event name" name="eventName" required placeholder="Homecoming pep rally" />
        <Field label="Event date & time" name="eventAt" type="datetime-local" required />
        <Field label="Location" name="location" placeholder="Gym / Field / Chapel" />
        <Field label="Contact email" name="requesterEmail" type="email" placeholder="you@madonna.edu" />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Services needed</legend>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(BROADCAST_BOOKING_SERVICE_LABELS) as BroadcastBookingServiceKey[]).map(
            (key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="services" value={key} className="size-4" />
                {BROADCAST_BOOKING_SERVICE_LABELS[key]}
              </label>
            ),
          )}
        </div>
      </fieldset>
      <div className="space-y-1.5">
        <label htmlFor="booking-details" className="text-sm font-medium">
          Details
        </label>
        <textarea
          id="booking-details"
          name="details"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="What should we capture? Approximate length? Special notes?"
        />
      </div>
      <FormFeedback state={state} pending={pending} submitLabel="Submit request" />
    </form>
  );
}

export function BookingReviewList({
  bookings,
  canManage,
}: {
  bookings: BroadcastBookingView[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No coverage requests yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((booking) => (
        <li key={booking.id} className="rounded-lg border border-border px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{booking.eventName}</p>
              <p className="text-xs text-muted-foreground">
                {booking.clubOrTeam} ·{" "}
                {formatCampusDateTime(booking.eventAt)}
                {booking.location ? ` · ${booking.location}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {booking.requesterName}
                {booking.services.length
                  ? ` · ${booking.services.map((s) => BROADCAST_BOOKING_SERVICE_LABELS[s]).join(", ")}`
                  : ""}
              </p>
              {booking.details ? (
                <p className="mt-1 text-sm text-muted-foreground">{booking.details}</p>
              ) : null}
            </div>
            <StatusPill label={BROADCAST_BOOKING_STATUS_LABELS[booking.status]} />
          </div>
          {canManage ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {(["ACCEPTED", "DECLINED", "COMPLETED"] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  disabled={pending || booking.status === status}
                  onClick={() =>
                    startTransition(() => {
                      void updateBookingStatusAction(booking.id, status);
                    })
                  }
                >
                  {BROADCAST_BOOKING_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function AnnouncementSubmitForm({
  storageConfigured = true,
}: {
  storageConfigured?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitAnnouncementRequestAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Faculty and students can submit items for the daily morning
        announcements. Crew reviews each request before air.
      </p>
      <Field
        label="Headline"
        name="title"
        required
        placeholder="What this announcement is about"
      />
      <div className="space-y-1.5">
        <label htmlFor="announce-body" className="text-sm font-medium">
          Announcement text
        </label>
        <textarea
          id="announce-body"
          name="body"
          required
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="The full message — what it entails"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="announce-air-notes" className="text-sm font-medium">
          What we should air or post for you
        </label>
        <textarea
          id="announce-air-notes"
          name="airNotes"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Read this line on air, post the flyer, mention the date…"
        />
      </div>
      <ImageField
        label="Upload image or flyer"
        fileName="flyer"
        urlName="flyerUrl"
        storageConfigured={storageConfigured}
        idPrefix="announce"
        hint="Library or camera — PNG, JPG, or WEBP, 4 MB or smaller."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Your role (optional)"
          name="submitterRole"
          placeholder="Faculty · Student · Coach"
        />
        <Field label="Preferred air date" name="preferredAirDate" type="date" />
      </div>
      <FormFeedback state={state} pending={pending} submitLabel="Submit for review" />
    </form>
  );
}

export function AnnouncementSubmissionReviewList({
  submissions,
  canManage,
}: {
  submissions: BroadcastAnnouncementSubmissionView[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No announcement submissions yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {submissions.map((item) => (
        <li key={item.id} className="rounded-lg border border-border px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.submitterName}
                {item.submitterRole ? ` · ${item.submitterRole}` : ""}
                {item.preferredAirDate
                  ? ` · prefer ${formatCampusDate(item.preferredAirDate)}`
                  : ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              {item.airNotes ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Air / post: </span>
                  {item.airNotes}
                </p>
              ) : null}
              {item.flyerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.flyerUrl}
                  alt=""
                  className="mt-2 h-24 w-auto rounded-md object-cover ring-1 ring-border"
                />
              ) : null}
            </div>
            <StatusPill label={BROADCAST_SUBMISSION_STATUS_LABELS[item.status]} />
          </div>
          {canManage ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {(["APPROVED", "DECLINED", "AIRED"] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  disabled={pending || item.status === status}
                  onClick={() =>
                    startTransition(() => {
                      void updateSubmissionStatusAction(item.id, status);
                    })
                  }
                >
                  {BROADCAST_SUBMISSION_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function CrewCreditRoll({
  credits,
  canManage,
  memberOptions = [],
}: {
  credits: BroadcastCrewCreditView[];
  canManage?: boolean;
  memberOptions?: { userId: string; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    upsertCrewCreditAction,
    initial,
  );
  const [removing, startTransition] = useTransition();

  const byRole = (Object.keys(BROADCAST_PRODUCTION_ROLE_LABELS) as BroadcastProductionRoleKey[])
    .map((role) => ({
      role,
      people: credits.filter((c) => c.productionRole === role && c.isVisible),
    }))
    .filter((group) => group.people.length > 0);

  return (
    <div className="space-y-6">
      {byRole.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Production credits will appear here once crew roles are assigned.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byRole.map((group) => (
            <div key={group.role} className="rounded-lg border border-border px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
                {BROADCAST_PRODUCTION_ROLE_LABELS[group.role]}
              </p>
              <ul className="mt-2 space-y-1">
                {group.people.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>{person.displayName}</span>
                    {canManage ? (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        disabled={removing}
                        onClick={() =>
                          startTransition(() => {
                            void removeCrewCreditAction(person.id);
                          })
                        }
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {canManage ? (
        <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">Add credit</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="credit-user" className="text-xs font-medium">
                Member
              </label>
              <select
                id="credit-user"
                name="userId"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  const option = memberOptions.find((m) => m.userId === e.target.value);
                  const nameInput = document.getElementById(
                    "credit-display-name",
                  ) as HTMLInputElement | null;
                  if (option && nameInput && !nameInput.value) {
                    nameInput.value = option.displayName;
                  }
                }}
              >
                <option value="">Select member</option>
                {memberOptions.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Display name" name="displayName" id="credit-display-name" required />
            <div className="space-y-1.5">
              <label htmlFor="credit-role" className="text-xs font-medium">
                Role
              </label>
              <select
                id="credit-role"
                name="productionRole"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(Object.keys(BROADCAST_PRODUCTION_ROLE_LABELS) as BroadcastProductionRoleKey[]).map(
                  (role) => (
                    <option key={role} value={role}>
                      {BROADCAST_PRODUCTION_ROLE_LABELS[role]}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <FormFeedback state={state} pending={pending} submitLabel="Add to credit roll" />
        </form>
      ) : null}
    </div>
  );
}

export function EquipmentChecklist({
  items,
  canManage,
}: {
  items: BroadcastEquipmentView[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [addState, addAction, addPending] = useActionState(
    addEquipmentItemAction,
    initial,
  );
  const checked = items.filter((i) => i.isChecked).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pre-show inventory checklist · {checked}/{items.length} ready
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.category ?? "Gear"}
                {item.isChecked && item.checkedByName
                  ? ` · checked by ${item.checkedByName}`
                  : ""}
              </p>
            </div>
            {canManage ? (
              <Button
                size="sm"
                variant={item.isChecked ? "outline" : "default"}
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void toggleEquipmentAction(item.id, !item.isChecked);
                  })
                }
              >
                {item.isChecked ? "Uncheck" : "Check in"}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                {item.isChecked ? "Ready" : "Pending"}
              </span>
            )}
          </li>
        ))}
      </ul>
      {canManage ? (
        <form action={addAction} className="flex flex-wrap items-end gap-2">
          <Field label="Add gear" name="name" required placeholder="Gimbal" />
          <Field label="Category" name="category" placeholder="Camera" />
          <Button type="submit" size="sm" disabled={addPending}>
            Add
          </Button>
          {addState.error ? (
            <p className="w-full text-sm text-destructive">{addState.error}</p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

export function JoinClubPortal({ canManage }: { canManage?: boolean }) {
  const [state, formAction, pending] = useActionState(
    submitJoinApplicationAction,
    initial,
  );

  return (
    <div className="space-y-5">
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        {JOIN_PORTAL_INSTRUCTIONS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <form action={formAction} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Desired production tracks</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(BROADCAST_JOIN_TRACK_LABELS) as BroadcastJoinTrackKey[]).map(
              (track) => (
                <label key={track} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="desiredTracks"
                    value={track}
                    className="size-4"
                  />
                  {BROADCAST_JOIN_TRACK_LABELS[track]}
                </label>
              ),
            )}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Grade / year" name="gradeOrYear" placeholder="Junior" />
          <Field label="Email" name="applicantEmail" type="email" />
          <Field label="Availability" name="availability" placeholder="After school Tue/Thu" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="join-experience" className="text-sm font-medium">
            Experience (optional)
          </label>
          <textarea
            id="join-experience"
            name="experience"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Video editing, photography, theater, YouTube…"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="join-why" className="text-sm font-medium">
            Why do you want to join?
          </label>
          <textarea
            id="join-why"
            name="whyJoin"
            required
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <FormFeedback state={state} pending={pending} submitLabel="Submit application" />
      </form>
      {canManage ? (
        <p className="text-xs text-muted-foreground">
          Officers review applications on the Applications tab.
        </p>
      ) : null}
    </div>
  );
}

export function JoinApplicationReviewList({
  applications,
  canManage,
}: {
  applications: BroadcastJoinApplicationView[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (applications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No applications yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {applications.map((app) => (
        <li key={app.id} className="rounded-lg border border-border px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{app.applicantName}</p>
              <p className="text-xs text-muted-foreground">
                {app.gradeOrYear ?? "Student"}
                {app.applicantEmail ? ` · ${app.applicantEmail}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tracks:{" "}
                {app.desiredTracks
                  .map((t) => BROADCAST_JOIN_TRACK_LABELS[t])
                  .join(", ")}
              </p>
              {app.experience ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Experience: {app.experience}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-muted-foreground">{app.whyJoin}</p>
            </div>
            <StatusPill label={BROADCAST_JOIN_STATUS_LABELS[app.status]} />
          </div>
          {canManage && app.status === "PENDING" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void updateJoinApplicationAction(app.id, "ACCEPTED");
                  })
                }
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void updateJoinApplicationAction(app.id, "DECLINED");
                  })
                }
              >
                Decline
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Field({
  label,
  name,
  id,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  id?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const fieldId = id ?? name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={fieldId}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function FormFeedback({
  state,
  pending,
  submitLabel,
}: {
  state: BroadcastActionState;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <>
      <Button type="submit" variant="action" disabled={pending}>
        {pending ? "Submitting…" : submitLabel}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {state.success}
        </p>
      ) : null}
    </>
  );
}
