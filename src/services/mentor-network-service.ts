import {
  MENTOR_SEEDS,
  type MentorSeed,
} from "@/config/mentor-network";
import { CLEAN_SLATE } from "@/config/app-mode";
import { isDatabaseConfigured } from "@/config/env";
import type {
  MentorCategory,
  MentorConnectionRequestStatus,
  MentorProfileStatus,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type MentorSummary = {
  id: string;
  name: string;
  category: MentorCategory;
  title: string;
  organization: string;
  bio: string;
  expertiseTags: string[];
  photoUrl: string | null;
};

export type MentorDetail = MentorSummary & {
  email: string;
};

export type PendingMentorProfile = {
  id: string;
  name: string;
  email: string;
  category: MentorCategory;
  title: string;
  organization: string;
  createdAt: Date;
};

export type PendingMentorConnection = {
  id: string;
  message: string;
  createdAt: Date;
  student: {
    id: string;
    displayName: string | null;
    email: string;
  };
  mentorProfile: {
    id: string;
    name: string;
    category: MentorCategory;
    organization: string;
  };
};

function seedToSummary(seed: MentorSeed): MentorSummary {
  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    title: seed.title,
    organization: seed.organization,
    bio: seed.bio,
    expertiseTags: seed.expertiseTags,
    photoUrl: seed.photoUrl ?? null,
  };
}

function seedToDetail(seed: MentorSeed): MentorDetail {
  return {
    ...seedToSummary(seed),
    email: seed.email,
  };
}

function mapMentorSummary(profile: {
  id: string;
  name: string;
  category: MentorCategory;
  title: string;
  organization: string;
  bio: string;
  expertiseTags: string[];
  photoUrl: string | null;
}): MentorSummary {
  return {
    id: profile.id,
    name: profile.name,
    category: profile.category,
    title: profile.title,
    organization: profile.organization,
    bio: profile.bio,
    expertiseTags: profile.expertiseTags,
    photoUrl: profile.photoUrl,
  };
}

function mapMentorDetail(profile: {
  id: string;
  name: string;
  email: string;
  category: MentorCategory;
  title: string;
  organization: string;
  bio: string;
  expertiseTags: string[];
  photoUrl: string | null;
}): MentorDetail {
  return {
    ...mapMentorSummary(profile),
    email: profile.email,
  };
}

function seedMentorFallback(): MentorSummary[] {
  // In clean slate mode, the mentor directory starts empty — real mentors are
  // added by the school over time. Never fall back to demo seed profiles.
  if (CLEAN_SLATE) {
    return [];
  }
  return MENTOR_SEEDS.filter((seed) => seed.status === "APPROVED").map(seedToSummary);
}

export async function listApprovedMentors(): Promise<MentorSummary[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return seedMentorFallback();
  }

  const mentors = await withDatabase((prisma) =>
    prisma.mentorProfile.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        category: true,
        title: true,
        organization: true,
        bio: true,
        expertiseTags: true,
        photoUrl: true,
      },
    }),
  );

  if (!mentors || mentors.length === 0) {
    return seedMentorFallback();
  }

  return mentors.map(mapMentorSummary);
}

export async function getMentorById(id: string): Promise<MentorDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    if (CLEAN_SLATE) {
      return null;
    }
    const seed = MENTOR_SEEDS.find((item) => item.id === id && item.status === "APPROVED");
    return seed ? seedToDetail(seed) : null;
  }

  const mentor = await withDatabase((prisma) =>
    prisma.mentorProfile.findFirst({
      where: { id, status: "APPROVED" },
      select: {
        id: true,
        name: true,
        email: true,
        category: true,
        title: true,
        organization: true,
        bio: true,
        expertiseTags: true,
        photoUrl: true,
      },
    }),
  );

  if (!mentor) {
    if (CLEAN_SLATE) {
      return null;
    }
    const seed = MENTOR_SEEDS.find((item) => item.id === id && item.status === "APPROVED");
    return seed ? seedToDetail(seed) : null;
  }

  return mapMentorDetail(mentor);
}

