import { MADONNA_ORGANIZATIONS } from "@/config/madonna-organizations";
import {
  FOCUS_CLUB_SLUGS,
  isFocusClubSlug,
  type FocusClubSlug,
} from "@/config/focused-clubs";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

function catalogEntry(slug: FocusClubSlug) {
  return MADONNA_ORGANIZATIONS.find((org) => org.slug === slug) ?? null;
}

/**
 * Upsert a single focus-club organization from the Madonna catalog.
 * Safe for production — idempotent create/update of structural rows only.
 */
export async function ensureFocusClubOrganization(slug: string) {
  if (!isFocusClubSlug(slug) || !isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const seed = catalogEntry(slug);
  if (!seed) {
    return null;
  }

  return withDatabase((prisma) =>
    prisma.organization.upsert({
      where: { slug: seed.slug },
      update: {
        name: seed.name,
        description: seed.description,
        type: seed.type,
        category: seed.category,
        sortOrder: seed.sortOrder,
      },
      create: {
        id: seed.id,
        slug: seed.slug,
        name: seed.name,
        type: seed.type,
        category: seed.category,
        sortOrder: seed.sortOrder,
        description: seed.description,
      },
    }),
  );
}

/** Upsert IT Club, Broadcasting, and Cricut Club from the catalog. */
export async function ensureAllFocusClubOrganizations() {
  for (const slug of FOCUS_CLUB_SLUGS) {
    await ensureFocusClubOrganization(slug);
  }
}
