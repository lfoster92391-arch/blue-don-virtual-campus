/**
 * Lunch lives outside this app.
 *
 * Madonna runs menus, lunch orders, and cafeteria payments on FuelTheDons, so
 * the campus keeps no menu calendar, order board, kitchen count, dietary queue,
 * or cafeteria ledger of its own. Every lunch surface in here is a labelled
 * external link to that site — see docs/MADONNA_HUB.md.
 */

const DEFAULT_URL = "https://fuelthedons.com";

/** Override per environment if the school moves the site. */
export const FUEL_THE_DONS_URL =
  process.env.NEXT_PUBLIC_FUEL_THE_DONS_URL?.trim() || DEFAULT_URL;

export const FUEL_THE_DONS_NAME = "FuelTheDons.com";

/** Host shown next to the link so people know they are leaving campus. */
export const FUEL_THE_DONS_HOST = (() => {
  try {
    return new URL(FUEL_THE_DONS_URL).host;
  } catch {
    return new URL(DEFAULT_URL).host;
  }
})();

export const FUEL_THE_DONS_BLURB =
  "Menus, lunch orders, and cafeteria payments are handled on FuelTheDons — a separate site, not part of this campus app.";
