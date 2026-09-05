/**
 * Cricut shop personalization — sport, print name, Canva-available web fonts.
 * Fonts are Google Fonts (OFL) that Canva also offers, so we can load them
 * on the product page without a Canva embed.
 */

import { DEFAULT_SPORTS } from "@/config/sports-highlights";

export const CRICUT_PRINT_NAME_MAX = 40;

export const CRICUT_PRINT_FONTS = [
  {
    key: "bebas-neue",
    label: "Bebas Neue",
    blurb: "Athletic block",
    cssVar: "--font-cricut-bebas",
    fallback: "Impact, sans-serif",
  },
  {
    key: "oswald",
    label: "Oswald",
    blurb: "Condensed sans",
    cssVar: "--font-cricut-oswald",
    fallback: "Arial Narrow, sans-serif",
  },
  {
    key: "montserrat",
    label: "Montserrat",
    blurb: "Clean campus",
    cssVar: "--font-cricut-montserrat",
    fallback: "Arial, sans-serif",
  },
  {
    key: "playfair-display",
    label: "Playfair Display",
    blurb: "Formal serif",
    cssVar: "--font-cricut-playfair",
    fallback: "Georgia, serif",
  },
] as const;

export type CricutPrintFontKey = (typeof CRICUT_PRINT_FONTS)[number]["key"];

export const CRICUT_DEFAULT_PRINT_FONT: CricutPrintFontKey = "bebas-neue";

export const CRICUT_SHOP_SPORTS = DEFAULT_SPORTS.map((sport) => ({
  slug: sport.slug,
  name: sport.name,
}));

const SPORT_NAME_BY_SLUG = new Map<string, string>(
  CRICUT_SHOP_SPORTS.map((sport) => [sport.slug, sport.name]),
);
const FONT_BY_KEY = new Map(CRICUT_PRINT_FONTS.map((font) => [font.key, font]));

export type CricutCustomization = {
  sportSlug: string | null;
  printName: string;
  fontKey: CricutPrintFontKey | null;
  designImageUrl: string | null;
  designStoragePath: string | null;
};

export function isCricutPrintFontKey(value: string): value is CricutPrintFontKey {
  return FONT_BY_KEY.has(value as CricutPrintFontKey);
}

export function parseCricutPrintFontKey(
  value: string | null | undefined,
): CricutPrintFontKey | null {
  const key = value?.trim() ?? "";
  return isCricutPrintFontKey(key) ? key : null;
}

export function parseCricutSportSlug(
  value: string | null | undefined,
): string | null {
  const slug = value?.trim() ?? "";
  if (!slug) return null;
  return SPORT_NAME_BY_SLUG.has(slug) ? slug : null;
}

export function cricutSportLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return SPORT_NAME_BY_SLUG.get(slug) ?? slug;
}

export function cricutFontLabel(key: string | null | undefined): string | null {
  if (!key) return null;
  return FONT_BY_KEY.get(key as CricutPrintFontKey)?.label ?? key;
}

export function cricutFontFamily(key: string | null | undefined): string {
  const font = FONT_BY_KEY.get((key ?? CRICUT_DEFAULT_PRINT_FONT) as CricutPrintFontKey);
  const chosen = font ?? CRICUT_PRINT_FONTS[0];
  return `var(${chosen.cssVar}), ${chosen.fallback}`;
}

export function sanitizeCricutPrintName(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, CRICUT_PRINT_NAME_MAX);
}

export function cricutCartLineKey(
  itemId: string,
  customization: Pick<
    CricutCustomization,
    "sportSlug" | "printName" | "fontKey" | "designStoragePath" | "designImageUrl"
  > & {
    size?: string | null;
    buyerNote?: string | null;
  },
): string {
  return [
    itemId,
    customization.sportSlug ?? "",
    customization.printName.trim().toLowerCase(),
    customization.fontKey ?? "",
    customization.designStoragePath ?? customization.designImageUrl ?? "",
    (customization.size ?? "").trim().toUpperCase(),
    (customization.buyerNote ?? "").trim().toLowerCase(),
  ].join("|");
}

export function summarizeCricutCustomization(input: {
  title?: string;
  sportSlug?: string | null;
  printName?: string | null;
  fontKey?: string | null;
  hasDesign?: boolean;
  size?: string | null;
  buyerNote?: string | null;
}): string | null {
  const bits: string[] = [];
  const sport = cricutSportLabel(input.sportSlug);
  const printName = sanitizeCricutPrintName(input.printName);
  const font = cricutFontLabel(input.fontKey);
  const size = input.size?.trim();
  const buyerNote = input.buyerNote?.trim();
  if (size) bits.push(`Size: ${size}`);
  if (sport) bits.push(`Sport: ${sport}`);
  if (printName) bits.push(`Name: ${printName}`);
  if (font && printName) bits.push(`Font: ${font}`);
  if (input.hasDesign) bits.push("Custom design uploaded");
  if (buyerNote) bits.push(`Note: ${buyerNote}`);
  if (bits.length === 0) return null;
  return input.title ? `${input.title} — ${bits.join(" · ")}` : bits.join(" · ");
}
