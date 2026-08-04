/**
 * Cricut Club project ideas — dollar-store / easy cheap creations.
 *
 * Each idea carries what a maker needs (materials), how to make it (steps),
 * an estimated build cost, and a suggested sell price so "Make this" and
 * "Sell this" can both work off the same record.
 *
 * The starter catalog below is real Cricut Club content (a menu students pick
 * from), so it stays available as a fallback when the database is unseeded or
 * unreachable — same soft-fail posture as the rest of the shop.
 */

export type CricutProjectDifficultyKey = "EASY" | "MEDIUM" | "ADVANCED";

export const CRICUT_PROJECT_DIFFICULTY_LABELS: Record<
  CricutProjectDifficultyKey,
  string
> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  ADVANCED: "Advanced",
};

export type CricutProjectMaterial = {
  /** Supply name, e.g. "Glass candle holder". */
  name: string;
  /** How much of it this build uses, e.g. "1" or "6x6 in". */
  qty?: string;
  /** Where to grab it — dollar store aisle, club cart, etc. */
  source?: string;
  /** Cost attributed to a single build. */
  costCents: number;
  /** True when the club already stocks it (vinyl, transfer tape, blades). */
  clubSupply?: boolean;
};

export type CricutProjectStep = {
  title: string;
  detail?: string;
};

export type CricutProjectIdeaSeed = {
  slug: string;
  title: string;
  summary: string;
  difficulty: CricutProjectDifficultyKey;
  timeMinutes: number;
  dollarStoreTag: string;
  materials: CricutProjectMaterial[];
  steps: CricutProjectStep[];
  estimatedCostCents: number;
  suggestedSellPriceCents: number;
  sellNotes?: string;
};

export const CRICUT_PROJECT_COST_MAX_CENTS = 500_00;

