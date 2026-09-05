import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VIEW_AS_LABELS, type ViewAsPersona } from "@/config/view-as";
import {
  startViewAsAction,
} from "@/features/admin/preview-actions";

const CHOICES: { persona: ViewAsPersona; blurb: string }[] = [
  { persona: "student", blurb: "Student home and clubs" },
  { persona: "parent", blurb: "Parent portal" },
  { persona: "guest", blurb: "Fan & Family — no school tools" },
  { persona: "coach", blurb: "Coach home density" },
  { persona: "faculty", blurb: "Faculty home and club browse" },
  { persona: "admin", blurb: "Your real admin view" },
];

export function ViewAsPanel() {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Eye className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          View as
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        See each home the way that person type sees it. A yellow banner stays
        until you exit. This does not change your account or grant extra
        permissions.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CHOICES.map((choice) => (
          <form key={choice.persona} action={startViewAsAction}>
            <input type="hidden" name="persona" value={choice.persona} />
            <Button
              type="submit"
              variant="action"
              size="lg"
              className="h-auto min-h-12 w-full flex-col items-start gap-0.5 whitespace-normal px-4 py-3 text-left"
            >
              <span className="block text-sm font-semibold">
                {VIEW_AS_LABELS[choice.persona]}
              </span>
              <span className="block text-xs font-normal text-white/85">
                {choice.blurb}
              </span>
            </Button>
          </form>
        ))}
      </div>
    </section>
  );
}
