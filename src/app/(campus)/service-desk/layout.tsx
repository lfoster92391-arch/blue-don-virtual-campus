import { enforceFocusClubAccess } from "@/lib/auth/focus-club-guard";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function ServiceDeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCompleteProfile();
  const identity = await resolveAccessIdentity(user);
  await enforceFocusClubAccess({
    userId: user.id,
    role: identity.navRole,
    clubSlug: "it-club",
    options: {
      forceScoped: identity.isPreviewing,
      membershipUserId: identity.membershipUserId,
      forcedMembershipSlugs: identity.forcedMembershipSlugs,
    },
  });

  return children;
}
