/**
 * W18 · School Culture & Traditions — seed data for Madonna's digital heartbeat.
 */

export type TraditionDetail = {
  slug: string;
  name: string;
  emoji: string;
  season: string;
  tagline: string;
  history: string;
  currentYear: {
    dates: string;
    theme?: string;
    highlights: string[];
  };
  timeline: { year: string; event: string }[];
  memories: { author: string; quote: string; year?: string }[];
  winners?: { year: string; name: string; category: string }[];
  gallery: { caption: string; category: string }[];
  videos: { title: string; duration: string }[];
};

export type HistoryEvent = {
  year: number;
  title: string;
  description: string;
  category: "founding" | "faith" | "academics" | "athletics" | "technology" | "campus";
};

export type HallCategory =
  | "academic"
  | "service"
  | "leadership"
  | "technology"
  | "broadcasting"
  | "fine-arts"
  | "athletics"
  | "faith"
  | "alumni";

export const HALL_CATEGORY_LABELS: Record<HallCategory, string> = {
  academic: "Academic",
  service: "Service",
  leadership: "Leadership",
  technology: "Technology",
  broadcasting: "Broadcasting",
  "fine-arts": "Fine Arts",
  athletics: "Athletics",
  faith: "Faith",
  alumni: "Alumni",
};

export type HallInductee = {
  id: string;
  name: string;
  hall: HallCategory;
  inducteeYear: number;
  classYear?: string;
  bio: string;
  accomplishments: string[];
  advice: string;
  photoLabel: string;
};

export type FacultyMember = {
  slug: string;
  name: string;
  title: string;
  department: string;
  education: string[];
  courses: string[];
  clubs: string[];
  officeHours: string;
  quote: string;
  funFact: string;
};

export type StudentSpotlight = {
  id: string;
  weekLabel: string;
  name: string;
  grade: string;
  category: string;
  emoji: string;
  bio: string;
  achievements: string[];
};

export type StaffSpotlight = {
  id: string;
  monthLabel: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  quote: string;
  emoji: string;
};

export type ThankYouMessage = {
  id: string;
  author: string;
  recipient?: string;
  message: string;
  status: "approved" | "pending";
  dateLabel: string;
};

export type MemoryHighlight = {
  id: string;
  type: "photo-of-week" | "video-of-week" | "throwback" | "event";
  title: string;
  dateLabel: string;
  description: string;
  emoji: string;
};

export type TraditionProposal = {
  id: string;
  title: string;
  proposer: string;
  grade: string;
  description: string;
  status: "approved" | "pending" | "review";
  submittedLabel: string;
};

export type CampusPollOption = {
  id: string;
  label: string;
  votes: number;
};

export type CampusPoll = {
  id: string;
  question: string;
  description: string;
  status: "open" | "closed";
  options: CampusPollOption[];
  endsLabel: string;
};

export type AlumniLocation = {
  id: string;
  name: string;
  classYear: string;
  location: string;
  type: "college" | "military" | "mission" | "career" | "alumni";
  detail: string;
};

export type LegacyProject = {
  id: string;
  classYear: string;
  title: string;
  description: string;
  contributors: string[];
  timeline: { label: string; dateLabel: string }[];
  photoCount: number;
};

export type ArchiveCollection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  itemCount: number;
  emoji: string;
};

export type ClassTimeCapsuleEntry = {
  id: string;
  author: string;
  prompt: string;
  response: string;
  dateLabel: string;
};

export type ClassTimeCapsule = {
  classYear: string;
  motto: string;
  entries: ClassTimeCapsuleEntry[];
};

export type MadonnaHistoryDay = {
  month: number;
  day: number;
  year?: number;
  title: string;
  description: string;
};

