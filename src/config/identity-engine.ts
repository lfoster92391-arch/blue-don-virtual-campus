/**
 * W8 · Identity Engine — Blue Don Pass, QR check-in.
 */

export type CheckInRecord = {
  id: string;
  location: string;
  timeLabel: string;
  method: "qr" | "manual";
};

export type BlueDonPass = {
  studentId: string;
  displayName: string;
  grade: string;
  classOf: string;
  academy: string;
  photoUrl: string | null;
  qrPayload: string;
  status: "active" | "suspended";
};

export const BLUE_DON_PASS: BlueDonPass = {
  studentId: "MHS-2026-0142",
  displayName: "Campus Student",
  grade: "11",
  classOf: "2027",
  academy: "STEM Academy",
  photoUrl: null,
  qrPayload: "blue-don://pass/MHS-2026-0142",
  status: "active",
};

export const RECENT_CHECK_INS: CheckInRecord[] = [
  { id: "ci-1", location: "Main Gym — Pep Rally", timeLabel: "Yesterday 6:45 PM", method: "qr" },
  { id: "ci-2", location: "STEM Lab 214", timeLabel: "Mon 3:20 PM", method: "qr" },
  { id: "ci-3", location: "Service Day — Food Pantry", timeLabel: "Mar 8, 9:05 AM", method: "manual" },
];