/** Starter catalog — cheap builds Cricut Club can run any meeting. */
export const CRICUT_STARTER_PROJECT_IDEAS: CricutProjectIdeaSeed[] = [
  {
    slug: "monogram-candle-jar",
    title: "Monogram glass candle jar",
    summary:
      "Dollar-store glass candle plus a single vinyl monogram. The fastest first project in the club — most makers finish two in one meeting.",
    difficulty: "EASY",
    timeMinutes: 30,
    dollarStoreTag: "Dollar Tree · under $2",
    materials: [
      { name: "Glass candle jar", qty: "1", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "3x3 in",
        source: "Club vinyl cart",
        costCents: 55,
        clubSupply: true,
      },
      {
        name: "Transfer tape",
        qty: "3x3 in",
        source: "Club supply",
        costCents: 15,
        clubSupply: true,
      },
      { name: "Ribbon or twine", qty: "10 in", source: "Dollar Tree", costCents: 10 },
    ],
    steps: [
      {
        title: "Design the monogram",
        detail:
          "In Design Space, type the initial in a bold script and size it to about 2 in tall so it fits the flat face of the jar.",
      },
      {
        title: "Cut on permanent vinyl",
        detail: "Material setting: Premium Vinyl. Mirror OFF — this is adhesive vinyl, not HTV.",
      },
      { title: "Weed the extra vinyl", detail: "Pull the background away and keep the letter on the backing." },
      { title: "Apply transfer tape", detail: "Burnish with the scraper, then peel the backing at a sharp angle." },
      {
        title: "Clean and stick",
        detail: "Wipe the glass with rubbing alcohol, center the decal, press firmly, then peel the tape off slowly.",
      },
      { title: "Finish", detail: "Tie ribbon around the rim and let the adhesive set for a few hours before gifting." },
    ],
    estimatedCostCents: 205,
    suggestedSellPriceCents: 700,
    sellNotes:
      "Sells best in pairs or as a teacher gift set. Bundle three for $18 and it still clears a healthy margin.",
  },
  {
    slug: "canvas-tote-name",
    title: "Personalized canvas tote bag",
    summary:
      "Plain dollar-store tote plus heat transfer vinyl. Great intro to the heat press and an easy custom order to take.",
    difficulty: "EASY",
    timeMinutes: 35,
    dollarStoreTag: "Dollar Tree · under $2.50",
    materials: [
      { name: "Canvas tote bag", qty: "1", source: "Dollar Tree", costCents: 125 },
      {
        name: "Heat transfer vinyl (HTV)",
        qty: "6x6 in",
        source: "Club HTV bin",
        costCents: 75,
        clubSupply: true,
      },
      {
        name: "Parchment / Teflon sheet",
        qty: "reusable",
        source: "Club supply",
        costCents: 5,
        clubSupply: true,
      },
    ],
    steps: [
      { title: "Pick the design", detail: "A name, a last-name monogram, or the Blue Don mark. Keep it under 6 in wide." },
      {
        title: "Mirror the design",
        detail: "HTV must be mirrored before cutting. Flip horizontally in Design Space or the cut will read backwards.",
      },
      { title: "Cut on Everyday Iron-On setting", detail: "Shiny carrier sheet goes face down on the mat." },
      { title: "Weed", detail: "Remove everything except the design still stuck to the clear carrier." },
      {
        title: "Press",
        detail: "305°F for 30 seconds with firm pressure. Press the blank flat for 5 seconds first to remove moisture.",
      },
      { title: "Warm peel", detail: "Peel the carrier while still warm, then press 5 more seconds through parchment." },
    ],
    estimatedCostCents: 205,
    suggestedSellPriceCents: 1000,
    sellNotes:
      "Teacher and senior totes move fastest. Add $2 for a second color or a back-side design.",
  },
  {
    slug: "name-water-bottle",
    title: "Name water bottle",
    summary:
      "Dollar-store sports bottle with a permanent vinyl name — the highest-volume, lowest-effort seller for game days.",
    difficulty: "EASY",
    timeMinutes: 20,
    dollarStoreTag: "Dollar Tree · under $2",
    materials: [
      { name: "Plastic sports bottle", qty: "1", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "4x2 in",
        source: "Club vinyl cart",
        costCents: 50,
        clubSupply: true,
      },
      { name: "Transfer tape", qty: "4x2 in", source: "Club supply", costCents: 15, clubSupply: true },
    ],
    steps: [
      { title: "Type the name", detail: "Sans-serif fonts survive dishwashers and weeding better than thin script." },
      { title: "Cut and weed", detail: "Premium Vinyl setting, mirror OFF. Use the weeding hook on letter centers." },
      { title: "Wipe the bottle", detail: "Rubbing alcohol on the curve where the decal goes — skip this and it peels." },
      { title: "Transfer", detail: "Apply from the center outward so the vinyl does not wrinkle on the curve." },
      { title: "Cure", detail: "Hand wash only, and wait 24 hours before the first wash." },
    ],
    estimatedCostCents: 190,
    suggestedSellPriceCents: 700,
    sellNotes:
      "Run a batch of 10 in team colors before a home game. Pre-sell by roster name so nothing is left over.",
  },
  {
    slug: "quote-picture-frame",
    title: "Quote picture frame",
    summary:
      "A dollar-store frame turns into a shelf sign with one vinyl cut. Zero press time, so it works when the heat press is busy.",
    difficulty: "EASY",
    timeMinutes: 25,
    dollarStoreTag: "Dollar Tree · under $2",
    materials: [
      { name: "5x7 picture frame", qty: "1", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "4x6 in",
        source: "Club vinyl cart",
        costCents: 40,
        clubSupply: true,
      },
      { name: "Transfer tape", qty: "4x6 in", source: "Club supply", costCents: 10, clubSupply: true },
      { name: "Scrapbook paper backing", qty: "1 sheet", source: "Dollar Tree", costCents: 15 },
    ],
    steps: [
      { title: "Size the quote to the glass", detail: "Measure the visible opening, then subtract 0.5 in on each side." },
      { title: "Cut and weed", detail: "Watch the insides of letters like a, e, and o — they weed out too." },
      { title: "Apply to the glass front", detail: "Vinyl goes on the outside of the glass so the paper can be swapped later." },
      { title: "Add the paper backing", detail: "Slide patterned paper behind the glass for contrast, then reassemble the frame." },
    ],
    estimatedCostCents: 190,
    suggestedSellPriceCents: 800,
    sellNotes:
      "Faith quotes and senior-year signs sell out at craft fairs. Offer custom wording for +$2.",
  },
  {
    slug: "clear-holiday-ornament",
    title: "Filled holiday ornament",
    summary:
      "Clear fillable ornament, a small vinyl name, and confetti or tinsel inside. Cheap, fast, and a proven fundraiser table item.",
    difficulty: "EASY",
    timeMinutes: 20,
    dollarStoreTag: "Dollar Tree · under $2",
    materials: [
      { name: "Clear fillable ornament", qty: "1", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "2x2 in",
        source: "Club vinyl cart",
        costCents: 30,
        clubSupply: true,
      },
      { name: "Confetti / tinsel filler", qty: "1 pinch", source: "Dollar Tree", costCents: 20 },
      { name: "Ribbon", qty: "8 in", source: "Dollar Tree", costCents: 10 },
    ],
    steps: [
      { title: "Fill first", detail: "Pop the ornament apart, add filler, and reseal before any vinyl touches it." },
      { title: "Cut a small name or year", detail: "Keep it around 1.5 in wide — big decals wrinkle on the sphere." },
      { title: "Apply in sections", detail: "Press the middle down first, then smooth outward to fight the curve." },
      { title: "Tie the ribbon", detail: "Loop through the cap for hanging and knot the ends." },
    ],
    estimatedCostCents: 185,
    suggestedSellPriceCents: 600,
    sellNotes:
      "Seasonal. Sell 2 for $10 in December and keep a name-personalization line at the table.",
  },
  {
    slug: "teacher-appreciation-mug",
    title: "Teacher appreciation mug",
    summary:
      "Dollar-store ceramic mug with a permanent vinyl name, wrapped in a gift bag. A steady staff-gift order every fall and spring.",
    difficulty: "MEDIUM",
    timeMinutes: 40,
    dollarStoreTag: "Dollar Tree · under $3",
    materials: [
      { name: "Ceramic mug", qty: "1", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "3x4 in",
        source: "Club vinyl cart",
        costCents: 50,
        clubSupply: true,
      },
      { name: "Transfer tape", qty: "3x4 in", source: "Club supply", costCents: 15, clubSupply: true },
      { name: "Gift bag + tissue", qty: "1", source: "Dollar Tree", costCents: 35 },
    ],
    steps: [
      { title: "Use permanent vinyl only", detail: "Removable vinyl will not survive washing. Check the roll before cutting." },
      { title: "Cut and weed the name", detail: "Leave the handle side clear so the design sits centered when held." },
      { title: "Prep the mug", detail: "Rubbing alcohol, then let it dry fully — mug glaze holds oils from packaging." },
      { title: "Apply and burnish", detail: "Press hard with the scraper through the transfer tape, especially on the curve." },
      { title: "Cure 24-72 hours", detail: "No washing during cure. Hand wash after; never put it in the dishwasher." },
      { title: "Bag it", detail: "Tissue in the gift bag, mug upright, and a card with the wash instructions." },
    ],
    estimatedCostCents: 225,
    suggestedSellPriceCents: 900,
    sellNotes:
      "Sell as a department bundle: 6 named mugs for $50. Collect the staff list before cutting.",
  },
  {
    slug: "locker-mirror-magnet-set",
    title: "Locker mirror + magnet set",
    summary:
      "A dollar-store locker mirror and magnet pack decaled to match. Easy to batch and easy to sell at lunch.",
    difficulty: "EASY",
    timeMinutes: 30,
    dollarStoreTag: "Dollar Tree · under $4",
    materials: [
      { name: "Locker mirror", qty: "1", source: "Dollar Tree", costCents: 125 },
      { name: "Magnet pack", qty: "1 pack", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "5x5 in",
        source: "Club vinyl cart",
        costCents: 45,
        clubSupply: true,
      },
      { name: "Transfer tape", qty: "5x5 in", source: "Club supply", costCents: 15, clubSupply: true },
    ],
    steps: [
      { title: "Build a matching set", detail: "One name for the mirror plus 3-4 small icons for the magnets." },
      { title: "Cut everything on one mat", detail: "Group the shapes in Design Space so you only load the mat once." },
      { title: "Weed smallest first", detail: "Tiny icons are easiest to lose — weed them before the big name." },
      { title: "Apply to mirror and magnets", detail: "Clean both surfaces; magnets need firm pressure on the painted side." },
    ],
    estimatedCostCents: 310,
    suggestedSellPriceCents: 900,
    sellNotes:
      "Back-to-school week is the window. Sell the mirror alone for $6 and the full set for $9.",
  },
  {
    slug: "wood-welcome-sign",
    title: "Wood welcome door sign",
    summary:
      "Dollar-store wood plaque, craft paint, and a vinyl phrase. The highest-margin build in the catalog and a good officer-led project.",
    difficulty: "MEDIUM",
    timeMinutes: 60,
    dollarStoreTag: "Dollar Tree · under $4",
    materials: [
      { name: "Wood plaque or round", qty: "1", source: "Dollar Tree craft aisle", costCents: 125 },
      { name: "Acrylic craft paint", qty: "2 coats", source: "Dollar Tree", costCents: 125 },
      {
        name: "Permanent adhesive vinyl",
        qty: "6x8 in",
        source: "Club vinyl cart",
        costCents: 70,
        clubSupply: true,
      },
      { name: "Ribbon or jute for hanging", qty: "16 in", source: "Dollar Tree", costCents: 25 },
    ],
    steps: [
      {
        title: "Paint and dry fully",
        detail: "Two thin coats beat one thick coat. Vinyl will not stick to paint that is still tacky — allow 2 hours.",
      },
      { title: "Cut the phrase", detail: "Keep letters at least 0.75 in tall so they survive weeding and outdoor wear." },
      { title: "Weed and tape", detail: "Use transfer tape for multi-word phrases so spacing stays exact." },
      { title: "Apply to the plaque", detail: "Center by measuring, not eyeballing. Burnish hard over the wood grain." },
      { title: "Seal (optional)", detail: "A clear top coat makes it porch-safe. Skip it for indoor signs." },
      { title: "Add the hanger", detail: "Knot ribbon through the pre-drilled holes or hot glue jute to the back." },
    ],
    estimatedCostCents: 345,
    suggestedSellPriceCents: 1500,
    sellNotes:
      "Custom family names sell for $18-$20. Take orders with a deposit since each one is one-of-a-kind.",
  },
  {
    slug: "party-favor-treat-boxes",
    title: "Party favor treat boxes (set of 6)",
    summary:
      "Six kraft boxes with cut cardstock toppers and vinyl labels. Sells as a set, so one build covers a whole party order.",
    difficulty: "MEDIUM",
    timeMinutes: 45,
    dollarStoreTag: "Dollar Tree · under $4 per set",
    materials: [
      { name: "Kraft treat boxes", qty: "6", source: "Dollar Tree", costCents: 250 },
      { name: "Cardstock", qty: "2 sheets", source: "Dollar Tree", costCents: 60, clubSupply: true },
      {
        name: "Permanent adhesive vinyl",
        qty: "4x6 in",
        source: "Club vinyl cart",
        costCents: 60,
        clubSupply: true,
      },
    ],
    steps: [
      { title: "Cut the cardstock toppers", detail: "Cardstock setting with a fine-point blade. Use the light-grip mat." },
      { title: "Cut the vinyl labels", detail: "Six identical labels — duplicate the design and let Design Space nest them." },
      { title: "Assemble the boxes", detail: "Fold along the scored lines first so the corners stay square." },
      { title: "Label each box", detail: "Center the vinyl on the lid, then glue the cardstock topper on top." },
      { title: "Package the set", detail: "Stack all six and band them together so it sells as one unit." },
    ],
    estimatedCostCents: 370,
    suggestedSellPriceCents: 1200,
    sellNotes:
      "Priced per set of 6. Birthday and baby shower orders often want 12-24 — quote in multiples.",
  },
];

/** Profit math shared by the sell panel and the shop hand-off. */
export function cricutProjectMargin(
  estimatedCostCents: number,
  sellPriceCents: number,
): { profitCents: number; marginPercent: number; multiple: number } {
  const profitCents = sellPriceCents - estimatedCostCents;
  const marginPercent =
    sellPriceCents > 0 ? Math.round((profitCents / sellPriceCents) * 100) : 0;
  const multiple =
    estimatedCostCents > 0
      ? Math.round((sellPriceCents / estimatedCostCents) * 10) / 10
      : 0;
  return { profitCents, marginPercent, multiple };
}

/** Sum of every material line — used to sanity check a hand-entered total. */
export function cricutMaterialsTotalCents(
  materials: CricutProjectMaterial[],
): number {
  return materials.reduce((total, material) => total + (material.costCents || 0), 0);
}
