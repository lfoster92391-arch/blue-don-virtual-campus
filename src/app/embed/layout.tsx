import { EmbedLayout } from "@/components/layout/embed-layout";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function EmbedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCompleteProfile();

  return <EmbedLayout>{children}</EmbedLayout>;
}
