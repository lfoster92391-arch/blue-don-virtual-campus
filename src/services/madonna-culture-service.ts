import { sampleList, sampleOrNull } from "@/config/app-mode";
import {
  APPROVED_TRADITION_PROPOSALS,
  ARCHIVE_COLLECTIONS,
  CAMPUS_POLLS,
  CLASS_TIME_CAPSULES,
  FACULTY,
  HALL_CATEGORY_LABELS,
  HALL_INDUCTEES,
  HISTORY_EVENTS,
  LEGACY_PROJECTS,
  MADONNA_HISTORY_DAYS,
  MEMORY_HIGHLIGHTS,
  ALUMNI_LOCATIONS,
  STAFF_SPOTLIGHT,
  STUDENT_SPOTLIGHT,
  THANK_YOU_MESSAGES,
  TRADITIONS,
  WHY_MADONNA,
  type AlumniLocation,
  type ArchiveCollection,
  type CampusPoll,
  type ClassTimeCapsule,
  type FacultyMember,
  type HallCategory,
  type HallInductee,
  type HistoryEvent,
  type LegacyProject,
  type MadonnaHistoryDay,
  type MemoryHighlight,
  type StaffSpotlight,
  type StudentSpotlight,
  type ThankYouMessage,
  type TraditionDetail,
  type TraditionProposal,
} from "@/config/madonna-culture";

export function getTraditions(): TraditionDetail[] {
  return TRADITIONS;
}

export function getTraditionBySlug(slug: string): TraditionDetail | undefined {
  return TRADITIONS.find((t) => t.slug === slug);
}

export function getTraditionSlugs(): string[] {
  return TRADITIONS.map((t) => t.slug);
}

export function getHistoryEvents(): HistoryEvent[] {
  return [...HISTORY_EVENTS].sort((a, b) => a.year - b.year);
}

export function getHallCategories(): { id: HallCategory; label: string }[] {
  return (Object.keys(HALL_CATEGORY_LABELS) as HallCategory[]).map((id) => ({
    id,
    label: HALL_CATEGORY_LABELS[id],
  }));
}

// The Hall of Fame, faculty directory, spotlights, thank-you wall, polls,
// alumni map, legacy projects, archives, and time capsules are all populated by
// real users over time. In clean slate mode they start empty; the demo samples
// only appear when clean slate is off.
export function getHallInductees(hall?: HallCategory): HallInductee[] {
  const inductees = sampleList(HALL_INDUCTEES);
  if (!hall) return inductees;
  return inductees.filter((i) => i.hall === hall);
}

export function getFaculty(): FacultyMember[] {
  return sampleList(FACULTY);
}

export function getFacultyBySlug(slug: string): FacultyMember | undefined {
  return getFaculty().find((f) => f.slug === slug);
}

export function getStudentSpotlight(): StudentSpotlight | null {
  return sampleOrNull(STUDENT_SPOTLIGHT);
}

export function getStaffSpotlight(): StaffSpotlight | null {
  return sampleOrNull(STAFF_SPOTLIGHT);
}

export function getThankYouMessages(status?: ThankYouMessage["status"]): ThankYouMessage[] {
  const messages = sampleList(THANK_YOU_MESSAGES);
  if (!status) return messages;
  return messages.filter((m) => m.status === status);
}

export function getMemoryHighlights(): MemoryHighlight[] {
  return sampleList(MEMORY_HIGHLIGHTS);
}

export function getApprovedTraditionProposals(): TraditionProposal[] {
  return sampleList(APPROVED_TRADITION_PROPOSALS);
}

export function getCampusPolls(): CampusPoll[] {
  return sampleList(CAMPUS_POLLS);
}

export function getAlumniLocations(): AlumniLocation[] {
  return sampleList(ALUMNI_LOCATIONS);
}

export function getLegacyProjects(): LegacyProject[] {
  return sampleList(LEGACY_PROJECTS);
}

export function getArchiveCollections(): ArchiveCollection[] {
  return sampleList(ARCHIVE_COLLECTIONS);
}

export function getClassTimeCapsules(): ClassTimeCapsule[] {
  return sampleList(CLASS_TIME_CAPSULES);
}

export function getWhyMadonna() {
  return WHY_MADONNA;
}

export function getTodayInMadonnaHistory(date: Date = new Date()): MadonnaHistoryDay[] {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return MADONNA_HISTORY_DAYS.filter((entry) => entry.month === month && entry.day === day);
}
