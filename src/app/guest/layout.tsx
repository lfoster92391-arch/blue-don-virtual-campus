import { redirect } from "next/navigation";

import { SCHOOL_HOME_PATH } from "@/config/login-audience";
import { canManageUsers } from "@/config/roles";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { getCurrentUser } from "@/lib/auth/session";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user && canManageUsers(user.role)) {
    const identity = await resolveAccessIdentity(user);
    if (identity.previewPersona === "guest") {
      redirect(SCHOOL_HOME_PATH);
    }
  }

  return children;
}