export const TRADITIONS: TraditionDetail[] = [
  {
    slug: "homecoming",
    name: "Homecoming",
    emoji: "🏈",
    season: "Fall",
    tagline: "Blue Dons past and present reunite under the Friday night lights.",
    history:
      "Homecoming at Madonna has been a cornerstone of fall since the 1960s. Alumni return to Weirton to cheer on the Blue Dons, reconnect with classmates, and pass traditions to the next generation.",
    currentYear: {
      dates: "October 10–12, 2026",
      theme: "Blue & Gold Forever",
      highlights: [
        "Friday night football vs. rival",
        "Hall of Fame induction ceremony",
        "Alumni tailgate on the quad",
        "Homecoming dance — gym transformed",
      ],
    },
    timeline: [
      { year: "1962", event: "First recorded Homecoming game" },
      { year: "1985", event: "Alumni tent tradition begins" },
      { year: "2010", event: "Blue Don Live streams first Homecoming" },
    ],
    memories: [
      { author: "Maria S. '18", quote: "Nothing beats the tunnel walk before kickoff.", year: "2017" },
      { author: "Coach Reynolds", quote: "Homecoming is when our whole Blue Don family shows up.", year: "2024" },
    ],
    winners: [
      { year: "2025", name: "Class of 2027", category: "Spirit Week champions" },
      { year: "2025", name: "Sophomore float", category: "Best parade float" },
    ],
    gallery: [
      { caption: "Friday night lights", category: "Athletics" },
      { caption: "Alumni tailgate reunion", category: "Community" },
      { caption: "Pep rally bonfire", category: "Spirit" },
    ],
    videos: [
      { title: "2025 Homecoming highlights", duration: "4:32" },
      { title: "Alumni welcome address", duration: "8:15" },
    ],
  },
  {
    slug: "catholic-schools-week",
    name: "Catholic Schools Week",
    emoji: "⛪",
    season: "January",
    tagline: "Celebrating faith, community, and the gift of Catholic education.",
    history:
      "Each January, Madonna joins Catholic schools nationwide in a week of prayer, service, and celebration — honoring the mission that has shaped our campus since 1955.",
    currentYear: {
      dates: "January 26 – February 1, 2027",
      theme: "Catholic Schools: Faith. Excellence. Service.",
      highlights: [
        "Opening Mass with Bishop",
        "Student appreciation day",
        "Community open house",
        "Faculty & staff luncheon",
      ],
    },
    timeline: [
      { year: "1974", event: "First CSW celebration at Madonna" },
      { year: "2000", event: "Service day expanded to tri-state" },
    ],
    memories: [
      { author: "Fr. Michael", quote: "CSW reminds us why we exist — to form disciples and scholars.", year: "2025" },
    ],
    gallery: [
      { caption: "All-school Mass", category: "Faith" },
      { caption: "Volunteer service projects", category: "Service" },
    ],
    videos: [{ title: "CSW 2026 recap", duration: "6:20" }],
  },
  {
    slug: "spirit-week",
    name: "Spirit Week",
    emoji: "🎉",
    season: "Fall & Spring",
    tagline: "Five days of themed dress, class competitions, and Blue Don pride.",
    history:
      "Spirit Week fuels Madonna's competitive but joyful culture. Each day has a theme — from Pajama Day to Blue & Gold — with points tallied for the winning class.",
    currentYear: {
      dates: "September 22–26, 2026",
      highlights: [
        "Monday: Pajama Day",
        "Tuesday: Twin Day",
        "Wednesday: Decades Day",
        "Thursday: Blue & Gold",
        "Friday: Class color wars",
      ],
    },
    timeline: [
      { year: "1990", event: "Class point system introduced" },
      { year: "2018", event: "Spirit Week moved to fall Homecoming lead-in" },
    ],
    memories: [
      { author: "Jake T. '26", quote: "Decades Day is when teachers really commit to the bit.", year: "2025" },
    ],
    winners: [{ year: "2025", name: "Class of 2027", category: "Spirit Week champions" }],
    gallery: [
      { caption: "Hallway decorations", category: "Spirit" },
      { caption: "Pep rally crowd", category: "Athletics" },
    ],
    videos: [{ title: "Spirit Week 2025 montage", duration: "3:45" }],
  },
  {
    slug: "christmas-concert",
    name: "Christmas Concert",
    emoji: "🎄",
    season: "December",
    tagline: "Madonna's finest voices and musicians herald the season.",
    history:
      "The annual Christmas Concert fills the gym with carols, chamber music, and the Madonna choir — a beloved tradition for families and the wider Weirton community.",
    currentYear: {
      dates: "December 18, 2026 · 7:00 PM",
      theme: "O Come, All Ye Faithful",
      highlights: [
        "Choir & band combined finale",
        "Student soloists",
        "Livestream on Blue Don Live",
        "Post-concert reception",
      ],
    },
    timeline: [{ year: "1978", event: "First combined choir & band concert" }],
    memories: [
      { author: "Mrs. Patterson", quote: "When the gym goes silent for Silent Night — that's Madonna magic.", year: "2024" },
    ],
    gallery: [
      { caption: "Choir in candlelight", category: "Fine Arts" },
      { caption: "Band brass section", category: "Music" },
    ],
    videos: [{ title: "2025 Christmas Concert full performance", duration: "52:10" }],
  },
  {
    slug: "living-stations",
    name: "Living Stations",
    emoji: "✝️",
    season: "Lent",
    tagline: "Students bring the Passion to life for the entire campus.",
    history:
      "During Holy Week, Madonna students dramatize the Stations of the Cross — a moving expression of faith that draws the community into Lenten reflection.",
    currentYear: {
      dates: "April 2, 2027 · Chapel & Gym",
      highlights: [
        "Student-led narration",
        "Live choir accompaniment",
        "Open to families & parishioners",
        "Streamed for alumni",
      ],
    },
    timeline: [{ year: "1988", event: "Living Stations tradition established" }],
    memories: [
      { author: "Campus Ministry", quote: "Students who perform often say it's the most meaningful thing they do here.", year: "2025" },
    ],
    gallery: [{ caption: "Station VII — Jesus falls", category: "Faith" }],
    videos: [{ title: "Living Stations 2025", duration: "28:00" }],
  },
  {
    slug: "graduation",
    name: "Graduation",
    emoji: "🎓",
    season: "May",
    tagline: "Baccalaureate, Commencement, and the sending forth of Blue Dons.",
    history:
      "Graduation week is the culmination of every Madonna journey — from Baccalaureate Mass to Commencement on the football field, families celebrate years of formation.",
    currentYear: {
      dates: "May 22–24, 2027",
      highlights: [
        "Baccalaureate Mass — May 22",
        "Senior awards night",
        "Commencement — May 24",
        "Time capsule unsealing for Class of 2023",
      ],
    },
    timeline: [
      { year: "1959", event: "First graduating class" },
      { year: "2023", event: "Digital time capsule tradition launched" },
    ],
    memories: [
      { author: "Dr. Brennan", quote: "Every diploma represents a story of growth in faith and excellence.", year: "2025" },
    ],
    gallery: [
      { caption: "Cap toss moment", category: "Graduation" },
      { caption: "Baccalaureate procession", category: "Faith" },
    ],
    videos: [
      { title: "Commencement 2025", duration: "1:12:00" },
      { title: "Senior tribute video", duration: "9:30" },
    ],
  },
  {
    slug: "alumni-weekend",
    name: "Alumni Weekend",
    emoji: "🤝",
    season: "Spring",
    tagline: "Blue Dons of every decade return to walk the halls again.",
    history:
      "Alumni Weekend welcomes graduates back for reunions, campus tours, and networking — keeping the Madonna family connected across generations.",
    currentYear: {
      dates: "April 17–18, 2027",
      highlights: [
        "Decade reunion dinners",
        "Campus tour with student ambassadors",
        "Alumni vs. faculty softball",
        "Hall of Champions brunch",
      ],
    },
    timeline: [{ year: "1995", event: "First formal Alumni Weekend" }],
    memories: [
      { author: "Tom R. '92", quote: "Walking into the chapel after 30 years — still feels like home.", year: "2024" },
    ],
    gallery: [{ caption: "Alumni chapel reunion", category: "Community" }],
    videos: [{ title: "Alumni Weekend 2025", duration: "5:15" }],
  },
  {
    slug: "open-house",
    name: "Open House",
    emoji: "🏫",
    season: "Fall & Spring",
    tagline: "Prospective families discover the Madonna difference.",
    history:
      "Open House showcases academics, faith formation, athletics, and student life — led by student ambassadors who share their authentic Madonna experience.",
    currentYear: {
      dates: "November 8, 2026 · 1:00–4:00 PM",
      highlights: [
        "Student-led campus tours",
        "Academy showcase booths",
        "Financial aid information session",
        "Madonna campus demo",
      ],
    },
    timeline: [{ year: "2005", event: "Student ambassador program formalized" }],
    memories: [
      { author: "Admissions Office", quote: "Our students are our best recruiters.", year: "2025" },
    ],
    gallery: [{ caption: "Academy showcase", category: "Admissions" }],
    videos: [{ title: "Why Madonna? student testimonials", duration: "4:00" }],
  },
  {
    slug: "academic-awards",
    name: "Academic Awards",
    emoji: "🏆",
    season: "Spring",
    tagline: "Honoring scholarly excellence across every discipline.",
    history:
      "The Academic Awards ceremony recognizes top performers in each department, National Honor Society inductees, and students who exemplify intellectual curiosity.",
    currentYear: {
      dates: "May 15, 2027 · Auditorium",
      highlights: [
        "Department medals",
        "NHS induction",
        "Valedictorian & salutatorian announcement",
        "Faculty recognition awards",
      ],
    },
    timeline: [{ year: "1965", event: "First academic honors convocation" }],
    winners: [
      { year: "2025", name: "Sarah Chen", category: "Science Excellence" },
      { year: "2025", name: "Marcus Williams", category: "Humanities Scholar" },
      { year: "2025", name: "Elena Rodriguez", category: "Mathematics Award" },
    ],
    memories: [
      { author: "Mr. Donovan", quote: "These students represent the best of Madonna scholarship.", year: "2025" },
    ],
    gallery: [{ caption: "Award recipients on stage", category: "Academics" }],
    videos: [{ title: "Academic Awards 2025", duration: "45:00" }],
  },
  {
    slug: "pep-rally",
    name: "Pep Rally",
    emoji: "📣",
    season: "Fall & Winter",
    tagline: "The gym erupts with Blue Don energy before the big game.",
    history:
      "Pep rallies unite the student body with cheers, class competitions, athlete introductions, and the marching band — fueling spirit before rivalry games and playoffs.",
    currentYear: {
      dates: "October 9, 2026 · Gym · 2:00 PM",
      theme: "Beat the Rivals",
      highlights: [
        "Varsity team introductions",
        "Cheer & dance performances",
        "Class spirit competition",
        "Blue Don Live broadcast",
      ],
    },
    timeline: [{ year: "1970", event: "First gym-wide pep rally" }],
    memories: [
      { author: "Cheer Captain '25", quote: "When the whole gym is chanting — that's pure Blue Don pride.", year: "2024" },
    ],
    gallery: [
      { caption: "Marching band entrance", category: "Spirit" },
      { caption: "Class cheer-off", category: "Competition" },
    ],
    videos: [{ title: "Homecoming pep rally 2025", duration: "12:30" }],
  },
];

