import { isDatabaseConfigured } from "@/config/env";
import type {
  AssignmentStatus,
  EventStatus,
  ParticipantRole,
} from "@/generated/prisma/client";
import { isPrismaReady, prisma, withDatabase } from "@/lib/prisma";

export type EventListItem = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string | null;
  status: EventStatus;
  impactPoints: number;
  archiveFlag: boolean;
  academy: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
  participantCount: number;
  assignmentCount: number;
  isParticipating: boolean;
};

export type EventDetail = EventListItem & {
  description: string | null;
  budgetId: string | null;
  createdBy: {
    id: string;
    displayName: string;
    email: string;
  };
  participants: {
    id: string;
    userId: string;
    displayName: string;
    role: ParticipantRole;
    attendance: string;
  }[];
  assignments: {
    id: string;
    title: string;
    dueDate: Date;
    status: AssignmentStatus;
    points: number;
    completion: number | null;
  }[];
};

export type CreateEventInput = {
  title: string;
  academyId: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  description?: string;
  impactPoints?: number;
  status?: EventStatus;
  createdById: string;
};

export type CreateAssignmentInput = {
  title: string;
  description?: string;
  dueDate: Date;
  eventId: string;
  academyId: string;
  userId?: string;
  points?: number;
};

function mapEventListItem(
  event: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    location: string | null;
    status: EventStatus;
    impactPoints: number;
    archiveFlag: boolean;
    academy: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
    };
    _count: {
      participants: number;
      assignments: number;
    };
    participants: { userId: string }[];
  },
  userId?: string,
): EventListItem {
  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    status: event.status,
    impactPoints: event.impactPoints,
    archiveFlag: event.archiveFlag,
    academy: event.academy,
    participantCount: event._count.participants,
    assignmentCount: event._count.assignments,
    isParticipating: userId
      ? event.participants.some((participant) => participant.userId === userId)
      : false,
  };
}

export async function listAcademies() {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const academies = await withDatabase((prisma) =>
    prisma.academy.findMany({
      orderBy: { name: "asc" },
    }),
  );

  return academies ?? [];
}

export async function listEvents(options?: {
  userId?: string;
  includeArchived?: boolean;
  academyId?: string;
  upcomingOnly?: boolean;
  limit?: number;
}): Promise<EventListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const now = new Date();

  const events = await withDatabase((prisma) =>
    prisma.event.findMany({
      where: {
        archiveFlag: options?.includeArchived ? undefined : false,
        academyId: options?.academyId,
        endDate: options?.upcomingOnly ? { gte: now } : undefined,
      },
      include: {
        academy: true,
        participants: options?.userId
          ? { where: { userId: options.userId }, select: { userId: true } }
          : { select: { userId: true } },
        _count: {
          select: {
            participants: true,
            assignments: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
      take: options?.limit,
    }),
  );

  if (!events) {
    return [];
  }

  return events.map((event) => mapEventListItem(event, options?.userId));
}

export async function listEventsForDay(
  userId: string,
  date: Date = new Date(),
): Promise<EventListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const events = await withDatabase((prisma) =>
    prisma.event.findMany({
      where: {
        archiveFlag: false,
        startDate: { lte: dayEnd },
        endDate: { gte: dayStart },
      },
      include: {
        academy: true,
        participants: { where: { userId }, select: { userId: true } },
        _count: {
          select: {
            participants: true,
            assignments: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    }),
  );

  if (!events) {
    return [];
  }

  return events.map((event) => mapEventListItem(event, userId));
}

export async function getEventById(
  eventId: string,
  userId?: string,
): Promise<EventDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      academy: true,
      createdBy: {
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      assignments: {
        orderBy: { dueDate: "asc" },
      },
      _count: {
        select: {
          participants: true,
          assignments: true,
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  const base = mapEventListItem(
    {
      ...event,
      participants: userId
        ? event.participants.filter((participant) => participant.userId === userId)
        : event.participants.map((participant) => ({ userId: participant.userId })),
    },
    userId,
  );

  return {
    ...base,
    description: event.description,
    budgetId: event.budgetId,
    createdBy: {
      id: event.createdBy.id,
      email: event.createdBy.email,
      displayName:
        event.createdBy.displayName ??
        [event.createdBy.firstName, event.createdBy.lastName]
          .filter(Boolean)
          .join(" ") ??
        event.createdBy.email,
    },
    participants: event.participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      displayName:
        participant.user.displayName ??
        [participant.user.firstName, participant.user.lastName]
          .filter(Boolean)
          .join(" ") ??
        participant.user.email,
      role: participant.role,
      attendance: participant.attendance,
    })),
    assignments: event.assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate,
      status: assignment.status,
      points: assignment.points,
      completion: assignment.completion,
    })),
  };
}

