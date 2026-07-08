import type {
  ImpactFundProposalStatus,
  ImpactFundVoteChoice,
  LabDifficulty,
  LabSessionStatus,
  LabStatus,
  PortfolioItemType,
  SimulatorCategory,
  SimulatorStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/generated/prisma/client";

export const PORTFOLIO_TYPE_LABELS: Record<PortfolioItemType, string> = {
  PROJECT: "Project",
  CERTIFICATION: "Certification",
  SERVICE: "Service",
  LEADERSHIP: "Leadership",
  ACHIEVEMENT: "Achievement",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  TECHNICAL: "Technical",
  ACADEMIC: "Academic",
  FACILITIES: "Facilities",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const MEMBERSHIP_STATUS_LABELS = {
  PENDING: "Pending approval",
  ACTIVE: "Active member",
  INACTIVE: "Inactive",
  REJECTED: "Rejected",
} as const;

export const LAB_STATUS_LABELS: Record<LabStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const LAB_DIFFICULTY_LABELS: Record<LabDifficulty, string> = {
  INTRODUCTORY: "Introductory",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const LAB_SESSION_STATUS_LABELS: Record<LabSessionStatus, string> = {
  REGISTERED: "Registered",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const SIMULATOR_STATUS_LABELS: Record<SimulatorStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const SIMULATOR_CATEGORY_LABELS: Record<SimulatorCategory, string> = {
  STEM: "STEM",
  BUSINESS: "Business",
  MEDIA: "Media",
  SERVICE: "Service",
  GENERAL: "General",
};

export const IMPACT_FUND_STATUS_LABELS: Record<ImpactFundProposalStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  VOTING: "Open for voting",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FUNDED: "Funded",
  ARCHIVED: "Archived",
};

export const IMPACT_FUND_VOTE_LABELS: Record<ImpactFundVoteChoice, string> = {
  FOR: "For",
  AGAINST: "Against",
  ABSTAIN: "Abstain",
};

export const IMPACT_FUND_BALANCE_CENTS = 250000;
