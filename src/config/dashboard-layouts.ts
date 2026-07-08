import { canAccessAdmin, hasPermission, type CampusRole } from "@/config/roles";

export type DashboardPersona =
  | "student_middle"
  | "student_freshman"
  | "student_upper"
  | "student_senior"
  | "parent"
  | "teacher"
  | "advisor"
  | "staff"
  | "coach"
  | "counselor"
  | "alumni"
  | "sponsor"
  | "admin"
  | "default";

export type WidgetId =
  | "hero_greeting"
  | "quick_actions"
  | "metrics_strip"
  | "assignments_due"
  | "calendar_week"
  | "events_upcoming"
  | "notifications"
  | "portfolio_summary"
  | "academy_progress"
  | "admin_system_health"
  | "admin_compliance"
  | "admin_enrollment"
  | "admin_moderation";

export type WidgetZone = "hero" | "actions" | "metrics" | "main" | "footer" | "admin";

export type WidgetPlacement = {
  id: WidgetId;
  zone: WidgetZone;
  span?: "full" | "half";
};

export type DashboardLayoutTemplate = {
  id: string;
  label: string;
  widgets: WidgetPlacement[];
};

export type DashboardContext = {
  gradeLevel?: number | null;
  cohortYear?: number | null;
};

const STUDENT_ROLES: CampusRole[] = ["student"];
const INSTRUCTION_ROLES: CampusRole[] = ["teacher", "advisor"];
const ADMIN_WIDGET_ROLES: CampusRole[] = ["admin"];

export const WIDGET_REGISTRY: Record<
  WidgetId,
  {
    label: string;
    roles: CampusRole[] | "all";
    minGrade?: number;
    maxGrade?: number;
    permission?: string;
  }
> = {
  hero_greeting: { label: "Welcome banner", roles: "all" },
  quick_actions: { label: "Quick actions", roles: "all" },
  metrics_strip: { label: "Metrics", roles: "all" },
  assignments_due: {
    label: "Assignments",
    roles: [...STUDENT_ROLES, ...INSTRUCTION_ROLES],
  },
  calendar_week: { label: "Calendar", roles: "all" },
  events_upcoming: { label: "Events", roles: "all" },
  notifications: { label: "Notifications", roles: "all" },
  portfolio_summary: {
    label: "Portfolio",
    roles: ["student", "alumni", "parent", "advisor"],
  },
  academy_progress: {
    label: "Academy progress",
    roles: ["student", "advisor"],
  },
  admin_system_health: {
    label: "System health",
    roles: ADMIN_WIDGET_ROLES,
    permission: "integrations:view_health",
  },
  admin_compliance: {
    label: "Compliance summary",
    roles: ADMIN_WIDGET_ROLES,
    permission: "admin:access",
  },
  admin_enrollment: {
    label: "Enrollment snapshot",
    roles: ADMIN_WIDGET_ROLES,
    permission: "admin:access",
  },
  admin_moderation: {
    label: "Moderation queue",
    roles: ADMIN_WIDGET_ROLES,
    permission: "admin:access",
  },
};