export const HISTORY_EVENTS: HistoryEvent[] = [
  { year: 1955, title: "Madonna High School Opens", description: "Madonna High School welcomes its first students in Weirton, West Virginia, founded on Catholic values and academic excellence.", category: "founding" },
  { year: 1959, title: "First Graduating Class", description: "The inaugural senior class receives diplomas, beginning a legacy of Blue Don alumni.", category: "founding" },
  { year: 1965, title: "Athletic Program Expands", description: "Varsity football and basketball programs gain regional recognition.", category: "athletics" },
  { year: 1974, title: "Catholic Schools Week Begins", description: "Madonna joins the national CSW celebration, deepening community identity.", category: "faith" },
  { year: 1985, title: "Science Wing Dedicated", description: "New laboratory facilities position Madonna as a STEM leader in the region.", category: "academics" },
  { year: 1995, title: "Alumni Weekend Launched", description: "Formal alumni reunions bring generations of Blue Dons back to campus.", category: "campus" },
  { year: 2005, title: "Student Ambassador Program", description: "Current students become official guides for prospective families.", category: "campus" },
  { year: 2010, title: "Campus Broadcasting Studio", description: "Madonna launches a student-run broadcasting program — precursor to Blue Don Live.", category: "technology" },
  { year: 2015, title: "Academy Model Introduced", description: "Career academies give students specialized pathways in IT, health sciences, and more.", category: "academics" },
  { year: 2020, title: "Remote Learning Pivot", description: "Madonna adapts to hybrid learning, accelerating digital infrastructure.", category: "technology" },
  { year: 2023, title: "Digital Time Capsule", description: "Seniors begin sealing reflections in a digital time capsule opened at graduation.", category: "campus" },
  { year: 2025, title: "Digital campus announced", description: "Madonna unveils the vision for a unified digital campus experience.", category: "technology" },
  { year: 2027, title: "Madonna digital campus launches", description: "School Culture & Traditions ships — Madonna's digital heartbeat goes live.", category: "technology" },
];

