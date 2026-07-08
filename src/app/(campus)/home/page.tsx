import { redirect } from "next/navigation";

import { BlueDonOS } from "@/components/home/blue-don-os";
import { CampusVersionBanner } from "@/components/layout/campus-version-banner";
import { getTodayDigest } from "@/services/campus-os-service";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await requireCompleteProfile();
  const digest = await getTodayDigest(user.id);

  return (
    <>
      <CampusVersionBanner />
      <BlueDonOS user={user} digest={digest} />
    </>
  );
}
