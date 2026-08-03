import type { FormType } from "@/generated/prisma/client";
import type { CampusRole } from "@/config/roles";
import { CLUB_MEMBERSHIP_COMMITMENT_FORM_ID } from "@/config/club-commitment";

/** Canonical IDs for the 13 required Madonna digital agreements. */
export type DigitalAgreementId =
  | "parent-student-portal"
  | "acceptable-use"
  | "parent-media-release"
  | "student-profile-permission"
  | "club-participation"
  | "athletics-participation"
  | "service-hours"
  | "blue-don-rewards"
  | "messaging-consent"
  | "ai-assistant-disclosure"
  | "student-marketplace"
  | "event-registration"
  | "digital-signature-system";

export type AgreementFrequency =
  | "annual"
  | "per_school_year"
  | "per_event"
  | "per_club"
  | "per_team"
  | "one_time"
  | "as_needed"
  | "future";

export type AgreementSignerRole = "student" | "parent" | "admin" | "advisor";

export type ApprovalChainStep =
  | "student_sign"
  | "parent_approve"
  | "advisor_approve"
  | "admin_approve"
  | "auto_record";

/** Granular opt-in categories for Parent Media Release (#3). */
export const MEDIA_RELEASE_CATEGORIES = [
  { id: "website", label: "School website" },
  { id: "blue_don", label: "Blue Don Virtual Campus" },
  { id: "livestreams", label: "Livestreams" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "local_news", label: "Local news" },
  { id: "yearbook", label: "Yearbook" },
  { id: "printed", label: "Printed materials" },
  { id: "promotional", label: "Promotional / marketing" },
] as const;

export type MediaReleaseCategoryId =
  (typeof MEDIA_RELEASE_CATEGORIES)[number]["id"];

/** Parent-controlled fields for Student Profile Permission (#4). */
export const STUDENT_PROFILE_PERMISSIONS = [
  { id: "photo", label: "Photo" },
  { id: "name", label: "Name" },
  { id: "grade", label: "Grade" },
  { id: "class_of", label: "Class of" },
  { id: "awards", label: "Awards" },
  { id: "clubs", label: "Clubs" },
  { id: "athletics", label: "Athletics" },
  { id: "service", label: "Service hours" },
  { id: "honor_roll", label: "Honor roll" },
] as const;

export type StudentProfilePermissionId =
  (typeof STUDENT_PROFILE_PERMISSIONS)[number]["id"];

/** Messaging Consent (#9) channel options per message type. */
export const MESSAGING_CONSENT_CHANNELS = [
  { id: "email", label: "Email" },
  { id: "text", label: "Text / SMS" },
  { id: "push", label: "Push notification" },
  { id: "none", label: "None" },
] as const;

export type MessagingConsentChannelId =
  (typeof MESSAGING_CONSENT_CHANNELS)[number]["id"];

export const MESSAGING_CONSENT_TYPES = [
  { id: "announcements", label: "School announcements" },
  { id: "club", label: "Club messages" },
  { id: "teacher", label: "Teacher messages" },
  { id: "events", label: "Event reminders" },
  { id: "assignments", label: "Assignment notifications" },
] as const;

export type MessagingConsentTypeId =
  (typeof MESSAGING_CONSENT_TYPES)[number]["id"];

export type DigitalAgreementDefinition = {
  id: DigitalAgreementId;
  title: string;
  purpose: string;
  frequency: AgreementFrequency;
  signerRoles: AgreementSignerRole[];
  approvalChain: ApprovalChainStep[];
  /** Maps to existing `Form` row when seeded; null until form is created. */
  formId: string | null;
  /** Nearest `FormType` enum value for admin create/publish workflows. */
  formType: FormType;
  /** Campus roles that may view or complete this agreement. */
  visibleToRoles: CampusRole[];
  /** Whether parent must act on behalf of a linked student (future `ParentGuardian`). */
  requiresLinkedStudent: boolean;
  status: "implemented" | "partial" | "planned" | "future";
  notes?: string;
};

/**
 * Registry of Madonna High School required digital agreements.
 * See `docs/BLUE_DON_DIGITAL_FORMS_CENTER.md` for full UX and policy spec.
 */