export const HALL_INDUCTEES: HallInductee[] = [
  { id: "hoc-1", name: "Sarah Chen", hall: "academic", inducteeYear: 2025, classYear: "2025", bio: "Valedictorian, National Merit Scholar, and research intern at WVU Medicine.", accomplishments: ["4.0 GPA", "AP Scholar with Distinction", "Science Olympiad state medalist"], advice: "Curiosity beats memorization every time.", photoLabel: "SC" },
  { id: "hoc-2", name: "Marcus Williams", hall: "leadership", inducteeYear: 2025, classYear: "2025", bio: "Student body president who led the largest service drive in school history.", accomplishments: ["Student Council President", "500+ service hours", "State leadership conference delegate"], advice: "Lead by listening first.", photoLabel: "MW" },
  { id: "hoc-3", name: "Elena Rodriguez", hall: "fine-arts", inducteeYear: 2024, classYear: "2024", bio: "All-state choir, lead in three musicals, and AP Music Theory perfect score.", accomplishments: ["All-State Choir", "Best Actress — regional festival", "Piano accompanist for CSW Mass"], advice: "Perform like it's your last, practice like it's your first.", photoLabel: "ER" },
  { id: "hoc-4", name: "Jake Thompson", hall: "athletics", inducteeYear: 2024, classYear: "2024", bio: "Three-sport varsity captain, all-conference football and track.", accomplishments: ["All-Conference Football", "State track qualifier", "Captain — football, basketball, track"], advice: "Champions are made in the offseason.", photoLabel: "JT" },
  { id: "hoc-5", name: "Aisha Patel", hall: "technology", inducteeYear: 2025, classYear: "2026", bio: "IT Club president who built the campus help desk ticketing prototype.", accomplishments: ["IT Club President", "CyberPatriot regional finalist", "Blue Don Pass architect"], advice: "Break things in dev so they work in prod.", photoLabel: "AP" },
  { id: "hoc-6", name: "Ryan O'Brien", hall: "broadcasting", inducteeYear: 2024, classYear: "2024", bio: "Blue Don Live lead producer for 40+ broadcasts including Homecoming and graduation.", accomplishments: ["40+ live broadcasts", "Morning announcements director", "Regional student media award"], advice: "Every broadcast is someone's first impression of Madonna.", photoLabel: "RO" },
  { id: "hoc-7", name: "Sister Margaret", hall: "faith", inducteeYear: 2023, bio: "Campus minister for 20 years, guiding thousands through retreats and service.", accomplishments: ["20 years campus ministry", "Kairos retreat founder", "Service trip leader — Appalachia"], advice: "Faith is a journey, not a destination.", photoLabel: "SM" },
  { id: "hoc-8", name: "David Kim", hall: "service", inducteeYear: 2025, classYear: "2025", bio: "Organized Blue Don Service Day logistics for 300+ student volunteers.", accomplishments: ["800+ service hours", "Interact Club President", "Habitat for Humanity youth lead"], advice: "Service isn't an event — it's a habit.", photoLabel: "DK" },
  { id: "hoc-9", name: "Jennifer Walsh '98", hall: "alumni", inducteeYear: 2024, bio: "Emergency room physician and Madonna scholarship fund founder.", accomplishments: ["MD — WVU School of Medicine", "Madonna Scholarship Fund founder", "Annual alumni mentor"], advice: "The foundation you build here carries you everywhere.", photoLabel: "JW" },
];

