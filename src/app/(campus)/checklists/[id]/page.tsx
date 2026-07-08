import Link from "next/link";
import { notFound } from "next/navigation";

import { ChecklistItemToggle } from "@/components/checklists/checklist-item-toggle";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getChecklistById } from "@/services/checklist-service";

type ChecklistDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const checklist = await getChecklistById(id, user.id);

  if (!checklist) {
    notFound();
  }

  const progress =
    checklist.totalItems > 0
      ? Math.round((checklist.completedItems / checklist.totalItems) * 100)
      : 0;

  return (
    <ShellPage
      title={checklist.title}
      description={
        checklist.description ??
        "Complete required steps for this campus activity."
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/checklists">All checklists</Link>} />
        <span className="text-sm text-muted-foreground">
          {checklist.completedItems}/{checklist.totalItems} complete ({progress}%)
        </span>
      </div>

      <ul className="mt-6 space-y-2">
        {checklist.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
          >
            <ChecklistItemToggle
              itemId={item.id}
              checklistId={checklist.id}
              completed={item.completed}
              title={item.title}
            />
            <div className="min-w-0 flex-1">
              <p className={item.completed ? "text-muted-foreground line-through" : "font-medium"}>
                {item.title}
                {item.required ? (
                  <span className="ml-2 text-xs text-[#D4A017]">Required</span>
                ) : null}
              </p>
              {item.description ? (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </ShellPage>
  );
}
