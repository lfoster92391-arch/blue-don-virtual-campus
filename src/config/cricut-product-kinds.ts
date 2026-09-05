/**
 * Cricut shop product kinds — officers pick one when listing.
 * Buyer option fields switch from this (tumbler set is the working example).
 */

export const CRICUT_SHOP_ITEM_KINDS = [
  {
    key: "SHIRT",
    label: "Shirt",
    blurb: "Apparel — size, customization, and quantity.",
  },
  {
    key: "TUMBLER",
    label: "Tumbler",
    blurb: "Wraps and cups — sport, name, font, design, and quantity.",
  },
  {
    key: "OTHER",
    label: "Other item",
    blurb: "Decals, keychains, and similar goods.",
  },
  {
    key: "CUSTOM_BUILT",
    label: "Custom built",
    blurb: "Made-to-order — quantity first, optional note.",
  },
] as const;

export type CricutShopItemKind = (typeof CRICUT_SHOP_ITEM_KINDS)[number]["key"];

export const CRICUT_SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export type CricutShirtSize = (typeof CRICUT_SHIRT_SIZES)[number];

export const CRICUT_BUYER_NOTE_MAX = 200;

const KIND_BY_KEY = new Map<string, CricutShopItemKind>(
  CRICUT_SHOP_ITEM_KINDS.map((kind) => [kind.key, kind.key]),
);

export function parseCricutShopItemKind(
  value: string | null | undefined,
): CricutShopItemKind {
  const key = (value ?? "").trim().toUpperCase();
  return KIND_BY_KEY.get(key) ?? "OTHER";
}

export function cricutShopItemKindLabel(
  kind: string | null | undefined,
): string {
  const parsed = parseCricutShopItemKind(kind);
  return CRICUT_SHOP_ITEM_KINDS.find((entry) => entry.key === parsed)?.label ?? "Other item";
}

export function cricutKindShowsSize(kind: CricutShopItemKind): boolean {
  return kind === "SHIRT";
}

export function cricutKindShowsBuyerNote(kind: CricutShopItemKind): boolean {
  return kind === "CUSTOM_BUILT";
}

export function cricutKindDefaultCustomizable(kind: CricutShopItemKind): boolean {
  return kind !== "CUSTOM_BUILT";
}

export function parseCricutShirtSize(
  value: string | null | undefined,
): CricutShirtSize | null {
  const size = (value ?? "").trim().toUpperCase();
  return CRICUT_SHIRT_SIZES.includes(size as CricutShirtSize)
    ? (size as CricutShirtSize)
    : null;
}

export function sanitizeCricutBuyerNote(
  value: string | null | undefined,
): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, CRICUT_BUYER_NOTE_MAX);
}

export function parseCricutQuantity(value: unknown, fallback = 1): number {
  const qty = Math.floor(Number(value ?? fallback));
  if (!Number.isFinite(qty)) return fallback;
  return Math.max(1, Math.min(99, qty));
}
