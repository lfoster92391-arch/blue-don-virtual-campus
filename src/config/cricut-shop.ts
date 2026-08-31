/**
 * Cricut Club shop — shipping from Weirton, WV (Madonna High School).
 *
 * Fulfillment:
 *   - PICKUP at Madonna High School — free (no shipping)
 *   - SHIP — flat standard rate from Weirton, WV (see CRICUT_SHIPPING)
 *
 * Payment is recorded as a pending club order (cash/P2P on pickup or after
 * ship confirmation). Card/Stripe can plug into checkout later.
 */

import { sampleList } from "@/config/app-mode";
import { IMAGE_UPLOAD_MAX_BYTES } from "@/config/uploads";

export const CRICUT_CLUB_SLUG = "cricut-club" as const;

export const CRICUT_SHOP_BUCKET =
  process.env.SUPABASE_CRICUT_SHOP_BUCKET?.trim() ||
  process.env.SUPABASE_CORNER_STORE_BUCKET?.trim() ||
  process.env.SUPABASE_CAMPUS_MEDIA_BUCKET?.trim() ||
  "campus-media";

export const CRICUT_SHOP_STORAGE_PREFIX = "cricut-shop";
export const CRICUT_DESIGN_STORAGE_PREFIX = "cricut-designs";

export const CRICUT_IMAGE_MAX_BYTES = IMAGE_UPLOAD_MAX_BYTES;

export const CRICUT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export const CRICUT_PRICE_MAX_CENTS = 5_000_00;

/** Origin for all Cricut Club shipments and pickup. */
export const CRICUT_SHIP_FROM = {
  school: "Madonna High School",
  city: "Weirton",
  state: "WV",
  postal: "26062",
  label: "Madonna High School · Weirton, WV",
} as const;

/**
 * Standard shipping from Weirton, WV.
 * Flat rate keeps checkout simple for maker merch (vinyl, HTV, stickers).
 * Override with NEXT_PUBLIC_CRICUT_SHIPPING_CENTS (integer cents).
 */
export const CRICUT_SHIPPING = {
  standardFlatCents: Number.parseInt(
    process.env.NEXT_PUBLIC_CRICUT_SHIPPING_CENTS?.trim() || "799",
    10,
  ) || 799,
  label: "Standard shipping from Weirton, WV",
  estimatedDays: "5–9 business days",
  carrierHint: "USPS / UPS Ground equivalent",
} as const;

export const CRICUT_PICKUP = {
  label: "Pick up at Madonna",
  location: CRICUT_SHIP_FROM.label,
  feeCents: 0,
  blurb: "Collect your order at Madonna High School in Weirton — no shipping charge.",
} as const;

/** Env fallback for Amazon wishlist; org.amazonWishlistUrl wins when set. */
export function getCricutAmazonWishlistEnvUrl(): string | null {
  const url = process.env.CRICUT_AMAZON_WISHLIST_URL?.trim();
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Live order tracking steps (progress bar). */
export const CRICUT_ORDER_PROGRESS_STEPS = [
  { key: "ORDER_SENT", label: "Order sent", statuses: ["PENDING"] },
  {
    key: "IN_PRODUCTION",
    label: "In production",
    statuses: ["CONFIRMED", "IN_PRODUCTION"],
  },
  {
    key: "READY_FOR_PICKUP",
    label: "Ready for pickup",
    statuses: ["READY_FOR_PICKUP"],
  },
  {
    key: "COMPLETED",
    label: "Completed",
    statuses: ["FULFILLED", "COMPLETED"],
  },
] as const;

export type CricutOrderProgressKey =
  (typeof CRICUT_ORDER_PROGRESS_STEPS)[number]["key"];

export const CRICUT_ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Order sent",
  CONFIRMED: "In production",
  IN_PRODUCTION: "In production",
  READY_FOR_PICKUP: "Ready for pickup",
  FULFILLED: "Completed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Statuses officers/assignees can set from the order desk. */
export const CRICUT_ORDER_UPDATE_STATUSES = [
  "PENDING",
  "IN_PRODUCTION",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;

export function formatShopPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function shippingCentsFor(fulfillment: "PICKUP" | "SHIP"): number {
  return fulfillment === "SHIP" ? CRICUT_SHIPPING.standardFlatCents : 0;
}

export function orderProgressIndex(status: string): number {
  if (status === "CANCELLED") {
    return -1;
  }
  const idx = CRICUT_ORDER_PROGRESS_STEPS.findIndex((step) =>
    (step.statuses as readonly string[]).includes(status),
  );
  return idx >= 0 ? idx : 0;
}

export type CricutSampleItem = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  availableToSell?: boolean;
};

const CRICUT_SAMPLE_ITEMS: CricutSampleItem[] = [
  {
    id: "sample-cricut-decal",
    title: "Blue Don car decal",
    description: "Weatherproof vinyl Blue Don logo — 4\" wide. Cut on campus Cricuts.",
    priceCents: 800,
    imageUrl: null,
    availableToSell: true,
  },
  {
    id: "sample-cricut-tumbler",
    title: "Spirit tumbler wrap",
    description: "Custom HTV wrap for 20oz tumblers. Choose navy or white lettering.",
    priceCents: 1800,
    imageUrl: null,
    availableToSell: true,
  },
  {
    id: "sample-cricut-keychain",
    title: "Acrylic keychain set",
    description: "Pair of Madonna spirit keychains — engraved + vinyl accent.",
    priceCents: 1200,
    imageUrl: null,
    availableToSell: false,
  },
];

export function getCricutSampleItems(): CricutSampleItem[] {
  return sampleList(CRICUT_SAMPLE_ITEMS);
}

export const CRICUT_CART_STORAGE_KEY = "blue-don-cricut-cart-v1";
