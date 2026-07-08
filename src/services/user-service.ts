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
import type { CampusUser } from "@/types/auth";

type EnsureUserInput = {
  id: string;
  email: string;
  displayName?: string | null;
  profileImage?: string | null;
  role?: CampusRole | null;
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

export async function ensureUserProfile(input: EnsureUserInput): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const role = input.role ?? "student";

  const user = await withDatabase((prisma) =>
    prisma.user.upsert({
      where: { id: input.id },
      update: {
        email: input.email,
        displayName: input.displayName ?? undefined,
        profileImage: input.profileImage ?? undefined,
      },
      create: {
        id: input.id,
        email: input.email,
        displayName: input.displayName,
        profileImage: input.profileImage,
        role: toUserRole(role),
        status: "PENDING",
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
}): Promise<CampusUser | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.update({
      where: { id: input.userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: `${input.firstName} ${input.lastName}`,
        status: "ACTIVE",
        onboardedAt: new Date(),
      },
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
  const displayName = hasName ? `${firstName} ${lastName}` : input.email;

  const user = await withDatabase((prisma) =>
    prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        firstName,
        lastName,
        displayName,
        role: toUserRole(input.role),
        status: hasName ? "ACTIVE" : "PENDING",
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

export type CampusUserSummary = CampusUser & {
  createdAt: Date;
};

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
