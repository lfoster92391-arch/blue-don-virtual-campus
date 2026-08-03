import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.profileComplete) {
    if (user.role === "parent" && user.status === "pending") {
      redirect("/pending-approval");
    }
    redirect("/home");
  }

  return <OnboardingForm user={user} />;
}
