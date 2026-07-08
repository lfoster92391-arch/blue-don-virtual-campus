import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.profileComplete) {
    redirect("/home");
  }

  return <OnboardingForm user={user} />;
}
