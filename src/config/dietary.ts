/**
 * Dietary and allergy catalog for the cafeteria.
 *
 * Families pick from these fixed ids rather than typing free text, so the
 * kitchen reads a consistent vocabulary and the lunch board can flag conflicts
 * (a nut allergy against a menu item, for example). The stored ids live in
 * `DietaryRequest` and `StudentDietaryProfile`; free-text detail goes in `notes`.
 *
 * Kept free of icon and Prisma imports so client components can use the labels.
 */

export type DietaryAllergen = {
  id: string;
  label: string;
  /** Shown to the office when reviewing, and on the student profile. */
  severityHint: string;
};

/** The FDA "big nine" plus the two the kitchen sees most often. */
export const DIETARY_ALLERGENS: DietaryAllergen[] = [
  { id: "peanuts", label: "Peanuts", severityHint: "Often severe — check labels." },
  { id: "tree-nuts", label: "Tree nuts", severityHint: "Often severe — check labels." },
  { id: "milk", label: "Milk / dairy", severityHint: "Common; affects sides and desserts." },
  { id: "eggs", label: "Eggs", severityHint: "Common in baked goods." },
  { id: "wheat", label: "Wheat", severityHint: "Affects bread, pasta, breading." },
  { id: "soy", label: "Soy", severityHint: "Common in sauces and breading." },
  { id: "fish", label: "Fish", severityHint: "Check Friday menus." },
  { id: "shellfish", label: "Shellfish", severityHint: "Often severe." },
  { id: "sesame", label: "Sesame", severityHint: "Common on buns and in sauces." },
  { id: "gluten", label: "Gluten", severityHint: "Celiac or sensitivity." },
  { id: "corn", label: "Corn", severityHint: "Check chips, tortillas, starch." },
];

export type DietaryRestriction = {
  id: string;
  label: string;
  description: string;
};

export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  {
    id: "vegetarian",
    label: "Vegetarian",
    description: "No meat, poultry, or fish.",
  },
  {
    id: "vegan",
    label: "Vegan",
    description: "No animal products at all.",
  },
  {
    id: "halal",
    label: "Halal",
    description: "Halal-prepared meat only.",
  },
  {
    id: "kosher",
    label: "Kosher",
    description: "Kosher-prepared food only.",
  },
  {
    id: "no-pork",
    label: "No pork",
    description: "Avoids pork and pork products.",
  },
  {
    id: "no-beef",
    label: "No beef",
    description: "Avoids beef and beef products.",
  },
  {
    id: "lactose-free",
    label: "Lactose-free",
    description: "Needs dairy-free substitutions.",
  },
  {
    id: "low-sugar",
    label: "Low sugar",
    description: "Diabetic or medically managed intake.",
  },
  {
    id: "gluten-free",
    label: "Gluten-free",
    description: "Needs gluten-free substitutions.",
  },
  {
    id: "nut-free-table",
    label: "Nut-free seating",
    description: "Seat away from nut products.",
  },
];

const ALLERGEN_BY_ID = new Map(DIETARY_ALLERGENS.map((item) => [item.id, item]));
const RESTRICTION_BY_ID = new Map(
  DIETARY_RESTRICTIONS.map((item) => [item.id, item]),
);

export function isDietaryAllergenId(value: string): boolean {
  return ALLERGEN_BY_ID.has(value);
}

export function isDietaryRestrictionId(value: string): boolean {
  return RESTRICTION_BY_ID.has(value);
}

export function dietaryAllergenLabel(id: string): string {
  return ALLERGEN_BY_ID.get(id)?.label ?? id;
}

export function dietaryRestrictionLabel(id: string): string {
  return RESTRICTION_BY_ID.get(id)?.label ?? id;
}

/** Drops anything not in the catalog and de-duplicates, preserving order. */
export function sanitizeAllergenIds(values: readonly string[]): string[] {
  return [...new Set(values.filter(isDietaryAllergenId))];
}

export function sanitizeRestrictionIds(values: readonly string[]): string[] {
  return [...new Set(values.filter(isDietaryRestrictionId))];
}

export const DIETARY_NOTES_MAX_LENGTH = 500;

/**
 * Restrictions that mean the posted meat entree is not appropriate, so the
 * lunch board can nudge toward the vegetarian option.
 */
const MEAT_AVOIDING_RESTRICTIONS = new Set([
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
]);

export function avoidsHotEntree(restrictionIds: readonly string[]): boolean {
  return restrictionIds.some((id) => MEAT_AVOIDING_RESTRICTIONS.has(id));
}

/** True when the student has anything the cafeteria must account for. */
export function hasDietaryNeeds(input: {
  allergens: readonly string[];
  restrictions: readonly string[];
  notes?: string | null;
}): boolean {
  return (
    input.allergens.length > 0 ||
    input.restrictions.length > 0 ||
    Boolean(input.notes?.trim())
  );
}
