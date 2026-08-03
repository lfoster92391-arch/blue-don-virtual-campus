import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { IT_CONTACT_EMAIL } from "@/lib/auth/email-domain";
import { getCurrentUser } from "@/lib/auth/session";
import { parentHasLinkedStudents } from "@/services/parent-student-service";

export default async function PendingApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    redirect("/login");
  }

  if (!user.profileComplete) {
    redirect("/onboarding");
  }

  if (user.status === "active" && user.role !== "parent") {
    redirect("/home");
  }

  const awaitingLink =
    params.reason === "awaiting_student_link" ||
    (user.status === "active" &&
      user.role === "parent" &&
      !(await parentHasLinkedStudents(user.id)));

  if (user.status === "active" && user.role === "parent" && !awaitingLink) {
    redirect("/home");
  }

  return (
    <AuthShell
      title={awaitingLink ? "Student link pending" : "Account pending approval"}
      description={
        awaitingLink
          ? "Your account is approved. IT is connecting you to your student's profile."
          : "Your parent account is registered but requires administrator approval before campus access."
      }
    >
      <div className="space-y-4 rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/5 px-4 py-4 text-sm">
        <p>
          Signed in as <span className="font-medium">{user.email}</span>
        </p>
        {user.relationshipNote ? (
          <p>
            Relationship on file:{" "}
            <span className="font-medium">{user.relationshipNote}</span>
          </p>
        ) : null}
      </div>

      {!awaitingLink ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Parent accounts using a personal email address cannot enter Blue Don
            Virtual Campus until an administrator verifies your connection to the
            school.
          </p>
          <p>
            Email IT at{" "}
            <a
              href={`mailto:${IT_CONTACT_EMAIL}`}
              className="font-medium text-[#0A2342] underline dark:text-white"
            >
              {IT_CONTACT_EMAIL}
            </a>{" "}
            with your relationship to Madonna High School (for example: parent of
            Jane Smith, Class of 2028).
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, contact{" "}
          <a
            href={`mailto:${IT_CONTACT_EMAIL}`}
            className="font-medium text-[#0A2342] underline dark:text-white"
          >
            {IT_CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/auth/signout">Sign out</Link>}
        />
      </div>
    </AuthShell>
  );
}
