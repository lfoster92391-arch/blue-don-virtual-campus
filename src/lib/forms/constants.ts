import type { ApprovalType, FormStatus, FormType } from "@/generated/prisma/client";

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  ENROLLMENT_PACKET: "Enrollment Packet",
  STUDENT_AGREEMENT: "Student Agreement",
  PARENT_AGREEMENT: "Parent Agreement",
  PARTICIPATION_COMMITMENT: "Participation Commitment",
  MEDIA_RELEASE: "Media Release",
  TECHNOLOGY_AGREEMENT: "Technology Agreement",
  EVENT_REGISTRATION: "Event Registration",
  VOLUNTEER_FORM: "Volunteer Form",
  SPONSOR_PACKET: "Sponsor Packet",
  PURCHASE_REQUEST: "Purchase Request",
  TRAVEL_APPROVAL: "Travel Approval",
  RISK_ACKNOWLEDGEMENT: "Risk Acknowledgement",
  EQUIPMENT_CHECKOUT: "Equipment Checkout",
  CUSTOM: "Custom Form",
};

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  COMPLETE: "Complete",
  ARCHIVED: "Archived",
};

export const APPROVAL_TYPE_LABELS: Record<ApprovalType, string> = {
  JOIN_ACADEMY: "Join Academy",
  PURCHASE: "Purchase",
  SPONSOR: "Sponsor",
  EVENT: "Event",
  TRAVEL: "Travel",
  IMPACT_FUND: "Impact Fund",
  CAPSTONE: "Capstone",
  PUBLISHING: "Publishing",
};

export const PARENT_FORM_TYPES: FormType[] = [
  "PARENT_AGREEMENT",
  "MEDIA_RELEASE",
  "PARTICIPATION_COMMITMENT",
  "ENROLLMENT_PACKET",
];

export const STUDENT_EXCLUDED_FORM_TYPES: FormType[] = [
  "PARENT_AGREEMENT",
  "SPONSOR_PACKET",
];

export const FORM_WORKFLOW: FormStatus[] = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "COMPLETE",
  "ARCHIVED",
];
