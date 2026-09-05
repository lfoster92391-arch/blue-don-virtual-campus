import type { User as SupabaseUser } from "@supabase/supabase-js";

import {
  normalizeRole,
  type CampusRole,
} from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import type { UserRole } from "@/generated/prisma/client";
import { withDatabase } from "@/lib/prisma";
import {
  getInitials,
  isProfileComplete,
  toCampusRole,
  toCampusStatus,
  toUserRole,
} from "@/lib/auth/mappers";
import { validateEmailForRole, normalizeAuthEmail } from "@/lib/auth/email-domain";
import type { CampusUser } from "@/types/auth";

type EnsureUserInput = {
  id: string;
  email: string;
  displayName?: string | null;
  profileImage?: string | null;
  role?: CampusRole | null;
  relationshipNote?: string | null;
};

function mapCampusUser(record: {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  profileImage: string | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  relationshipNote?: string | null;
}): CampusUser {
  const displayName =
    record.displayName ??
    [record.firstName, record.lastName].filter(Boolean).join(" ") ??
    record.email;

  return {
    id: record.id,
    email: record.email,
    displayName,
    firstName: record.firstName,
    lastName: record.lastName,
    role: toCampusRole(record.role),
    profileImage: record.profileImage,
    status: toCampusStatus(record.status),
    relationshipNote: record.relationshipNote ?? null,
    profileComplete: isProfileComplete(record),
    initials: getInitials(record),
  };
}

function mapFallbackUser(
  authUser: SupabaseUser,
  role: CampusRole = "student",
): CampusUser {
  const metadata = authUser.user_metadata ?? {};
  const firstName = (metadata.first_name as string | undefined) ?? null;
  const lastName = (metadata.last_name as string | undefined) ?? null;
  const displayName =
    (metadata.display_name as string | undefined) ??
    authUser.email ??
    "Campus User";

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    displayName,
    firstName,
    lastName,
    role: normalizeRole(metadata.role as string | undefined) ?? role,
    profileImage: (metadata.avatar_url as string | undefined) ?? null,
    status: firstName && lastName ? "active" : "pending",
    relationshipNote: null,
    profileComplete: Boolean(
      (firstName && lastName) || metadata.onboarded === true,
    ),
    initials: getInitials({
      firstName,
      lastName,
      displayName,
      email: authUser.email ?? "",
    }),
  };
}

/**
 * True when this auth identity already has a campus profile row — provisioned
 * by an administrator, or created before today's policy. This is what keeps the
 * school-email rule a *registration* gate rather than a sign-in gate.
 */
async function campusAccountExists(userId: string): Promise<boolean> {
  const existing = await withDatabase((prisma) =>
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  );

  return Boolean(existing);
}

export async function ensureUserProfile(input: EnsureUserInput): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const role = input.role ?? "student";
  const email = normalizeAuthEmail(input.email);

  // The school-email rule keeps the open internet from self-registering as a
  // student. It must not lock out an account an administrator already created
  // with an outside address, so it only applies to brand-new profiles.
  if (!(await campusAccountExists(input.id))) {
    const emailCheck = validateEmailForRole(email, role);
    if (!emailCheck.valid) {
      throw new Error(emailCheck.message);
    }
  }

  const isParent = role === "parent";

  const user = await withDatabase((prisma) =>
    prisma.user.upsert({
      where: { id: input.id },
      update: {
        email,
        displayName: input.displayName ?? undefined,
        profileImage: input.profileImage ?? undefined,
      },
      create: {
        id: input.id,
        email,
        displayName: input.displayName,
        profileImage: input.profileImage,
        role: toUserRole(role),
        status: isParent ? "PENDING" : "PENDING",
        relationshipNote: isParent ? input.relationshipNote ?? null : undefined,
      },
    }),
  );

  return user ? mapCampusUser(user) : null;
}

export async function getUserProfile(userId: string): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.findUnique({ where: { id: userId } }),
  );

  return user ? mapCampusUser(user) : null;
}

