import { redirect } from "next/navigation";

import { canViewSuccessAnalytics } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function AdminSuccessAnalyticsPage() {
  const user = await requireCompleteProfile();

  if (!canViewSuccessAnalytics(user.role)) {
    redirect("/home");
  }

  redirect("/counselor/analytics");
}
