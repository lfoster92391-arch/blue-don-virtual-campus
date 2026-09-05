import type { CampusRole } from "@/config/roles";
import {
  canAccessAdmin,
  canAccessCoachWorkspace,
  isFacultyClubLookupRole,
} from "@/config/roles";

/** School operator vs public guest — the two doors on the login page. */
export type LoginAudience = "school" | "guest";

/**
 * Role the visitor *intends* to use. Faculty is a login label, not a
 * `CampusRole` — it maps to teacher/advisor/staff/counselor after auth.
 */
export type LoginIntent = "student" | "coach" | "admin" | "faculty";

export const LOGIN_INTENTS: readonly LoginIntent[] = [
  "student",
  "coach",
  "admin",
  "faculty",
] as const;

export const SCHOOL_HOME_PATH = "/home";
export const GUEST_HOME_PATH = "/guest";

export const LOGIN_COPY = {
  welcomeTitle: "Welcome to Madonna",
  welcomeDescription:
    "Choose how you would like to visit Madonna High School today.",
  schoolLabel: "Madonna School",
  schoolBlurb: "Students, coaches, faculty, and school staff — sign in with your campus account.",
  guestLabel: "Fan & Family",
  guestBlurb:
    "Watch games and follow campus news as a guest — no school login needed.",
  schoolRolesTitle: "Madonna School",
  schoolRolesDescription: "Who are you signing in as? Your home page follows your real account.",
  roles: {
    student: {
      label: "Student",
      blurb: "Classes, clubs, and campus life",
    },
    coach: {
      label: "Coach",
      blurb: "Teams, film, and game day",
    },
    admin: {
      label: "Admin",
      blurb: "Office tools and student accounts",
    },
    faculty: {
      label: "Faculty",
      blurb: "Classes, clubs, and school resources",
    },
  },
} as const;

export function parseLoginAudience(
  value: string | null | undefined,
): LoginAudience | null {
  if (value === "school" || value === "guest") {
    return value;
  }
  return null;
}

export function parseLoginIntent(
  value: string | null | undefined,
): LoginIntent | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "teacher") {
    return "faculty";
  }
  return LOGIN_INTENTS.includes(normalized as LoginIntent)
    ? (normalized as LoginIntent)
    : null;
}

export function loginIntentMatchesRole(
  intent: LoginIntent,
  role: CampusRole,
): boolean {
  switch (intent) {
    case "student":
      return role === "student";
    case "coach":
      return canAccessCoachWorkspace(role);
    case "admin":
      return canAccessAdmin(role);
    case "faculty":
      return isFacultyClubLookupRole(role);
  }
}

export function intentMismatchMessage(
  intent: LoginIntent,
  role: CampusRole,
): string | null {
  if (loginIntentMatchesRole(intent, role)) {
    return null;
  }

  const labels: Record<LoginIntent, string> = {
    student: "Student",
    coach: "Coach",
    admin: "Admin",
    faculty: "Faculty",
  };

  return `You chose ${labels[intent]}, but this account is signed in as ${role}. We opened your real home — that button does not change your permissions.`;
}
