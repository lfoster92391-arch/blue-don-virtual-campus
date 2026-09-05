import { CampusFeed } from "@/components/home/campus-feed";
import { ClubOpsPulsePanel } from "@/components/home/club-ops-pulse";
import { CommandStrip } from "@/components/home/command-strip";
import { DailyDiscovery } from "@/components/home/daily-discovery";
import { QuickActions } from "@/components/home/quick-actions";
import { TodayAtMadonna } from "@/components/home/today-at-madonna";
import { TodayPanel } from "@/components/home/today-panel";
import { TodayInMadonnaHistoryWidget } from "@/components/culture/today-in-history-widget";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import { CAMPUS_FEED } from "@/config/campus-feed";
import type {
  ClubStudentTaskView,
  CommandCenterMeetingView,
  StudentMessageView,
} from "@/lib/command-center";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type { BlueDonOSViewModel } from "@/services/campus-os-service";
import type { ClubOpsPulse } from "@/services/club-ops-pulse-service";
import type { HubDigest } from "@/services/school-hub-service";
import type { StudentContext } from "@/services/student-context-service";
import type { CampusUser } from "@/types/auth";
import type { ReactNode } from "react";

type BlueDonOSProps = {
  user: CampusUser;
  digest: BlueDonOSViewModel;
  context: StudentContext;
  hub: HubDigest;
  announcement: BroadcastAnnouncementView | null;
  messages?: StudentMessageView[];
  meetings?: CommandCenterMeetingView[];
  tasks?: ClubStudentTaskView[];
  opsPulse?: ClubOpsPulse | null;
  children?: ReactNode;
};

export function BlueDonOS({
  user,
  digest,
  context,
  hub,
  announcement,
  messages = [],
  meetings = [],
  tasks = [],
  opsPulse = null,
  children,
}: BlueDonOSProps) {
  if (FOCUSED_CLUBS_MODE) {
    return (
      <TodayAtMadonna
        user={user}
        hub={hub}
        announcement={announcement}
        messages={messages}
        meetings={meetings}
        tasks={tasks}
        opsPulse={opsPulse}
      >
        {children}
      </TodayAtMadonna>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DashboardHero user={user} />

      <CommandStrip
        digest={digest}
        context={context}
        announcementCount={CAMPUS_FEED.length}
      />

      {opsPulse ? <ClubOpsPulsePanel pulse={opsPulse} /> : null}
      {children}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <QuickActions context={context} role={user.role} />
          <TodayInMadonnaHistoryWidget date={digest.today} />
          <DailyDiscovery date={digest.today} />
          <CampusFeed />
        </div>

        <aside aria-label="Today panel">
          <TodayPanel digest={digest} context={context} />
        </aside>
      </div>
    </div>
  );
}
