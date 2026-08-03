import { CricutCartProvider } from "@/components/cricut/cricut-cart-context";
import { enforceFocusClubAccess } from "@/lib/auth/focus-club-guard";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function CricutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCompleteProfile();
  const identity = await resolveAccessIdentity(user);
  await enforceFocusClubAccess({
    userId: user.id,
    role: identity.navRole,
    clubSlug: "cricut-club",
    options: {
      forceScoped: identity.isPreviewing,
      membershipUserId: identity.membershipUserId,
      forcedMembershipSlugs: identity.forcedMembershipSlugs,
    },
  });

  return <CricutCartProvider>{children}</CricutCartProvider>;
}
