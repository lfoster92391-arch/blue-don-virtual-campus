/**
 * Group messaging for the three focus clubs.
 *
 * A thin audience-resolution layer on top of the existing Command Center
 * messaging stack: it works out which clubs the sender is allowed to address,
 * expands each audience to active members, then hands off to
 * `sendStudentMessages`. Nothing here writes to the database directly, so
 * permissions and message shape stay defined in exactly one place.
 */

import {
  CLUB_AUDIENCES,
  getClubAudience,
  type ClubAudienceId,
} from "@/config/club-audiences";
import { isDatabaseConfigured } from "@/config/env";
import { FOCUS_CLUB_SLUGS, type FocusClubSlug } from "@/config/focused-clubs";
import type { CampusRole } from "@/config/roles";
import {
  canBroadcastToFocusClubs,
  canSendClubMessages,
  listActiveClubMemberIds,
} from "@/lib/command-center-permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import {
  buildDefaultAdvisorActions,
  sendStudentMessages,
} from "@/services/student-message-service";

export type ClubAudienceOption = {
  id: ClubAudienceId;
  label: string;
  description: string;
  /** Active members who would receive this message, excluding the sender. */
  recipientCount: number;
};

export type ClubAudienceCompose = {
  options: ClubAudienceOption[];
  /** Set when nothing can be sent, so the page can explain why. */
  unavailableReason: string | null;
};

export type ClubAudienceSendResult = {
  count: number;
  /** Per-club breakdown so the sender sees exactly where it landed. */
  delivered: { club: string; count: number }[];
  error?: string;
};

type FocusClubOrg = {
  id: string;
  slug: FocusClubSlug;
  name: string;
};

async function listFocusClubOrganizations(): Promise<FocusClubOrg[]> {
  const rows = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      select: { id: true, slug: true, name: true },
    }),
  );

  if (!rows) {
    return [];
  }

  // Keep the canonical FOCUS_CLUB_SLUGS order rather than whatever the DB returns.
  return FOCUS_CLUB_SLUGS.map((slug) => {
    const row = rows.find((candidate) => candidate.slug === slug);
    return row ? { id: row.id, slug, name: row.name } : null;
  }).filter((org): org is FocusClubOrg => org !== null);
}

/** Clubs this user may broadcast to, with their active rosters attached. */
async function resolveSendableClubs(
  userId: string,
  role: CampusRole,
): Promise<{ org: FocusClubOrg; memberIds: string[] }[]> {
  const orgs = await listFocusClubOrganizations();
  // Campus staff and officers of any focus club reach all three; the per-club
  // check below is the fallback for anyone who gets here another way.
  const everyClub = await canBroadcastToFocusClubs(userId, role);

  const resolved = await Promise.all(
    orgs.map(async (org) => {
      if (!everyClub && !(await canSendClubMessages(userId, role, org.id))) {
        return null;
      }
      const memberIds = (await listActiveClubMemberIds(org.id)).filter(
        (id) => id !== userId,
      );
      return { org, memberIds };
    }),
  );

  return resolved.filter(
    (entry): entry is { org: FocusClubOrg; memberIds: string[] } =>
      entry !== null,
  );
}

/**
 * Audience picker contents for one sender. Campus admin, advisors, and staff
 * see all three clubs plus "Everyone in Groups", and so does any active
 * President / Vice President / Secretary of a focus club. Plain members get
 * nothing to send.
 */
export async function listClubAudiencesForSender(
  userId: string,
  role: CampusRole,
): Promise<ClubAudienceCompose> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      options: [],
      unavailableReason:
        "Campus messaging is offline right now — the club directory is unavailable.",
    };
  }

  try {
    const sendable = await resolveSendableClubs(userId, role);

    if (sendable.length === 0) {
      return {
        options: [],
        unavailableReason:
          "Group messaging is for campus staff and club officers. You are not a President, Vice President, or Secretary of IT Club, Broadcasting, or Cricut Club, so there is no group for you to message.",
      };
    }

    const bySlug = new Map(sendable.map((entry) => [entry.org.slug, entry]));
    const options: ClubAudienceOption[] = [];

    for (const audience of CLUB_AUDIENCES) {
      const matched = audience.slugs
        .map((slug) => bySlug.get(slug))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      // "Everyone in Groups" is only meaningful when more than one club is in reach.
      if (matched.length === 0 || (audience.slugs.length > 1 && matched.length < 2)) {
        continue;
      }

      const recipients = new Set<string>();
      for (const entry of matched) {
        for (const memberId of entry.memberIds) {
          recipients.add(memberId);
        }
      }

      options.push({
        id: audience.id,
        label: audience.label,
        description: audience.description,
        recipientCount: recipients.size,
      });
    }

    return { options, unavailableReason: null };
  } catch {
    return {
      options: [],
      unavailableReason:
        "Could not load the club directory. Try again in a moment.",
    };
  }
}

/**
 * Sends one Command Center message per club in the audience, so each recipient
 * sees which club it came from. Someone in two clubs is messaged once.
 */
export async function sendClubAudienceMessage(input: {
  fromUserId: string;
  role: CampusRole;
  audienceId: string;
  title: string;
  body?: string | null;
  href?: string | null;
}): Promise<ClubAudienceSendResult> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { count: 0, delivered: [], error: "Campus messaging is offline right now." };
  }

  const audience = getClubAudience(input.audienceId);
  if (!audience) {
    return { count: 0, delivered: [], error: "Pick a group to message." };
  }

  const title = input.title.trim();
  if (!title) {
    return { count: 0, delivered: [], error: "Message title is required." };
  }

  const sendable = await resolveSendableClubs(input.fromUserId, input.role);
  const targets = sendable.filter((entry) =>
    audience.slugs.includes(entry.org.slug),
  );

  if (targets.length === 0) {
    return {
      count: 0,
      delivered: [],
      error: `You are not allowed to message ${audience.label}.`,
    };
  }

  const actions = buildDefaultAdvisorActions(input.href?.trim() || undefined);
  const alreadyMessaged = new Set<string>();
  const delivered: { club: string; count: number }[] = [];
  const failures: string[] = [];
  let count = 0;

  for (const target of targets) {
    const toUserIds = target.memberIds.filter((id) => !alreadyMessaged.has(id));
    if (toUserIds.length === 0) {
      continue;
    }

    const result = await sendStudentMessages({
      fromUserId: input.fromUserId,
      role: input.role,
      organizationId: target.org.id,
      toUserIds,
      title,
      body: input.body?.trim() || null,
      kind: "GENERAL",
      actions,
    });

    if (result.error) {
      // One club being unreachable should not throw away the others.
      failures.push(`${target.org.name}: ${result.error}`);
      continue;
    }

    for (const id of toUserIds) {
      alreadyMessaged.add(id);
    }
    count += result.count;
    delivered.push({ club: target.org.name, count: result.count });
  }

  if (count === 0) {
    return {
      count: 0,
      delivered,
      error:
        failures[0] ??
        `${audience.label} has no active members to message yet.`,
    };
  }

  return { count, delivered };
}
