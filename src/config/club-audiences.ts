/**
 * Named groups you can address from the "Message clubs" compose page.
 *
 * These are not a new entity — each audience resolves to `Organization` rows
 * from {@link FOCUS_CLUB_SLUGS} and their active `OrganizationMembership`
 * records. The messages themselves are plain `StudentMessage` rows, so they
 * land in the Command Center panel every recipient already reads on /home.
 */

import { FOCUS_CLUBS, type FocusClubSlug } from "@/config/focused-clubs";

/** Every active member of all three focus clubs, each person messaged once. */
export const CLUB_AUDIENCE_EVERYONE = "everyone-in-groups" as const;

export type ClubAudienceId = FocusClubSlug | typeof CLUB_AUDIENCE_EVERYONE;

export type ClubAudienceDefinition = {
  id: ClubAudienceId;
  label: string;
  description: string;
  /** Which club slugs the audience expands to. */
  slugs: readonly FocusClubSlug[];
};

export const CLUB_AUDIENCES: readonly ClubAudienceDefinition[] = [
  ...FOCUS_CLUBS.map((club) => ({
    id: club.slug,
    label: club.name,
    description: `Every active ${club.name} member.`,
    slugs: [club.slug] as const,
  })),
  {
    id: CLUB_AUDIENCE_EVERYONE,
    label: "Everyone in Groups",
    description:
      "All three focus clubs at once. Anyone in more than one club still gets a single message.",
    slugs: FOCUS_CLUBS.map((club) => club.slug),
  },
];

export function getClubAudience(
  id: string,
): ClubAudienceDefinition | null {
  return CLUB_AUDIENCES.find((audience) => audience.id === id) ?? null;
}
