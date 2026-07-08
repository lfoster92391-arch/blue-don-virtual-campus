import Link from "next/link";

import { ChecklistItemToggle } from "@/components/checklists/checklist-item-toggle";
import { EventChecklistCreateButton } from "@/components/checklists/event-checklist-create-button";
import { canManageEvents } from "@/config/roles";
import type { CampusRole } from "@/config/roles";
import { listChecklistsForEvent } from "@/services/checklist-service";

type EventChecklistSectionProps = {
  eventId: string;
  academyId: string;
  userId: string;
  userRole: CampusRole;
};

export async function EventChecklistSection({
  eventId,
  academyId,
  userId,
  userRole,
}: EventChecklistSectionProps) {
  const checklists = await listChecklistsForEvent(eventId, userId);
  const canManage = canManageEvents(userRole);

  if (checklists.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#0A2342] dark:text-white">
            Checklist
          </h2>
          {canManage ? (
            <EventChecklistCreateButton eventId={eventId} academyId={academyId} />
          ) : null}
        </header>
        <p className="text-sm text-muted-foreground">
          No operational checklist attached to this event yet.
        </p>
      </section>
    );
  }

  return (
    <>
      {checklists.map((checklist) => (
        <section
          key={checklist.id}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <header className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#0A2342] dark:text-white">
              {checklist.title}
            </h2>
            <Link
              href={`/checklists/${checklist.id}`}
              className="text-sm text-[#2F80ED] hover:underline"
            >
              Open full checklist
            </Link>
          </header>
          <ul className="space-y-2">
            {checklist.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 rounded-lg border border-border px-3 py-2">
                <ChecklistItemToggle
                  itemId={item.id}
                  checklistId={checklist.id}
                  completed={item.completions.length > 0}
                  title={item.title}
                  eventId={eventId}
                />
                <span className={item.completions.length > 0 ? "text-muted-foreground line-through" : ""}>
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
