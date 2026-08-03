export type DiscoveryItem = {
  key: string;
  emoji: string;
  label: string;
  title: string;
  body: string;
};

const SAINTS: Omit<DiscoveryItem, "key" | "emoji" | "label">[] = [
  { title: "St. Thomas Aquinas", body: "Patron of students — “Wonder is the desire for knowledge.”" },
  { title: "St. Isidore of Seville", body: "Patron of the internet and technology students." },
  { title: "St. Frances Cabrini", body: "Fearless builder who served immigrants across the world." },
  { title: "St. Kateri Tekakwitha", body: "Lily of the Mohawks, patron of ecology and youth." },
  { title: "Bl. Carlo Acutis", body: "Teen who used coding to share his faith online." },
  { title: "St. Joseph of Cupertino", body: "Patron of students taking tests — pray for focus and calm." },
  { title: "St. Catherine of Siena", body: "Doctor of the Church who spoke truth with courage." },
  { title: "St. John Bosco", body: "Patron of youth — educated and mentored young people in faith." },
  { title: "St. Elizabeth Ann Seton", body: "First American-born saint; founded Catholic schools for girls." },
  { title: "St. Maximilian Kolbe", body: "Gave his life for another prisoner at Auschwitz." },
];

const BRAIN_GAMES: Omit<DiscoveryItem, "key" | "emoji" | "label">[] = [
  { title: "Math · Logic", body: "A pizza has 8 slices. You eat 3 and share 2. How many remain? (Three.)" },
  { title: "History · Trivia", body: "In what year was the Declaration of Independence signed? (1776.)" },
  { title: "Geography · Trivia", body: "What is the capital of Australia? (Canberra — not Sydney!)" },
  { title: "Science · Trivia", body: "What is the chemical symbol for gold? (Au, from the Latin aurum.)" },
  { title: "Literature · Trivia", body: "Who wrote Romeo and Juliet? (William Shakespeare.)" },
  { title: "Music · Trivia", body: "How many lines are on a standard musical staff? (Five.)" },
  { title: "Sports · Trivia", body: "How many players from one team are on a basketball court? (Five.)" },
  { title: "Civics · Trivia", body: "Name the three branches of the U.S. government. (Legislative, executive, judicial.)" },
  { title: "Madonna · Trivia", body: "What is Madonna's mascot? (The Blue Dons — and Lady Dons.)" },
  { title: "Arts · Riddle", body: "I hold colors but never paint. Artists open me every day. (A palette.)" },
  { title: "Health · Trivia", body: "Teens need about how many hours of sleep per night? (8–10 hours.)" },
  { title: "Word · Scramble", body: "Unscramble: YROTHSI → HISTORY." },
  { title: "Pattern · Math", body: "2, 4, 8, 16, 32 — what's next? (64: multiply by 2.)" },
  { title: "Geography · Riddle", body: "I have cities but no houses, forests but no trees. What am I? (A map.)" },
  { title: "Science · Logic", body: "Water freezes at 0°C. At what temperature does it boil? (100°C.)" },
  { title: "Literature · Riddle", body: "I'm passed from page to page but never walk. What am I? (A story.)" },
  { title: "History · Logic", body: "If the Civil War ended in 1865, how many years ago was that in 2025? (160.)" },
  { title: "General · Riddle", body: "The more you take, the more you leave behind. What are they? (Footsteps.)" },
  { title: "Math · Trivia", body: "How many degrees are in the angles of a triangle? (180.)" },
  { title: "School · Trivia", body: "What does GPA stand for? (Grade Point Average.)" },
];