export async function getStudentConnectionStatus(
  studentId: string,
  mentorProfileId: string,
): Promise<MentorConnectionRequestStatus | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const request = await withDatabase((prisma) =>
    prisma.mentorConnectionRequest.findUnique({
      where: {
        studentId_mentorProfileId: { studentId, mentorProfileId },
      },
      select: { status: true },
    }),
  );

  return request?.status ?? null;
}

export async function listPendingMentorProfiles(): Promise<PendingMentorProfile[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const profiles = await withDatabase((prisma) =>
    prisma.mentorProfile.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        category: true,
        title: true,
        organization: true,
        createdAt: true,
      },
    }),
  );

  return profiles ?? [];
}

export async function listPendingMentorConnections(): Promise<PendingMentorConnection[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const requests = await withDatabase((prisma) =>
    prisma.mentorConnectionRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        student: {
          select: { id: true, displayName: true, email: true },
        },
        mentorProfile: {
          select: { id: true, name: true, category: true, organization: true },
        },
      },
    }),
  );

  return requests ?? [];
}

export type SubmitMentorApplicationInput = {
  name: string;
  email: string;
  category: MentorCategory;
  title: string;
  organization: string;
  bio: string;
  expertiseTags: string[];
  userId?: string;
};

export async function submitMentorApplication(
  input: SubmitMentorApplicationInput,
): Promise<{ id: string } | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const profile = await withDatabase((prisma) =>
    prisma.mentorProfile.create({
      data: {
        userId: input.userId ?? null,
        name: input.name,
        email: input.email,
        category: input.category,
        title: input.title,
        organization: input.organization,
        bio: input.bio,
        expertiseTags: input.expertiseTags,
        status: "PENDING",
      },
      select: { id: true },
    }),
  );

  return profile;
}

export type RequestMentorConnectionInput = {
  studentId: string;
  mentorProfileId: string;
  message: string;
};

export async function requestMentorConnection(
  input: RequestMentorConnectionInput,
): Promise<{ id: string; status: MentorConnectionRequestStatus } | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return withDatabase(async (prisma) => {
    const mentor = await prisma.mentorProfile.findFirst({
      where: { id: input.mentorProfileId, status: "APPROVED" },
      select: { id: true },
    });

    if (!mentor) {
      return null;
    }

    const existing = await prisma.mentorConnectionRequest.findUnique({
      where: {
        studentId_mentorProfileId: {
          studentId: input.studentId,
          mentorProfileId: input.mentorProfileId,
        },
      },
    });

    if (existing) {
      if (existing.status === "DECLINED") {
        return prisma.mentorConnectionRequest.update({
          where: { id: existing.id },
          data: { message: input.message, status: "PENDING", reviewedById: null },
          select: { id: true, status: true },
        });
      }

      return { id: existing.id, status: existing.status };
    }

    return prisma.mentorConnectionRequest.create({
      data: {
        studentId: input.studentId,
        mentorProfileId: input.mentorProfileId,
        message: input.message,
        status: "PENDING",
      },
      select: { id: true, status: true },
    });
  });
}

export async function updateMentorProfileStatus(
  profileId: string,
  status: MentorProfileStatus,
  approvedById?: string,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.mentorProfile.update({
      where: { id: profileId },
      data: {
        status,
        approvedById: status === "APPROVED" ? approvedById : null,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    }),
  );

  return result !== null;
}

export async function reviewMentorConnection(
  requestId: string,
  status: Extract<MentorConnectionRequestStatus, "APPROVED" | "DECLINED">,
  reviewedById: string,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.mentorConnectionRequest.update({
      where: { id: requestId },
      data: { status, reviewedById },
    }),
  );

  return result !== null;
}

export async function countPendingMentorItems(): Promise<{
  profiles: number;
  connections: number;
}> {
  const [profiles, connections] = await Promise.all([
    listPendingMentorProfiles(),
    listPendingMentorConnections(),
  ]);

  return {
    profiles: profiles.length,
    connections: connections.length,
  };
}
