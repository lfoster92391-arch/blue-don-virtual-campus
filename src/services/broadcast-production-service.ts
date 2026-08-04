import {
  BROADCAST_ORG_SLUG,
} from "@/config/broadcast-media";
import {
  DEFAULT_BROADCAST_EQUIPMENT,
  type BroadcastBookingServiceKey,
  type BroadcastJoinTrackKey,
  type BroadcastProductionRoleKey,
  type CampusMediaCategoryKey,
} from "@/config/broadcast-production";
import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { listActiveClubMemberIds } from "@/lib/command-center-permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { canManageCampusMedia } from "@/services/media-service";
import {
  buildDefaultAdvisorActions,
  sendSystemStudentMessages,
} from "@/services/student-message-service";

export type BroadcastScheduleView = {
  id: string | null;
  organizationId: string | null;
  nextAirAt: Date | null;
  title: string | null;
  notes: string | null;
  updatedByName: string | null;
};

export type BroadcastBookingView = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string | null;
  clubOrTeam: string;
  eventName: string;
  eventAt: Date;
  location: string | null;
  services: BroadcastBookingServiceKey[];
  details: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  reviewNote: string | null;
  createdAt: Date;
};

export type BroadcastAnnouncementSubmissionView = {
  id: string;
  submitterId: string;
  submitterName: string;
  submitterRole: string | null;
  title: string;
  body: string;
  preferredAirDate: Date | null;
  status: "PENDING" | "APPROVED" | "DECLINED" | "AIRED";
  reviewNote: string | null;
  createdAt: Date;
};

export type BroadcastCrewCreditView = {
  id: string;
  userId: string;
  displayName: string;
  productionRole: BroadcastProductionRoleKey;
  sortOrder: number;
  isVisible: boolean;
};

export type BroadcastEquipmentView = {
  id: string;
  name: string;
  category: string | null;
  notes: string | null;
  isChecked: boolean;
  checkedByName: string | null;
  checkedAt: Date | null;
  sortOrder: number;
};

export type BroadcastJoinApplicationView = {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string | null;
  gradeOrYear: string | null;
  desiredTracks: BroadcastJoinTrackKey[];
  experience: string | null;
  availability: string | null;
  whyJoin: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  reviewNote: string | null;
  createdAt: Date;
};

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

export async function getBroadcastOrganization(): Promise<{
  id: string;
  name: string;
} | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }
  return withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { slug: BROADCAST_ORG_SLUG },
      select: { id: true, name: true },
    }),
  );
}

async function listBroadcastOfficerIds(
  organizationId: string,
): Promise<string[]> {
  const members = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        orgRole: { in: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"] },
      },
      select: { userId: true },
    }),
  );
  return (members ?? []).map((m) => m.userId);
}

export async function getBroadcastSchedule(): Promise<BroadcastScheduleView> {
  const empty: BroadcastScheduleView = {
    id: null,
    organizationId: null,
    nextAirAt: null,
    title: null,
    notes: null,
    updatedByName: null,
  };

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return empty;
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return empty;
  }

  const row = await withDatabase((prisma) =>
    prisma.broadcastSchedule.findUnique({
      where: { organizationId: org.id },
      include: {
        updatedBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  );

  if (!row) {
    return { ...empty, organizationId: org.id };
  }

  return {
    id: row.id,
    organizationId: row.organizationId,
    nextAirAt: row.nextAirAt,
    title: row.title,
    notes: row.notes,
    updatedByName: row.updatedBy ? displayName(row.updatedBy) : null,
  };
}

export async function setBroadcastSchedule(input: {
  actorId: string;
  role: CampusRole;
  nextAirAt: Date | null;
  title?: string | null;
  notes?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can set the next air time." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.broadcastSchedule.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        nextAirAt: input.nextAirAt,
        title: input.title?.trim() || null,
        notes: input.notes?.trim() || null,
        updatedById: input.actorId,
      },
      update: {
        nextAirAt: input.nextAirAt,
        title: input.title?.trim() || null,
        notes: input.notes?.trim() || null,
        updatedById: input.actorId,
      },
      select: { id: true },
    }),
  );

  if (!updated) {
    return { error: "Unable to save broadcast schedule." };
  }
  return { ok: true };
}

