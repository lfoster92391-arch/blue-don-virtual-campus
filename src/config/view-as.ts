import type { CampusRole } from "@/config/roles";

/** Admin-only “View as” personas. Does not grant extra permissions. */
export type ViewAsPersona =
  | "student"
  | "parent"
  | "guest"
  | "coach"
  | "faculty"
  | "admin";

export const VIEW_AS_PERSONAS: readonly ViewAsPersona[] = [
  "student",
  "parent",
  "guest",
  "coach",
  "faculty",
  "admin",
] as const;

export const VIEW_AS_LABELS: Record<ViewAsPersona, string> = {
  student: "Student",
  parent: "Parent",
  guest: "Fan & Family",
  coach: "Coach",
  faculty: "Faculty",
  admin: "Admin",
};

export function parseViewAsPersona(
  value: string | null | undefined,
): ViewAsPersona | null {
  if (!value) {
    return null;
  }
  return VIEW_AS_PERSONAS.includes(value as ViewAsPersona)
    ? (value as ViewAsPersona)
    : null;
}

/** Nav / home density role while previewing. Admin persona exits preview. */
export function navRoleForViewAs(
  persona: ViewAsPersona,
): CampusRole | null {
  switch (persona) {
    case "student":
      return "student";
    case "parent":
      return "parent";
    case "coach":
      return "coach";
    case "faculty":
      return "teacher";
    case "guest":
    case "admin":
      return null;
  }
}

export function homePathForViewAs(persona: ViewAsPersona): string {
  switch (persona) {
    case "parent":
      return "/parent";
    case "guest":
      return "/guest";
    case "admin":
      return "/admin";
    case "coach":
      return "/home";
    case "faculty":
      return "/home";
    case "student":
      return "/home";
  }
}

/** Hero eyebrow so each View-as landing reads as that role’s home. */
export function homeEyebrowForView(
  role: CampusRole,
  persona?: ViewAsPersona | null,
): string {
  if (persona === "guest") {
    return "Fan & Family home";
  }
  if (persona === "parent" || role === "parent") {
    return "Parent home";
  }
  switch (role) {
    case "student":
      return "Student home";
    case "coach":
      return "Coach home";
    case "teacher":
      return "Faculty home";
    case "admin":
      return "Admin home";
    default:
      return "School home";
  }
}
