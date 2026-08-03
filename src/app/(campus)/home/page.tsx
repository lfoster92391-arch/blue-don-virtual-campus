import { AgreementsWidget } from "@/components/home/agreements-widget";
import { ClubJoinRequestsAlert } from "@/components/home/club-join-requests-alert";
import { BlueDonOS } from "@/components/home/blue-don-os";
import { CampusVersionBanner } from "@/components/layout/campus-version-banner";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import { getTodayDigest } from "@/services/campus-os-service";
import { getTodayHubDigest } from "@/services/school-hub-service";
import { getStudentContext } from "@/services/student-context-service";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await requireCompleteProfile();
  const [digest, context, dailyAnnouncement, hub] = await Promise.all([
    getTodayDigest(user.id),
    getStudentContext(user.id),
    getTodaysBroadcastAnnouncement(),
    getTodayHubDigest({ id: user.id, role: user.role }),
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
      />
    </>
  );
}
