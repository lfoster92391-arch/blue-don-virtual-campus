import Link from "next/link";
import { CheckSquare } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listChecklistsForUser } from "@/services/checklist-service";

export default async function ChecklistsPage() {
  const user = await requireCompleteProfile();
  const checklists = await listChecklistsForUser(user.id);
  const complete = checklists.filter(
    (c) => c.totalItems > 0 && c.completedItems === c.totalItems,
  );

  return (
    <ShellPage
      title="Checklists"
      description="Operational checklists for events and academy activities."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold">{checklists.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Complete</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">{complete.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">In progress</p>
          <p className="text-2xl font-semibold text-[#D4A017]">
            {checklists.length - complete.length}
          </p>
        </div>
      </div>

      {checklists.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {checklists.map((checklist) => {
            const progress =
              checklist.totalItems > 0
                ? Math.round((checklist.completedItems / checklist.totalItems) * 100)
                : 0;

            return (
              <li key={checklist.id}>
                <Link
                  href={`/checklists/${checklist.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
                >
                  <div className="flex items-start gap-3">
                    <CheckSquare className="mt-0.5 size-5 text-[#0A2342] dark:text-white" />
                    <div>
                      <p className="font-medium">{checklist.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {[checklist.eventTitle, checklist.academyName]
                          .filter(Boolean)
                          .join(" · ") || "Campus checklist"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {checklist.completedItems}/{checklist.totalItems} ({progress}%)
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No active checklists</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Event organizers can attach operational checklists to campus events.
          </p>
        </div>
      )}
    </ShellPage>
  );
}
