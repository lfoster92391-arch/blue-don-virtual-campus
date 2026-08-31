import { redirect } from "next/navigation";

/**
 * Legacy URL. Announcements — the live show, today's message, and the archive —
 * moved into the Broadcast section of the Madonna Hub.
 */
export default function MadonnaAnnouncementsPage() {
  redirect("/madonna/broadcast");
}
