/**
 * Blue Don Corner — the campus marketplace.
 *
 * Students, clubs, and the school store list spirit wear, tickets, handmade
 * goods, supplies, and services. Photos live in Supabase Storage; listings are
 * persisted with Prisma. Payment is handled off-platform for the MVP (cash on
 * campus, peer-to-peer apps, and stubbed card/rewards checkout) so the store
 * can launch before a full payments integration lands.
 */

import { sampleList } from "@/config/app-mode";

/**
 * Storage bucket for listing photos. Reuses the existing `campus-media` bucket
 * (see Media MVP) under a `corner-store/` path prefix by default so no new
 * bucket provisioning is required. Override with SUPABASE_CORNER_STORE_BUCKET.
 */
export const CORNER_STORE_BUCKET =
  process.env.SUPABASE_CORNER_STORE_BUCKET?.trim() ||
  process.env.SUPABASE_CAMPUS_MEDIA_BUCKET?.trim() ||
  "campus-media";

export const CORNER_STORAGE_PREFIX = "corner-store";

export const CORNER_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

export const CORNER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

/**
 * Optional external card-checkout link (e.g. a Stripe Payment Link or the
 * school store's hosted checkout). When set, the "Card" pay option deep-links
 * here; otherwise it renders as "coming soon".
 */
export const CORNER_CARD_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_CORNER_CARD_CHECKOUT_URL?.trim() || null;

export const CORNER_PRICE_MAX_CENTS = 5_000_00; // $5,000 ceiling for a student listing

export type CornerCategory = {
  id: string;
  label: string;
  emoji: string;
};

export const CORNER_CATEGORIES: CornerCategory[] = [
  { id: "spirit-wear", label: "Spirit Wear", emoji: "👕" },
  { id: "tickets", label: "Tickets & Events", emoji: "🎟️" },
  { id: "supplies", label: "School Supplies", emoji: "✏️" },
  { id: "handmade", label: "Handmade & Crafts", emoji: "🎨" },
  { id: "food", label: "Bake Sale & Snacks", emoji: "🧁" },
  { id: "books", label: "Books & Study", emoji: "📚" },
  { id: "services", label: "Services & Tutoring", emoji: "🛠️" },
  { id: "fundraiser", label: "Club Fundraiser", emoji: "💙" },
  { id: "other", label: "Other", emoji: "📦" },
];

export function getCornerCategory(id: string | null | undefined): CornerCategory | null {
  if (!id) {
    return null;
  }
  return CORNER_CATEGORIES.find((category) => category.id === id) ?? null;
}

export type CornerPaymentMethodId =
  | "cash"
  | "venmo"
  | "cashapp"
  | "zelle"
  | "card"
  | "points";

export type CornerPaymentMethodMeta = {
  id: CornerPaymentMethodId;
  label: string;
  blurb: string;
  /** Seller must supply a handle/username for buyers to send money. */
  needsHandle: boolean;
  handleLabel?: string;
  handlePlaceholder?: string;
  /** Not yet wired end-to-end — shown to buyers as a placeholder. */
  comingSoon?: boolean;
};

export const CORNER_PAYMENT_METHODS: CornerPaymentMethodMeta[] = [
  {
    id: "cash",
    label: "Cash at school",
    blurb: "Meet the seller on campus and pay in person.",
    needsHandle: false,
  },
  {
    id: "venmo",
    label: "Venmo",
    blurb: "Send the amount to the seller's Venmo.",
    needsHandle: true,
    handleLabel: "Venmo username",
    handlePlaceholder: "@your-venmo",
  },
  {
    id: "cashapp",
    label: "Cash App",
    blurb: "Send the amount to the seller's $Cashtag.",
    needsHandle: true,
    handleLabel: "Cash App $Cashtag",
    handlePlaceholder: "$YourCashtag",
  },
  {
    id: "zelle",
    label: "Zelle",
    blurb: "Send the amount via Zelle to the seller.",
    needsHandle: true,
    handleLabel: "Zelle email or phone",
    handlePlaceholder: "you@example.com",
  },
  {
    id: "card",
    label: "Card (online)",
    blurb: CORNER_CARD_CHECKOUT_URL
      ? "Pay securely by card through the school checkout."
      : "Secure card checkout is launching soon.",
    needsHandle: false,
    comingSoon: !CORNER_CARD_CHECKOUT_URL,
  },
  {
    id: "points",
    label: "Blue Don Points",
    blurb: "Redeem campus rewards points. Launching with the Rewards center.",
    needsHandle: false,
    comingSoon: true,
  },
];

export function getPaymentMethodMeta(
  id: CornerPaymentMethodId,
): CornerPaymentMethodMeta | null {
  return CORNER_PAYMENT_METHODS.find((method) => method.id === id) ?? null;
}

/**
 * Shape stored in `CornerStoreItem.paymentMethods` (JSON).
 */
export type CornerPaymentConfig = {
  methods: CornerPaymentMethodId[];
  /** Per-method handle (Venmo username, $Cashtag, Zelle contact, ...). */
  handles?: Partial<Record<CornerPaymentMethodId, string>>;
  /** Free-text pickup / payment note from the seller. */
  note?: string;
};

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export type CornerSampleItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
  sellerName: string;
  sellerKind: "student" | "club" | "store";
  payment: CornerPaymentConfig;
};

const CORNER_SAMPLE_ITEMS: CornerSampleItem[] = [
  {
    id: "sample-spirit-hoodie",
    title: "Madonna Blue Dons Hoodie",
    description:
      "Navy pullover hoodie with gold Blue Don crest. Sizes S–XXL. Proceeds support the fall pep rally.",
    category: "spirit-wear",
    priceCents: 3500,
    imageUrl: null,
    sellerName: "Student Council",
    sellerKind: "club",
    payment: {
      methods: ["cash", "venmo"],
      handles: { venmo: "@madonna-stuco" },
      note: "Pick up outside the main office during lunch.",
    },
  },
  {
    id: "sample-homecoming-ticket",
    title: "Homecoming Dance Ticket",
    description: "One admission to the Homecoming dance. Includes photo booth access.",
    category: "tickets",
    priceCents: 2500,
    imageUrl: null,
    sellerName: "Blue Don Store",
    sellerKind: "store",
    payment: { methods: ["cash", "card"], note: "Tickets emailed after purchase." },
  },
  {
    id: "sample-bake-sale",
    title: "Fresh Baked Cookies (6-pack)",
    description: "Homemade chocolate chip cookies. Baked fresh every Friday for the Key Club fundraiser.",
    category: "food",
    priceCents: 500,
    imageUrl: null,
    sellerName: "Key Club",
    sellerKind: "club",
    payment: { methods: ["cash", "cashapp"], handles: { cashapp: "$KeyClubMHS" } },
  },
  {
    id: "sample-tutoring",
    title: "Peer Math Tutoring (1 hour)",
    description: "Algebra & Geometry help from a National Honor Society tutor. After-school in the library.",
    category: "services",
    priceCents: 1500,
    imageUrl: null,
    sellerName: "Ava R.",
    sellerKind: "student",
    payment: { methods: ["venmo", "zelle"], handles: { venmo: "@ava-tutors" } },
  },
];

/** Demo listings — empty in clean-slate mode, populated when demo mode is on. */
export function getCornerSampleItems(): CornerSampleItem[] {
  return sampleList(CORNER_SAMPLE_ITEMS);
}
