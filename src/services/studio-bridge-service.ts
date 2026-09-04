/**
 * Studio Bridge — the OBS control path for the Broadcast Control Studio.
 *
 * The campus runs on Vercel and cannot dial the Studio B PC through the school
 * NAT, so control is inverted. The console writes a `StudioCommand` row; a small
 * agent on the OBS machine polls for it, runs it against OBS WebSocket, and
 * posts telemetry back. Nothing in this file ever holds an OBS password or a
 * stream key — those live only in the agent's local `.env`.
 *
 * Two honesty rules hold everywhere below:
 *  - "Connected" is derived from how recently the agent was heard from, never
 *    from a stored flag. An agent that dies mid-show reads DISCONNECTED.
 *  - A command kind is an enum in the database and a whitelist again in the
 *    agent, so no arbitrary OBS RPC can be pushed from the network.
 *
 * See docs/STUDIO_BRIDGE_SETUP.md.
 */

import { createHash, timingSafeEqual } from "crypto";

import {
  STUDIO_BRIDGE_DEFAULT_KEY,
  STUDIO_BRIDGE_ONLINE_WINDOW_MS,
  STUDIO_COMMAND_BATCH_SIZE,
  STUDIO_COMMAND_HISTORY_SIZE,
  STUDIO_COMMAND_LABELS,
  STUDIO_COMMAND_TTL_MS,
} from "@/config/broadcast-studio";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy } from "@/config/roles";
import type {
  StudioCommandKind,
  StudioCommandStatus,
} from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { withDatabase } from "@/lib/prisma";
import { resolveBroadcastOrgId } from "@/services/broadcast-script-service";
import { canManageCampusMedia } from "@/services/media-service";

/* --------------------------------------------------------------- shapes */

export type StudioBridgeStats = {
  kbps: number | null;
  droppedFrames: number | null;
  totalFrames: number | null;
  cpuUsage: number | null;
};

export type StudioCommandView = {
  id: string;
  kind: StudioCommandKind;
  label: string;
  status: StudioCommandStatus;
  /** The scene a scene command targets, so a failure names what did not take. */
  sceneName: string | null;
  requestedByName: string | null;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
};

export type StudioBridgeDeviceState = {
  key: string;
  label: string;
  /** Fresh telemetry inside the liveness window. The only honest "connected". */
  online: boolean;
  lastSeenAt: string | null;
  agentVersion: string | null;
  obsConnected: boolean;
  obsVersion: string | null;
  studioModeEnabled: boolean;
  programScene: string | null;
  previewScene: string | null;
  /** Scene names OBS reported. Kept while offline, but the panel is disabled. */
  scenes: string[];
  streaming: boolean;
  recording: boolean;
  streamTimecode: string | null;
  recordTimecode: string | null;
  stats: StudioBridgeStats | null;
  lastError: string | null;
  lastErrorAt: string | null;
  queuedCount: number;
  recentCommands: StudioCommandView[];
};

export type StudioBridgeSnapshot = {
  /** `STUDIO_BRIDGE_TOKEN` is set on the server, so pairing is possible at all. */
  configured: boolean;
  /** Null until an agent has authenticated at least once. */
  device: StudioBridgeDeviceState | null;
};

export type StudioBridgeTelemetry = {
  obsConnected: boolean;
  obsVersion?: string | null;
  studioModeEnabled?: boolean;
  programScene?: string | null;
  previewScene?: string | null;
  scenes?: string[];
  streaming?: boolean;
  recording?: boolean;
  streamTimecode?: string | null;
  recordTimecode?: string | null;
  stats?: StudioBridgeStats | null;
  /** Last thing that went wrong on the agent, surfaced in System Health. */
  error?: string | null;
};

export type StudioCommandResult = {
  id: string;
  status: "DONE" | "FAILED";
  error?: string | null;
};

/* ----------------------------------------------------------------- token */

function bridgeTokenFromEnv(): string | null {
  const raw = process.env.STUDIO_BRIDGE_TOKEN?.trim();
  // Short secrets are treated as unset rather than quietly accepted.
  return raw && raw.length >= 24 ? raw : null;
}

export function isStudioBridgeConfigured(): boolean {
  return bridgeTokenFromEnv() !== null;
}

/**
 * Student-facing reason the Studio B encoder cannot start. Null means OBS is
 * reachable and Go Live may queue StartStream.
 */
