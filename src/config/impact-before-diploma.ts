/**
 * Impact Before Diploma — senior capstone project requirement.
 */

export type ImpactProjectStatus =
  | "PROPOSAL"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "REJECTED";

export type ImpactProjectExample = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export const IMPACT_BEFORE_DIPLOMA_TAGLINE =
  "Every senior completes one meaningful project before graduating.";

export const IMPACT_PROJECT_STATUS_LABELS: Record<ImpactProjectStatus, string> = {
  PROPOSAL: "Proposal submitted",
  APPROVED: "Approved",
  IN_PROGRESS: "In progress",
  COMPLETE: "Complete",
  REJECTED: "Needs revision",
};

export const IMPACT_PROJECT_STATUS_ORDER: ImpactProjectStatus[] = [
  "PROPOSAL",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETE",
];

export const IMPACT_PROJECT_EXAMPLES: ImpactProjectExample[] = [
  {
    id: "ex-nonprofit-website",
    title: "Nonprofit Website Build",
    description:
      "Design and launch a website for a local charity — content, branding, and hosting included.",
    category: "Technology",
  },
  {
    id: "ex-creek-cleanup",
    title: "Community Creek Cleanup",
    description:
      "Organize a watershed cleanup with environmental science documentation and volunteer coordination.",
    category: "Environment",
  },
  {
    id: "ex-mentor-program",
    title: "Peer Mentorship Program",
    description:
      "Launch a structured mentoring initiative pairing upperclassmen with underclass students.",
    category: "Leadership",
  },
  {
    id: "ex-documentary",
    title: "Service Documentary",
    description:
      "Produce a short documentary highlighting a local nonprofit's mission and impact.",
    category: "Media",
  },
  {
    id: "ex-sensory-garden",
    title: "Sensory Garden Installation",
    description:
      "Plan, fund, and build an accessible sensory garden for a partner school or care facility.",
    category: "Service",
  },
  {
    id: "ex-chromebook-drive",
    title: "Device Repair Drive",
    description:
      "Lead a campus-wide Chromebook repair event benefiting students without reliable technology.",
    category: "Technology",
  },
];

export const IMPACT_PROJECT_MILESTONE_TEMPLATES = [
  { id: "proposal", label: "Proposal submitted", status: "PROPOSAL" as const },
  { id: "approval", label: "Advisor approval", status: "APPROVED" as const },
  { id: "kickoff", label: "Project kickoff", status: "IN_PROGRESS" as const },
  { id: "midpoint", label: "Midpoint check-in", status: "IN_PROGRESS" as const },
  { id: "completion", label: "Project complete", status: "COMPLETE" as const },
];
