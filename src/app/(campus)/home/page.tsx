import { AgreementsWidget } from "@/components/home/agreements-widget";
import { ClubJoinRequestsAlert } from "@/components/home/club-join-requests-alert";
import { BlueDonOS } from "@/components/home/blue-don-os";
import { IntentMismatchNotice } from "@/components/home/intent-mismatch-notice";
import { SchoolCommunityPanels } from "@/components/home/school-community-panels";
import { SchoolRoleExtras } from "@/components/home/school-role-extras";
import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CampusVersionBanner } from "@/components/layout/campus-version-banner";
import { GUEST_HOME_PATH, parseLoginIntent } from "@/config/login-audience";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import type {
  ClubStudentTaskView,
  CommandCenterMeetingView,
  StudentMessageView,
} from "@/lib/command-center";
import { redirect } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getTodaysBroadcastAnnouncement,
  type BroadcastAnnouncementView,
} from "@/services/broadcast-announcement-service";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import {
  getTodayDigest,
  type BlueDonOSViewModel,
} from "@/services/campus-os-service";
import {
  getClubOpsPulse,
  type ClubOpsPulse,
} from "@/services/club-ops-pulse-service";
import { listMeetingsForStudent } from "@/services/club-calendar-service";
import { listTasksForStudent } from "@/services/club-student-task-service";
import { getActiveLiveStream } from "@/services/media-service";
import {
  buildEmptyHubDigest,
  getTodayHubDigest,
} from "@/services/school-hub-service";
import {
  getSportsBanner,
  listHighlights,
  listPlayers,
} from "@/services/sports-highlights-service";
import {
  getStudentContext,
  type StudentContext,
} from "@/services/student-context-service";
import { listStudentMessagesForUser } from "@/services/student-message-service";
import { getCricutAmazonWishlistUrl } from "@/services/cricut-shop-service";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";

const EMPTY_CONTEXT: StudentContext = { clubs: [], teams: [], classes: [] };

function emptyDigest(date = new Date()): BlueDonOSViewModel {
  return {
    today: date,
    items: [],
    eventCount: 0,
    assignmentCount: 0,
  };
}

async function safeHomeData<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[home] ${label} failed:`, error);
    return fallback;
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const user = await requireCompleteProfile();
  const identity = await resolveAccessIdentity(user);
  if (identity.previewPersona === "guest") {
    redirect(GUEST_HOME_PATH);
  }
  const viewRole = identity.navRole;
  const { intent: rawIntent } = await searchParams;
  const intent = parseLoginIntent(rawIntent);
  const [
    digest,
    context,
    dailyAnnouncement,
    hub,
    messages,
    meetings,
    tasks,
    cricutWishlistUrl,
    opsPulse,
    banner,
    highlights,
    players,
    activeLive,
    schedule,
  ] = await Promise.all([
    safeHomeData("digest", () => getTodayDigest(user.id), emptyDigest()),
    safeHomeData("context", () => getStudentContext(user.id), EMPTY_CONTEXT),
    safeHomeData(
      "broadcast-announcement",
      () => getTodaysBroadcastAnnouncement(),
      null as BroadcastAnnouncementView | null,
    ),
    safeHomeData(
      "hub",
      () => getTodayHubDigest({ id: user.id, role: user.role }),
      buildEmptyHubDigest(),
    ),
    safeHomeData(
      "messages",
      () => listStudentMessagesForUser(user.id),
      [] as StudentMessageView[],
    ),
    safeHomeData(
      "meetings",
      () => listMeetingsForStudent(user.id),
      [] as CommandCenterMeetingView[],
    ),
    safeHomeData(
      "tasks",
      () => listTasksForStudent(user.id),
      [] as ClubStudentTaskView[],
    ),
    safeHomeData("cricut-wishlist", () => getCricutAmazonWishlistUrl(), null),
    safeHomeData(
      "club-ops-pulse",
      () => getClubOpsPulse({ id: user.id, role: user.role }),
      null as ClubOpsPulse | null,
    ),
    safeHomeData("sports-banner", () => getSportsBanner(), {
      lastGame: null,
      upcoming: [],
    }),
    safeHomeData(
      "highlights",
      () => listHighlights({ publishedOnly: true, take: 8 }),
      [],
    ),
    safeHomeData("players", () => listPlayers(), []),
    safeHomeData("live", () => getActiveLiveStream(), null),
    safeHomeData("broadcast-schedule", () => getBroadcastSchedule(), null),
  ]);

  const showAgreements = viewRole === "student" || viewRole === "parent";
  const showClubJoinRequests =
    !identity.isPreviewing &&
    (viewRole === "teacher" ||
      viewRole === "advisor" ||
      viewRole === "admin");

  return (
    <>
      <CampusVersionBanner />
      <IntentMismatchNotice intent={intent} role={user.role} />
      {showAgreements ? <AgreementsWidget user={user} /> : null}
      {showClubJoinRequests ? <ClubJoinRequestsAlert user={user} /> : null}
      {FOCUSED_CLUBS_MODE && cricutWishlistUrl ? (
        <div className="mb-6">
          <CricutAmazonWishlistBanner url={cricutWishlistUrl} compact />
        </div>
      ) : null}
      <BlueDonOS
        user={user}
        digest={digest}
        context={context}
        hub={hub}
        announcement={dailyAnnouncement}
        messages={messages}
        meetings={meetings}
        tasks={tasks}
        opsPulse={opsPulse}
      >
        <div className="space-y-6">
          <SchoolRoleExtras user={user} context={context} viewRole={viewRole} />
          <SchoolCommunityPanels
            data={{
              lastGame: banner.lastGame,
              upcoming: banner.upcoming,
              highlights,
              players,
              activeLive,
              nextAirAt: schedule?.nextAirAt ?? null,
            }}
          />
        </div>
      </BlueDonOS>
    </>
  );
}