export function describeStudioEncoderBlocker(
  snapshot: StudioBridgeSnapshot,
): string | null {
  if (!snapshot.configured) {
    return "Studio B is not linked yet. Use Go Live from your phone, or ask an advisor to start the Studio Bridge.";
  }
  if (!snapshot.device) {
    return "The Studio Bridge has never paired. Start it on the Studio B PC, or go live from your phone.";
  }
  if (!snapshot.device.online) {
    return "The Studio Bridge is offline. Start it on the Studio B PC, or go live from your phone.";
  }
  if (!snapshot.device.obsConnected) {
    return "OBS is not connected. Open OBS on the Studio B PC, or go live from your phone.";
  }
  return null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export type BridgeAuthResult =
  | { ok: true; tokenHash: string }
  | { ok: false; status: number; error: string };

/**
 * Authenticates an agent request against `STUDIO_BRIDGE_TOKEN`.
 *
 * Both sides are hashed before comparison so the compare runs over two
 * fixed-length digests: `timingSafeEqual` then cannot throw on a length
 * mismatch, and the length of the real token never leaks through timing.
 */
export function authorizeBridgeRequest(request: Request): BridgeAuthResult {
  const expected = bridgeTokenFromEnv();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Studio bridge is not configured on this server.",
    };
  }

  const header = request.headers.get("authorization")?.trim() ?? "";
  const presented = /^Bearer\s+(.+)$/i.exec(header)?.[1]?.trim();
  if (!presented) {
    return { ok: false, status: 401, error: "Missing bridge token." };
  }

  const presentedHash = sha256(presented);
  const matches = timingSafeEqual(
    Buffer.from(presentedHash, "hex"),
    Buffer.from(sha256(expected), "hex"),
  );

  return matches
    ? { ok: true, tokenHash: presentedHash }
    : { ok: false, status: 401, error: "Invalid bridge token." };
}

/** Device key from the agent, normalized so it can key a unique row. */
export function normalizeBridgeKey(value: unknown): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  const cleaned = raw.replace(/[^a-z0-9._-]/g, "").slice(0, 64);
  return cleaned || STUDIO_BRIDGE_DEFAULT_KEY;
}

/* ------------------------------------------------------------- read side */

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function parseScenes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, 100);
}

function parseStats(value: unknown): StudioBridgeStats | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const num = (key: string): number | null => {
    const entry = raw[key];
    return typeof entry === "number" && Number.isFinite(entry) ? entry : null;
  };

  const stats: StudioBridgeStats = {
    kbps: num("kbps"),
    droppedFrames: num("droppedFrames"),
    totalFrames: num("totalFrames"),
    cpuUsage: num("cpuUsage"),
  };

  return Object.values(stats).some((entry) => entry !== null) ? stats : null;
}

function isFresh(lastSeenAt: Date | null, now: number): boolean {
  return Boolean(
    lastSeenAt && now - lastSeenAt.getTime() <= STUDIO_BRIDGE_ONLINE_WINDOW_MS,
  );
}

function commandSceneName(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const scene = (payload as Record<string, unknown>).sceneName;
  return typeof scene === "string" && scene.trim().length > 0
    ? scene.trim()
    : null;
}

function toCommandView(row: {
  id: string;
  kind: StudioCommandKind;
  status: StudioCommandStatus;
  payload: unknown;
  requestedByName: string | null;
  createdAt: Date;
  completedAt: Date | null;
  error: string | null;
}): StudioCommandView {
  return {
    id: row.id,
    kind: row.kind,
    label: STUDIO_COMMAND_LABELS[row.kind] ?? row.kind,
    status: row.status,
    sceneName: commandSceneName(row.payload),
    requestedByName: row.requestedByName,
    createdAt: row.createdAt.toISOString(),
    completedAt: toIso(row.completedAt),
    error: row.error,
  };
}

/**
 * Bridge state for the console snapshot.
 *
 * When the agent has gone quiet every OBS-derived field is forced false or
 * null: the last posted values describe a machine we can no longer see, and the
 * console must not imply it is still switching scenes. The scene name list is
 * the one thing kept, so the panel can stay recognizable while disabled.
 */
