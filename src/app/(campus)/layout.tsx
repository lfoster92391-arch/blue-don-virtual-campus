import { CampusLayout } from "@/components/layout/campus-layout";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCampusAccess } from "@/lib/auth/session";
import { getStudentContext } from "@/services/student-context-service";
import {
  listLinkedStudents,
  userCanAccessParentPortal,
} from "@/services/parent-student-service";

export default async function CampusRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCampusAccess();
  const identity = await resolveAccessIdentity(user);

  let context;
  try {
    if (identity.forcedMembershipSlugs) {
      context = {
        clubs: identity.forcedMembershipSlugs.map((slug) => {
          const club = FOCUS_CLUBS.find((c) => c.slug === slug)!;
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
      };
    } else {
      const actsAsParent =
        !identity.isPreviewing &&
        (await userCanAccessParentPortal(user.id, user.role));
      const linkedStudents = actsAsParent
        ? await listLinkedStudents(user.id)
        : [];
      const contextUserId = identity.isPreviewing
        ? identity.membershipUserId
        : actsAsParent && linkedStudents[0]
          ? linkedStudents[0].id
          : user.id;
      context = await getStudentContext(contextUserId);
    }
  } catch (error) {
    console.error("[campus-layout] context failed:", error);
    context = { clubs: [], teams: [], classes: [] };
  }

  return (
    <CampusLayout
      user={user}
      context={context}
      navRole={identity.navRole}
      preview={{
        active: identity.isPreviewing,
        studentName: identity.previewTarget?.displayName ?? null,
        clubSlug: identity.previewClubSlug,
      }}
    >
      {children}
    </CampusLayout>
  );
}
