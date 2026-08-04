import type {
  ClubDocumentType,
  ClubProjectStatus,
} from "@/generated/prisma/client";

export type ClubDocumentView = {
  id: string;
  organizationId: string;
  title: string;
  docType: ClubDocumentType;
  body: string | null;
  fileUrl: string | null;
  createdByName: string;
  updatedAt: Date;
};

export const CLUB_DOCUMENT_TYPE_LABELS: Record<ClubDocumentType, string> = {
  BYLAWS: "Bylaws",
  CONSTITUTION: "Constitution",
  OTHER: "Other",
};

export type ClubProjectView = {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  status: ClubProjectStatus;
  ownerUserId: string | null;
  ownerName: string | null;
  createdByName: string;
  updatedAt: Date;
};

export type ClubChecklistItemView = {
  id: string;
  title: string;
  done: boolean;
  doneByName: string | null;
  doneAt: Date | null;
  sortOrder: number;
};

export type ClubChecklistView = {
  id: string;
  organizationId: string;
  projectId: string | null;
  projectTitle: string | null;
  title: string;
  createdByName: string;
  items: ClubChecklistItemView[];
  updatedAt: Date;
};

export const CLUB_PROJECT_STATUS_LABELS: Record<ClubProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
};