export async function getStudioBridgeSnapshot(options?: {
  bridgeKey?: string;
}): Promise<StudioBridgeSnapshot> {
  const configured = isStudioBridgeConfigured();
  const key = normalizeBridgeKey(options?.bridgeKey);

  const row = await withDatabase((prisma) =>
    prisma.studioBridge.findUnique({
      where: { key },
      select: {
        key: true,
        label: true,
        lastSeenAt: true,
        agentVersion: true,
        obsConnected: true,
        obsVersion: true,
        studioModeEnabled: true,
        programScene: true,
        previewScene: true,
        scenes: true,
        streaming: true,
        recording: true,
        streamTimecode: true,
        recordTimecode: true,
        stats: true,
        lastError: true,
        lastErrorAt: true,
        commands: {
          orderBy: { createdAt: "desc" },
          take: STUDIO_COMMAND_HISTORY_SIZE,
          select: {
            id: true,
            kind: true,
            status: true,
            payload: true,
            requestedByName: true,
            createdAt: true,
            completedAt: true,
            error: true,
          },
        },
        _count: {
          select: { commands: { where: { status: { in: ["QUEUED", "CLAIMED"] } } } },
        },
      },
    }),
  );

  if (!row) {
    return { configured, device: null };
  }

  const online = isFresh(row.lastSeenAt, Date.now());

  return {
    configured,
    device: {
      key: row.key,
      label: row.label,
      online,
      lastSeenAt: toIso(row.lastSeenAt),
      agentVersion: row.agentVersion,
      obsConnected: online && row.obsConnected,
      obsVersion: online ? row.obsVersion : null,
      studioModeEnabled: online && row.studioModeEnabled,
      programScene: online ? row.programScene : null,
      previewScene: online ? row.previewScene : null,
      scenes: parseScenes(row.scenes),
      streaming: online && row.streaming,
      recording: online && row.recording,
      streamTimecode: online ? row.streamTimecode : null,
      recordTimecode: online ? row.recordTimecode : null,
      stats: online ? parseStats(row.stats) : null,
      lastError: row.lastError,
      lastErrorAt: toIso(row.lastErrorAt),
      queuedCount: row._count.commands,
      recentCommands: row.commands.map(toCommandView),
    },
  };
}

/* --------------------------------------------------------- permissions */

/**
 * Who may start or stop the actual OBS stream.
 *
 * Everything in the studio already requires `canManageCampusMedia`. This
 * narrows the two destructive transport commands to people accountable for the
 * broadcast: campus admins and advisors, Broadcasting officers, and anyone
 * credited as Producer or Floor Director. A plain Broadcast Academy member can
 * still run the console and switch scenes, but cannot pull the stream down.
 */
export async function canRunStudioTransport(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  if (!(await canManageCampusMedia(userId, role))) {
    return false;
  }

  if (canManageAcademy(role)) {
    return true;
  }

  const orgId = await resolveBroadcastOrgId();
  if (orgId && (await hasOrgPermission(userId, orgId, "org:media:manage"))) {
    return true;
  }

  const credit = await withDatabase((prisma) =>
    prisma.broadcastCrewCredit.findFirst({
      where: {
        userId,
        productionRole: { in: ["PRODUCER", "FLOOR_DIRECTOR"] },
      },
      select: { id: true },
    }),
  );

  return Boolean(credit);
}

const TRANSPORT_KINDS: StudioCommandKind[] = [
  "OBS_START_STREAM",
  "OBS_STOP_STREAM",
];

const SCENE_KINDS: StudioCommandKind[] = [
  "SET_PROGRAM_SCENE",
  "SET_PREVIEW_SCENE",
];

const STUDIO_MODE_KINDS: StudioCommandKind[] = [
  "SET_PREVIEW_SCENE",
  "TRIGGER_TRANSITION",
];

/* -------------------------------------------------------------- queueing */

export type QueueCommandResult =
  | { command: StudioCommandView }
  | { error: string };

/**
 * Puts one whitelisted command on the queue for the paired OBS machine.
 *
 * Refuses rather than queuing into the void: a command written while the agent
 * is down would run whenever it next came up, which for a scene take or a
 * stream stop is worse than nothing. Crew permission is re-checked here, not
 * only in the action, so the queue cannot be filled from anywhere else.
 */
