import { isDatabaseConfigured } from "@/config/env";
import { FOCUS_CLUB_ROLE_LABELS } from "@/config/focus-club-access";
import {
  isFocusClubSlug,
  type FocusClubSlug,
} from "@/config/focused-clubs";
import type { CampusRole } from "@/config/roles";
import {
  canManageAcademy,
  hasPermission,
  normalizeOrgRole,
} from "@/config/roles";
import type {
  StudentMessageAction,
  StudentMessageKind,
  StudentMessageStatus,
  StudentMessageView,
} from "@/lib/command-center";
import {
  canRequestInvoiceReceipt,
  canSendClubMessages,
  listActiveClubMemberIds,
} from "@/lib/command-center-permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "User"
  );
}

function parseActions(raw: unknown): StudentMessageAction[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const actions: StudentMessageAction[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    if (!label) {
      continue;
    }
    const actionType =
      typeof row.actionType === "string"
        ? (row.actionType as StudentMessageAction["actionType"])
        : "link";
    actions.push({
      label,
      href: typeof row.href === "string" ? row.href : undefined,
      actionType,
    });
  }
  return actions;
}

function mapMessage(row: {
  id: string;
  fromUserId: string;
  toUserId: string;
  organizationId: string | null;
  kind: StudentMessageKind;
  title: string;
  body: string | null;
  status: StudentMessageStatus;
  actions: unknown;
  calendarTitle: string | null;
  calendarStart: Date | null;
  calendarEnd: Date | null;
  calendarLocation: string | null;
  createdAt: Date;
  fromUser: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  organization: { id: string; slug: string; name: string } | null;
  fromMembershipRole?: string | null;
}): StudentMessageView {
  let fromRoleLabel: string | null = null;
  const slug = row.organization?.slug;
  if (slug && isFocusClubSlug(slug) && row.fromMembershipRole) {
    const orgRole = normalizeOrgRole(row.fromMembershipRole);
    if (orgRole) {
      fromRoleLabel = FOCUS_CLUB_ROLE_LABELS[slug as FocusClubSlug][orgRole];
    }
  }

  return {
    id: row.id,
    fromUserId: row.fromUserId,
    fromName: displayName(row.fromUser),
    fromRoleLabel,
    toUserId: row.toUserId,
    organizationId: row.organizationId,
    organizationSlug: row.organization?.slug ?? null,
    organizationName: row.organization?.name ?? null,
    kind: row.kind,
    title: row.title,
    body: row.body,
    status: row.status,
    actions: parseActions(row.actions),
    calendarTitle: row.calendarTitle,
    calendarStart: row.calendarStart,
    calendarEnd: row.calendarEnd,
    calendarLocation: row.calendarLocation,
    createdAt: row.createdAt,
  };
}

