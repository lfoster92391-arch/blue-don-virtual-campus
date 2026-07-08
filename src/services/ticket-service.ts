import { isDatabaseConfigured } from "@/config/env";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type TicketListItem = {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  requesterName: string;
};

export type TicketDetail = TicketListItem & {
  description: string;
  assignedToName: string | null;
  comments: {
    id: string;
    body: string;
    authorName: string;
    createdAt: Date;
  }[];
};

export async function listTicketsForUser(
  userId: string,
  options?: { includeAll?: boolean },
): Promise<TicketListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const tickets = await withDatabase((prisma) =>
    prisma.ticket.findMany({
      where: options?.includeAll ? undefined : { userId },
      include: {
        user: { select: { displayName: true, firstName: true, lastName: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  );

  if (!tickets) {
    return [];
  }

  return tickets.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    commentCount: ticket._count.comments,
    requesterName: formatDisplayName(ticket.user),
  }));
}

export async function getTicketById(
  id: string,
  userId: string,
  canManage: boolean,
): Promise<TicketDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const ticket = await withDatabase((prisma) =>
    prisma.ticket.findFirst({
      where: canManage ? { id } : { id, userId },
      include: {
        user: { select: { displayName: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { displayName: true, firstName: true, lastName: true, email: true } },
        comments: {
          include: {
            user: { select: { displayName: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { comments: true } },
      },
    }),
  );

  if (!ticket) {
    return null;
  }

  return {
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    commentCount: ticket._count.comments,
    requesterName: formatDisplayName(ticket.user),
    assignedToName: ticket.assignedTo ? formatDisplayName(ticket.assignedTo) : null,
    comments: ticket.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      authorName: formatDisplayName(comment.user),
      createdAt: comment.createdAt,
    })),
  };
}

export async function createTicket(input: {
  userId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const ticket = await withDatabase((prisma) =>
    prisma.ticket.create({
      data: {
        userId: input.userId,
        subject: input.subject,
        description: input.description,
        category: input.category,
        priority: input.priority ?? "MEDIUM",
      },
      select: { id: true },
    }),
  );

  return ticket?.id ?? null;
}

export async function addTicketComment(input: {
  ticketId: string;
  userId: string;
  body: string;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase(async (prisma) => {
    await prisma.ticketComment.create({
      data: {
        ticketId: input.ticketId,
        userId: input.userId,
        body: input.body,
      },
    });
    await prisma.ticket.update({
      where: { id: input.ticketId },
      data: { updatedAt: new Date() },
    });
    return true;
  });

  return result === true;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    }),
  );

  return result !== null;
}

export async function countOpenTickets(userId: string): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const count = await withDatabase((prisma) =>
    prisma.ticket.count({
      where: {
        userId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
  );

  return count ?? 0;
}

function formatDisplayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  if (user.displayName) {
    return user.displayName;
  }
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.email;
}