export async function queueStudioCommand(input: {
  actorId: string;
  actorName: string;
  role: CampusRole;
  kind: StudioCommandKind;
  sceneName?: string | null;
  bridgeKey?: string;
}): Promise<QueueCommandResult> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can drive the studio bridge." };
  }

  if (
    TRANSPORT_KINDS.includes(input.kind) &&
    !(await canRunStudioTransport(input.actorId, input.role))
  ) {
    return {
      error:
        "Starting and stopping the OBS stream is limited to Producers, Floor Directors, Broadcasting officers, and advisors.",
    };
  }

  const key = normalizeBridgeKey(input.bridgeKey);
  const bridge = await withDatabase((prisma) =>
    prisma.studioBridge.findUnique({
      where: { key },
      select: {
        id: true,
        lastSeenAt: true,
        obsConnected: true,
        studioModeEnabled: true,
        scenes: true,
      },
    }),
  );

  if (!bridge) {
    return {
      error:
        "No studio bridge has ever paired with the campus. Start the bridge on the Studio B PC.",
    };
  }

  if (!isFresh(bridge.lastSeenAt, Date.now())) {
    return {
      error:
        "The studio bridge is offline. Start it on the Studio B PC, or run this in OBS by hand.",
    };
  }

  if (!bridge.obsConnected) {
    return {
      error:
        "The bridge is running but OBS is not connected. Open OBS and check Tools → WebSocket Server Settings.",
    };
  }

  if (
    STUDIO_MODE_KINDS.includes(input.kind) &&
    !bridge.studioModeEnabled
  ) {
    return {
      error: "Turn on Studio Mode in OBS to use preview and take.",
    };
  }

  const sceneName = input.sceneName?.trim() ?? "";
  if (SCENE_KINDS.includes(input.kind)) {
    if (!sceneName) {
      return { error: "Pick a scene first." };
    }

    if (!parseScenes(bridge.scenes).includes(sceneName)) {
      return {
        error: `OBS is not reporting a scene named "${sceneName}".`,
      };
    }
  }

  const now = Date.now();
  const created = await withDatabase((prisma) =>
    prisma.studioCommand.create({
      data: {
        bridgeId: bridge.id,
        kind: input.kind,
        payload: SCENE_KINDS.includes(input.kind) ? { sceneName } : {},
        requestedById: input.actorId,
        requestedByName: input.actorName,
        expiresAt: new Date(now + STUDIO_COMMAND_TTL_MS),
      },
      select: {
        id: true,
        kind: true,
        status: true,
        payload: true,
        requestedByName: true,
        createdAt: true,
        completedAt: true,
        error: true,
      },
    }),
  );

  if (!created) {
    return { error: "Unable to queue the command. Check database connectivity." };
  }

  return { command: toCommandView(created) };
}

/* ---------------------------------------------------------- agent side */

export type ClaimedCommand = {
  id: string;
  kind: StudioCommandKind;
  payload: Record<string, unknown>;
};

/**
 * Heartbeat plus claim, in one call — the agent's poll is also the liveness
 * signal the console reads, so a bridge that stops polling goes DISCONNECTED
 * without anyone writing a "disconnected" flag.
 *
 * The same pass ages out work that can no longer be trusted: queued commands
 * past their TTL become EXPIRED, and claimed commands the agent never reported
 * on become FAILED, so the console never shows a permanently pending take.
 */
export async function claimStudioCommands(input: {
  bridgeKey: string;
  tokenHash: string;
}): Promise<{ bridgeKey: string; commands: ClaimedCommand[] } | null> {
  const key = normalizeBridgeKey(input.bridgeKey);
  const now = new Date();

  return withDatabase(async (prisma) => {
    const bridge = await prisma.studioBridge.upsert({
      where: { key },
      create: {
        key,
        label: bridgeLabel(key),
        tokenHash: input.tokenHash,
        lastSeenAt: now,
      },
      update: { tokenHash: input.tokenHash, lastSeenAt: now },
      select: { id: true },
    });

    await prisma.studioCommand.updateMany({
      where: { bridgeId: bridge.id, status: "QUEUED", expiresAt: { lt: now } },
      data: { status: "EXPIRED", completedAt: now },
    });

    await prisma.studioCommand.updateMany({
      where: {
        bridgeId: bridge.id,
        status: "CLAIMED",
        claimedAt: { lt: new Date(now.getTime() - STUDIO_COMMAND_TTL_MS) },
      },
      data: {
        status: "FAILED",
        completedAt: now,
        error: "The bridge never reported a result for this command.",
      },
    });

    const queued = await prisma.studioCommand.findMany({
      where: { bridgeId: bridge.id, status: "QUEUED" },
      orderBy: { createdAt: "asc" },
      take: STUDIO_COMMAND_BATCH_SIZE,
      select: { id: true },
    });

    if (queued.length === 0) {
      return { bridgeKey: key, commands: [] };
    }

    const ids = queued.map((row) => row.id);
    await prisma.studioCommand.updateMany({
      where: { id: { in: ids }, status: "QUEUED" },
      data: { status: "CLAIMED", claimedAt: now },
    });

    const claimed = await prisma.studioCommand.findMany({
      where: { id: { in: ids }, status: "CLAIMED" },
      orderBy: { createdAt: "asc" },
      select: { id: true, kind: true, payload: true },
    });

    return {
      bridgeKey: key,
      commands: claimed.map((row) => ({
        id: row.id,
        kind: row.kind,
        payload:
          row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
            ? (row.payload as Record<string, unknown>)
            : {},
      })),
    };
  });
}

