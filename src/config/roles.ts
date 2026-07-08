export type CampusRole =
  | "admin"
  | "advisor"
  | "teacher"
  | "student"
  | "parent"
  | "sponsor"
  | "alumni"
  | "staff"
  | "coach"
  | "counselor";

export type OrgMembershipRole = "lead" | "officer" | "moderator" | "member";

export const CAMPUS_ROLES: CampusRole[] = [
  "admin",
  "advisor",
  "teacher",
  "student",
  "parent",
  "sponsor",
  "alumni",
  "staff",
  "coach",
  "counselor",
];

export const ORG_MEMBERSHIP_ROLES: OrgMembershipRole[] = [
  "lead",
  "officer",
  "moderator",
  "member",
];

export const ROLE_LABELS: Record<CampusRole, string> = {
  admin: "Administrator",
  advisor: "Advisor",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  sponsor: "Sponsor",
  alumni: "Alumni",
  staff: "Staff",
  coach: "Coach",
  counselor: "Counselor",
};

export const ORG_ROLE_LABELS: Record<OrgMembershipRole, string> = {
  lead: "Lead / President",
  officer: "Officer",
  moderator: "Moderator",
  member: "Member",
};

const CORE = ["campus:access"] as const;

export const GLOBAL_ROLE_PERMISSIONS: Record<CampusRole, string[]> = {
  admin: [
    ...CORE,
    "admin:access",
    "users:manage",
    "reports:view",
    "events:manage",
    "events:participate",
    "events:publish",
    "forms:manage",
    "forms:approve",
    "forms:submit",
    "academy:manage",
    "org:create",
    "org:manage",
    "checklists:manage",
    "checklists:complete",
    "portfolio:view_linked",
    "knowledge:manage",
    "knowledge:view",
    "tickets:create",
    "tickets:manage",
    "labs:manage",
    "labs:use",
    "simulators:manage",
    "simulators:use",
    "impact_fund:manage",
    "impact_fund:propose",
    "impact_fund:vote",
    "impact_fund:view",
    "journey:view_students",
    "future:explore",
    "rewards:grant",
    "rewards:manage_store",
    "feed:post",
    "feed:moderate",
    "athletics:manage_team",
    "athletics:view",
    "integrations:manage",
    "integrations:view_health",
    "ai:use",
    "ai:audit",
  ],
  advisor: [
    ...CORE,
    "academy:manage",
    "students:view",
    "reports:view",
    "events:manage",
    "events:participate",
    "events:publish",
    "forms:approve",
    "forms:submit",
    "org:create",
    "org:manage",
    "checklists:manage",
    "checklists:complete",
    "portfolio:view_linked",
    "knowledge:view",
    "tickets:create",
    "tickets:manage",
    "labs:manage",
    "labs:use",
    "simulators:manage",
    "simulators:use",
    "impact_fund:propose",
    "impact_fund:vote",
    "impact_fund:view",
    "journey:view_students",
    "future:explore",
    "rewards:grant",
    "feed:post",
    "athletics:view",
    "ai:use",
  ],
  teacher: [
    ...CORE,
    "reports:view",
    "events:manage",
    "events:participate",
    "events:publish",
    "forms:submit",
    "org:create",
    "org:manage",
    "checklists:manage",
    "checklists:complete",
    "portfolio:view_linked",
    "knowledge:view",
    "tickets:create",
    "labs:use",
    "simulators:use",
    "impact_fund:view",
    "journey:view_students",
    "future:explore",
    "rewards:grant",
    "feed:post",
    "athletics:view",
    "ai:use",
  ],
  student: [
    ...CORE,
    "portfolio:edit",
    "tickets:create",
    "events:participate",
    "forms:submit",
    "academy:join",
    "checklists:complete",
    "knowledge:view",
    "labs:use",
    "simulators:use",
    "impact_fund:propose",
    "impact_fund:vote",
    "impact_fund:view",
    "journey:edit_self",
    "future:explore",
    "rewards:earn",
    "feed:post",
    "athletics:view",
    "ai:use",
  ],
  parent: [
    ...CORE,
    "parent:portal",
    "parent:view_student",
    "forms:sign",
    "forms:submit",
    "events:participate",
    "knowledge:view",
    "impact_fund:view",
    "portfolio:view_linked",
    "journey:view_students",
    "future:explore",
    "tickets:create",
    "athletics:view",
  ],
  sponsor: [
    ...CORE,
    "sponsors:view",
    "events:participate",
    "knowledge:view",
    "impact_fund:view",
    "impact_fund:vote",
  ],
  alumni: [
    ...CORE,
    "alumni:portal",
    "events:participate",
    "forms:submit",
    "knowledge:view",
    "portfolio:edit",
    "journey:edit_self",
    "future:explore",
    "feed:post",
    "athletics:view",
    "ai:use",
  ],
  staff: [
    ...CORE,
    "reports:view",
    "events:manage",
    "events:participate",
    "forms:submit",
    "org:create",
    "org:manage",
    "checklists:complete",
    "knowledge:manage",
    "knowledge:view",
    "tickets:create",
    "tickets:manage",
    "impact_fund:view",
    "feed:post",
    "feed:moderate",
    "athletics:view",
  ],
  coach: [
    ...CORE,
    "events:manage",
    "events:participate",
    "events:publish",
    "forms:submit",
    "org:create",
    "org:manage",
    "checklists:manage",
    "checklists:complete",
    "knowledge:view",
    "tickets:create",
    "rewards:grant",
    "feed:post",
    "athletics:manage_team",
    "athletics:view",
  ],
  counselor: [
    ...CORE,
    "reports:view",
    "knowledge:view",
    "portfolio:view_linked",
    "journey:view_students",
    "future:explore",
    "athletics:view",
  ],
};