const FUN_FACTS: Omit<DiscoveryItem, "key" | "emoji" | "label">[] = [
  { title: "Science", body: "Honey never spoils — 3,000-year-old jars found in tombs are still edible." },
  { title: "Space", body: "A day on Venus is longer than its year." },
  { title: "Body", body: "Your brain uses about 20% of your body's energy." },
  { title: "History", body: "The shortest war in history lasted 38 minutes (Britain vs. Zanzibar, 1896)." },
  { title: "Geography", body: "Russia spans 11 time zones — more than any other country." },
  { title: "Literature", body: "The longest novel ever published in a single volume has over 2 million words." },
  { title: "Music", body: "Mozart composed his first piece of music at age five." },
  { title: "Sports", body: "A regulation marathon is exactly 26.2 miles — a distance set for the 1908 Olympics." },
  { title: "Arts", body: "The Mona Lisa has no eyebrows — a common style in Renaissance portraits." },
  { title: "Civics", body: "The U.S. Constitution is the oldest written national constitution still in use." },
  { title: "Health", body: "Laughing boosts your immune system and lowers stress hormones." },
  { title: "Nature", body: "Octopuses have three hearts and blue blood." },
  { title: "Math", body: "Zero was independently invented in multiple ancient cultures, including India and the Maya." },
  { title: "School", body: "The word “salary” comes from the Latin salarium — salt money paid to Roman soldiers." },
  { title: "Madonna", body: "Madonna High School's Blue Don spirit traces back decades of Ohio Valley pride." },
  { title: "Career", body: "Registered nurses are among the most in-demand careers in the U.S. right now." },
  { title: "Technology", body: "The first computer bug was a real moth, found in a Harvard Mark II in 1947." },
  { title: "Language", body: "English has more words than any other language — over 170,000 in current use." },
  { title: "Faith", body: "The Hail Mary prayer appears in many languages — a shared prayer across cultures." },
  { title: "Environment", body: "Recycling one aluminum can saves enough energy to run a TV for three hours." },
];

const CAREERS: Omit<DiscoveryItem, "key" | "emoji" | "label">[] = [
  { title: "Registered Nurse", body: "Caring + science. Explore the health pathway in Future Center." },
  { title: "Teacher", body: "Shapes young minds daily. Start with tutoring, peer mentoring, or education clubs." },
  { title: "Electrician", body: "Skilled trade in high demand. Explore apprenticeships through the Trade Passport." },
  { title: "Graphic Designer", body: "Turns ideas into visuals — try the Art Club and design labs." },
  { title: "Social Worker", body: "Helps families and communities thrive. Pair service hours with psychology coursework." },
  { title: "Journalist", body: "Tells stories that matter. Build skills in Broadcasting and the school newspaper." },
  { title: "Physical Therapist", body: "Helps people recover and move. Combines biology, anatomy, and compassion." },
  { title: "Architect", body: "Designs spaces people live and learn in. Strong math, art, and problem-solving." },
  { title: "Veterinarian", body: "Cares for animals with science and heart. Start with biology and volunteer hours." },
  { title: "Chef", body: "Creates food and runs kitchens. Culinary arts blends creativity with chemistry." },
  { title: "Firefighter", body: "Serves the community under pressure. Explore EMT and first-responder pathways." },
  { title: "Counselor", body: "Guides students through challenges. Psychology and active listening are key." },
  { title: "Mechanical Engineer", body: "Designs machines and systems. Strong in math and physics — try Robotics." },
  { title: "Broadcast Producer", body: "Runs live shows — build the skills in Broadcasting." },
  { title: "Cybersecurity Analyst", body: "Protects networks — start in IT Club if technology interests you." },
];

const WORDS: Omit<DiscoveryItem, "key" | "emoji" | "label">[] = [
  { title: "Perseverance", body: "(n.) steadfastness in doing something despite difficulty." },
  { title: "Magnanimous", body: "(adj.) generous or forgiving, especially toward a rival." },
  { title: "Diligence", body: "(n.) careful and persistent work or effort." },
  { title: "Fortitude", body: "(n.) courage in pain or adversity." },
  { title: "Ingenuity", body: "(n.) the quality of being clever, original, and inventive." },
  { title: "Empathy", body: "(n.) the ability to understand and share another person's feelings." },
  { title: "Integrity", body: "(n.) honesty and strong moral principles." },
  { title: "Resilience", body: "(n.) the capacity to recover quickly from difficulties." },
  { title: "Curiosity", body: "(n.) a strong desire to know or learn something." },
  { title: "Gratitude", body: "(n.) the quality of being thankful; readiness to show appreciation." },
];