export const FACULTY: FacultyMember[] = [
  { slug: "donovan", name: "Mr. Patrick Donovan", title: "Science Department Chair", department: "Science", education: ["M.S. Chemistry, West Virginia University", "B.S. Biology, Wheeling University"], courses: ["AP Chemistry", "Honors Biology", "Forensic Science"], clubs: ["Science Olympiad", "Envirothon"], officeHours: "Tue & Thu · 7:30–8:15 AM · Room 204", quote: "Science is not about answers — it's about better questions.", funFact: "Completed three marathons and uses running metaphors in every lab." },
  { slug: "patterson", name: "Mrs. Lisa Patterson", title: "Fine Arts Director", department: "Fine Arts", education: ["M.M. Music Education, Duquesne University", "B.M. Vocal Performance, WVU"], courses: ["Choir", "AP Music Theory", "Musical Theatre"], clubs: ["Choir", "Drama Club", "Pep Band"], officeHours: "Mon & Wed · 3:15–4:00 PM · Music Room", quote: "Every student has a voice worth hearing.", funFact: "Directed 15 consecutive Christmas Concerts." },
  { slug: "reynolds", name: "Coach Mike Reynolds", title: "Athletic Director & Head Football Coach", department: "Athletics", education: ["M.Ed. Sports Administration, Marshall University", "B.S. Physical Education, WVU"], courses: ["Health", "Physical Education"], clubs: ["Football", "Strength & Conditioning"], officeHours: "Daily · 3:00–3:30 PM · Athletic Office", quote: "We build character on the field and in the classroom.", funFact: "Played linebacker for the Mountaineers." },
  { slug: "brennan", name: "Dr. Catherine Brennan", title: "Principal", department: "Administration", education: ["Ed.D. Educational Leadership, Duquesne University", "M.A. Theology, Franciscan University", "B.A. English, Madonna High School '95"], courses: [], clubs: ["Campus Ministry Advisory"], officeHours: "By appointment · Main Office", quote: "Madonna forms disciples, scholars, and leaders.", funFact: "First Madonna alumna to serve as principal." },
  { slug: "nguyen", name: "Mr. Tony Nguyen", title: "IT Academy Lead", department: "Technology", education: ["M.S. Computer Science, CMU", "B.S. Information Systems, Pitt"], courses: ["AP Computer Science A", "Cybersecurity", "Web Development"], clubs: ["IT Club", "CyberPatriot", "Robotics"], officeHours: "Wed & Fri · 7:30–8:15 AM · IT Lab", quote: "The best code is the code your users never notice.", funFact: "Built the first Madonna student portal in 2012." },
  { slug: "morales", name: "Mrs. Carmen Morales", title: "Campus Ministry Coordinator", department: "Faith Formation", education: ["M.A. Pastoral Studies, Loyola Chicago", "B.A. Theology, Franciscan University"], courses: ["Theology III", "Theology IV", "Social Justice"], clubs: ["Campus Ministry", "Pro-Life Club", "Interact"], officeHours: "Daily · Chapel Office · 7:45 AM", quote: "Faith without works is incomplete.", funFact: "Led 12 service immersion trips across Appalachia." },
];