export async function completeOnboarding(input: {
  userId: string;
  firstName: string;
  lastName: string;
  relationshipNote?: string;
}): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const existing = await withDatabase((prisma) =>
    prisma.user.findUnique({ where: { id: input.userId } }),
  );

  if (!existing) {
    return null;
  }

  // No domain re-check here: the profile row already exists, so the account was
  // either admin-provisioned or passed the registration gate.
  const role = toCampusRole(existing.role);
  const isParent = role === "parent";

  const user = await withDatabase((prisma) =>
    prisma.user.update({
      where: { id: input.userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: `${input.firstName} ${input.lastName}`,
        relationshipNote: isParent ? input.relationshipNote?.trim() || null : undefined,
        status: isParent ? "PENDING" : "ACTIVE",
        onboardedAt: new Date(),
      },
    }),
  );

  return user ? mapCampusUser(user) : null;
}

export async function approveUserAccount(userId: string): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    }),
  );

  return user ? mapCampusUser(user) : null;
}

export async function createCampusUser(input: {
  id: string;
  email: string;
  role: CampusRole;
  firstName?: string;
  lastName?: string;
}): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const hasName = Boolean(input.firstName?.trim() && input.lastName?.trim());
  const firstName = input.firstName?.trim() || null;
  const lastName = input.lastName?.trim() || null;
  const email = normalizeAuthEmail(input.email);
  const displayName = hasName ? `${firstName} ${lastName}` : email;
  const isParent = input.role === "parent";

  const user = await withDatabase((prisma) =>
    prisma.user.create({
      data: {
        id: input.id,
        email,
        firstName,
        lastName,
        displayName,
        role: toUserRole(input.role),
        status: isParent ? "PENDING" : hasName ? "ACTIVE" : "PENDING",
        onboardedAt: hasName ? new Date() : undefined,
      },
    }),
  );

  return user ? mapCampusUser(user) : null;
}

export async function assignUserRole(
  userId: string,
  role: CampusRole,
): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.update({
      where: { id: userId },
      data: { role: toUserRole(role) },
    }),
  );

  return user ? mapCampusUser(user) : null;
}

export async function setUserAccountStatus(
  userId: string,
  status: "active" | "inactive" | "pending",
): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const prismaStatus =
    status === "active" ? "ACTIVE" : status === "inactive" ? "INACTIVE" : "PENDING";

  const user = await withDatabase((prisma) =>
    prisma.user.update({
      where: { id: userId },
      data: { status: prismaStatus },
    }),
  );

  return user ? mapCampusUser(user) : null;
}

export type CampusUserSummary = CampusUser & {
  createdAt: Date;
};

export async function searchCampusUsers(options?: {
  query?: string;
  role?: CampusRole;
  take?: number;
}): Promise<CampusUserSummary[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const query = options?.query?.trim();
  const role = options?.role;
  const take = options?.take ?? 40;

  const users = await withDatabase((prisma) =>
    prisma.user.findMany({
      where: {
        ...(role ? { role: toUserRole(role) } : {}),
        ...(query
          ? {
              OR: [
                { email: { contains: query, mode: "insensitive" } },
                { displayName: { contains: query, mode: "insensitive" } },
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ lastName: "asc" }, { displayName: "asc" }, { email: "asc" }],
      take,
    }),
  );

  if (!users) {
    return [];
  }

  return users.map((user) => ({
    ...mapCampusUser(user),
    createdAt: user.createdAt,
  }));
}

export async function listCampusUsers(): Promise<CampusUserSummary[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const users = await withDatabase((prisma) =>
    prisma.user.findMany({
      orderBy: [{ createdAt: "desc" }],
    }),
  );

  if (!users) {
    return [];
  }

  return users.map((user) => ({
    ...mapCampusUser(user),
    createdAt: user.createdAt,
  }));
}

export async function getUserById(userId: string): Promise<CampusUser | null> {
  return getUserProfile(userId);
}

export function buildCampusUserFromAuth(
  authUser: SupabaseUser,
  profile: CampusUser | null,
): CampusUser {
  if (profile) {
    return profile;
  }

  const metadataRole = normalizeRole(authUser.user_metadata?.role as string | undefined);
  return mapFallbackUser(authUser, metadataRole ?? "student");
}

export { mapCampusUser };
