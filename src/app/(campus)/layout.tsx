import { CampusLayout } from "@/components/layout/campus-layout";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function CampusRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCompleteProfile();

  return <CampusLayout user={user}>{children}</CampusLayout>;
}