export const STUDENT_SPOTLIGHT: StudentSpotlight = {
  id: "spot-1",
  weekLabel: "Week of July 7, 2026",
  name: "Aisha Patel",
  grade: "Junior",
  category: "IT & Technology",
  emoji: "💻",
  bio: "Aisha leads the IT Club help desk, mentors freshmen in coding basics, and architected the Blue Don Pass check-in prototype.",
  achievements: [
    "IT Club President",
    "CyberPatriot regional finalist",
    "Built campus ticketing MVP",
    "Volunteer tutor — AP CS prep",
  ],
};

export const STAFF_SPOTLIGHT: StaffSpotlight = {
  id: "staff-1",
  monthLabel: "July 2026",
  name: "Mrs. Lisa Patterson",
  role: "Fine Arts Director",
  department: "Fine Arts",
  bio: "Mrs. Patterson has directed the Christmas Concert for 15 years, grown the choir to 80 members, and mentored dozens of all-state musicians.",
  quote: "Music is how we pray twice.",
  emoji: "🎵",
};

export const THANK_YOU_MESSAGES: ThankYouMessage[] = [
  { id: "ty-1", author: "Sophia M. '27", recipient: "Mrs. Patterson", message: "Thank you for believing in my voice when I was too shy to audition. The Christmas Concert changed everything for me.", status: "approved", dateLabel: "Jul 5, 2026" },
  { id: "ty-2", author: "Marcus W. '25", recipient: "Coach Reynolds", message: "You taught me that discipline on the field translates to every part of life. Forever grateful, Coach.", status: "approved", dateLabel: "Jul 3, 2026" },
  { id: "ty-3", author: "Parent — Garcia Family", recipient: "Madonna Faculty", message: "Thank you for welcoming our transfer student with open arms. She finally feels like she belongs.", status: "approved", dateLabel: "Jul 1, 2026" },
  { id: "ty-4", author: "Ryan K. '26", recipient: "Mr. Nguyen", message: "The cybersecurity unit was the best class I've ever taken. You made complex topics click.", status: "approved", dateLabel: "Jun 28, 2026" },
  { id: "ty-5", author: "Anonymous '28", recipient: "Campus Ministry", message: "Kairos retreat was life-changing. Thank you for creating a space to be real about faith.", status: "pending", dateLabel: "Jul 7, 2026" },
];

export const MEMORY_HIGHLIGHTS: MemoryHighlight[] = [
  { id: "mem-1", type: "photo-of-week", title: "Sunset over the football field", dateLabel: "Week of Jul 7, 2026", description: "Golden hour captures Blue Don spirit after summer conditioning.", emoji: "📸" },
  { id: "mem-2", type: "video-of-week", title: "Blue Don Live — summer studio tour", dateLabel: "Week of Jul 7, 2026", description: "Broadcasting students preview the upgraded studio for fall.", emoji: "🎬" },
  { id: "mem-3", type: "throwback", title: "Throwback Thursday: 1998 Homecoming", dateLabel: "Jul 3, 2026", description: "Alumni share photos from the last Homecoming in the old gym.", emoji: "⏪" },
  { id: "mem-4", type: "event", title: "Summer band camp highlights", dateLabel: "Jul 1, 2026", description: "Marching band prepares the fall halftime show.", emoji: "🎺" },
];

export const APPROVED_TRADITION_PROPOSALS: TraditionProposal[] = [
  { id: "tp-1", title: "Blue & Gold Breakfast", proposer: "Student Council", grade: "Campus-wide", description: "Monthly informal breakfast where students and faculty share a meal before first period.", status: "approved", submittedLabel: "Approved Mar 2024" },
  { id: "tp-2", title: "Senior Sunrise", proposer: "Class of 2025", grade: "Seniors", description: "Seniors gather on the football field at dawn on the first day of school.", status: "approved", submittedLabel: "Approved May 2024" },
];

