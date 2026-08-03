import { CheckCircle2, Mail, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  IT_HELP_DESK_EMAIL,
  IT_HELP_DESK_NAME,
  IT_TICKET_GUIDANCE_HEADLINE,
  IT_TICKET_GUIDANCE_ITEMS,
  buildItHelpDeskMailto,
} from "@/config/it-help-desk";
import { cn } from "@/lib/utils";

type ItHelpDeskPanelProps = {
  id?: string;
  variant?: "banner" | "card" | "compact";
  className?: string;
};

export function ItHelpDeskPanel({
  id = "it-help-desk",
  variant = "banner",
  className,
}: ItHelpDeskPanelProps) {
  const mailtoHref = buildItHelpDeskMailto();
  const isCompact = variant === "compact";

  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5",
        variant === "card" ? "p-5" : isCompact ? "p-4" : "p-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-4",
          isCompact ? "flex-col" : "flex-col sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <Monitor
              className={cn(
                "shrink-0 text-[#2F80ED]",
                isCompact ? "mt-0.5 size-4" : "mt-0.5 size-5",
              )}
              aria-hidden="true"
            />
            <div>
              <h2
                className={cn(
                  "font-semibold text-[#0A2342] dark:text-white",
                  isCompact ? "text-sm" : "text-base",
                )}
              >
                {IT_HELP_DESK_NAME}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Technology, devices, network, and account issues are handled through our
                Spiceworks help desk.
              </p>
              <a
                href={`mailto:${IT_HELP_DESK_EMAIL}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                {IT_HELP_DESK_EMAIL}
              </a>
            </div>
          </div>

          <ItHelpDeskGuidance className={cn("mt-4", isCompact && "mt-3")} compact={isCompact} />
        </div>

        <div className={cn("shrink-0", !isCompact && "sm:pt-1")}>
          <Button
            nativeButton={false}
            size={isCompact ? "sm" : "default"}
            render={
              <a href={mailtoHref}>
                <Mail className="size-4" />
                Email Help Desk
              </a>
            }
          />
        </div>
      </div>
    </section>
  );
}

export function ItHelpDeskGuidance({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/80 p-4",
        compact && "p-3",
        className,
      )}
    >
      <p
        className={cn(
          "font-medium text-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {IT_TICKET_GUIDANCE_HEADLINE}
      </p>
      <ul className={cn("mt-2 space-y-1.5", compact ? "text-xs" : "text-sm")}>
        {IT_TICKET_GUIDANCE_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2 text-muted-foreground">
            <CheckCircle2
              className="mt-0.5 size-3.5 shrink-0 text-[#2F80ED]"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