export async function createBroadcastBooking(input: {
  requesterId: string;
  requesterName: string;
  requesterEmail?: string | null;
  clubOrTeam: string;
  eventName: string;
  eventAt: Date;
  location?: string | null;
  services: BroadcastBookingServiceKey[];
  details?: string | null;
}): Promise<{ id: string } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Database unavailable." };
  }
  if (input.services.length === 0) {
    return { error: "Select at least one service." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const created = await withDatabase((prisma) =>
    prisma.broadcastBookingRequest.create({
      data: {
        organizationId: org.id,
        requesterId: input.requesterId,
        requesterName: input.requesterName.trim(),
        requesterEmail: input.requesterEmail?.trim() || null,
        clubOrTeam: input.clubOrTeam.trim(),
        eventName: input.eventName.trim(),
        eventAt: input.eventAt,
        location: input.location?.trim() || null,
        services: input.services,
        details: input.details?.trim() || null,
        status: "PENDING",
      },
      select: { id: true },
    }),
  );

  if (!created) {
    return { error: "Unable to submit booking request." };
  }

  const officers = await listBroadcastOfficerIds(org.id);
  const allMembers = await listActiveClubMemberIds(org.id);
  const recipients = [...new Set([...officers, ...allMembers])].filter(
    (id) => id !== input.requesterId,
  );

  if (recipients.length > 0) {
    await sendSystemStudentMessages({
      fromUserId: input.requesterId,
      toUserIds: recipients,
      organizationId: org.id,
      kind: "BROADCAST_BOOKING",
      title: `Coverage request: ${input.eventName.trim()}`,
      body: `${input.requesterName.trim()} (${input.clubOrTeam.trim()}) requested Broadcasting coverage.`,
      actions: buildDefaultAdvisorActions(
        "/organizations/broadcasting?tab=bookings",
      ),
    });
  }

  return { id: created.id };
}

export async function listBroadcastBookings(options?: {
  status?: BroadcastBookingView["status"];
}): Promise<BroadcastBookingView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }
  const org = await getBroadcastOrganization();
  if (!org) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.broadcastBookingRequest.findMany({
      where: {
        organizationId: org.id,
        ...(options?.status ? { status: options.status } : {}),
      },
      orderBy: [{ status: "asc" }, { eventAt: "asc" }],
      take: 100,
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    requesterId: row.requesterId,
    requesterName: row.requesterName,
    requesterEmail: row.requesterEmail,
    clubOrTeam: row.clubOrTeam,
    eventName: row.eventName,
    eventAt: row.eventAt,
    location: row.location,
    services: row.services as BroadcastBookingServiceKey[],
    details: row.details,
    status: row.status,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
  }));
}

export async function updateBroadcastBookingStatus(input: {
  bookingId: string;
  actorId: string;
  role: CampusRole;
  status: BroadcastBookingView["status"];
  reviewNote?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can update bookings." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.broadcastBookingRequest.updateMany({
      where: { id: input.bookingId, organizationId: org.id },
      data: {
        status: input.status,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote?.trim() || null,
      },
    }),
  );

  if (!updated || updated.count === 0) {
    return { error: "Booking not found." };
  }

  const booking = await withDatabase((prisma) =>
    prisma.broadcastBookingRequest.findUnique({
      where: { id: input.bookingId },
      select: { requesterId: true, eventName: true },
    }),
  );

  if (booking && booking.requesterId !== input.actorId) {
    await sendSystemStudentMessages({
      fromUserId: input.actorId,
      toUserIds: [booking.requesterId],
      organizationId: org.id,
      kind: "BROADCAST_BOOKING",
      title: `Coverage update: ${booking.eventName}`,
      body: `Your Broadcasting coverage request is now ${input.status.toLowerCase()}.`,
      actions: buildDefaultAdvisorActions(
        "/organizations/broadcasting?tab=book",
      ),
    });
  }

  return { ok: true };
}