export const DIGITAL_AGREEMENTS: DigitalAgreementDefinition[] = [
  {
    id: "parent-student-portal",
    title: "Parent & Student Portal Agreement",
    purpose:
      "Annual acknowledgment of Blue Don portal use, handbook policies, and family participation expectations.",
    frequency: "annual",
    signerRoles: ["student", "parent"],
    approvalChain: ["student_sign", "parent_approve", "auto_record"],
    formId: "form-parent-agreement",
    formType: "PARENT_AGREEMENT",
    visibleToRoles: ["student", "parent"],
    requiresLinkedStudent: true,
    status: "partial",
    notes:
      "Student Agreement (`form-student-agreement`) is a companion annual form; composite portal gate is planned.",
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Agreement",
    purpose:
      "Technology use standards extending Madonna handbook and diocesan AUP policies.",
    frequency: "annual",
    signerRoles: ["student", "parent"],
    approvalChain: ["student_sign", "parent_approve", "auto_record"],
    formId: "form-technology-agreement",
    formType: "TECHNOLOGY_AGREEMENT",
    visibleToRoles: ["student", "parent"],
    requiresLinkedStudent: true,
    status: "partial",
    notes: "Seeded as DRAFT; publish when handbook text is finalized.",
  },
  {
    id: "parent-media-release",
    title: "Parent Media Release",
    purpose:
      "Granular parent opt-in for student name, image, and work across school media channels.",
    frequency: "annual",
    signerRoles: ["parent"],
    approvalChain: ["parent_approve", "auto_record"],
    formId: "form-media-release",
    formType: "MEDIA_RELEASE",
    visibleToRoles: ["parent"],
    requiresLinkedStudent: true,
    status: "partial",
    notes:
      "Published but not yet granular; categories stored in `responseData` when UI ships.",
  },
  {
    id: "student-profile-permission",
    title: "Student Profile Permission",
    purpose:
      "Parent controls which profile fields are visible on Blue Don and to other campus users.",
    frequency: "annual",
    signerRoles: ["parent"],
    approvalChain: ["parent_approve", "auto_record"],
    formId: "form-profile-permission",
    formType: "CUSTOM",
    visibleToRoles: ["parent"],
    requiresLinkedStudent: true,
    status: "partial",
    notes:
      "Granular per-field toggles stored in `responseData.profilePermissions`; default private until submitted.",
  },
  {
    id: "club-participation",
    title: "Club Participation Agreement",
    purpose:
      "Student requests club membership; parent approves; advisor is notified and activates membership.",
    frequency: "per_club",
    signerRoles: ["student", "parent"],
    approvalChain: [
      "student_sign",
      "parent_approve",
      "advisor_approve",
      "auto_record",
    ],
    formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
    formType: "PARTICIPATION_COMMITMENT",
    visibleToRoles: ["student", "parent", "advisor"],
    requiresLinkedStudent: true,
    status: "partial",
    notes:
      "Student sign + advisor approve exists; parent approval step is the primary gap.",
  },
  {
    id: "athletics-participation",
    title: "Athletics Participation Agreement",
    purpose:
      "Team communications, schedule, travel, fundraising, and media permissions for athletics.",
    frequency: "per_team",
    signerRoles: ["student", "parent"],
    approvalChain: [
      "student_sign",
      "parent_approve",
      "advisor_approve",
      "auto_record",
    ],
    formId: null,
    formType: "PARTICIPATION_COMMITMENT",
    visibleToRoles: ["student", "parent", "coach", "advisor"],
    requiresLinkedStudent: true,
    status: "planned",
  },
  {
    id: "service-hours",
    title: "Service Hours Agreement",
    purpose:
      "Acknowledgment of service hour logging rules, verification, and portfolio use.",
    frequency: "annual",
    signerRoles: ["student", "parent"],
    approvalChain: ["student_sign", "parent_approve", "auto_record"],
    formId: null,
    formType: "CUSTOM",
    visibleToRoles: ["student", "parent"],
    requiresLinkedStudent: true,
    status: "planned",
  },
  {
    id: "blue-don-rewards",
    title: "Blue Don Rewards Agreement",
    purpose:
      "XP and rewards have no cash value; gamification is educational, not gambling or compensation.",
    frequency: "annual",
    signerRoles: ["student", "parent"],
    approvalChain: ["student_sign", "parent_approve", "auto_record"],
    formId: null,
    formType: "CUSTOM",
    visibleToRoles: ["student", "parent"],
    requiresLinkedStudent: true,
    status: "planned",
  },
  {
    id: "messaging-consent",
    title: "Messaging Consent",
    purpose:
      "Per-category consent for announcements, club, teacher, events, and assignments via email/text/push.",
    frequency: "annual",
    signerRoles: ["parent"],
    approvalChain: ["parent_approve", "auto_record"],
    formId: null,
    formType: "CUSTOM",
    visibleToRoles: ["parent"],
    requiresLinkedStudent: true,
    status: "planned",
  },
  {
    id: "ai-assistant-disclosure",
    title: "AI Assistant Disclosure",
    purpose:
      "Discloses AI use in Blue Don, data handling, and student/parent acknowledgment of limitations.",
    frequency: "annual",
    signerRoles: ["student", "parent"],
    approvalChain: ["student_sign", "parent_approve", "auto_record"],
    formId: "form-ai-disclosure",
    formType: "CUSTOM",
    visibleToRoles: ["student", "parent"],
    requiresLinkedStudent: true,
    status: "partial",
    notes:
      "Acknowledged before Blue Don AI use; recorded per signer with school-year scope.",
  },
  {
    id: "student-marketplace",
    title: "Student Marketplace Agreement",
    purpose:
      "Future consent for student-run marketplace listings; school moderation and no off-platform transactions.",
    frequency: "future",
    signerRoles: ["student", "parent"],
    approvalChain: [
      "student_sign",
      "parent_approve",
      "admin_approve",
      "auto_record",
    ],
    formId: null,
    formType: "CUSTOM",
    visibleToRoles: ["student", "parent"],
    requiresLinkedStudent: true,
    status: "future",
  },
  {
    id: "event-registration",
    title: "Event Registration",
    purpose:
      "Per-event registration with emergency contact, medical info, transportation, permission, signature, and QR check-in.",
    frequency: "per_event",
    signerRoles: ["student", "parent"],
    approvalChain: ["student_sign", "parent_approve", "auto_record"],
    formId: "form-event-registration",
    formType: "EVENT_REGISTRATION",
    visibleToRoles: ["student", "parent", "advisor"],
    requiresLinkedStudent: true,
    status: "partial",
    notes: "Seeded as DRAFT; rich fields and QR check-in not yet built.",
  },
  {
    id: "digital-signature-system",
    title: "Digital Signature System",
    purpose:
      "Cross-cutting audit standard: typed name, signer role, timestamp, IP, school year — permanent record.",
    frequency: "as_needed",
    signerRoles: ["student", "parent", "admin", "advisor"],
    approvalChain: ["auto_record"],
    formId: null,
    formType: "CUSTOM",
    visibleToRoles: [
      "admin",
      "advisor",
      "teacher",
      "student",
      "parent",
      "coach",
      "counselor",
    ],
    requiresLinkedStudent: false,
    status: "partial",
    notes:
      "Phase 5 implements checkbox + typed name; full audit fields are a schema extension.",
  },
];

const agreementById = new Map(
  DIGITAL_AGREEMENTS.map((agreement) => [agreement.id, agreement]),
);

export function getDigitalAgreement(
  id: DigitalAgreementId,
): DigitalAgreementDefinition | undefined {
  return agreementById.get(id);
}

export function getDigitalAgreementsForRole(
  role: CampusRole,
): DigitalAgreementDefinition[] {
  return DIGITAL_AGREEMENTS.filter((agreement) =>
    agreement.visibleToRoles.includes(role),
  );
}

export function getImplementedDigitalAgreements(): DigitalAgreementDefinition[] {
  return DIGITAL_AGREEMENTS.filter(
    (agreement) => agreement.status === "implemented" || agreement.status === "partial",
  );
}

/** Example: resolve registry entry from a seeded `Form.id`. */
export function getDigitalAgreementByFormId(
  formId: string,
): DigitalAgreementDefinition | undefined {
  return DIGITAL_AGREEMENTS.find((agreement) => agreement.formId === formId);
}