export const CAMPUS_POLLS: CampusPoll[] = [
  {
    id: "poll-1",
    question: "Fall Spirit Week Theme Day — which should we add?",
    description: "Student Council is choosing a new theme day for September Spirit Week.",
    status: "open",
    endsLabel: "Ends Jul 15",
    options: [
      { id: "opt-1", label: "Meme Day", votes: 142 },
      { id: "opt-2", label: "Country vs. Country Club", votes: 198 },
      { id: "opt-3", label: "Disney Day", votes: 167 },
      { id: "opt-4", label: "Jersey Day", votes: 89 },
    ],
  },
  {
    id: "poll-2",
    question: "Homecoming 2026 theme?",
    description: "Vote for the official Homecoming theme.",
    status: "closed",
    endsLabel: "Closed Jun 30",
    options: [
      { id: "opt-5", label: "Blue & Gold Forever", votes: 312 },
      { id: "opt-6", label: "Blue Dons Unite", votes: 245 },
      { id: "opt-7", label: "Friday Night Lights", votes: 189 },
    ],
  },
];

export const ALUMNI_LOCATIONS: AlumniLocation[] = [
  { id: "al-1", name: "Jennifer Walsh", classYear: "1998", location: "Pittsburgh, PA", type: "career", detail: "Emergency Medicine Physician — UPMC" },
  { id: "al-2", name: "Michael Torres", classYear: "2015", location: "Columbus, OH", type: "college", detail: "Ohio State University — Engineering Ph.D." },
  { id: "al-3", name: "Emily Foster", classYear: "2019", location: "San Diego, CA", type: "military", detail: "U.S. Navy — Surface Warfare Officer" },
  { id: "al-4", name: "James Okafor", classYear: "2020", location: "Guatemala City", type: "mission", detail: "Catholic mission — education outreach" },
  { id: "al-5", name: "Sarah Mitchell", classYear: "2012", location: "Weirton, WV", type: "alumni", detail: "Madonna teacher — English Department" },
  { id: "al-6", name: "David Park", classYear: "2018", location: "Austin, TX", type: "career", detail: "Software Engineer — Dell Technologies" },
  { id: "al-7", name: "Maria Santos", classYear: "2016", location: "Morgantown, WV", type: "college", detail: "WVU School of Nursing — RN, BSN" },
  { id: "al-8", name: "Chris Brennan", classYear: "2001", location: "Washington, D.C.", type: "career", detail: "Policy Analyst — U.S. Department of Education" },
];

export const LEGACY_PROJECTS: LegacyProject[] = [
  {
    id: "leg-1",
    classYear: "2025",
    title: "Campus Prayer Garden",
    description: "The Class of 2025 funded and built a meditation garden behind the chapel with benches, native plants, and a Marian statue.",
    contributors: ["Senior Class Officers", "Interact Club", "Campus Ministry", "Local nurseries (donors)"],
    timeline: [
      { label: "Fundraising begins", dateLabel: "Sep 2024" },
      { label: "Groundbreaking", dateLabel: "Apr 2025" },
      { label: "Dedication Mass", dateLabel: "May 2025" },
    ],
    photoCount: 24,
  },
  {
    id: "leg-2",
    classYear: "2023",
    title: "Blue Don Broadcasting Studio Upgrade",
    description: "Class of 2023 legacy gift funded new cameras, switcher, and streaming equipment for Blue Don Live.",
    contributors: ["IT Club", "Broadcasting class", "Class of 2023"],
    timeline: [
      { label: "Proposal approved", dateLabel: "Oct 2022" },
      { label: "Equipment installed", dateLabel: "Mar 2023" },
      { label: "First broadcast", dateLabel: "Apr 2023" },
    ],
    photoCount: 18,
  },
  {
    id: "leg-3",
    classYear: "2020",
    title: "Blue Don Courtyard Mural",
    description: "A student-designed mural celebrating 65 years of Madonna history on the main courtyard wall.",
    contributors: ["Art Club", "National Art Honor Society", "Class of 2020"],
    timeline: [
      { label: "Design competition", dateLabel: "Jan 2020" },
      { label: "Painting weekends", dateLabel: "Mar–Apr 2020" },
      { label: "Unveiling", dateLabel: "May 2020" },
    ],
    photoCount: 31,
  },
];

