/**
 * Tunable thresholds for Success Analytics buckets.
 * Adjust these values to match Madonna graduation requirements and engagement goals.
 */

export const SUCCESS_ANALYTICS_THRESHOLDS = {
  /** Minimum service hours toward graduation (placeholder until ServiceHour model ships). */
  serviceHoursMinimum: 20,

  /** Club count that signals strong campus involvement. */
  excellingClubCount: 2,

  /** Certifications earned to count as excelling. */
  excellingCertificationCount: 1,

  /** Academy / module progress percent for honor-roll placeholder. */
  excellingProgressPercent: 60,

  /** Completed learning modules for high-engagement signal. */
  excellingModulesCompleted: 3,

  /** Published portfolio items needed before resume bucket clears. */
  resumeMinPublishedItems: 1,

  /** Portfolio completion percent below which a student appears in withoutResume. */
  resumeMinCompletionPercent: 25,
} as const;

/** Placeholder until grade level is stored on User. */
export const SUCCESS_ANALYTICS_GRADE_LABEL = "Class of 2026";

export const SUCCESS_ANALYTICS_BUCKETS = {
  needingSupport: {
    label: "Students needing support",
    description:
      "Gentle outreach for students who may benefit from a check-in — clubs, activity, or agreements.",
    statusVariant: "info" as const,
  },
  excelling: {
    label: "Students excelling",
    description:
      "Celebrate wins — leadership, certifications, and strong engagement across campus.",
    statusVariant: "success" as const,
  },
  missingOpportunities: {
    label: "Students missing opportunities",
    description:
      "Invite exploration — pathways, mentorship, and Future Center resources they have not tapped yet.",
    statusVariant: "warning" as const,
  },
  needsServiceHours: {
    label: "Students needing service hours",
    description:
      "Encourage meaningful service — help students log hours and find volunteer placements.",
    statusVariant: "info" as const,
  },
  withoutClubs: {
    label: "Students without clubs",
    description:
      "Connection matters — suggest clubs that match their interests and strengths.",
    statusVariant: "warning" as const,
  },
  withoutResume: {
    label: "Students without resumes",
    description:
      "Career readiness — nudge students to build and share their career portfolio.",
    statusVariant: "info" as const,
  },
} as const;

export type SuccessAnalyticsBucketId = keyof typeof SUCCESS_ANALYTICS_BUCKETS;
