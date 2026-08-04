import { AgreementsWidget } from "@/components/home/agreements-widget";
import { ClubJoinRequestsAlert } from "@/components/home/club-join-requests-alert";
import { BlueDonOS } from "@/components/home/blue-don-os";
import { CampusVersionBanner } from "@/components/layout/campus-version-banner";
import type {
  ClubStudentTaskView,
  CommandCenterMeetingView,
  StudentMessageView,
} from "@/lib/command-center";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getTodaysBroadcastAnnouncement,
  type BroadcastAnnouncementView,
} from "@/services/broadcast-announcement-service";
import {
  getTodayDigest,
  type BlueDonOSViewModel,
} from "@/services/campus-os-service";
import { listMeetingsForStudent } from "@/services/club-calendar-service";
import { listTasksForStudent } from "@/services/club-student-task-service";
import {
  buildEmptyHubDigest,
  getTodayHubDigest,
} from "@/services/school-hub-service";
import {
  getStudentContext,
  type StudentContext,
} from "@/services/student-context-service";
import { listStudentMessagesForUser } from "@/services/student-message-service";

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

export default async function HomePage() {
  const user = await requireCompleteProfile();
  const [digest, context, dailyAnnouncement, hub, messages, meetings, tasks] =
    await Promise.all([
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
    ]);

  const showAgreements = user.role === "student" || user.role === "parent";
  const showClubJoinRequests =
    user.role === "teacher" ||
    user.role === "advisor" ||
    user.role === "admin";

  return (
    <>
      <CampusVersionBanner />
      {showAgreements ? <AgreementsWidget user={user} /> : null}
      {showClubJoinRequests ? <ClubJoinRequestsAlert user={user} /> : null}
      <BlueDonOS
        user={user}
        digest={digest}
        context={context}
        hub={hub}
        announcement={dailyAnnouncement}
        messages={messages}
        meetings={meetings}
        tasks={tasks}
      />
    </>
  );
}
