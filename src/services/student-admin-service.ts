import { FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { mapCampusUser } from "@/services/user-service";
import type { CampusUser } from "@/types/auth";
import {
  listFocusClubMembershipsByUserIds,
  type FocusClubMembershipSummary,
} from "@/services/org-membership-service";

export type StudentAdminRow = CampusUser & {
  createdAt: Date;
  memberships: FocusClubMembershipSummary[];
};

/** Students for the Admin Students Control Center. */
export async function listStudentsForAdmin(): Promise<StudentAdminRow[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const users = await withDatabase((prisma) =>
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
    }),
  );

  if (!users?.length) {
    return [];
  }

  const membershipsByUser = await listFocusClubMembershipsByUserIds(
    users.map((u) => u.id),
  );

  return users.map((user) => ({
    ...mapCampusUser(user),
    createdAt: user.createdAt,
    memberships: membershipsByUser[user.id] ?? [],
  }));
}

export type FocusClubMemberCount = {
  slug: (typeof FOCUS_CLUB_SLUGS)[number];
  name: string;
  count: number;
};

export async function countFocusClubMemberships(): Promise<
  FocusClubMemberCount[]
> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return FOCUS_CLUB_SLUGS.map((slug) => ({
      slug,
      name: slug,
      count: 0,
    }));
  }

  const rows = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      select: {
        slug: true,
        name: true,
        _count: {
          select: {
            memberships: { where: { status: "ACTIVE" } },
          },
        },
      },
    }),
  );

  const bySlug = new Map(
    (rows ?? []).map((row) => [
      row.slug,
      { name: row.name, count: row._count.memberships },
    ]),
  );

  return FOCUS_CLUB_SLUGS.map((slug) => ({
    slug,
    name: bySlug.get(slug)?.name ?? slug,
    count: bySlug.get(slug)?.count ?? 0,
  }));
}
