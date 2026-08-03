/**
 * College Readiness Passport — Future Center checklist for juniors & seniors.
 * Students self-report progress on eight core college-prep milestones.
 */

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  MapPin,
  MessageSquare,
  PenLine,
} from "lucide-react";

export type CollegeReadinessItemId =
  | "sat"
  | "act"
  | "fafsa"
  | "applications"
  | "essays"
  | "campus-visits"
  | "scholarships"
  | "interviews";

export type CollegeReadinessPassportItem = {
  id: CollegeReadinessItemId;
  label: string;
  description: string;
  icon: LucideIcon;
  resourceHref?: string;
  resourceLabel?: string;
  external?: boolean;
  /** Primary audience — passport is for grades 11–12 */
  minGrade?: 11 | 12;
};

export const COLLEGE_READINESS_PASSPORT_TAGLINE =
  "Your official college readiness passport — track every milestone from testing to acceptance.";

export const COLLEGE_READINESS_GRADE_MIN = 11;
export const COLLEGE_READINESS_GRADE_MAX = 12;

export const COLLEGE_READINESS_PASSPORT_ITEMS: CollegeReadinessPassportItem[] = [
  {
    id: "sat",
    label: "SAT",
    description:
      "Register for and complete the SAT. Review scores with your counselor and identify target retake dates if needed.",
    icon: FileText,
    resourceHref: "/pathways",
    resourceLabel: "Test prep resources",
    minGrade: 11,
  },
  {
    id: "act",
    label: "ACT",
    description:
      "Register for and complete the ACT. Compare SAT/ACT results with your counselor to choose your best score profile.",
    icon: ClipboardList,
    resourceHref: "/pathways",
    resourceLabel: "Test prep resources",
    minGrade: 11,
  },
  {
    id: "fafsa",
    label: "FAFSA",
    description:
      "Submit the Free Application for Federal Student Aid (FAFSA) with a parent or guardian. Madonna's code is on file in the Future Center.",
    icon: DollarSign,
    resourceHref: "https://studentaid.gov/h/apply-for-aid/fafsa",
    resourceLabel: "FAFSA.gov",
    external: true,
    minGrade: 12,
  },
  {
    id: "applications",
    label: "Applications",
    description:
      "Submit college applications to your reach, match, and safety schools. Track deadlines in the Future Center.",
    icon: GraduationCap,
    resourceHref: "/pathways",
    resourceLabel: "Future Center",
    minGrade: 12,
  },
  {
    id: "essays",
    label: "Essays",
    description:
      "Draft and finalize personal statements and supplemental essays. Schedule a review with your counselor or writing lab.",
    icon: PenLine,
    resourceHref: "/career-portfolio",
    resourceLabel: "Career Portfolio",
    minGrade: 12,
  },
  {
    id: "campus-visits",
    label: "Campus Visits",
    description:
      "Tour at least two campuses — in person or virtual. Document impressions to refine your college list.",
    icon: MapPin,
    resourceHref: "/partners",
    resourceLabel: "Partner programs",
    minGrade: 11,
  },
  {
    id: "scholarships",
    label: "Scholarships",
    description:
      "Apply to scholarships you qualify for. Blue Don matches your profile to local and national awards.",
    icon: Building2,
    resourceHref: "/scholarships",
    resourceLabel: "Scholarship Center",
    minGrade: 11,
  },
  {
    id: "interviews",
    label: "Interviews",
    description:
      "Prepare for admissions and scholarship interviews. Practice STAR responses and professional follow-up.",
    icon: MessageSquare,
    resourceHref: "/professional-skills/interview-ready",
    resourceLabel: "Interview Ready track",
    minGrade: 12,
  },
];

export function getCollegeReadinessItemIds(
  gradeLevel?: number | null,
): CollegeReadinessItemId[] {
  return COLLEGE_READINESS_PASSPORT_ITEMS.filter(
    (item) =>
      !item.minGrade || gradeLevel == null || gradeLevel >= item.minGrade,
  ).map((item) => item.id);
}

export function isCollegePassportEligible(gradeLevel?: number | null): boolean {
  if (gradeLevel == null) {
    return true;
  }
  return (
    gradeLevel >= COLLEGE_READINESS_GRADE_MIN &&
    gradeLevel <= COLLEGE_READINESS_GRADE_MAX
  );
}
