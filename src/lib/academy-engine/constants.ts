import type {
  AcademyLevelTier,
  AssessmentType,
  CareerPathway,
  CertificationStatus,
  LearningStepType,
  MissionStatus,
  ModuleStatus,
  ProgressStatus,
} from "@/generated/prisma/client";

export const CAREER_PATHWAYS: {
  value: CareerPathway;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: "BROADCAST_MEDIA",
    label: "Broadcast & Media",
    description: "Live production, journalism, and media operations.",
    color: "#9B51E0",
  },
  {
    value: "IT",
    label: "IT",
    description: "Infrastructure, support, and enterprise technology.",
    color: "#2F80ED",
  },
  {
    value: "ROBOTICS_ENGINEERING",
    label: "Robotics & Engineering",
    description: "Mechanical systems, sensors, and automation.",
    color: "#27AE60",
  },
  {
    value: "SOFTWARE_DEVELOPMENT",
    label: "Software Development",
    description: "Application design, coding, and deployment.",
    color: "#00B4D8",
  },
  {
    value: "DIGITAL_MARKETING",
    label: "Digital Marketing",
    description: "Social campaigns, analytics, and brand growth.",
    color: "#F2994A",
  },
  {
    value: "GRAPHIC_DESIGN",
    label: "Graphic Design",
    description: "Visual identity, layout, and creative production.",
    color: "#EB5757",
  },
  {
    value: "BUSINESS_ENTREPRENEURSHIP",
    label: "Business & Entrepreneurship",
    description: "Leadership, finance, and venture building.",
    color: "#D4A017",
  },
];

export const ACADEMY_LEVEL_TIERS: AcademyLevelTier[] = [
  "EXPLORER",
  "FOUNDATION",
  "INTERMEDIATE",
  "ADVANCED",
  "PROFESSIONAL",
  "COLLEGIATE",
  "INDUSTRY_CAPSTONE",
];

export const LEVEL_TIER_LABELS: Record<AcademyLevelTier, string> = {
  EXPLORER: "Explorer",
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  PROFESSIONAL: "Professional",
  COLLEGIATE: "Collegiate",
  INDUSTRY_CAPSTONE: "Industry Capstone",
};

export const LEARNING_FLOW_STEPS: LearningStepType[] = [
  "LEARN",
  "WATCH",
  "GUIDED_LAB",
  "PRACTICE_LAB",
  "CHALLENGE_LAB",
  "TROUBLESHOOTING_LAB",
  "PRACTICAL_EXAM",
  "CERTIFICATION",
  "PORTFOLIO_PROJECT",
  "CAPSTONE_MISSION",
];

export const LEARNING_STEP_LABELS: Record<LearningStepType, string> = {
  LEARN: "Learn",
  WATCH: "Watch",
  GUIDED_LAB: "Guided Lab",
  PRACTICE_LAB: "Practice Lab",
  CHALLENGE_LAB: "Challenge Lab",
  TROUBLESHOOTING_LAB: "Troubleshooting Lab",
  PRACTICAL_EXAM: "Practical Exam",
  CERTIFICATION: "Certification",
  PORTFOLIO_PROJECT: "Portfolio Project",
  CAPSTONE_MISSION: "Capstone Mission",
};

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const CERTIFICATION_STATUS_LABELS: Record<CertificationStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  KNOWLEDGE_CHECK: "Knowledge Check",
  PRACTICAL_EXAM: "Practical Exam",
  QUIZ: "Quiz",
};

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  LOCKED: "Locked",
};

export function getPathwayLabel(pathway: CareerPathway): string {
  return CAREER_PATHWAYS.find((p) => p.value === pathway)?.label ?? pathway;
}
