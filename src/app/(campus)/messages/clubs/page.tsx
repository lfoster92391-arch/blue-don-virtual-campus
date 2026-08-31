import Link from "next/link";
import { ArrowRight, Inbox, MailWarning } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { ClubAudienceCompose } from "@/components/messaging/club-audience-compose";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listClubAudiencesForSender } from "@/services/club-audience-message-service";

export const metadata = {
  title: "Message clubs",
  description:
    "Send one message to IT Club, Broadcasting, Cricut Club, or everyone in all three.",
};

export default async function MessageClubsPage() {
  const user = await requireCompleteProfile();
  const { options, unavailableReason } = await listClubAudiencesForSender(
    user.id,
    user.role,
  );

  return (
    <ShellPage
      title="Message clubs"
      description="One message, one group. It lands in each member's Command Center on the home page — no email, no group chat."
    >
      {options.length > 0 ? (
        <ClubAudienceCompose options={options} />
      ) : (
        <DashboardCard
          title="Nothing to send yet"
          description="Group messaging is limited to campus staff and club officers — President, Vice President, and Secretary."
          icon={<MailWarning className="size-5" />}
        >
          <p className="text-sm text-muted-foreground">
            {unavailableReason ??
              "No club audiences are available for your account."}
          </p>
        </DashboardCard>
      )}

      <DashboardCard
        title="Where these land"
        description="Recipients do not need a new inbox — this reuses the Command Center messages they already read."
        icon={<Inbox className="size-5" />}
        actions={
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Home
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            Each message shows the club it came from and your name, with a
            “View Later” button so nobody loses it.
          </li>
          <li>
            Someone in two clubs gets one message, not two, when you send to
            Everyone in Groups.
          </li>
          <li>
            To message a handful of named students instead of a whole club, use
            the Messages tab on that club&rsquo;s page.
          </li>
        </ul>
      </DashboardCard>
    </ShellPage>
  );
}
