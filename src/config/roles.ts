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

export type OrgMembershipRole =
  | "president"
  | "vice_president"
  | "secretary"
  | "member";

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
  "president",
  "vice_president",
  "secretary",
  "member",
];

/** Legacy org-role strings still accepted when normalizing older rows/seeds. */
const ORG_ROLE_ALIASES: Record<string, OrgMembershipRole> = {
  president: "president",
  vice_president: "vice_president",
  secretary: "secretary",
  member: "member",
  lead: "president",
  officer: "vice_president",
  moderator: "secretary",
};

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
  president: "President",
  vice_president: "Vice President",
  secretary: "Secretary",
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
    "partners:approve",
    "partners:view",
    "mentors:approve",
    "mentors:manage",
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
    "lunch:order",
    "lunch:manage",
    "dietary:submit",
    "dietary:manage",
    "cafeteria:manage",
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
    "partners:approve",
    "partners:view",
    "mentors:manage",
    "journey:view_students",
    "future:explore",
    "rewards:grant",
    "feed:post",
    "athletics:manage_team",
    "athletics:view",
    "ai:use",
    "lunch:order",
    "lunch:manage",
    "dietary:submit",
    "dietary:manage",
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
    "partners:view",
    "journey:view_students",
    "future:explore",
    "rewards:grant",
    "feed:post",
    "athletics:view",
    "ai:use",
    "lunch:order",
    "dietary:submit",
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
    "partners:view",
    "journey:edit_self",
    "future:explore",
    "mentors:request",
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
    "partners:view",
    "portfolio:view_linked",
    "journey:view_students",
    "future:explore",
    "tickets:create",
    "athletics:view",
    "lunch:order",
    "dietary:submit",
  ],
  sponsor: [
    ...CORE,
    "sponsors:view",
    "events:participate",
    "knowledge:view",
    "impact_fund:view",
    "partners:view",
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
    "partners:view",
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
    "partners:view",
    "mentors:manage",
    "feed:post",
    "feed:moderate",
    "athletics:view",
    "lunch:order",
    "lunch:manage",
    "dietary:submit",
    "dietary:manage",
    "cafeteria:manage",
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
    "partners:view",
    "lunch:order",
    "dietary:submit",
  ],
  counselor: [
    ...CORE,
    "reports:view",
    "knowledge:view",
    "portfolio:view_linked",
    "journey:view_students",
    "future:explore",
    "partners:approve",
    "partners:view",
    "mentors:manage",
    "athletics:view",
    "lunch:order",
    "dietary:submit",
    "dietary:manage",
  ],
};

export const ORG_ROLE_PERMISSIONS: Record<OrgMembershipRole, string[]> = {
  president: [
    "org:announcements:manage",
    "org:events:manage",
    "org:members:manage",
    "org:media:manage",
    "org:feed:moderate",
    "org:store:manage",
    "org:resources:edit",
    "org:documents:edit",
    "org:projects:manage",
    "org:tasks:assign",
    "org:messages:send",
    "org:invoice_requests:create",
    "org:finances:view",
    "org:finances:manage",
    "org:orders:manage",
    "org:orders:fulfill",
    "org:catalog:list",
    "org:view",
  ],
  vice_president: [
    "org:announcements:manage",
    "org:events:manage",
    "org:members:manage",
    "org:media:manage",
    "org:feed:moderate",
    "org:store:manage",
    "org:resources:edit",
    "org:documents:edit",
    "org:projects:manage",
    "org:tasks:assign",
    "org:messages:send",
    "org:invoice_requests:create",
    "org:finances:view",
    "org:finances:manage",
    "org:orders:manage",
    "org:orders:fulfill",
    "org:catalog:list",
    "org:view",
  ],
  secretary: [
    "org:announcements:manage",
    "org:members:manage",
    "org:media:manage",
    "org:feed:moderate",
    "org:store:manage",
    "org:resources:edit",
    "org:documents:edit",
    "org:projects:manage",
    "org:messages:send",
    "org:invoice_requests:create",
    "org:finances:view",
    "org:orders:fulfill",
    "org:catalog:list",
    "org:view",
  ],
  member: ["org:view", "org:orders:fulfill", "org:catalog:list"],
};

/** Officer roles that may view club financials (not Members). */
export const FINANCE_VIEW_ORG_ROLES: OrgMembershipRole[] = [
  "president",
  "vice_president",
  "secretary",
];

/** President / VP — assign tasks and schedule club meetings. */
export const TASK_ASSIGN_ORG_ROLES: OrgMembershipRole[] = [
  "president",
  "vice_president",
];