export const ARCHIVE_COLLECTIONS: ArchiveCollection[] = [
  { id: "arc-1", slug: "yearbooks", title: "Digital Yearbooks", description: "Every Madonna yearbook from 1959 to present, searchable by name and activity.", itemCount: 67, emoji: "📚" },
  { id: "arc-2", slug: "championships", title: "Championship Archive", description: "Photos, rosters, and game recaps from 65 years of Blue Don athletics.", itemCount: 340, emoji: "🏆" },
  { id: "arc-3", slug: "broadcasts", title: "Broadcast Archive", description: "Blue Don Live replays, morning announcements, and event livestreams.", itemCount: 520, emoji: "📺" },
  { id: "arc-4", slug: "newspapers", title: "Blue Don Chronicle", description: "Student newspaper editions dating back to 1968.", itemCount: 280, emoji: "📰" },
  { id: "arc-5", slug: "oral-histories", title: "Oral Histories", description: "Recorded interviews with alumni, faculty, and community members.", itemCount: 45, emoji: "🎙️" },
  { id: "arc-6", slug: "photos", title: "Photo Archive", description: "Thousands of campus photos organized by decade, event, and organization.", itemCount: 12000, emoji: "📷" },
];

export const CLASS_TIME_CAPSULES: ClassTimeCapsule[] = [
  {
    classYear: "2027",
    motto: "Building the future, honoring the past",
    entries: [
      { id: "tc-1", author: "Aisha P.", prompt: "What do you hope to accomplish before graduation?", response: "Help launch Madonna's digital campus and mentor underclassmen in IT Club.", dateLabel: "Sep 2025" },
      { id: "tc-2", author: "Marcus W.", prompt: "What will you miss most about Madonna?", response: "Friday night lights and the people who became family.", dateLabel: "Sep 2025" },
    ],
  },
  {
    classYear: "2028",
    motto: "Faith, grit, and blue & gold",
    entries: [
      { id: "tc-3", author: "Sophia M.", prompt: "What does being a Blue Don mean to you?", response: "Showing up for each other — in chapel, on the field, and in the hallways.", dateLabel: "Sep 2025" },
    ],
  },
];

export const MADONNA_HISTORY_DAYS: MadonnaHistoryDay[] = [
  { month: 7, day: 8, year: 1955, title: "Madonna High School Opens", description: "On this day in 1955, Madonna High School welcomed its first students to Weirton, West Virginia." },
  { month: 7, day: 8, year: 2027, title: "Madonna digital campus — Culture Wave", description: "School Culture & Traditions launches, making Madonna's heartbeat digital." },
  { month: 7, day: 4, title: "Independence Day Alumni Gatherings", description: "Madonna alumni chapters across the country host annual Fourth of July picnics." },
  { month: 5, day: 24, year: 2025, title: "Class of 2025 Commencement", description: "The Class of 2025 graduated 142 seniors — the largest class in a decade." },
  { month: 10, day: 10, title: "Homecoming Weekend", description: "Blue Dons gather annually for the Homecoming football game and alumni celebrations." },
  { month: 1, day: 28, title: "Catholic Schools Week", description: "Madonna celebrates the gift of Catholic education with the national CSW observance." },
  { month: 12, day: 18, title: "Christmas Concert", description: "The annual Christmas Concert fills the gym with carols and community." },
  { month: 4, day: 2, title: "Living Stations of the Cross", description: "Students dramatize the Passion during Holy Week — a moving campus tradition." },
];

export const WHY_MADONNA = {
  headline: "Why Madonna?",
  subheadline: "Faith. Excellence. Community. For 70+ years, Madonna has formed Blue Dons who lead with heart.",
  testimonials: [
    { author: "Sarah M. '24", quote: "Madonna gave me the faith foundation and academic rigor to thrive at Notre Dame.", role: "Alumni — University of Notre Dame" },
    { author: "The Garcia Family", quote: "We chose Madonna for the community. Our kids are known, loved, and challenged.", role: "Current Parents" },
    { author: "Marcus W. '25", quote: "From IT Club to student government, every door was open. I found my purpose here.", role: "Senior" },
  ],
  highlights: {
    faith: ["Daily prayer & monthly all-school Mass", "Campus Ministry & Kairos retreats", "Theology integrated across curriculum", "Living Stations & CSW celebrations"],
    academics: ["AP & honors courses in every department", "Career academies — IT, Health Sciences, Business", "95% college acceptance rate", "National Honor Society & academic awards"],
    athletics: ["15 varsity sports", "Conference championships in football, track, basketball", "Student-athlete academic support", "Blue Don Live game broadcasts"],
    clubs: ["40+ student organizations", "IT Club, Broadcasting, Drama, Robotics", "Interact & service immersion trips", "Student-led campus initiatives"],
    collegePlacement: ["95% college acceptance", "Graduates at WVU, Pitt, Notre Dame, Ohio State", "Dedicated college counseling", "Scholarship support & FAFSA workshops"],
  },
  virtualTourHref: "/open-house",
};