export const ORG_ROLE_PERMISSIONS: Record<OrgMembershipRole, string[]> = {
  lead: [
    "org:announcements:manage",
    "org:events:manage",
    "org:members:manage",
    "org:media:manage",
    "org:feed:moderate",
    "org:store:manage",
    "org:resources:edit",
    "org:view",
  ],
  officer: [
    "org:announcements:manage",
    "org:events:manage",
    "org:members:manage",
    "org:media:manage",
    "org:feed:moderate",
    "org:resources:edit",
    "org:view",
  ],
  moderator: [
    "org:media:manage",
    "org:feed:moderate",
    "org:view",
  ],
  member: ["org:view"],
};

/** @deprecated Use GLOBAL_ROLE_PERMISSIONS — kept for backward compatibility */
export const ROLE_PERMISSIONS = GLOBAL_ROLE_PERMISSIONS;

export function normalizeRole(value: string | null | undefined): CampusRole | null {
  if (!value) {
    return null;
  }

  const role = value.toLowerCase() as CampusRole;
  return CAMPUS_ROLES.includes(role) ? role : null;
}

export function normalizeOrgRole(
  value: string | null | undefined,
): OrgMembershipRole | null {
  if (!value) {
    return null;
  }

  const role = value.toLowerCase() as OrgMembershipRole;
  return ORG_MEMBERSHIP_ROLES.includes(role) ? role : null;
}

export function hasPermission(
  role: CampusRole,
  permission: string,
): boolean {
  const permissions = GLOBAL_ROLE_PERMISSIONS[role];
  return permissions.includes(permission) || permissions.includes("*");
}

export function hasOrgRolePermission(
  orgRole: OrgMembershipRole,
  permission: string,
): boolean {
  const permissions = ORG_ROLE_PERMISSIONS[orgRole];
  return permissions.includes(permission) || permissions.includes("*");
}

export function canAccessAdmin(role: CampusRole): boolean {
  return hasPermission(role, "admin:access");
}

export function canManageEvents(role: CampusRole): boolean {
  return hasPermission(role, "events:manage");
}

export function canParticipateInEvents(role: CampusRole): boolean {
  return hasPermission(role, "events:participate");
}

export function canManageForms(role: CampusRole): boolean {
  return hasPermission(role, "forms:manage");
}

export function canApproveForms(role: CampusRole): boolean {
  return hasPermission(role, "forms:approve");
}

export function canSubmitForms(role: CampusRole): boolean {
  return (
    hasPermission(role, "forms:submit") || hasPermission(role, "forms:sign")
  );
}

export function canJoinAcademy(role: CampusRole): boolean {
  return hasPermission(role, "academy:join");
}

export function canManageAcademy(role: CampusRole): boolean {
  return hasPermission(role, "academy:manage");
}

export function canManageChecklists(role: CampusRole): boolean {
  return hasPermission(role, "checklists:manage");
}

export function canCompleteChecklists(role: CampusRole): boolean {
  return (
    hasPermission(role, "checklists:complete") ||
    hasPermission(role, "checklists:manage")
  );
}

export function canEditPortfolio(role: CampusRole): boolean {
  return hasPermission(role, "portfolio:edit");
}

export function canCreateTickets(role: CampusRole): boolean {
  return hasPermission(role, "tickets:create");
}

export function canManageTickets(role: CampusRole): boolean {
  return hasPermission(role, "tickets:manage");
}

export function canManageUsers(role: CampusRole): boolean {
  return hasPermission(role, "users:manage");
}

export function canManageKnowledge(role: CampusRole): boolean {
  return hasPermission(role, "knowledge:manage");
}

export function canViewKnowledge(role: CampusRole): boolean {
  return (
    hasPermission(role, "knowledge:view") ||
    hasPermission(role, "knowledge:manage")
  );
}

export function canUseLabs(role: CampusRole): boolean {
  return (
    hasPermission(role, "labs:use") || hasPermission(role, "labs:manage")
  );
}

export function canManageLabs(role: CampusRole): boolean {
  return hasPermission(role, "labs:manage");
}

export function canUseSimulators(role: CampusRole): boolean {
  return (
    hasPermission(role, "simulators:use") ||
    hasPermission(role, "simulators:manage")
  );
}

export function canManageSimulators(role: CampusRole): boolean {
  return hasPermission(role, "simulators:manage");
}

export function canViewImpactFund(role: CampusRole): boolean {
  return hasPermission(role, "impact_fund:view");
}

export function canProposeImpactFund(role: CampusRole): boolean {
  return hasPermission(role, "impact_fund:propose");
}

export function canVoteImpactFund(role: CampusRole): boolean {
  return hasPermission(role, "impact_fund:vote");
}

export function canManageImpactFund(role: CampusRole): boolean {
  return hasPermission(role, "impact_fund:manage");
}
