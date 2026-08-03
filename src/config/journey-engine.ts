/**
 * W4/W11/W15 · Journey Engine — timeline, milestones, year in review, graduation.
 */

export type JourneyMilestoneType =
  | "academy"
  | "event"
  | "service"
  | "leadership"
  | "achievement"
  | "graduation";

export const MILESTONE_TYPE_LABELS: Record<JourneyMilestoneType, string> = {
  academy: "Academy",
  event: "Event",
  service: "Service",
  leadership: "Leadership",
  achievement: "Achievement",
  graduation: "Graduation",
};

export type JourneyMilestone = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  type: JourneyMilestoneType;
  xpEarned?: number;
};

export type YearInReviewStat = {
  label: string;
  value: string;
  icon: string;
};

export type TimeCapsuleEntry = {
  id: string;
  prompt: string;
  response: string;
  gradeLabel: string;
};

export type GraduationMilestone = {
  id: string;
  label: string;
  completed: boolean;
  dueLabel?: string;
};

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: "ms-join-it",
    title: "Joined IT Club",
    description: "Became an active member of the campus technology organization.",
    dateLabel: "Sep 2024",
    type: "leadership",
    xpEarned: 50,
  },
  {
    id: "ms-cyber-cert",
    title: "Cybersecurity Foundations",
    description: "Completed the introductory certification in the STEM Academy.",
    dateLabel: "Nov 2024",
    type: "academy",
    xpEarned: 200,
  },
  {
    id: "ms-service-25",
    title: "25 Service Hours",
    description: "Logged 25 verified volunteer hours through the Service Center.",
    dateLabel: "Jan 2025",
    type: "service",
    xpEarned: 100,
  },
  {
    id: "ms-robotics",
    title: "Robotics Showcase Presenter",
    description: "Led a demo station at the annual STEM showcase event.",
    dateLabel: "Mar 2025",
    type: "event",
    xpEarned: 75,
  },
  {
    id: "ms-honor",
    title: "Honor Roll — Q3",
    description: "Achieved honor roll recognition for third quarter.",
    dateLabel: "Apr 2025",
    type: "achievement",
    xpEarned: 150,
  },
];

export const YEAR_IN_REVIEW_STATS: YearInReviewStat[] = [
  { label: "Events attended", value: "18", icon: "📅" },
  { label: "Service hours", value: "42", icon: "❤️" },
  { label: "XP earned", value: "2,340", icon: "⭐" },
  { label: "Badges unlocked", value: "7", icon: "🏅" },
  { label: "Clubs joined", value: "3", icon: "👥" },
  { label: "Certifications", value: "2", icon: "🎓" },
];

export const TIME_CAPSULE_ENTRIES: TimeCapsuleEntry[] = [
  {
    id: "tc-9",
    prompt: "What do you hope to accomplish in high school?",
    response: "I want to learn coding and help the IT Club grow.",
    gradeLabel: "Grade 9",
  },
  {
    id: "tc-10",
    prompt: "Who inspires you most right now?",
    response: "My robotics coach — she makes STEM feel possible for everyone.",
    gradeLabel: "Grade 10",
  },
  {
    id: "tc-11",
    prompt: "What will you miss most about Madonna?",
    response: "Friday night games and the friends I made in IT Club.",
    gradeLabel: "Grade 11",
  },
];

export const GRADUATION_CHECKLIST: GraduationMilestone[] = [
  { id: "gc-cap", label: "Cap & gown ordered", completed: true },
  { id: "gc-senior", label: "Senior portrait submitted", completed: true },
  { id: "gc-service", label: "Service hours requirement met", completed: true },
  { id: "gc-essay", label: "Graduation reflection essay", completed: false, dueLabel: "Due May 15" },
  { id: "gc-video", label: "Graduation video clip uploaded", completed: false, dueLabel: "Due May 22" },
  { id: "gc-capsule", label: "Time capsule sealed", completed: false, dueLabel: "Due May 30" },
];
