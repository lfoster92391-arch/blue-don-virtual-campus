import type { UserRole, UserStatus } from "@/generated/prisma/client";
import type { CampusRole } from "@/config/roles";

export function toCampusRole(role: UserRole): CampusRole {
  return role.toLowerCase() as CampusRole;
}

export function toUserRole(role: CampusRole): UserRole {
  return role.toUpperCase() as UserRole;
}

export function toCampusStatus(status: UserStatus): "active" | "inactive" | "pending" {
  return status.toLowerCase() as "active" | "inactive" | "pending";
}

export function getInitials(input: {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email: string;
}): string {
  if (input.firstName && input.lastName) {
    return `${input.firstName[0]}${input.lastName[0]}`.toUpperCase();
  }

  if (input.displayName) {
    const parts = input.displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  return input.email.slice(0, 2).toUpperCase();
}

export function isProfileComplete(input: {
  firstName?: string | null;
  lastName?: string | null;
  status: UserStatus;
}): boolean {
  return Boolean(input.firstName && input.lastName && input.status === "ACTIVE");
}