/** Officers who can message club members (incl. Secretary invoice/receipt requests). */
export const MESSAGE_SEND_ORG_ROLES: OrgMembershipRole[] = [
  "president",
  "vice_president",
  "secretary",
];

export function orgRoleCanViewFinances(orgRole: OrgMembershipRole): boolean {
  return FINANCE_VIEW_ORG_ROLES.includes(orgRole);
}

export function orgRoleCanAssignTasks(orgRole: OrgMembershipRole): boolean {
  return TASK_ASSIGN_ORG_ROLES.includes(orgRole);
}

export function orgRoleCanSendMessages(orgRole: OrgMembershipRole): boolean {
  return MESSAGE_SEND_ORG_ROLES.includes(orgRole);
}

export function orgRoleIsOfficer(orgRole: OrgMembershipRole): boolean {
  return orgRole !== "member";
}

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

  const key = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ORG_ROLE_ALIASES[key] ?? null;
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

/**
 * Coach film room, roster, and stat sheet. Coaches and campus athletics
 * overseers (admin / advisor). Students, parents, and teachers without the
 * coach role stay on the public sports pages.
 */
export function canAccessCoachWorkspace(role: CampusRole): boolean {
  return hasPermission(role, "athletics:manage_team");
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

/** Faculty browse every club for student co-browsing — no membership join flow */
export const FACULTY_CLUB_LOOKUP_ROLES: CampusRole[] = [
  "admin",
  "teacher",
  "advisor",
  "coach",
  "counselor",
  "staff",
];

export function isFacultyClubLookupRole(role: CampusRole): boolean {
  return FACULTY_CLUB_LOOKUP_ROLES.includes(role);
}

export function canRequestOrganizationMembership(role: CampusRole): boolean {
  return canJoinAcademy(role);
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

export function canApproveMentorProfiles(role: CampusRole): boolean {
  return hasPermission(role, "mentors:approve");
}

export function canApprovePartners(role: CampusRole): boolean {
  return hasPermission(role, "partners:approve");
}

export function canReviewMentorConnections(role: CampusRole): boolean {
  return hasPermission(role, "mentors:manage");
}

export function canRequestMentorConnection(role: CampusRole): boolean {
  return hasPermission(role, "mentors:request");
}

const SUCCESS_ANALYTICS_ROLES: CampusRole[] = ["admin", "advisor", "counselor"];

export function canViewSuccessAnalytics(role: CampusRole): boolean {
  return SUCCESS_ANALYTICS_ROLES.includes(role);
}

/** Principal / leadership command center — broader than counselor success analytics. */
const LEADERSHIP_ANALYTICS_ROLES: CampusRole[] = [
  "admin",
  "advisor",
  "counselor",
  "staff",
];

export function canViewLeadershipAnalytics(role: CampusRole): boolean {
  return LEADERSHIP_ANALYTICS_ROLES.includes(role);
}

/**
 * Order cafeteria lunch. Parents order for their linked students; faculty and
 * staff order their own. Sponsors and alumni are not on campus for lunch.
 */
export function canOrderLunch(role: CampusRole): boolean {
  return hasPermission(role, "lunch:order");
}

/** See kitchen counts and every diner's order for a service date. */
export function canManageLunch(role: CampusRole): boolean {
  return hasPermission(role, "lunch:manage");
}

/**
 * Handle cafeteria money — credit the envelopes families bring to school and
 * record what a student has eaten. Narrower than `lunch:manage` on purpose:
 * seeing kitchen counts is not the same as moving a balance.
 */
export function canManageCafeteriaAccounts(role: CampusRole): boolean {
  return hasPermission(role, "cafeteria:manage");
}

/**
 * Roles that eat as themselves rather than ordering on someone else's behalf.
 * Parents are excluded — they order for linked students, not for themselves.
 */
const SELF_LUNCH_ROLES: CampusRole[] = [
  "admin",
  "advisor",
  "teacher",
  "staff",
  "coach",
  "counselor",
  "student",
];

export function ordersLunchForSelf(role: CampusRole): boolean {
  return SELF_LUNCH_ROLES.includes(role) && canOrderLunch(role);
}

/** Submit a dietary / allergy form for a linked student. */
export function canSubmitDietaryForm(role: CampusRole): boolean {
  return hasPermission(role, "dietary:submit");
}

/** Accept or decline dietary forms and edit the record on a student account. */
export function canManageDietary(role: CampusRole): boolean {
  return hasPermission(role, "dietary:manage");
}