export async function createEvent(input: CreateEventInput) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return prisma.event.create({
    data: {
      title: input.title,
      academyId: input.academyId,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      description: input.description,
      impactPoints: input.impactPoints ?? 0,
      status: input.status ?? "SCHEDULED",
      createdById: input.createdById,
    },
    include: {
      academy: true,
    },
  });
}

export async function joinEvent(eventId: string, userId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, archiveFlag: true, endDate: true },
  });

  if (!event || event.archiveFlag) {
    return null;
  }

  const participant = await prisma.eventParticipant.upsert({
    where: {
      eventId_userId: { eventId, userId },
    },
    update: {
      attendance: "REGISTERED",
    },
    create: {
      eventId,
      userId,
      role: "ATTENDEE",
      attendance: "REGISTERED",
    },
  });

  const remindAt = new Date(event.endDate);
  remindAt.setDate(remindAt.getDate() - 1);

  if (remindAt > new Date()) {
    const existingReminder = await prisma.eventReminder.findFirst({
      where: { eventId, userId },
    });

    if (existingReminder) {
      await prisma.eventReminder.update({
        where: { id: existingReminder.id },
        data: { remindAt, sent: false },
      });
    } else {
      await prisma.eventReminder.create({
        data: { eventId, userId, remindAt },
      });
    }
  }

  return participant;
}

export async function leaveEvent(eventId: string, userId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  await prisma.eventParticipant.deleteMany({
    where: { eventId, userId },
  });

  await prisma.eventReminder.deleteMany({
    where: { eventId, userId },
  });

  return true;
}

export async function createEventAssignment(input: CreateAssignmentInput) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return prisma.assignment.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      eventId: input.eventId,
      academyId: input.academyId,
      userId: input.userId,
      points: input.points ?? 0,
      status: "PENDING",
    },
  });
}

export async function getCalendarEntries(options?: {
  userId?: string;
  rangeStart?: Date;
  rangeEnd?: Date;
  academyId?: string;
}) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rangeStart = options?.rangeStart ?? new Date();
  const rangeEnd =
    options?.rangeEnd ??
    new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0, 23, 59, 59, 999);

  const result = await withDatabase((prisma) =>
    Promise.all([
      prisma.event.findMany({
        where: {
          archiveFlag: false,
          academyId: options?.academyId,
          startDate: { lte: rangeEnd },
          endDate: { gte: rangeStart },
        },
        include: { academy: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.assignment.findMany({
        where: {
          academyId: options?.academyId,
          dueDate: { gte: rangeStart, lte: rangeEnd },
          OR: options?.userId
            ? [{ userId: options.userId }, { userId: null }]
            : undefined,
        },
        include: { academy: true },
        orderBy: { dueDate: "asc" },
      }),
    ]),
  );

  if (!result) {
    return [];
  }

  const [events, assignments] = result;

  const eventEntries = events.map((event) => ({
    id: `event-${event.id}`,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    location: event.location,
    academyId: event.academyId,
    academyName: event.academy.name,
    academyColor: event.academy.color,
    type: "event" as const,
    eventId: event.id,
  }));

  const assignmentEntries = assignments.map((assignment) => ({
    id: `assignment-${assignment.id}`,
    title: assignment.title,
    start: assignment.dueDate,
    end: assignment.dueDate,
    location: null,
    academyId: assignment.academyId ?? "campus",
    academyName: assignment.academy?.name ?? "Campus",
    academyColor: assignment.academy?.color ?? "#0A2342",
    type: "assignment" as const,
    assignmentId: assignment.id,
    eventId: assignment.eventId ?? undefined,
  }));

  return [...eventEntries, ...assignmentEntries].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
}
