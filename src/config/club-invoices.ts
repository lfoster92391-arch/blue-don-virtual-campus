/**
 * Club invoice / expense submissions (receipt scan + materials lines).
 * Posts to ClubLedgerEntry as WITHDRAWAL when approved.
 */

export const CLUB_INVOICE_BUCKET =
  process.env.SUPABASE_CLUB_INVOICE_BUCKET?.trim() ||
  process.env.SUPABASE_CAMPUS_MEDIA_BUCKET?.trim() ||
  "campus-media";

export const CLUB_INVOICE_STORAGE_PREFIX = "club-invoices";

export const CLUB_INVOICE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const CLUB_INVOICE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

/** Clubs that submit expenses into the shared finance surface. */
export const INVOICE_CLUB_SLUGS = [
  "it-club",
  "broadcasting",
  "cricut-club",
] as const;

export type InvoiceClubSlug = (typeof INVOICE_CLUB_SLUGS)[number];

export function isInvoiceClubSlug(slug: string): slug is InvoiceClubSlug {
  return (INVOICE_CLUB_SLUGS as readonly string[]).includes(slug);
}
