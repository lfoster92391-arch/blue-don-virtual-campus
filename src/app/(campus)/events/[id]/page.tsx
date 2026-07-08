import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  Calendar,
  ClipboardList,
  DollarSign,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";

import { EventAssignmentForm } from "@/components/events/event-assignment-form";
import { EventParticipationButtons } from "@/components/events/event-participation-buttons";
import { EventChecklistSection } from "@/components/checklists/event-checklist-section";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  canManageEvents,
  canParticipateInEvents,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { formatDateLabel, formatTimeRange } from "@/lib/calendar/utils";
import { getEventById } from "@/services/event-service";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const event = await getEventById(id, user.id);

  if (!event) {
    notFound();
  }

  const canManage = canManageEvents(user.role);
  const canParticipate = canParticipateInEvents(user.role);

  return (
    <ShellPage
      title={event.title}
      description={`${event.academy.name} · ${formatDateLabel(event.startDate, "long")}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/events">Back to events</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/calendar">View calendar</Link>} />
        <EventParticipationButtons
          eventId={event.id}
          isParticipating={event.isParticipating}
          canParticipate={canParticipate && !event.archiveFlag}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <EventSection title="Overview" icon={<Calendar className="size-4" />}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="When"
                value={`${formatDateLabel(event.startDate, "long")} · ${formatTimeRange(event.startDate, event.endDate)}`}
              />
              <DetailField
                label="Location"
                value={event.location ?? "To be announced"}
                icon={<MapPin className="size-3.5" />}
              />
              <DetailField label="Status" value={formatStatus(event.status)} />
              <DetailField label="Impact points" value={String(event.impactPoints)} />
              <DetailField label="Organizer" value={event.createdBy.displayName} />
              <DetailField
                label="Academy"
                value={event.academy.name}
              />
            </dl>
            {event.description ? (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No description provided yet.
              </p>
            )}
          </EventSection>

          <EventSection
            title="Assignments"
            icon={<ClipboardList className="size-4" />}
            count={event.assignments.length}
          >
            {event.assignments.length > 0 ? (
              <ul className="space-y-3">
                {event.assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="rounded-lg border border-border px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {formatDateLabel(assignment.dueDate)} · {assignment.points} pts
                        </p>
                      </div>
                      <span className="text-xs uppercase text-muted-foreground">
                        {assignment.status.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No assignments linked to this event yet.
              </p>
            )}
            {canManage ? <EventAssignmentForm eventId={event.id} /> : null}
          </EventSection>

          <EventSection title="Participants" icon={<Users className="size-4" />} count={event.participants.length}>
            {event.participants.length > 0 ? (
              <ul className="space-y-2">
                {event.participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{participant.displayName}</span>
                    <span className="text-muted-foreground">
                      {participant.role.toLowerCase()} · {participant.attendance.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Be the first to join this event.
              </p>
            )}
          </EventSection>

          <FutureSection
            title="Budget"
            icon={<DollarSign className="size-4" />}
            description="Budget tracking connects in a later phase. Event budget ID can be linked when finance tools launch."
          />
          <EventChecklistSection
            eventId={event.id}
            academyId={event.academy.id}
            userId={user.id}
            userRole={user.role}
          />
          <FutureSection
            title="Sponsors"
            icon={<Users className="size-4" />}
            description="Sponsor visibility and stewardship tools are planned for post-MVP phases."
          />
          <FutureSection
            title="Reflection"
            icon={<MessageSquare className="size-4" />}
            description="Participant reflections will be captured after events conclude."
          />
          <FutureSection
            title="Archive"
            icon={<Archive className="size-4" />}
            description={
              event.archiveFlag
                ? "This event is archived."
                : "Archive controls will be expanded in reporting and admin phases."
            }
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Cross-academy visibility</p>
            <p className="mt-2 text-sm text-muted-foreground">
              All authenticated campus users can view events across academies to
              coordinate schedules and participation.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Reminders</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {event.isParticipating
                ? "A reminder is scheduled for one day before this event ends."
                : "Join the event to receive a campus reminder before it starts."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Google Calendar two-way sync is planned for a future release.
            </p>
          </div>
        </aside>
      </div>
    </ShellPage>
  );
}

function EventSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-2">
        <div className="text-[#0A2342] dark:text-white">{icon}</div>
        <h2 className="text-base font-semibold text-[#0A2342] dark:text-white">
          {title}
        </h2>
        {typeof count === "number" ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {count}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function FutureSection({
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <section className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
      <header className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-xs text-[#2F80ED]">
          Coming later
        </span>
      </header>
      <p className="text-sm text-muted-foreground">{description}</p>
    </section>
  );
}

function DetailField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
        {icon}
        {value}
      </dd>
    </div>
  );
}

function formatStatus(status: string): string {
  return status.toLowerCase().replaceAll("_", " ");
}
