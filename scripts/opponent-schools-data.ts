/**
 * Opponent directory import manifest — Broadcasting's Sports desk.
 *
 * Source art came from Lisa as a ZIP of numbered slide exports ("13.png" …
 * "42.png") with no folder structure, so school identity was read off each
 * slide's own artwork and caption. `sourceFile` records that mapping.
 *
 * `mascot` is only filled in where the provided artwork states it outright (mark
 * text like "SEMINOLES"/"Blue Eagles", or an unmistakable mascot figure). City
 * and state are deliberately left blank rather than guessed — Lisa can add them
 * from the Sports desk edit form.
 */

export type OpponentSchoolSeed = {
  /** File name inside the source ZIP this mark came from. */
  sourceFile: string;
  /** Stable slug — also the committed logo filename and storage object name. */
  slug: string;
  name: string;
  shortName: string;
  mascot?: string;
  notes?: string;
  /** Event/organisation marks get no per-sport teams. */
  skipSportLinking?: boolean;
};

/**
 * Sports every imported school is linked to, so Lisa can pick an opponent the
 * moment she schedules a game. Extra teams are removable per chip in the
 * Opponent directory; a missing one blocks scheduling entirely, so we err
 * toward linking.
 */
export const CORE_SPORT_SLUGS = [
  "football",
  "volleyball",
  "boys-basketball",
  "girls-basketball",
  "baseball",
  "softball",
] as const;

export const OPPONENT_SCHOOLS: OpponentSchoolSeed[] = [
  {
    sourceFile: "13.png",
    slug: "shenandoah",
    name: "Shenandoah High School",
    shortName: "Shenandoah",
    mascot: "Zeps",
  },
  {
    sourceFile: "14.png",
    slug: "beaver-local",
    name: "Beaver Local High School",
    shortName: "Beaver Local",
  },
  {
    sourceFile: "15.png",
    slug: "leetonia",
    name: "Leetonia High School",
    shortName: "Leetonia",
  },
  {
    sourceFile: "16.png",
    slug: "steubenville-catholic-central",
    name: "Steubenville Catholic Central High School",
    shortName: "Steubenville CC",
  },
  {
    sourceFile: "17.png",
    slug: "buckeye-local",
    name: "Buckeye Local High School",
    shortName: "Buckeye Local",
  },
  {
    sourceFile: "18.png",
    slug: "east-liverpool",
    name: "East Liverpool High School",
    shortName: "East Liverpool",
  },
  {
    sourceFile: "19.png",
    slug: "trinity-christian",
    name: "Trinity Christian School",
    shortName: "Trinity Christian",
  },
  {
    sourceFile: "20.png",
    slug: "southern-local",
    name: "Southern Local High School",
    shortName: "Southern Local",
  },
  {
    sourceFile: "21.png",
    slug: "monroe-central",
    name: "Monroe Central High School",
    shortName: "Monroe Central",
    mascot: "Seminoles",
  },
  {
    sourceFile: "22.png",
    slug: "magnolia",
    name: "Magnolia High School",
    shortName: "Magnolia",
    mascot: "Blue Eagles",
  },
  {
    sourceFile: "23.png",
    slug: "union-local",
    name: "Union Local High School",
    shortName: "Union Local",
  },
  {
    sourceFile: "24.png",
    slug: "river",
    name: "River High School",
    shortName: "River",
    mascot: "Pilots",
  },
  {
    sourceFile: "25.png",
    slug: "valley-wetzel",
    name: "Valley High School (Wetzel)",
    shortName: "Valley Wetzel",
  },
  {
    sourceFile: "26.png",
    slug: "bridgeport",
    name: "Bridgeport High School",
    shortName: "Bridgeport",
    mascot: "Bulldogs",
  },
  {
    sourceFile: "27.png",
    slug: "toronto",
    name: "Toronto High School",
    shortName: "Toronto",
  },
  {
    sourceFile: "28.png",
    slug: "cameron",
    name: "Cameron High School",
    shortName: "Cameron",
  },
  {
    sourceFile: "29.png",
    slug: "clarksburg-notre-dame",
    name: "Notre Dame High School (Clarksburg)",
    shortName: "Clarksburg ND",
  },
  {
    sourceFile: "30.png",
    slug: "wellsville",
    name: "Wellsville High School",
    shortName: "Wellsville",
  },
  {
    sourceFile: "31.png",
    slug: "oak-glen",
    name: "Oak Glen High School",
    shortName: "Oak Glen",
  },
  {
    sourceFile: "32.png",
    slug: "brooke",
    name: "Brooke High School",
    shortName: "Brooke",
  },
  {
    sourceFile: "33.png",
    slug: "martins-ferry",
    name: "Martins Ferry High School",
    shortName: "Martins Ferry",
  },
  {
    sourceFile: "34.png",
    slug: "wheeling-central-catholic",
    name: "Wheeling Central Catholic High School",
    shortName: "Wheeling Central",
  },
  {
    sourceFile: "35.png",
    slug: "linsly",
    name: "The Linsly School",
    shortName: "Linsly",
  },
  {
    sourceFile: "36.png",
    slug: "heartland-christian",
    name: "Heartland Christian School",
    shortName: "Heartland Christian",
  },
  {
    sourceFile: "37.png",
    slug: "jefferson-county-christian",
    name: "Jefferson County Christian School",
    shortName: "Jefferson County Christian",
  },
  {
    sourceFile: "38.png",
    slug: "burgettstown",
    name: "Burgettstown High School",
    shortName: "Burgettstown",
    mascot: "Blue Devils",
  },
  {
    sourceFile: "39.png",
    slug: "st-marys",
    name: "St. Mary's High School",
    shortName: "St. Mary's",
  },
  {
    sourceFile: "40.png",
    slug: "tyler-consolidated",
    name: "Tyler Consolidated High School",
    shortName: "Tyler Consolidated",
    mascot: "Knights",
  },
  {
    sourceFile: "41.png",
    slug: "wood-county-christian",
    name: "Wood County Christian School",
    shortName: "Wood County Christian",
  },
  {
    sourceFile: "42.png",
    slug: "ssac-regionals",
    name: "SSAC Regionals",
    shortName: "SSAC Regionals",
    notes:
      "Event mark from the opponent logo ZIP, not a school — useful as a postseason placeholder when the regional opponent is still TBD. Archive it if you don't want it in the directory.",
    skipSportLinking: true,
  },
];
