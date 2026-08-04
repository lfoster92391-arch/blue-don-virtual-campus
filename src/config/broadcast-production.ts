/**
 * Broadcasting production suite — categories, roles, booking services, join tracks.
 */

export const CAMPUS_MEDIA_CATEGORY_LABELS = {
  MORNING_ANNOUNCEMENTS: "Morning Announcements",
  SPORTS_HIGHLIGHTS: "Sports Highlights",
  STUDENT_SPOTLIGHT: "Student Spotlight",
  SPECIAL_EVENTS: "Special Events",
  HIGHLIGHT_REEL: "Highlight Reel",
  OTHER: "Other",
} as const;

export type CampusMediaCategoryKey = keyof typeof CAMPUS_MEDIA_CATEGORY_LABELS;

export const ON_DEMAND_CATEGORIES: CampusMediaCategoryKey[] = [
  "MORNING_ANNOUNCEMENTS",
  "SPORTS_HIGHLIGHTS",
  "STUDENT_SPOTLIGHT",
  "SPECIAL_EVENTS",
];

export const BROADCAST_BOOKING_SERVICE_LABELS = {
  FILM_COVERAGE: "Film coverage",
  PHOTOGRAPHY: "Photography",
  LIVE_STREAMING: "Live streaming",
} as const;

export type BroadcastBookingServiceKey =
  keyof typeof BROADCAST_BOOKING_SERVICE_LABELS;

export const BROADCAST_BOOKING_STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  COMPLETED: "Completed",
} as const;

export const BROADCAST_SUBMISSION_STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DECLINED: "Declined",
  AIRED: "Aired",
} as const;

export const BROADCAST_PRODUCTION_ROLE_LABELS = {
  HOST: "Host",
  CAMERA: "Camera",
  EDITOR: "Editor",
  PRODUCER: "Producer",
  GRAPHICS: "Graphics",
  AUDIO: "Audio",
  FLOOR_DIRECTOR: "Floor director",
  WRITER: "Writer",
  OTHER: "Other",
} as const;

export type BroadcastProductionRoleKey =
  keyof typeof BROADCAST_PRODUCTION_ROLE_LABELS;

export const BROADCAST_JOIN_TRACK_LABELS = {
  HOST: "Host",
  CAMERA: "Camera",
  EDITOR: "Editor",
  GRAPHICS: "Graphics",
  AUDIO: "Audio",
  PRODUCER: "Producer",
  WRITER: "Writer",
  FLEXIBLE: "Flexible / wherever needed",
} as const;

export type BroadcastJoinTrackKey = keyof typeof BROADCAST_JOIN_TRACK_LABELS;

export const BROADCAST_JOIN_STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
} as const;

export const DEFAULT_BROADCAST_EQUIPMENT = [
  { name: "Studio camera A", category: "Camera", sortOrder: 1 },
  { name: "Studio camera B", category: "Camera", sortOrder: 2 },
  { name: "Tripod / fluid head", category: "Camera", sortOrder: 3 },
  { name: "Desk microphone", category: "Audio", sortOrder: 4 },
  { name: "Wireless lav kit", category: "Audio", sortOrder: 5 },
  { name: "Audio mixer / interface", category: "Audio", sortOrder: 6 },
  { name: "LED key light", category: "Lighting", sortOrder: 7 },
  { name: "Fill / hair light", category: "Lighting", sortOrder: 8 },
  { name: "Teleprompter", category: "Studio", sortOrder: 9 },
  { name: "Switching computer (OBS)", category: "Control", sortOrder: 10 },
  { name: "Graphics / lower-thirds laptop", category: "Control", sortOrder: 11 },
  { name: "Spare SD / media cards", category: "Accessories", sortOrder: 12 },
] as const;

export const JOIN_PORTAL_INSTRUCTIONS = [
  "Tell us which production tracks interest you — Host, Camera, Editor, Graphics, and more.",
  "Share any prior experience (school, church, YouTube, photography, etc.). Experience is welcome but not required.",
  "Officers review applications and will message you on Command Center with next steps.",
  "Accepted members are added to the Broadcasting roster and can use Daily Rundown and Control Room tools.",
] as const;
