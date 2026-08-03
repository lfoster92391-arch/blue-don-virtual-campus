/**
 * Weirton Madonna High School — history timeline.
 *
 * A milestone-by-milestone story of the Blue Dons and Lady Dons from the
 * school's opening in the summer of 1955 (dedicated August 15, 1955) through a
 * seven-decade celebration in 2026. The timeline is intentionally weighted
 * toward athletics and school life (theater, music, academics, faith, and
 * campus traditions), with technology kept to a single milestone — the move to
 * 1:1 Chromebooks.
 *
 * ⚠️ PLACEHOLDER CONTENT — please verify against school records.
 * Weirton Madonna's mascots are the **Blue Dons** (men's teams) and the
 * **Lady Dons** (women's teams). Because we do not have verified archival
 * data, the specific seasons, championships, titles, and dates below are
 * realistic *sample* entries written in a news-clipping style. School staff
 * should correct years, results, and details to match the official history.
 * Each entry is a plain object, so edits are safe and self-contained.
 *
 * Image strategy: `imageSrc` points at lightweight SVG placeholders in
 * `public/images/timeline/`, named predictably (e.g.
 * `madonna-1955-original.svg`, `madonna-2024-state-champions.svg`). To use real
 * photos later, replace the SVG in place or add a real `.jpg`/`.png` with the
 * same base name and update `imageSrc`. `imageAlt` describes the intended
 * archival photo for accessibility, and `source`/`headline` let entries read
 * like newspaper clippings.
 */

export type MadonnaTimelineCategory =
  | "founding"
  | "faith"
  | "academics"
  | "athletics"
  | "campus"
  | "arts";

export type MadonnaTimelineEntry = {
  /** Numeric year, used for sorting and as a stable key. */
  year: number;
  /** Human-friendly date label shown on the node and in the jump menu. */
  dateLabel: string;
  /** Short title used in the accordion header and jump menu. */
  title: string;
  /** Optional newspaper-style headline shown at the top of the expanded panel. */
  headline?: string;
  /** Optional attribution shown like a clipping byline (placeholder). */
  source?: string;
  /** Article-style blurb describing the milestone. */
  description: string;
  /** Path (relative to /public) to the milestone photo or placeholder. */
  imageSrc: string;
  /** Accessible description of the intended archival photo. */
  imageAlt: string;
  category: MadonnaTimelineCategory;
  /** Marks the origin node (school opening). */
  isStart?: boolean;
};

export const MADONNA_TIMELINE_CATEGORY_LABELS: Record<MadonnaTimelineCategory, string> = {
  founding: "Founding",
  faith: "Faith",
  academics: "Academics",
  athletics: "Athletics",
  campus: "Campus Life",
  arts: "Arts",
};

