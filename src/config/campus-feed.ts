export type FeedCategory =
  | "school"
  | "clubs"
  | "athletics"
  | "classes"
  | "faith"
  | "service";

export const FEED_CATEGORY_LABELS: Record<FeedCategory, string> = {
  school: "School",
  clubs: "Clubs",
  athletics: "Athletics",
  classes: "Classes",
  faith: "Faith",
  service: "Service",
};

export type FeedPost = {
  id: string;
  category: FeedCategory;
  emoji: string;
  source: string;
  title: string;
  body: string;
  timeLabel: string;
  href?: string;
};

import { sampleList } from "@/config/app-mode";

/** Sample categorized campus feed. Replace with announcement data when available. */
const CAMPUS_FEED_SAMPLE: FeedPost[] = [
  {
    id: "post-principal",
    category: "school",
    emoji: "📢",
    source: "Principal's Office",
    title: "Welcome back — a great week ahead",
    body: "Reminder: spirit dress is approved this Friday for the pep rally. Let's show our Blue Don pride!",
    timeLabel: "2h ago",
    href: "/community",
  },
  {
    id: "post-football",
    category: "athletics",
    emoji: "🏈",
    source: "Football",
    title: "Home game Friday at 7 PM",
    body: "Varsity takes on Central. Broadcasting will livestream — pack the stands!",
    timeLabel: "3h ago",
    href: "/athletics",
  },
  {
    id: "post-it-club",
    category: "clubs",
    emoji: "💻",
    source: "IT Club",
    title: "Help desk shifts open this week",
    body: "Earn service hours and XP supporting classrooms. Sign up at tonight's meeting, 3:15 in Room 214.",
    timeLabel: "5h ago",
    href: "/organizations/it-club",
  },
  {
    id: "post-senior",
    category: "classes",
    emoji: "🎓",
    source: "Senior Class",
    title: "Cap & gown orders due Friday",
    body: "Seniors, finalize your graduation orders and check the countdown on your class page.",
    timeLabel: "Yesterday",
    href: "/find-your-place",
  },
  {
    id: "post-service",
    category: "service",
    emoji: "❤️",
    source: "Service Center",
    title: "Food pantry volunteers needed",
    body: "Saturday morning, 9–11 AM. Great for graduation service hours. QR check-in on site.",
    timeLabel: "Yesterday",
    href: "/service",
  },
  {
    id: "post-broadcast",
    category: "school",
    emoji: "🎥",
    source: "Broadcasting",
    title: "Morning announcements — watch live",
    body: "Catch today's Blue Don News at 8:05 AM in the Media Hub or on the studio livestream.",
    timeLabel: "Today",
    href: "/media",
  },
  {
    id: "post-prayer",
    category: "faith",
    emoji: "🙏",
    source: "Campus Ministry",
    title: "Morning prayer in the chapel",
    body: "Join Prayer Club Wednesdays at 7:30 AM. All are welcome.",
    timeLabel: "Today",
    href: "/organizations/prayer-club",
  },
];

/**
 * Clean slate: the campus feed starts empty and fills with real announcements.
 * When clean slate is off, the sample feed above is shown for demos.
 */
export const CAMPUS_FEED: FeedPost[] = sampleList(CAMPUS_FEED_SAMPLE);
