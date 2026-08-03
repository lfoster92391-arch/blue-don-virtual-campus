import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getClassTimeCapsules } from "@/services/madonna-culture-service";

export default function TimeCapsulePage() {
  const capsules = getClassTimeCapsules();

  return (
    <ShellPage
      title="Digital Time Capsule"
      description="Per-class contributions sealed until graduation — reflections, hopes, and memories."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/my-journey">
              <ArrowLeft className="size-3.5" />
              My Journey
            </Link>
          }
        />
      }
    >
      <div className="space-y-6">
        {capsules.map((capsule) => (
          <DashboardCard
            key={capsule.classYear}
            title={`Class of ${capsule.classYear}`}
            description={capsule.motto}
            icon={<Lock className="size-5" />}
            status={{ label: `${capsule.entries.length} entries`, variant: "warning" }}
          >
            <ul className="space-y-3">
              {capsule.entries.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-xs font-medium text-[#2F80ED]">{entry.prompt}</p>
                  <p className="mt-1 text-sm italic text-foreground">&ldquo;{entry.response}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.author} · {entry.dateLabel}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Sealed until graduation — Class of {capsule.classYear} Baccalaureate.
            </p>
          </DashboardCard>
        ))}
      </div>

      <DashboardCard title="Add your reflection" description="Seniors and juniors can contribute to their class capsule.">
        <p className="text-sm text-muted-foreground">
          Visit My Journey to add a new time capsule entry. Entries are locked until your class graduates.
        </p>
        <Button className="mt-3" variant="outline" size="sm" nativeButton={false} render={<Link href="/my-journey">Go to My Journey</Link>} />
      </DashboardCard>
    </ShellPage>
  );
}