export const MADONNA_TIMELINE: MadonnaTimelineEntry[] = [
  {
    year: 1955,
    dateLabel: "Summer 1955 · Dedicated Aug 15, 1955",
    title: "Weirton Madonna Opens Its Doors",
    headline: "Weirton Welcomes Madonna High School",
    source: "From the school archives (placeholder)",
    description:
      "Madonna High School officially opened in the summer of 1955 to serve the Catholic families of Weirton, West Virginia, with its formal dedication on the Feast of the Assumption, August 15, 1955. From day one the school was built on faith, academic excellence, and a spirit that would come to be known across the Ohio Valley as the Blue Dons and Lady Dons.",
    imageSrc: "/images/timeline/madonna-1955-original.svg",
    imageAlt:
      "Archival photo placeholder of the original Weirton Madonna High School building as it appeared when it first opened in 1955.",
    category: "founding",
    isStart: true,
  },
  {
    year: 1956,
    dateLabel: "1956–57 School Year",
    title: "The Blue Dons Take the Field",
    headline: "Blue Dons Debut on the Gridiron and Hardwood",
    source: "Ohio Valley sports desk (placeholder)",
    description:
      "In their earliest seasons, Madonna's teams adopted the Blue Dons name and colors and began competing across the region. Friday night football and packed-gym basketball quickly became the heartbeat of the young school's community.",
    imageSrc: "/images/timeline/madonna-1956-first-teams.svg",
    imageAlt:
      "Archival photo placeholder of an early Weirton Madonna Blue Dons team lining up in the mid-1950s.",
    category: "athletics",
  },
  {
    year: 1959,
    dateLabel: "Spring 1959",
    title: "First Graduating Class",
    headline: "Madonna Sends Forth Its First Graduates",
    source: "Commencement program (placeholder)",
    description:
      "Madonna's inaugural senior class received their diplomas, launching a legacy of Blue Don and Lady Don alumni who would carry the school's faith and values into the wider world.",
    imageSrc: "/images/timeline/madonna-1959-first-graduates.svg",
    imageAlt:
      "Archival photo placeholder of Weirton Madonna's first graduating class in cap and gown, 1959.",
    category: "founding",
  },
  {
    year: 1962,
    dateLabel: "Winter 1962",
    title: "First Sectional Basketball Title",
    headline: "Blue Dons Capture First Sectional Basketball Crown",
    source: "Weirton sports pages (placeholder)",
    description:
      "The Blue Dons boys' basketball team is remembered for an early sectional championship run, filling the gym with blue and gold and putting Madonna hoops on the Ohio Valley map. (Season and result to be confirmed from school records.)",
    imageSrc: "/images/timeline/madonna-1962-boys-basketball.svg",
    imageAlt:
      "Archival photo placeholder of the early-1960s Weirton Madonna Blue Dons boys' basketball team celebrating a sectional title.",
    category: "athletics",
  },
  {
    year: 1965,
    dateLabel: "Fall 1965",
    title: "Friday Night Football Rivalries",
    headline: "Blue Dons Football Ignites Ohio Valley Rivalries",
    source: "Local prep football roundup (placeholder)",
    description:
      "Blue Dons football grew into a Friday night tradition, with hard-fought games against area rivals drawing generations of fans. The marching band, cheer squad, and student section made Madonna home games a community event.",
    imageSrc: "/images/timeline/madonna-1965-football.svg",
    imageAlt:
      "Archival photo placeholder of a 1960s Weirton Madonna Blue Dons football game under the lights.",
    category: "athletics",
  },
  {
    year: 1968,
    dateLabel: "1968",
    title: "The Student Newspaper Debuts",
    headline: "Blue Don Chronicle Hits the Hallways",
    source: "Student press (placeholder)",
    description:
      "Student journalists launched Madonna's newspaper, chronicling games, plays, clubs, and campus life for their classmates — an early home for the storytellers who would keep Blue Don history alive.",
    imageSrc: "/images/timeline/madonna-1968-chronicle.svg",
    imageAlt:
      "Archival photo placeholder of students producing the Weirton Madonna student newspaper in 1968.",
    category: "campus",
  },
  {
    year: 1972,
    dateLabel: "1972",
    title: "The Lady Dons Rise",
    headline: "Lady Dons Take the Court as Girls' Athletics Expand",
    source: "Prep sports feature (placeholder)",
    description:
      "As opportunities for girls' athletics expanded, the Lady Dons fielded competitive teams in basketball, volleyball, and track. Their grit and success added a proud new chapter to Madonna's sports tradition. (Exact program dates to be verified.)",
    imageSrc: "/images/timeline/madonna-1972-lady-dons.svg",
    imageAlt:
      "Archival photo placeholder of an early 1970s Weirton Madonna Lady Dons team.",
    category: "athletics",
  },
  {
    year: 1974,
    dateLabel: "January 1974",
    title: "Catholic Schools Week Begins",
    headline: "Madonna Joins National Catholic Schools Week",
    source: "Diocesan bulletin (placeholder)",
    description:
      "Madonna joined the national Catholic Schools Week celebration, deepening a community identity of faith, service, and gratitude that continues every January with Mass, service projects, and student appreciation.",
    imageSrc: "/images/timeline/madonna-1974-catholic-schools-week.svg",
    imageAlt:
      "Archival photo placeholder of a 1970s Catholic Schools Week Mass at Weirton Madonna.",
    category: "faith",
  },
  {
    year: 1978,
    dateLabel: "December 1978",
    title: "Bands and Voices Unite",
    headline: "Choir and Band Join for First Christmas Concert",
    source: "Fine arts program (placeholder)",
    description:
      "The choir and band combined for a Christmas Concert that filled the gym with carols for families and the Weirton community — a beloved fine-arts tradition that still opens the holiday season each December.",
    imageSrc: "/images/timeline/madonna-1978-christmas-concert.svg",
    imageAlt:
      "Archival photo placeholder of the Weirton Madonna choir and band at a late-1970s Christmas Concert.",
    category: "arts",
  },
  {
    year: 1982,
    dateLabel: "Fall 1982",
    title: "Lady Dons Volleyball Surge",
    headline: "Lady Dons Volleyball Spikes to a Regional Crown",
    source: "Weirton sports pages (placeholder)",
    description:
      "A standout Lady Dons volleyball squad is remembered for a deep postseason run and a regional title, energizing the fall sports calendar. (Season and result to be confirmed from school records.)",
    imageSrc: "/images/timeline/madonna-1982-volleyball.svg",
    imageAlt:
      "Archival photo placeholder of the early-1980s Weirton Madonna Lady Dons volleyball team.",
    category: "athletics",
  },
  {
    year: 1985,
    dateLabel: "1985",
    title: "A New Home Gym Opens",
    headline: "New Gymnasium Opens as the House of the Blue Dons",
    source: "Dedication program (placeholder)",
    description:
      "A new gymnasium and athletic complex was dedicated, giving the Blue Dons and Lady Dons a true home court for basketball, volleyball, pep rallies, and packed-house Friday nights.",
    imageSrc: "/images/timeline/madonna-1985-gymnasium.svg",
    imageAlt:
      "Archival photo placeholder of the Weirton Madonna gymnasium dedicated in 1985.",
    category: "campus",
  },
  {
    year: 1991,
    dateLabel: "Spring 1991",
    title: "Blue Dons Baseball State Run",
    headline: "Blue Dons Baseball Makes a State Tournament Run",
    source: "Prep baseball coverage (placeholder)",
    description:
      "The Blue Dons baseball team is remembered for a memorable spring that carried them into the state tournament conversation, powered by clutch pitching and timely hitting. (Season and result to be verified.)",
    imageSrc: "/images/timeline/madonna-1991-baseball.svg",
    imageAlt:
      "Archival photo placeholder of the early-1990s Weirton Madonna Blue Dons baseball team.",
    category: "athletics",
  },
  {
    year: 1995,
    dateLabel: "Spring 1995",
    title: "Alumni Weekend Launched",
    headline: "Blue Dons of Every Decade Return Home",
    source: "Alumni Office (placeholder)",
    description:
      "The first formal Alumni Weekend welcomed graduates back to Weirton for reunions, campus tours, and a chance to swap stories of Blue Don and Lady Don glory days — keeping the Madonna family connected across generations.",
    imageSrc: "/images/timeline/madonna-1995-alumni-weekend.svg",
    imageAlt:
      "Archival photo placeholder of alumni gathering on campus for the first Weirton Madonna Alumni Weekend in 1995.",
    category: "campus",
  },
  {
    year: 1998,
    dateLabel: "Spring 1998",
    title: "Drama Club Takes the Stage",
    headline: "Madonna Drama Stages an Ambitious Spring Musical",
    source: "Fine arts review (placeholder)",
    description:
      "Madonna's drama and music students earned standing ovations for an ambitious spring musical, showcasing the school's growing theater tradition alongside its athletic pride.",
    imageSrc: "/images/timeline/madonna-1998-drama.svg",
    imageAlt:
      "Archival photo placeholder of a late-1990s Weirton Madonna drama club stage production.",
    category: "arts",
  },
  {
    year: 2004,
    dateLabel: "Spring 2004",
    title: "State Track Medalists",
    headline: "Blue Dons and Lady Dons Sprint to State Track Medals",
    source: "Track & field results (placeholder)",
    description:
      "Madonna runners and field athletes brought home medals from the state track meet, adding individual honors to the school's team accomplishments. (Athletes and events to be confirmed from records.)",
    imageSrc: "/images/timeline/madonna-2004-track.svg",
    imageAlt:
      "Archival photo placeholder of Weirton Madonna track athletes competing at a state meet in 2004.",
    category: "athletics",
  },
  {
    year: 2009,
    dateLabel: "Winter 2009",
    title: "Lady Dons Basketball Breakthrough",
    headline: "Lady Dons Basketball Reaches the State Semifinals",
    source: "Prep hoops coverage (placeholder)",
    description:
      "A talented Lady Dons basketball team is remembered for a deep playoff run to the state semifinals, drawing raucous student sections and community bus caravans. (Season and result to be verified.)",
    imageSrc: "/images/timeline/madonna-2009-lady-dons-basketball.svg",
    imageAlt:
      "Archival photo placeholder of the 2009 Weirton Madonna Lady Dons basketball team.",
    category: "athletics",
  },
  {
    year: 2013,
    dateLabel: "Fall 2013",
    title: "Blue Dons Football Playoff Berth",
    headline: "Blue Dons Football Clinches a Playoff Berth",
    source: "Local prep football roundup (placeholder)",
    description:
      "Behind a hard-nosed defense and a raucous home crowd, the Blue Dons football team earned a postseason berth, reviving Friday night excitement for a new generation of fans. (Season and result to be confirmed.)",
    imageSrc: "/images/timeline/madonna-2013-football-playoff.svg",
    imageAlt:
      "Archival photo placeholder of the 2013 Weirton Madonna Blue Dons football team.",
    category: "athletics",
  },
  {
    year: 2016,
    dateLabel: "2016",
    title: "Classrooms Go 1:1 with Chromebooks",
    headline: "Every Student Receives a Chromebook",
    source: "Academic office (placeholder)",
    description:
      "Madonna moved to a 1:1 device model, putting a Chromebook in the hands of every student. Framed as a simple learning shift, it helped teachers blend classic instruction with digital resources — the one big technology step in the school's story.",
    imageSrc: "/images/timeline/madonna-2016-chromebooks.svg",
    imageAlt:
      "Archival photo placeholder of Weirton Madonna students using Chromebooks in class around 2016.",
    category: "academics",
  },
  {
    year: 2021,
    dateLabel: "2021",
    title: "The Blue Dons Return to Play",
    headline: "Blue Dons and Lady Dons Return to Competition",
    source: "Athletics department (placeholder)",
    description:
      "After a challenging pause, Madonna's teams returned to the field, court, and track. The reunions of players, families, and fans were a reminder of how much the Blue Don and Lady Don community means to Weirton.",
    imageSrc: "/images/timeline/madonna-2021-return-to-play.svg",
    imageAlt:
      "Archival photo placeholder of Weirton Madonna athletes and fans celebrating a return to competition in 2021.",
    category: "athletics",
  },
  {
    year: 2024,
    dateLabel: "2024",
    title: "A New Championship Banner",
    headline: "Blue Dons Bring Home a State Championship Banner",
    source: "State tournament coverage (placeholder)",
    description:
      "A Madonna team is celebrated here for raising a state championship banner in the rafters — a crowning achievement for the athletes, coaches, and fans. (Sport, season, and result are placeholders to be verified from school records.)",
    imageSrc: "/images/timeline/madonna-2024-state-champions.svg",
    imageAlt:
      "Archival photo placeholder of a Weirton Madonna team celebrating a state championship in 2024.",
    category: "athletics",
  },
  {
    year: 2026,
    dateLabel: "2026",
    title: "Seven Decades of Blue Don Pride",
    headline: "Blue Dons Celebrate More Than 70 Years of Faith and Excellence",
    source: "Anniversary celebration (placeholder)",
    description:
      "From the original 1955 building to a proud community of alumni around the world, Madonna marks more than seven decades of faith, academics, arts, and Blue Don and Lady Don athletics — honoring the past while cheering on the next generation.",
    imageSrc: "/images/timeline/madonna-2026-anniversary.svg",
    imageAlt:
      "Archival photo placeholder celebrating more than seventy years of Weirton Madonna in 2026.",
    category: "campus",
  },
];

export function getMadonnaTimeline(): MadonnaTimelineEntry[] {
  return [...MADONNA_TIMELINE].sort((a, b) => a.year - b.year);
}
