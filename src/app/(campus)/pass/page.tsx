import Link from "next/link";
import { QrCode, ScanLine } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { BLUE_DON_PASS, RECENT_CHECK_INS } from "@/config/identity-engine";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function BlueDonPassPage() {
  const user = await requireCompleteProfile();
  const pass = {
    ...BLUE_DON_PASS,
    displayName: user.displayName,
  };

  return (
    <ShellPage
      title="Blue Don Pass"
      description="Your digital campus identity — scan to check in at events, labs, and service sites."
      actions={
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            pass.status === "active"
              ? "bg-[#2E8B57]/10 text-[#2E8B57]"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {pass.status}
        </span>
      }
    >
      <div className="mx-auto max-w-sm">
        <div className="overflow-hidden rounded-2xl border-2 border-[#0A2342] bg-gradient-to-b from-[#0A2342] to-[#0F2F52] p-6 text-white shadow-lg">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C6CCD6]">
              Madonna High School
            </p>
            <p className="mt-1 text-lg font-semibold">Blue Don Pass</p>
          </div>

          <div className="mx-auto mt-4 flex size-32 items-center justify-center rounded-xl bg-white">
            <QrCode className="size-24 text-[#0A2342]" aria-label="QR code placeholder" />
          </div>
          <p className="mt-2 text-center font-mono text-xs text-[#C6CCD6]">{pass.qrPayload}</p>

          <div className="mt-4 space-y-1 text-center">
            <p className="text-xl font-semibold">{pass.displayName}</p>
            <p className="text-sm text-[#C6CCD6]">
              Grade {pass.grade} · Class of {pass.classOf}
            </p>
            <p className="text-sm text-[#C6CCD6]">{pass.academy}</p>
            <p className="mt-2 font-mono text-xs text-[#C6CCD6]">{pass.studentId}</p>
          </div>
        </div>
      </div>

      <DashboardCard
        title="Check-In"
        description="Scan your pass at event entrances, labs, and service sites."
        icon={<ScanLine className="size-5" />}
        status={{ label: "Identity Engine", variant: "info" }}
      >
        <p className="text-sm text-muted-foreground">
          Present your Blue Don Pass QR code to staff or use a self-service kiosk.
          Check-ins earn spirit points and verify attendance for service hours.
        </p>
        <Button className="mt-3" variant="outline" size="sm" disabled>
          Simulate check-in (coming soon)
        </Button>
      </DashboardCard>

      <DashboardCard title="Recent Check-Ins" description="Your attendance history.">
        <ul className="space-y-2">
          {RECENT_CHECK_INS.map((ci) => (
            <li
              key={ci.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{ci.location}</p>
                <p className="text-xs text-muted-foreground">{ci.timeLabel}</p>
              </div>
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs uppercase text-muted-foreground">
                {ci.method}
              </span>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <Button variant="outline" nativeButton={false} render={<Link href="/profile">View full profile</Link>} />
    </ShellPage>
  );
}
