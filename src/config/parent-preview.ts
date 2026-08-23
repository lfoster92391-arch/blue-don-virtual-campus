/**
 * The stand-in child an admin sees while previewing the parent experience.
 *
 * Admin accounts have no `ParentStudentLink`, so the parent portal and the lunch
 * board would render as empty states and hide exactly the chrome an admin needs
 * to check. This synthetic student fills that gap for display only.
 *
 * The id is deliberately not a UUID. Both `lunch_orders.diner_id` and
 * `dietary_requests.student_id` are `uuid` columns with a foreign key to
 * `users`, so this value cannot match a real row even if a write got past the
 * action-level guards in `features/lunch` and `features/dietary`.
 */

export const PARENT_PREVIEW_STUDENT_ID = "parent-preview-student";

export const PARENT_PREVIEW_STUDENT_NAME = "Sample Student (PREVIEW)";

export const PARENT_PREVIEW_STUDENT_EMAIL = "sample.student@preview.invalid";

export const PARENT_PREVIEW_RELATIONSHIP = "Preview child — not a real student";

/**
 * A dietary record on the preview child so the allergy badges and the
 * hot-entree conflict nudge are both visible without touching real data.
 */
export const PARENT_PREVIEW_DIETARY = {
  allergens: ["peanuts", "milk"],
  restrictions: ["vegetarian"],
  notes: "Sample dietary record shown in preview only.",
} as const;

export function isParentPreviewStudentId(id: string): boolean {
  return id === PARENT_PREVIEW_STUDENT_ID;
}
