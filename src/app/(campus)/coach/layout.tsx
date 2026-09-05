import { requireCoachWorkspace } from "@/lib/auth/session";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCoachWorkspace();
  return children;
}
