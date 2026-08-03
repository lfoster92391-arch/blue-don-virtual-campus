export type ClubCalendarEventView = {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
  createdByName: string;
};
