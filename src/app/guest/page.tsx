import { GuestHome } from "@/components/guest/guest-home";
import { listPublicCampusCampaigns } from "@/services/club-finance-service";
import { SCHOOL_HOME_PATH } from "@/config/login-audience";
import { canManageUsers } from "@/config/roles";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { getCurrentUser } from "@/lib/auth/session";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import { getActiveLiveStream } from "@/services/media-service";
import {
  buildEmptyHubDigest,
  getTodayHubDigest,
} from "@/services/school-hub-service";
import {
  getSportsBanner,
  listGameReports,
  listHighlights,
} from "@/services/sports-highlights-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fan & Family",
  description:
    "Watch Madonna High School games, highlights, and campus news — no school login required.",
};

async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[guest-home] data failed:", error);
    return fallback;
  }
}

export default async function GuestHomePage() {
  const [user, hub, announcement, banner, highlights, reports, activeLive, schedule, campaigns] =
    await Promise.all([
      getCurrentUser(),
      safe(getTodayHubDigest(null), buildEmptyHubDigest()),
      safe(getTodaysBroadcastAnnouncement(), null),
      safe(getSportsBanner(), { lastGame: null, upcoming: [] }),
      safe(listHighlights({ publishedOnly: true, take: 8 }), []),
      safe(listGameReports({ publishedOnly: true, take: 4 }), []),
      safe(getActiveLiveStream(), null),
      safe(getBroadcastSchedule(), null),
      safe(listPublicCampusCampaigns({ take: 3 }), []),
    ]);

  const previewPersona =
    user && canManageUsers(user.role)
      ? (await resolveAccessIdentity(user)).previewPersona
      : null;

  return (
    <GuestHome
      dateLabel={hub.dateLabel}
      weather={hub.weather}
      announcement={announcement}
      reports={reports}
      community={{
        lastGame: banner.lastGame,
        upcoming: banner.upcoming,
        highlights,
        players: [],
        activeLive,
        nextAirAt: schedule?.nextAirAt ?? null,
      }}
      campaigns={campaigns}
      signedInHomeHref={user ? SCHOOL_HOME_PATH : null}
      previewPersona={previewPersona}
    />
  );
}
