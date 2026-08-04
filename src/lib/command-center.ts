export type StudentMessageActionType =
  | "link"
  | "view_later"
  | "add_to_calendar"
  | "upload_receipt"
  | "custom";

export type StudentMessageAction = {
  label: string;
  href?: string;
  actionType: StudentMessageActionType;
};

export type StudentMessageStatus =
  | "UNREAD"
  | "VIEW_LATER"
  | "DONE"
  | "DISMISSED";

export type StudentMessageKind =
  | "GENERAL"
  | "ADVISOR_REQUEST"
  | "INVOICE_RECEIPT_REQUEST"
  | "CRICUT_ORDER"
  | "BROADCAST_BOOKING"
  | "BROADCAST_ANNOUNCEMENT_SUBMISSION"
  | "BROADCAST_JOIN_APPLICATION"
  | "SPORTS_COVERAGE";

export type StudentMessageView = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromRoleLabel: string | null;
  toUserId: string;
  organizationId: string | null;
  organizationSlug: string | null;
  organizationName: string | null;
  kind: StudentMessageKind;
  title: string;
  body: string | null;
  status: StudentMessageStatus;
  actions: StudentMessageAction[];
  calendarTitle: string | null;
  calendarStart: Date | null;
  calendarEnd: Date | null;
  calendarLocation: string | null;
  createdAt: Date;
};

export type ClubStudentTaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED";

export const CLUB_STUDENT_TASK_STATUS_LABELS: Record<
  ClubStudentTaskStatus,
  string
> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
};

export type ClubStudentTaskView = {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  title: string;
  description: string | null;
  dueAt: Date | null;
  status: ClubStudentTaskStatus;
  assigneeId: string;
  assigneeName: string;
  createdByName: string;
  createdAt: Date;
  isPastDue: boolean;
};

export type CommandCenterMeetingView = {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  mandatoryAllClubs: boolean;
  createdByName: string;
};