function bridgeLabel(key: string): string {
  return key === STUDIO_BRIDGE_DEFAULT_KEY ? "Studio B" : key;
}

/**
 * Telemetry push from the agent, plus the outcome of any command it just ran.
 *
 * `runId` is the agent's process id for this run, so a restart opens a new
 * `StudioSession` and "was the bridge up for the game?" stays answerable.
 */
export async function recordStudioBridgeState(input: {
  bridgeKey: string;
  tokenHash: string;
  runId?: string | null;
  agentVersion?: string | null;
  telemetry: StudioBridgeTelemetry;
  results?: StudioCommandResult[];
}): Promise<{ bridgeKey: string; applied: number } | null> {
  const key = normalizeBridgeKey(input.bridgeKey);
  const now = new Date();
  const telemetry = input.telemetry;
  const runId = input.runId?.trim().slice(0, 64) || null;

  return withDatabase(async (prisma) => {
    const data = {
      tokenHash: input.tokenHash,
      lastSeenAt: now,
      agentVersion: input.agentVersion?.trim().slice(0, 40) ?? null,
      obsConnected: telemetry.obsConnected,
      obsVersion: telemetry.obsVersion?.trim().slice(0, 40) ?? null,
      studioModeEnabled: Boolean(telemetry.studioModeEnabled),
      programScene: telemetry.programScene?.trim().slice(0, 200) ?? null,
      previewScene: telemetry.previewScene?.trim().slice(0, 200) ?? null,
      scenes: parseScenes(telemetry.scenes),
      streaming: Boolean(telemetry.streaming),
      recording: Boolean(telemetry.recording),
      streamTimecode: telemetry.streamTimecode?.trim().slice(0, 20) ?? null,
      recordTimecode: telemetry.recordTimecode?.trim().slice(0, 20) ?? null,
      stats: parseStats(telemetry.stats) ?? undefined,
      ...(telemetry.error
        ? { lastError: telemetry.error.slice(0, 500), lastErrorAt: now }
        : {}),
    };

    const bridge = await prisma.studioBridge.upsert({
      where: { key },
      create: { key, label: bridgeLabel(key), ...data },
      update: data,
      select: { id: true },
    });

    let sessionId: string | null = null;
    if (runId) {
      const session = await prisma.studioSession.upsert({
        where: { bridgeId_runId: { bridgeId: bridge.id, runId } },
        create: {
          bridgeId: bridge.id,
          runId,
          startedAt: now,
          lastSeenAt: now,
          agentVersion: data.agentVersion,
          obsVersion: data.obsVersion,
        },
        update: {
          lastSeenAt: now,
          agentVersion: data.agentVersion,
          obsVersion: data.obsVersion,
        },
        select: { id: true },
      });
      sessionId = session.id;

      // An older run that is still open belongs to an agent that has since been
      // restarted; close it so the session log reads truthfully.
      await prisma.studioSession.updateMany({
        where: { bridgeId: bridge.id, endedAt: null, id: { not: session.id } },
        data: { endedAt: now },
      });
    }

    let applied = 0;
    for (const result of input.results ?? []) {
      if (!result?.id) {
        continue;
      }

      const update = await prisma.studioCommand.updateMany({
        where: { id: result.id, bridgeId: bridge.id, status: "CLAIMED" },
        data: {
          status: result.status === "DONE" ? "DONE" : "FAILED",
          completedAt: now,
          error: result.status === "DONE" ? null : (result.error?.slice(0, 500) ?? "OBS rejected the command."),
          ...(sessionId ? { sessionId } : {}),
        },
      });

      applied += update.count;
    }

    return { bridgeKey: key, applied };
  });
}