export async function createAnnouncementSubmission(input: {
  submitterId: string;
  submitterName: string;
  submitterRole?: string | null;
  title: string;
  body: string;
  preferredAirDate?: Date | null;
}): Promise<{ id: string } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Database unavailable." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const created = await withDatabase((prisma) =>
    prisma.broadcastAnnouncementSubmission.create({
      data: {
        organizationId: org.id,
        submitterId: input.submitterId,
        submitterName: input.submitterName.trim(),
        submitterRole: input.submitterRole?.trim() || null,
        title: input.title.trim(),
        body: input.body.trim(),
        preferredAirDate: input.preferredAirDate ?? null,
        status: "PENDING",
      },
      select: { id: true },
    }),
  );

  if (!created) {
    return { error: "Unable to submit announcement." };
  }

  const officers = await listBroadcastOfficerIds(org.id);
  const recipients = officers.filter((id) => id !== input.submitterId);

  if (recipients.length > 0) {
    await sendSystemStudentMessages({
      fromUserId: input.submitterId,
      toUserIds: recipients,
      organizationId: org.id,
      kind: "BROADCAST_ANNOUNCEMENT_SUBMISSION",
      title: `Announcement submission: ${input.title.trim()}`,
      body: `${input.submitterName.trim()} submitted a morning-announcement request.`,
      actions: buildDefaultAdvisorActions(
        "/organizations/broadcasting?tab=submissions",
      ),
    });
  }

  return { id: created.id };
}

export async function listAnnouncementSubmissions(options?: {
  status?: BroadcastAnnouncementSubmissionView["status"];
}): Promise<BroadcastAnnouncementSubmissionView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }
  const org = await getBroadcastOrganization();
  if (!org) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.broadcastAnnouncementSubmission.findMany({
      where: {
        organizationId: org.id,
        ...(options?.status ? { status: options.status } : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    submitterId: row.submitterId,
    submitterName: row.submitterName,
    submitterRole: row.submitterRole,
    title: row.title,
    body: row.body,
    preferredAirDate: row.preferredAirDate,
    status: row.status,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
  }));
}

export async function updateAnnouncementSubmissionStatus(input: {
  submissionId: string;
  actorId: string;
  role: CampusRole;
  status: BroadcastAnnouncementSubmissionView["status"];
  reviewNote?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can review submissions." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.broadcastAnnouncementSubmission.updateMany({
      where: { id: input.submissionId, organizationId: org.id },
      data: {
        status: input.status,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote?.trim() || null,
      },
    }),
  );

  if (!updated || updated.count === 0) {
    return { error: "Submission not found." };
  }

  const submission = await withDatabase((prisma) =>
    prisma.broadcastAnnouncementSubmission.findUnique({
      where: { id: input.submissionId },
      select: { submitterId: true, title: true, body: true },
    }),
  );

  if (submission && input.status === "APPROVED") {
    const today = new Date();
    const dateOnly = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    await withDatabase((prisma) =>
      prisma.broadcastAnnouncement.upsert({
        where: { announcementDate: dateOnly },
        create: {
          announcementDate: dateOnly,
          title: submission.title,
          body: submission.body,
          authorId: input.actorId,
        },
        update: {
          title: submission.title,
          body: submission.body,
          authorId: input.actorId,
        },
      }),
    );
  }

  if (submission && submission.submitterId !== input.actorId) {
    await sendSystemStudentMessages({
      fromUserId: input.actorId,
      toUserIds: [submission.submitterId],
      organizationId: org.id,
      kind: "BROADCAST_ANNOUNCEMENT_SUBMISSION",
      title: `Announcement ${input.status.toLowerCase()}: ${submission.title}`,
      body: `Your morning-announcement submission was ${input.status.toLowerCase()}.`,
      actions: buildDefaultAdvisorActions(
        "/organizations/broadcasting?tab=announce",
      ),
    });
  }

  return { ok: true };
}

export async function listCrewCredits(options?: {
  visibleOnly?: boolean;
}): Promise<BroadcastCrewCreditView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }
  const org = await getBroadcastOrganization();
  if (!org) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.broadcastCrewCredit.findMany({
      where: {
        organizationId: org.id,
        ...(options?.visibleOnly ? { isVisible: true } : {}),
      },
      orderBy: [{ productionRole: "asc" }, { sortOrder: "asc" }, { displayName: "asc" }],
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    userId: row.userId,
    displayName: row.displayName,
    productionRole: row.productionRole as BroadcastProductionRoleKey,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
  }));
}

