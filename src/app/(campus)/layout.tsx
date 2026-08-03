import { CampusLayout } from "@/components/layout/campus-layout";
import { requireCampusAccess } from "@/lib/auth/session";
import { getStudentContext } from "@/services/student-context-service";
import { listLinkedStudents, userCanAccessParentPortal } from "@/services/parent-student-service";

export default async function CampusRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCampusAccess();
  const actsAsParent = await userCanAccessParentPortal(user.id, user.role);
  const linkedStudents = actsAsParent ? await listLinkedStudents(user.id) : [];
  const contextUserId =
    actsAsParent && linkedStudents[0] ? linkedStudents[0].id : user.id;
  const context = await getStudentContext(contextUserId);

  return (
    <CampusLayout user={user} context={context}>
      {children}
    </CampusLayout>
  );
}
