import { Mail, MapPin, Phone } from "lucide-react";

import type { DirectoryEntry } from "@/config/school-hub";
import { buildItHelpDeskMailto } from "@/config/it-help-desk";

type DirectoryListProps = {
  entries: DirectoryEntry[];
};

export function DirectoryList({ entries }: DirectoryListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-lg border border-border px-3 py-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-[#0A2342] dark:text-white">
                {entry.name}
              </p>
              <p className="text-sm text-muted-foreground">{entry.role}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#0A2342]/5 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-white/10">
              {entry.department}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-sm">
            {entry.location ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {entry.location}
              </p>
            ) : null}
            {entry.phone ? (
              <a
                href={`tel:${entry.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 text-[#2F80ED] hover:underline"
              >
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                {entry.phone}
              </a>
            ) : null}
            {entry.email ? (
              <a
                href={
                  entry.id === "it-help"
                    ? buildItHelpDeskMailto()
                    : `mailto:${entry.email}`
                }
                className="flex items-center gap-2 truncate text-[#2F80ED] hover:underline"
              >
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{entry.email}</span>
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
