/**
 * Club-focus pivot — the three primary clubs when FOCUSED_CLUBS_MODE is on.
 * See docs/CLUB_FOCUS_PIVOT.md.
 */

export const FOCUS_CLUB_SLUGS = [
  "it-club",
  "broadcasting",
  "cricut-club",
] as const;

export type FocusClubSlug = (typeof FOCUS_CLUB_SLUGS)[number];

export const FOCUS_CLUBS: {
  slug: FocusClubSlug;
  name: string;
  href: string;
  shortLabel: string;
  accent: string;
  tagline: string;
  description: string;
}[] = [
  {
    slug: "it-club",
    name: "IT Club",
    href: "/organizations/it-club",
    shortLabel: "IT",
    accent: "#2F80ED",
    tagline: "Tech · Help desk · Finances",
    description:
      "Real-world technology skills — networking, repair, cybersecurity, and club finances.",
  },
  {
    slug: "broadcasting",
    name: "Broadcasting",
    href: "/organizations/broadcasting",
    shortLabel: "Broadcast",
    accent: "#E11D48",
    tagline: "Live · Media · Storytelling",
    description:
      "Go live from Studio B — morning announcements, games, and student media.",
  },
  {
    slug: "cricut-club",
    name: "Cricut Club",
    href: "/organizations/cricut-club",
    shortLabel: "Cricut",
    accent: "#DB2777",
    tagline: "Design · Cut · Create",
    description:
      "Maker projects with Cricut — vinyl, HTV, spirit wear, and campus creatives.",
  },
];

export function isFocusClubSlug(slug: string): slug is FocusClubSlug {
  return (FOCUS_CLUB_SLUGS as readonly string[]).includes(slug);
}

/** Slim club-page tabs when focused mode is on (per-club extras applied in ClubTabNav). */
export const FOCUS_CLUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "script", label: "Daily Rundown" },
  { id: "calendar", label: "Calendar" },
  { id: "finances", label: "Finances" },
  { id: "invoices", label: "Invoices" },
  { id: "fundraisers", label: "Fundraisers" },
  { id: "media", label: "Control Room" },
  { id: "shop", label: "Shop" },
  { id: "members", label: "Members" },
] as const;

