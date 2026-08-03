import Link from "next/link";
import { Heart } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getStaffSpotlight } from "@/services/madonna-culture-service";

export default function StaffAppreciationPage() {
  const spotlight = getStaffSpotlight();

  if (!spotlight) {
    return (
      <ShellPage
        title="Staff Appreciation"
        description="Monthly spotlights honoring the faculty and staff who make Madonna extraordinary."
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/thank-you">Thank You Wall</Link>}
          />
        }
      >
        <DashboardCard title="No spotlight yet" icon={<Heart className="size-5" />}>
          <p className="text-sm text-muted-foreground">
            No staff member has been featured yet. Nominate someone who goes
            above and beyond and check back for the first monthly spotlight.
          </p>
          <Button className="mt-3" variant="outline" size="sm" nativeButton={false} render={<Link href="/thank-you">Go to Thank You Wall</Link>} />
        </DashboardCard>
      </ShellPage>
    );
  }

  return (
    <ShellPage
      title="Staff Appreciation"
      description="Monthly spotlights honoring the faculty and staff who make Madonna extraordinary."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/thank-you">Thank You Wall</Link>}
        />
      }
    >
      <DashboardCard
        title={`${spotlight.emoji} ${spotlight.name}`}
        description={`${spotlight.role} · ${spotlight.department}`}
        icon={<Heart className="size-5" />}
        status={{ label: spotlight.monthLabel, variant: "success" }}
      >
        <p className="text-sm leading-relaxed text-foreground">{spotlight.bio}</p>
        <blockquote className="mt-4 rounded-lg border-l-2 border-[#2E8B57] bg-[#2E8B57]/5 px-3 py-2 text-sm italic text-foreground">
          &ldquo;{spotlight.quote}&rdquo;
        </blockquote>
        <div className="mt-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342]/10 to-[#2E8B57]/20">
          <div className="text-center">
            <span className="text-4xl">{spotlight.emoji}</span>
            <p className="mt-2 font-semibold text-foreground">{spotlight.name}</p>
            <p className="text-sm text-muted-foreground">Staff Spotlight</p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Nominate a staff member" description="Know someone who goes above and beyond?">
        <p className="text-sm text-muted-foreground">
          Send a thank-you on the Thank You Wall or email Student Council with your nomination for next month&apos;s spotlight.
        </p>
        <Button className="mt-3" variant="outline" size="sm" nativeButton={false} render={<Link href="/thank-you">Go to Thank You Wall</Link>} />
      </DashboardCard>
    </ShellPage>
  );
}