export async function upsertCrewCredit(input: {
  actorId: string;
  role: CampusRole;
  userId: string;
  displayName: string;
  productionRole: BroadcastProductionRoleKey;
  sortOrder?: number;
  isVisible?: boolean;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage the credit roll." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const saved = await withDatabase((prisma) =>
    prisma.broadcastCrewCredit.upsert({
      where: {
        organizationId_userId_productionRole: {
          organizationId: org.id,
          userId: input.userId,
          productionRole: input.productionRole,
        },
      },
      create: {
        organizationId: org.id,
        userId: input.userId,
        displayName: input.displayName.trim(),
        productionRole: input.productionRole,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      update: {
        displayName: input.displayName.trim(),
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      select: { id: true },
    }),
  );

  if (!saved) {
    return { error: "Unable to save credit." };
  }
  return { ok: true };
}

export async function removeCrewCredit(input: {
  creditId: string;
  actorId: string;
  role: CampusRole;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage the credit roll." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  await withDatabase((prisma) =>
    prisma.broadcastCrewCredit.deleteMany({
      where: { id: input.creditId, organizationId: org.id },
    }),
  );

  return { ok: true };
}

export async function listBroadcastEquipment(): Promise<BroadcastEquipmentView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }
  const org = await getBroadcastOrganization();
  if (!org) {
    return [];
  }

  let rows = await withDatabase((prisma) =>
    prisma.broadcastEquipmentItem.findMany({
      where: { organizationId: org.id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        checkedBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  );

  if (!rows || rows.length === 0) {
    await withDatabase((prisma) =>
      prisma.broadcastEquipmentItem.createMany({
        data: DEFAULT_BROADCAST_EQUIPMENT.map((item) => ({
          organizationId: org.id,
          name: item.name,
          category: item.category,
          sortOrder: item.sortOrder,
        })),
      }),
    );
    rows = await withDatabase((prisma) =>
      prisma.broadcastEquipmentItem.findMany({
        where: { organizationId: org.id },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          checkedBy: {
            select: { displayName: true, firstName: true, lastName: true },
          },
        },
      }),
    );
  }

  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    notes: row.notes,
    isChecked: row.isChecked,
    checkedByName: row.checkedBy ? displayName(row.checkedBy) : null,
    checkedAt: row.checkedAt,
    sortOrder: row.sortOrder,
  }));
}

export async function toggleBroadcastEquipment(input: {
  itemId: string;
  actorId: string;
  role: CampusRole;
  isChecked: boolean;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can update the equipment checklist." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.broadcastEquipmentItem.updateMany({
      where: { id: input.itemId, organizationId: org.id },
      data: {
        isChecked: input.isChecked,
        checkedById: input.isChecked ? input.actorId : null,
        checkedAt: input.isChecked ? new Date() : null,
      },
    }),
  );

  if (!updated || updated.count === 0) {
    return { error: "Equipment item not found." };
  }
  return { ok: true };
}

export async function addBroadcastEquipmentItem(input: {
  actorId: string;
  role: CampusRole;
  name: string;
  category?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can edit equipment." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  await withDatabase((prisma) =>
    prisma.broadcastEquipmentItem.create({
      data: {
        organizationId: org.id,
        name: input.name.trim(),
        category: input.category?.trim() || null,
        sortOrder: 100,
      },
    }),
  );

  return { ok: true };
}

export async function createJoinApplication(input: {
  applicantId: string;
  applicantName: string;
  applicantEmail?: string | null;
  gradeOrYear?: string | null;
  desiredTracks: BroadcastJoinTrackKey[];
  experience?: string | null;
  availability?: string | null;
  whyJoin: string;
}): Promise<{ id: string } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Database unavailable." };
  }
  if (input.desiredTracks.length === 0) {
    return { error: "Select at least one production track." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const existing = await withDatabase((prisma) =>
    prisma.broadcastJoinApplication.findFirst({
      where: {
        organizationId: org.id,
        applicantId: input.applicantId,
        status: "PENDING",
      },
      select: { id: true },
    }),
  );
  if (existing) {
    return { error: "You already have a pending application." };
  }

  const created = await withDatabase((prisma) =>
    prisma.broadcastJoinApplication.create({
      data: {
        organizationId: org.id,
        applicantId: input.applicantId,
        applicantName: input.applicantName.trim(),
        applicantEmail: input.applicantEmail?.trim() || null,
        gradeOrYear: input.gradeOrYear?.trim() || null,
        desiredTracks: input.desiredTracks,
        experience: input.experience?.trim() || null,
        availability: input.availability?.trim() || null,
        whyJoin: input.whyJoin.trim(),
        status: "PENDING",
      },
      select: { id: true },
    }),
  );

  if (!created) {
    return { error: "Unable to submit application." };
  }

  const officers = await listBroadcastOfficerIds(org.id);
  const recipients = officers.filter((id) => id !== input.applicantId);

  if (recipients.length > 0) {
    await sendSystemStudentMessages({
      fromUserId: input.applicantId,
      toUserIds: recipients,
      organizationId: org.id,
      kind: "BROADCAST_JOIN_APPLICATION",
      title: `Join application: ${input.applicantName.trim()}`,
      body: "A student applied to join Broadcasting. Review their tracks and experience.",
      actions: buildDefaultAdvisorActions(
        "/organizations/broadcasting?tab=applications",
      ),
    });
  }

  return { id: created.id };
}

export async function listJoinApplications(options?: {
  status?: BroadcastJoinApplicationView["status"];
}): Promise<BroadcastJoinApplicationView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }
  const org = await getBroadcastOrganization();
  if (!org) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.broadcastJoinApplication.findMany({
      where: {
        organizationId: org.id,
        ...(options?.status ? { status: options.status } : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    applicantId: row.applicantId,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    gradeOrYear: row.gradeOrYear,
    desiredTracks: row.desiredTracks as BroadcastJoinTrackKey[],
    experience: row.experience,
    availability: row.availability,
    whyJoin: row.whyJoin,
    status: row.status,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
  }));
}

