import type { CampusRole } from "@/config/roles";

export const SCHOOL_EMAIL_DOMAIN = "weirtonmadonna.org";
export const IT_CONTACT_EMAIL = "lisamorris@weirtonmadonna.org";

/** Documented local/demo student account — see docs/TEST_ACCOUNTS.md */
export const DEMO_STUDENT_EMAIL = "demo.student@bluedon.test";

/** Documented local/demo teacher account — see docs/TEST_ACCOUNTS.md */
export const DEMO_TEACHER_EMAIL = "demo.teacher@bluedon.test";

/** Primary principal account — provision via scripts/create-principal.mjs */
export const PRINCIPAL_EMAIL = "jheckathorn@weirtonmadonna.org";

/** Backup leadership admin — same provisioning script */
export const BACKUP_ADMIN_EMAIL = "lisamorris@weirtonmadonna.org";

/** Default bypass list when auth test bypass is enabled and no env override is set. */
export const DEFAULT_AUTH_TEST_BYPASS_EMAILS = [
  DEMO_STUDENT_EMAIL,
  DEMO_TEACHER_EMAIL,
] as const;

/** Trim + lowercase before any Supabase auth call. Phones often capitalize the first letter. */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Roles that must use a @weirtonmadonna.org email to register or sign in. */
export const SCHOOL_EMAIL_ROLES: CampusRole[] = [
  "student",
  "staff",
  "teacher",
  "admin",
  "advisor",
  "coach",
  "counselor",
];

function isAuthTestBypassEnabled(): boolean {
  if (process.env.ALLOW_AUTH_TEST_BYPASS === "true") {
    return true;
  }

  return (
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
  );
}

function parseBypassEmailList(): string[] {
  const fromEnv = [
    process.env.AUTH_TEST_BYPASS_EMAILS,
    process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS_EMAILS,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .flatMap((raw) => raw.split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  // When bypass is enabled, always include the documented demo accounts in
  // addition to any env-provided emails. This keeps the built-in demo student
  // and teacher working even if an env override only lists a subset (e.g. a
  // duplicated key in .env.local that clobbers one of the addresses).
  if (isAuthTestBypassEnabled()) {
    return [...new Set([...DEFAULT_AUTH_TEST_BYPASS_EMAILS, ...fromEnv])];
  }

  if (fromEnv.length > 0) {
    return [...new Set(fromEnv)];
  }

  return [];
}

export function isAuthTestBypassEmail(email: string): boolean {
  if (!isAuthTestBypassEnabled()) {
    return false;
  }

  return parseBypassEmailList().includes(normalizeAuthEmail(email));
}

export function getEmailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) {
    return null;
  }

  return email.slice(at + 1).trim().toLowerCase();
}

export function isSchoolEmail(email: string): boolean {
  return getEmailDomain(email) === SCHOOL_EMAIL_DOMAIN;
}

export function requiresSchoolEmail(role: CampusRole): boolean {
  return SCHOOL_EMAIL_ROLES.includes(role);
}

/**
 * Registration gate — call this before creating a *new* account, not on every
 * request.
 *
 * The school domain keeps the open internet from self-registering as a student.
 * It is not a statement about who may sign in: administrators provision student
 * accounts on outside addresses for families without a school mailbox, and
 * re-checking the domain at session time would lock those students out of the
 * campus (including published video). Callers that already have a provisioned
 * profile row should skip this.
 */
export function validateEmailForRole(
  email: string,
  role: CampusRole,
): { valid: true } | { valid: false; message: string } {
  if (!requiresSchoolEmail(role)) {
    return { valid: true };
  }

  if (isAuthTestBypassEmail(email)) {
    return { valid: true };
  }

  if (!isSchoolEmail(email)) {
    return {
      valid: false,
      message: `${role === "student" ? "Students" : "Staff"} must use a @${SCHOOL_EMAIL_DOMAIN} email address.`,
    };
  }

  return { valid: true };
}

export function schoolEmailRequiredMessage(role: CampusRole): string {
  const label =
    role === "student"
      ? "Students"
      : role === "staff"
        ? "Staff"
        : "School accounts";

  return `${label} must register and sign in with a @${SCHOOL_EMAIL_DOMAIN} email address.`;
}
