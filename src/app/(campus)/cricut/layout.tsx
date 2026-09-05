import { Bebas_Neue, Montserrat, Oswald, Playfair_Display } from "next/font/google";

import { CricutCartProvider } from "@/components/cricut/cricut-cart-context";
import { enforceFocusClubAccess } from "@/lib/auth/focus-club-guard";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCompleteProfile } from "@/lib/auth/session";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cricut-bebas",
  display: "swap",
});
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-cricut-oswald",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-cricut-montserrat",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-cricut-playfair",
  display: "swap",
});

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

  return (
    <div
      className={`${bebasNeue.variable} ${oswald.variable} ${montserrat.variable} ${playfair.variable}`}
    >
      <CricutCartProvider>{children}</CricutCartProvider>
    </div>
  );
}