const GOOD_NEWS: Omit<DiscoveryItem, "key" | "emoji" | "label">[] = [
  { title: "Service", body: "Interact Club logged 200+ service hours last month!" },
  { title: "Robotics", body: "The robotics team advanced to the regional finals." },
  { title: "Kindness", body: "Students filled 3 pantry shelves during the food drive." },
  { title: "Spirit", body: "Record turnout at Friday's home game — go Blue Dons!" },
  { title: "Choir", body: "The Christmas Concert drew a standing-room-only crowd last weekend." },
  { title: "Academics", body: "32 students made honor roll this quarter — congratulations!" },
  { title: "Arts", body: "The spring art show featured 40 student pieces in the gallery." },
  { title: "Athletics", body: "Girls' cross country placed 2nd at the district meet." },
  { title: "Faith", body: "Campus Ministry led a successful winter clothing drive." },
  { title: "Leadership", body: "Student Council organized the best-attended pep rally in five years." },
];

type DiscoveryContent = Omit<DiscoveryItem, "key" | "emoji" | "label">;

export type DiscoveryCategory = {
  key: string;
  emoji: string;
  label: string;
  /** Short blurb describing what this category is about. */
  blurb: string;
  /**
   * True when the pool represents fabricated *school activity* (e.g. real-looking
   * club/team wins). Gated behind clean slate so a fresh launch doesn't present
   * made-up campus data as real. Evergreen learning content stays visible.
   */
  demo?: boolean;
  items: DiscoveryContent[];
};

/**
 * The full content pool for Daily Discovery, one entry per category.
 * `getDailyDiscovery` picks today's card from each; the hub can also browse the
 * whole pool per category.
 */
export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  {
    key: "saint",
    emoji: "✝️",
    label: "Saint of the Day",
    blurb: "A patron and their story, connected to Madonna's mission.",
    items: SAINTS,
  },
  {
    key: "brain",
    emoji: "🧠",
    label: "Brain Game",
    blurb: "A daily riddle, puzzle, or trivia question — reveal the answer when ready.",
    items: BRAIN_GAMES,
  },
  {
    key: "fact",
    emoji: "🌎",
    label: "Fun Fact",
    blurb: "Something surprising from science, history, space, and beyond.",
    items: FUN_FACTS,
  },
  {
    key: "career",
    emoji: "🎓",
    label: "Career Spotlight",
    blurb: "A real-world career and how to start exploring it at Madonna.",
    items: CAREERS,
  },
  {
    key: "word",
    emoji: "📖",
    label: "Word of the Day",
    blurb: "Build your vocabulary one word at a time.",
    items: WORDS,
  },
  {
    key: "news",
    emoji: "❤️",
    label: "Good News",
    blurb: "Positive stories and wins from around campus.",
    demo: true,
    items: GOOD_NEWS,
  },
];

function dayIndex(date: Date, length: number): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return dayOfYear % length;
}

/** Deterministic daily rotation so every student sees the same content each day. */
export function getDailyDiscovery(date: Date = new Date()): DiscoveryItem[] {
  return DISCOVERY_CATEGORIES.map((category) => {
    const item = category.items[dayIndex(date, category.items.length)];
    return {
      key: category.key,
      emoji: category.emoji,
      label: category.label,
      ...item,
    };
  });
}

/**
 * Splits a Brain Game body into its prompt and answer so the answer can stay
 * hidden until a student chooses to reveal it. Answers are authored either as a
 * trailing parenthetical — "…? (Answer.)" — or after an arrow — "… → ANSWER".
 * Falls back to no answer when neither pattern is present.
 */
export function splitBrainGame(body: string): { prompt: string; answer: string | null } {
  const paren = body.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  if (paren) {
    return { prompt: paren[1].trim(), answer: paren[2].trim() };
  }

  const arrow = body.match(/^(.*?)\s*(?:→|->)\s*(.+?)\s*$/);
  if (arrow) {
    return { prompt: arrow[1].trim(), answer: arrow[2].trim() };
  }

  return { prompt: body, answer: null };
}
