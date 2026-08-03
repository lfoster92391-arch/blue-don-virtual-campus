/**
 * W12 · Media + Live — Photo of the Day, livestream, albums.
 */

export type PhotoOfTheDay = {
  id: string;
  caption: string;
  photographer: string;
  dateLabel: string;
  category: string;
};

export type LivestreamEvent = {
  id: string;
  title: string;
  status: "live" | "upcoming" | "replay";
  timeLabel: string;
  href: string;
};

export type MediaAlbum = {
  id: string;
  title: string;
  photoCount: number;
  dateLabel: string;
};

export const PHOTO_OF_THE_DAY: PhotoOfTheDay = {
  id: "potd-1",
  caption: "Blue Dons pack the stands for Friday night football",
  photographer: "Broadcasting Club",
  dateLabel: "Today",
  category: "Athletics",
};

export const LIVESTREAM_EVENTS: LivestreamEvent[] = [
  { id: "ls-1", title: "Morning Announcements", status: "upcoming", timeLabel: "Tomorrow 8:05 AM", href: "/media" },
  { id: "ls-2", title: "Varsity Football vs Central", status: "upcoming", timeLabel: "Fri 7:00 PM", href: "/athletics" },
  { id: "ls-3", title: "Robotics Showcase", status: "replay", timeLabel: "Replay available", href: "/media" },
];

export const MEDIA_ALBUMS: MediaAlbum[] = [
  { id: "alb-1", title: "Homecoming 2025", photoCount: 142, dateLabel: "Oct 2025" },
  { id: "alb-2", title: "STEM Showcase", photoCount: 68, dateLabel: "Mar 2025" },
  { id: "alb-3", title: "Service Day", photoCount: 95, dateLabel: "Apr 2025" },
  { id: "alb-4", title: "Graduation 2024", photoCount: 210, dateLabel: "May 2024" },
];