const LAYOUT_TEMPLATES: Record<string, DashboardLayoutTemplate> = {
  student_explorer: {
    id: "student_explorer",
    label: "Middle school explorer",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "academy_progress", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  student_onboarding: {
    id: "student_onboarding",
    label: "Freshman onboarding",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "assignments_due", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "academy_progress", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  student_pathway: {
    id: "student_pathway",
    label: "Upperclass pathway",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "assignments_due", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "academy_progress", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
      { id: "portfolio_summary", zone: "footer", span: "full" },
    ],
  },
  student_graduation: {
    id: "student_graduation",
    label: "Senior graduation",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "assignments_due", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "academy_progress", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "portfolio_summary", zone: "footer", span: "full" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  parent_hub: {
    id: "parent_hub",
    label: "Parent hub",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "portfolio_summary", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  teacher_command: {
    id: "teacher_command",
    label: "Teacher command",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "assignments_due", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  advisor_oversight: {
    id: "advisor_oversight",
    label: "Advisor oversight",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "assignments_due", zone: "main", span: "half" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "academy_progress", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  admin_command: {
    id: "admin_command",
    label: "Admin command",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "admin_system_health", zone: "admin", span: "half" },
      { id: "admin_compliance", zone: "admin", span: "half" },
      { id: "admin_enrollment", zone: "admin", span: "half" },
      { id: "admin_moderation", zone: "admin", span: "half" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
  campus_default: {
    id: "campus_default",
    label: "Campus default",
    widgets: [
      { id: "hero_greeting", zone: "hero", span: "full" },
      { id: "quick_actions", zone: "actions", span: "full" },
      { id: "metrics_strip", zone: "metrics", span: "full" },
      { id: "calendar_week", zone: "main", span: "half" },
      { id: "events_upcoming", zone: "main", span: "half" },
      { id: "notifications", zone: "main", span: "half" },
    ],
  },
};

const PERSONA_LAYOUT_MAP: Record<DashboardPersona, string> = {
  student_middle: "student_explorer",
  student_freshman: "student_onboarding",
  student_upper: "student_pathway",
  student_senior: "student_graduation",
  parent: "parent_hub",
  teacher: "teacher_command",
  advisor: "advisor_oversight",
  staff: "campus_default",
  coach: "teacher_command",
  counselor: "campus_default",
  alumni: "campus_default",
  sponsor: "campus_default",
  admin: "admin_command",
  default: "campus_default",
};

export function resolveStudentPersona(gradeLevel?: number | null): DashboardPersona {
  if (!gradeLevel) {
    return "student_upper";
  }

  if (gradeLevel <= 8) {
    return "student_middle";
  }

  if (gradeLevel === 9) {
    return "student_freshman";
  }

  if (gradeLevel === 12) {
    return "student_senior";
  }

  return "student_upper";
}

export function resolveDashboardPersona(
  role: CampusRole,
  context: DashboardContext = {},
): DashboardPersona {
  if (role === "admin") {
    return "admin";
  }

  if (role === "parent") {
    return "parent";
  }

  if (role === "teacher") {
    return "teacher";
  }

  if (role === "advisor") {
    return "advisor";
  }

  if (role === "student") {
    return resolveStudentPersona(context.gradeLevel);
  }

  if (role === "staff") {
    return "staff";
  }

  if (role === "coach") {
    return "coach";
  }

  if (role === "counselor") {
    return "counselor";
  }

  if (role === "alumni") {
    return "alumni";
  }

  if (role === "sponsor") {
    return "sponsor";
  }

  return "default";
}

export function getDashboardLayout(persona: DashboardPersona): DashboardLayoutTemplate {
  const templateId = PERSONA_LAYOUT_MAP[persona] ?? "campus_default";
  return LAYOUT_TEMPLATES[templateId] ?? LAYOUT_TEMPLATES.campus_default;
}

export function isWidgetVisible(
  widgetId: WidgetId,
  role: CampusRole,
  context: DashboardContext = {},
): boolean {
  const config = WIDGET_REGISTRY[widgetId];
  if (!config) {
    return false;
  }

  if (config.permission && !hasPermission(role, config.permission)) {
    return false;
  }

  if (config.roles !== "all" && !config.roles.includes(role)) {
    return false;
  }

  if (config.minGrade !== undefined || config.maxGrade !== undefined) {
    const grade = context.gradeLevel;
    if (grade == null) {
      return true;
    }
    if (config.minGrade !== undefined && grade < config.minGrade) {
      return false;
    }
    if (config.maxGrade !== undefined && grade > config.maxGrade) {
      return false;
    }
  }

  if (
    widgetId.startsWith("admin_") &&
    !canAccessAdmin(role) &&
    config.permission &&
    !hasPermission(role, config.permission)
  ) {
    return false;
  }

  return true;
}

export function getVisibleWidgets(
  role: CampusRole,
  persona: DashboardPersona,
  context: DashboardContext = {},
): WidgetPlacement[] {
  const layout = getDashboardLayout(persona);
  return layout.widgets.filter((placement) =>
    isWidgetVisible(placement.id, role, context),
  );
}
