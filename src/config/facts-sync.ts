/**
 * W14 · FACTS Sync — StudentProfile and parent data sync status.
 */

export type FactsSyncField = {
  field: string;
  source: "facts" | "blue_don";
  lastSyncedLabel: string;
  status: "synced" | "pending" | "conflict";
};

export type FactsSyncSummary = {
  lastFullSync: string;
  studentProfilesSynced: number;
  parentContactsSynced: number;
  pendingConflicts: number;
  status: "healthy" | "syncing" | "error";
};

export const FACTS_SYNC_SUMMARY: FactsSyncSummary = {
  lastFullSync: "Today 6:00 AM",
  studentProfilesSynced: 980,
  parentContactsSynced: 620,
  pendingConflicts: 2,
  status: "healthy",
};

export const FACTS_SYNC_FIELDS: FactsSyncField[] = [
  { field: "Student name", source: "facts", lastSyncedLabel: "Today 6:00 AM", status: "synced" },
  { field: "Grade level", source: "facts", lastSyncedLabel: "Today 6:00 AM", status: "synced" },
  { field: "Parent/guardian contacts", source: "facts", lastSyncedLabel: "Today 6:00 AM", status: "synced" },
  { field: "Emergency contacts", source: "facts", lastSyncedLabel: "Today 6:00 AM", status: "synced" },
  { field: "Enrollment status", source: "facts", lastSyncedLabel: "Today 6:00 AM", status: "synced" },
  { field: "Profile photo", source: "blue_don", lastSyncedLabel: "Manual upload", status: "pending" },
  { field: "Academy membership", source: "blue_don", lastSyncedLabel: "Real-time", status: "synced" },
  { field: "Service hours", source: "blue_don", lastSyncedLabel: "Real-time", status: "synced" },
];
