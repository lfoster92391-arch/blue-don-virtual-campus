/**
 * W2 · Event Engine v2 — EventPublication, fan-out, and reminders.
 *
 * MVP seed layer: view models describing how a published campus event fans out
 * to audiences and schedules reminder pushes. Swap the seed arrays for
 * `EventPublication` / `EventReminder` reads when those models ship.
 */

export type PublicationChannel = "campus_feed" | "calendar" | "email" | "push";

export const PUBLICATION_CHANNEL_LABELS: Record<PublicationChannel, string> = {
  campus_feed: "Campus Feed",
  calendar: "Calendar",
  email: "Email",
  push: "Push",
};

export type EventPublication = {
  id: string;
  eventTitle: string;
  audience: string;
  channels: PublicationChannel[];
  status: "published" | "scheduled" | "draft";
  reach: number;
  publishLabel: string;
};

export type EventReminder = {
  id: string;
  eventTitle: string;
  offsetLabel: string;
  channel: PublicationChannel;
  sendLabel: string;
  status: "sent" | "queued";
};

export const EVENT_PUBLICATIONS: EventPublication[] = [
  {
    id: "pub-pep-rally",
    eventTitle: "Fall Pep Rally",
    audience: "All Campus",
    channels: ["campus_feed", "calendar", "push"],
    status: "published",
    reach: 842,
    publishLabel: "Published 2h ago",
  },
  {
    id: "pub-robotics",
    eventTitle: "Robotics Showcase",
    audience: "STEM Academy · Families",
    channels: ["campus_feed", "email", "calendar"],
    status: "published",
    reach: 214,
    publishLabel: "Published yesterday",
  },
  {
    id: "pub-service-day",
    eventTitle: "Blue Don Service Day",
    audience: "Grades 9–12 · Service Center",
    channels: ["campus_feed", "email", "push"],
    status: "scheduled",
    reach: 610,
    publishLabel: "Publishes Fri 8:00 AM",
  },
];

export const EVENT_REMINDERS: EventReminder[] = [
  {
    id: "rem-pep-1",
    eventTitle: "Fall Pep Rally",
    offsetLabel: "1 day before",
    channel: "push",
    sendLabel: "Sent · 720 delivered",
    status: "sent",
  },
  {
    id: "rem-pep-2",
    eventTitle: "Fall Pep Rally",
    offsetLabel: "1 hour before",
    channel: "push",
    sendLabel: "Queued for 6:00 PM",
    status: "queued",
  },
  {
    id: "rem-robotics",
    eventTitle: "Robotics Showcase",
    offsetLabel: "Morning of",
    channel: "email",
    sendLabel: "Queued for 7:30 AM",
    status: "queued",
  },
];