export async function updateJoinApplicationStatus(input: {
  applicationId: string;
  actorId: string;
  role: CampusRole;
  status: "ACCEPTED" | "DECLINED";
  reviewNote?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting officers/crew can review applications." };
  }

  const org = await getBroadcastOrganization();
  if (!org) {
    return { error: "Broadcasting organization not found." };
  }

  const application = await withDatabase((prisma) =>
    prisma.broadcastJoinApplication.findFirst({
      where: { id: input.applicationId, organizationId: org.id },
    }),
  );

  if (!application) {
    return { error: "Application not found." };
  }

  await withDatabase((prisma) =>
    prisma.broadcastJoinApplication.update({
      where: { id: input.applicationId },
      data: {
        status: input.status,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote?.trim() || null,
      },
    }),
  );

  if (input.status === "ACCEPTED") {
    const existing = await withDatabase((prisma) =>
      prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: application.applicantId,
          },
        },
      }),
    );

    if (existing) {
      await withDatabase((prisma) =>
        prisma.organizationMembership.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            joinedAt: existing.joinedAt ?? new Date(),
          },
        }),
      );
    } else {
      await withDatabase((prisma) =>
        prisma.organizationMembership.create({
          data: {
            organizationId: org.id,
            userId: application.applicantId,
            orgRole: "MEMBER",
            status: "ACTIVE",
            joinedAt: new Date(),
          },
        }),
      );
    }

    const primaryTrack = application.desiredTracks[0];
    if (primaryTrack && primaryTrack !== "FLEXIBLE") {
      const roleMap: Record<string, BroadcastProductionRoleKey> = {
        HOST: "HOST",
        CAMERA: "CAMERA",
        EDITOR: "EDITOR",
        GRAPHICS: "GRAPHICS",
        AUDIO: "AUDIO",
        PRODUCER: "PRODUCER",
        WRITER: "WRITER",
      };
      const productionRole = roleMap[primaryTrack];
      if (productionRole) {
        await upsertCrewCredit({
          actorId: input.actorId,
          role: input.role,
          userId: application.applicantId,
          displayName: application.applicantName,
          productionRole,
        });
      }
    }
  }

  if (application.applicantId !== input.actorId) {
    await sendSystemStudentMessages({
      fromUserId: input.actorId,
      toUserIds: [application.applicantId],
      organizationId: org.id,
      kind: "BROADCAST_JOIN_APPLICATION",
      title:
        input.status === "ACCEPTED"
          ? "Welcome to Broadcasting"
          : "Broadcasting application update",
      body:
        input.status === "ACCEPTED"
          ? "Your application was accepted. Open the club page for Daily Rundown and Control Room."
          : "Your Broadcasting application was declined. You can reapply later.",
      actions: buildDefaultAdvisorActions("/organizations/broadcasting"),
    });
  }

  return { ok: true };
}

export async function updateMediaCategory(input: {
  mediaId: string;
  actorId: string;
  role: CampusRole;
  category: CampusMediaCategoryKey | null;
  isHighlightReel?: boolean;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can categorize media." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.campusMediaItem.update({
      where: { id: input.mediaId },
      data: {
        category: input.category,
        isHighlightReel:
          input.isHighlightReel ?? input.category === "HIGHLIGHT_REEL",
      },
      select: { id: true },
    }),
  );

  if (!updated) {
    return { error: "Media item not found." };
  }
  return { ok: true };
}
