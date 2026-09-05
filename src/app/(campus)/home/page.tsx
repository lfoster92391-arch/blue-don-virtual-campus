import { CampusCampaignBanner } from "@/components/fundraisers/campus-campaign-banner";
import { PageDropdown } from "@/components/ui/page-dropdown";
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
import { listPublicCampusCampaigns } from "@/services/club-finance-service";
import { getCricutAmazonWishlistUrl } from "@/services/cricut-shop-service";
import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import { FOCUS_CLUBS } from "@/config/focused-clubs";

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
  // Named-student preview uses that student’s inbox. Persona preview must not
  // reuse Lisa’s admin meetings/tasks — that made View as look like chrome-only.
  const commandUserId = identity.previewTarget?.id
    ?? (identity.isPreviewing ? null : user.id);
  const showOpsPulse = viewRole !== "student" && viewRole !== "parent";
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
    campaigns,
  ] = await Promise.all([
    safeHomeData(
      "digest",
      () => getTodayDigest(commandUserId ?? user.id),
      emptyDigest(),
    ),
    safeHomeData(
      "context",
      () => {
        if (identity.forcedMembershipSlugs) {
          return Promise.resolve({
            clubs: identity.forcedMembershipSlugs.map((slug) => {
              const club = FOCUS_CLUBS.find((item) => item.slug === slug)!;
              return {
                id: slug,
                slug,
                name: club.name,
                icon: "◆",
                href: club.href,
                role: "MEMBER",
              };
            }),
            teams: [],
            classes: [],
          } satisfies StudentContext);
        }
        return getStudentContext(commandUserId ?? user.id);
      },
      EMPTY_CONTEXT,
    ),
    safeHomeData(
      "broadcast-announcement",
      () => getTodaysBroadcastAnnouncement(),
      null as BroadcastAnnouncementView | null,
    ),
    safeHomeData(
      "hub",
      () =>
        getTodayHubDigest({
          id: commandUserId ?? user.id,
          role: viewRole,
        }),
      buildEmptyHubDigest(),
    ),
    safeHomeData(
      "messages",
      () =>
        commandUserId
          ? listStudentMessagesForUser(commandUserId)
          : Promise.resolve([] as StudentMessageView[]),
      [] as StudentMessageView[],
    ),
    safeHomeData(
      "meetings",
      () =>
        commandUserId
          ? listMeetingsForStudent(commandUserId)
          : Promise.resolve([] as CommandCenterMeetingView[]),
      [] as CommandCenterMeetingView[],
    ),
    safeHomeData(
      "tasks",
      () =>
        commandUserId
          ? listTasksForStudent(commandUserId)
          : Promise.resolve([] as ClubStudentTaskView[]),
      [] as ClubStudentTaskView[],
    ),
    safeHomeData("cricut-wishlist", () => getCricutAmazonWishlistUrl(), null),
    safeHomeData(
      "club-ops-pulse",
      () =>
        showOpsPulse
          ? getClubOpsPulse({ id: user.id, role: viewRole })
          : Promise.resolve(null as ClubOpsPulse | null),
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
    safeHomeData("campus-campaigns", () => listPublicCampusCampaigns({ take: 3 }), []),
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
      {identity.isPreviewing ? null : (
        <IntentMismatchNotice intent={intent} role={user.role} />
      )}
      {showAgreements ? <AgreementsWidget user={user} /> : null}
      {showClubJoinRequests ? <ClubJoinRequestsAlert user={user} /> : null}
      <CampusCampaignBanner campaigns={campaigns} className="mb-6" />
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
        viewRole={viewRole}
        previewPersona={identity.previewPersona}
        previewName={identity.previewTarget?.displayName ?? null}
      >
        <div className="space-y-3">
          <PageDropdown
            id="your-tools"
            title="Your tools"
            description="Shortcuts for your role on campus."
          >
            <SchoolRoleExtras user={user} context={context} viewRole={viewRole} />
          </PageDropdown>
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