export async function listStudentMessagesForUser(
  userId: string,
  options?: { includeDone?: boolean },
): Promise<StudentMessageView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const statuses: StudentMessageStatus[] = options?.includeDone
    ? ["UNREAD", "VIEW_LATER", "DONE", "DISMISSED"]
    : ["UNREAD", "VIEW_LATER"];

  const rows = await withDatabase((prisma) =>
    prisma.studentMessage.findMany({
      where: {
        toUserId: userId,
        status: { in: statuses },
      },
      include: {
        fromUser: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        organization: { select: { id: true, slug: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  );

  if (!rows?.length) {
    return [];
  }

  const orgIds = [
    ...new Set(
      rows
        .map((r) => r.organizationId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const fromIds = [...new Set(rows.map((r) => r.fromUserId))];

  const memberships =
    orgIds.length > 0
      ? await withDatabase((prisma) =>
          prisma.organizationMembership.findMany({
            where: {
              organizationId: { in: orgIds },
              userId: { in: fromIds },
              status: "ACTIVE",
            },
            select: {
              organizationId: true,
              userId: true,
              orgRole: true,
            },
          }),
        )
      : [];

  const roleByKey = new Map(
    (memberships ?? []).map((m) => [
      `${m.organizationId}:${m.userId}`,
      m.orgRole,
    ]),
  );

  return rows.map((row) =>
    mapMessage({
      ...row,
      kind: row.kind as StudentMessageKind,
      status: row.status as StudentMessageStatus,
      fromMembershipRole: row.organizationId
        ? (roleByKey.get(`${row.organizationId}:${row.fromUserId}`) ?? null)
        : null,
    }),
  );
}

export async function listInvoiceReceiptRequestsForClub(
  organizationId: string,
): Promise<StudentMessageView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.studentMessage.findMany({
      where: {
        organizationId,
        kind: "INVOICE_RECEIPT_REQUEST",
        status: { in: ["UNREAD", "VIEW_LATER", "DONE"] },
      },
      include: {
        fromUser: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        organization: { select: { id: true, slug: true, name: true } },
        toUser: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) =>
    mapMessage({
      ...row,
      kind: row.kind as StudentMessageKind,
      status: row.status as StudentMessageStatus,
      fromMembershipRole: null,
      title: `${row.title} → ${displayName(row.toUser)}`,
    }),
  );
}

export async function sendStudentMessages(input: {
  fromUserId: string;
  role: CampusRole;
  organizationId: string | null;
  toUserIds: string[];
  title: string;
  body?: string | null;
  kind?: StudentMessageKind;
  actions: StudentMessageAction[];
  calendarTitle?: string | null;
  calendarStart?: Date | null;
  calendarEnd?: Date | null;
  calendarLocation?: string | null;
}): Promise<{ count: number; error?: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { count: 0, error: "Database unavailable." };
  }

  const uniqueRecipients = [...new Set(input.toUserIds.filter(Boolean))];
  if (uniqueRecipients.length === 0) {
    return { count: 0, error: "Select at least one student." };
  }

  if (input.organizationId) {
    const allowed = await canSendClubMessages(
      input.fromUserId,
      input.role,
      input.organizationId,
    );
    if (!allowed) {
      return { count: 0, error: "You cannot message this club." };
    }
  } else {
    const campusWide =
      hasPermission(input.role, "admin:access") ||
      canManageAcademy(input.role) ||
      input.role === "advisor";
    if (!campusWide) {
      return { count: 0, error: "Pick a club to message students." };
    }
  }

  if (input.kind === "INVOICE_RECEIPT_REQUEST" && input.organizationId) {
    const allowed = await canRequestInvoiceReceipt(
      input.fromUserId,
      input.role,
      input.organizationId,
    );
    if (!allowed) {
      return { count: 0, error: "You cannot request invoices for this club." };
    }
  }

  const created = await withDatabase((prisma) =>
    prisma.studentMessage.createMany({
      data: uniqueRecipients.map((toUserId) => ({
        fromUserId: input.fromUserId,
        toUserId,
        organizationId: input.organizationId,
        kind: input.kind ?? "GENERAL",
        title: input.title.trim(),
        body: input.body?.trim() || null,
        status: "UNREAD" as const,
        actions: input.actions,
        calendarTitle: input.calendarTitle?.trim() || null,
        calendarStart: input.calendarStart ?? null,
        calendarEnd: input.calendarEnd ?? null,
        calendarLocation: input.calendarLocation?.trim() || null,
      })),
    }),
  );

  return { count: created?.count ?? 0 };
}

/**
 * System / buyer-triggered notifications (e.g. Cricut new order).
 * Skips officer send-permission checks; still requires DB + recipients.
 */
export async function sendSystemStudentMessages(input: {
  fromUserId: string;
  toUserIds: string[];
  organizationId: string | null;
  title: string;
  body?: string | null;
  kind?: StudentMessageKind;
  actions: StudentMessageAction[];
}): Promise<{ count: number; error?: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { count: 0, error: "Database unavailable." };
  }

  const uniqueRecipients = [...new Set(input.toUserIds.filter(Boolean))];
  if (uniqueRecipients.length === 0) {
    return { count: 0, error: "No recipients." };
  }

  const created = await withDatabase((prisma) =>
    prisma.studentMessage.createMany({
      data: uniqueRecipients.map((toUserId) => ({
        fromUserId: input.fromUserId,
        toUserId,
        organizationId: input.organizationId,
        kind: input.kind ?? "GENERAL",
        title: input.title.trim(),
        body: input.body?.trim() || null,
        status: "UNREAD" as const,
        actions: input.actions,
      })),
    }),
  );

  return { count: created?.count ?? 0 };
}

export async function sendMessageToWholeClub(input: {
  fromUserId: string;
  role: CampusRole;
  organizationId: string;
  title: string;
  body?: string | null;
  kind?: StudentMessageKind;
  actions: StudentMessageAction[];
  calendarTitle?: string | null;
  calendarStart?: Date | null;
  calendarEnd?: Date | null;
  calendarLocation?: string | null;
}): Promise<{ count: number; error?: string }> {
  const memberIds = await listActiveClubMemberIds(input.organizationId);
  const recipients = memberIds.filter((id) => id !== input.fromUserId);
  return sendStudentMessages({ ...input, toUserIds: recipients });
}

export async function updateStudentMessageStatus(input: {
  messageId: string;
  userId: string;
  status: StudentMessageStatus;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const updated = await withDatabase((prisma) =>
    prisma.studentMessage.updateMany({
      where: { id: input.messageId, toUserId: input.userId },
      data: { status: input.status },
    }),
  );

  return (updated?.count ?? 0) > 0;
}

export async function getStudentMessageForUser(
  messageId: string,
  userId: string,
): Promise<StudentMessageView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.studentMessage.findFirst({
      where: { id: messageId, toUserId: userId },
      include: {
        fromUser: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        organization: { select: { id: true, slug: true, name: true } },
      },
    }),
  );

  if (!row) {
    return null;
  }

  return mapMessage({
    ...row,
    kind: row.kind as StudentMessageKind,
    status: row.status as StudentMessageStatus,
    fromMembershipRole: null,
  });
}

export function buildDefaultAdvisorActions(href?: string): StudentMessageAction[] {
  const actions: StudentMessageAction[] = [];
  if (href) {
    actions.push({ label: "Check it out", href, actionType: "link" });
  }
  actions.push({ label: "View Later", actionType: "view_later" });
  return actions;
}

export function buildInvoiceReceiptActions(
  organizationSlug: string,
): StudentMessageAction[] {
  return [
    {
      label: "Upload receipt",
      href: `/organizations/${organizationSlug}?tab=invoices`,
      actionType: "upload_receipt",
    },
    { label: "View Later", actionType: "view_later" },
  ];
}

export function buildCalendarActions(): StudentMessageAction[] {
  return [
    { label: "View Later", actionType: "view_later" },
    { label: "Add to calendar", actionType: "add_to_calendar" },
  ];
}
