/**
 * W10 · Integrations — Classroom + Calendar read sync.
 */

export type IntegrationStatus = "connected" | "syncing" | "disconnected" | "planned";

export type IntegrationConnection = {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: IntegrationStatus;
  lastSyncLabel: string;
  itemsSynced?: number;
};

export const INTEGRATIONS: IntegrationConnection[] = [
  {
    id: "int-classroom",
    name: "Google Classroom",
    provider: "Google",
    description: "Read-only sync of assignments, due dates, and class rosters.",
    status: "connected",
    lastSyncLabel: "Synced 12 min ago",
    itemsSynced: 48,
  },
  {
    id: "int-calendar",
    name: "Google Calendar",
    provider: "Google",
    description: "Two-way read sync of campus events and personal calendars.",
    status: "connected",
    lastSyncLabel: "Synced 12 min ago",
    itemsSynced: 23,
  },
  {
    id: "int-facts",
    name: "FACTS SIS",
    provider: "FACTS",
    description: "Student profiles, parent contacts, and enrollment data.",
    status: "syncing",
    lastSyncLabel: "Initial sync in progress",
  },
  {
    id: "int-assetpilot",
    name: "Asset Pilot EDU",
    provider: "Asset Pilot",
    description: "Partner embed and cross-origin API health.",
    status: "connected",
    lastSyncLabel: "Healthy",
  },
];
