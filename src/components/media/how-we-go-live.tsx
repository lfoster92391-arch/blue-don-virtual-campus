import Link from "next/link";
import { School } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MADONNA_GO_LIVE_NOTES } from "@/config/broadcast-media";

/**
 * The crew's house rules, in the words an advisor would use out loud. Deliberately
 * short — the operating steps live on the Go live panel, not here.
 */
export function HowWeGoLiveCard() {
  return (
    <DashboardCard
      title="How we go live at Madonna"
      description="What the crew is responsible for on a normal show day."
      icon={<School className="size-5" />}
      status={{ label: "Crew", variant: "info" }}
      expandable
    >
      <dl className="space-y-4">
        {MADONNA_GO_LIVE_NOTES.map((note) => (
          <div key={note.label}>
            <dt className="text-sm font-semibold text-[#0A2342] dark:text-white">
              {note.label}
            </dt>
            <dd className="mt-0.5 text-sm text-muted-foreground">
              {note.text}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm text-muted-foreground">
        Stuck mid-show? End the broadcast and tell your advisor. Campus watches
        at{" "}
        <Link href="/media" className="text-[#2F80ED] underline">
          Watch Broadcasting
        </Link>
        .
      </p>
    </DashboardCard>
  );
}
