/**
 * Blue Don Studio Bridge — the OBS agent for the Broadcast Control Studio.
 *
 * Runs on the Studio B PC, next to OBS. The campus site is on Vercel and cannot
 * dial into the school network, so this agent does the reaching: it polls the
 * campus for queued commands, runs the whitelisted ones against OBS WebSocket,
 * and posts OBS telemetry back so the console can show real status.
 *
 * Two things never leave this machine: OBS_WEBSOCKET_PASSWORD and whatever
 * stream key OBS is configured with. Neither is read, logged, or transmitted.
 *
 * Setup: ../docs/STUDIO_BRIDGE_SETUP.md
 */

import "dotenv/config";
import { randomUUID } from "node:crypto";

import OBSWebSocket from "obs-websocket-js";

const AGENT_VERSION = "1.0.0";

/* ------------------------------------------------------------------ config */

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(
      `[bridge] ${name} is missing. Copy .env.example to .env and fill it in.`,
    );
    process.exit(1);
  }
  return value;
}

function intFromEnv(name, fallback) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const config = {
  obsUrl: process.env.OBS_WEBSOCKET_URL?.trim() || "ws://127.0.0.1:4455",
  obsPassword: process.env.OBS_WEBSOCKET_PASSWORD?.trim() || "",
  apiUrl: required("STUDIO_API_URL").replace(/\/+$/, ""),
  token: required("STUDIO_BRIDGE_TOKEN"),
  bridgeKey: (process.env.STUDIO_BRIDGE_KEY?.trim() || "studio-b").toLowerCase(),
  pollIntervalMs: intFromEnv("STUDIO_BRIDGE_POLL_MS", 3000),
  /** Post telemetry at least this often, even when nothing changed. */
  heartbeatMs: intFromEnv("STUDIO_BRIDGE_HEARTBEAT_MS", 10000),
  requestTimeoutMs: intFromEnv("STUDIO_BRIDGE_TIMEOUT_MS", 8000),
};

/** One id per process run, so the campus can log agent restarts honestly. */
const runId = randomUUID();

/* ------------------------------------------------------------- OBS command
 *
 * The whitelist. A command kind that is not a key here is refused, so nothing
 * arriving over the network can reach an arbitrary OBS RPC. Each entry decides
 * for itself which OBS request it makes and which arguments it passes on —
 * payloads never become request bodies.
 */

const COMMAND_HANDLERS = {
  SET_PROGRAM_SCENE: async (obs, payload, telemetry) => {
    const sceneName = knownScene(payload, telemetry);
    await obs.call("SetCurrentProgramScene", { sceneName });
  },
  SET_PREVIEW_SCENE: async (obs, payload, telemetry) => {
    const sceneName = knownScene(payload, telemetry);
    if (!telemetry.studioModeEnabled) {
      throw new Error("Studio Mode is off in OBS.");
    }
    await obs.call("SetCurrentPreviewScene", { sceneName });
  },
  TRIGGER_TRANSITION: async (obs, _payload, telemetry) => {
    if (!telemetry.studioModeEnabled) {
      throw new Error("Studio Mode is off in OBS.");
    }
    await obs.call("TriggerStudioModeTransition");
  },
  OBS_START_STREAM: async (obs, _payload, telemetry) => {
    if (telemetry.streaming) {
      return;
    }
    await obs.call("StartStream");
  },
  OBS_STOP_STREAM: async (obs, _payload, telemetry) => {
    if (!telemetry.streaming) {
      return;
    }
    await obs.call("StopStream");
  },
  OBS_START_RECORD: async (obs, _payload, telemetry) => {
    if (telemetry.recording) {
      return;
    }
    await obs.call("StartRecord");
  },
  OBS_STOP_RECORD: async (obs, _payload, telemetry) => {
    if (!telemetry.recording) {
      return;
    }
    await obs.call("StopRecord");
  },
};

/** Scene names are only accepted if OBS just told us it has one by that name. */
function knownScene(payload, telemetry) {
  const sceneName =
    typeof payload?.sceneName === "string" ? payload.sceneName.trim() : "";

  if (!sceneName) {
    throw new Error("No scene name given.");
  }
  if (!telemetry.scenes.includes(sceneName)) {
    throw new Error(`OBS has no scene named "${sceneName}".`);
  }

  return sceneName;
}

/* --------------------------------------------------------------------- OBS */

const obs = new OBSWebSocket();
let obsConnected = false;
let connecting = false;
let lastConnectError = null;
/** Previous stream byte counter, so bitrate is measured rather than guessed. */
let lastStreamSample = null;

obs.on("ConnectionOpened", () => {
  lastConnectError = null;
});

obs.on("ConnectionClosed", () => {
  if (obsConnected) {
    console.log("[bridge] OBS connection closed.");
  }
  obsConnected = false;
  lastStreamSample = null;
});

// Without a listener obs-websocket-js emits an unhandled 'error' event.
obs.on("ConnectionError", (error) => {
  lastConnectError = error?.message ?? "OBS connection error.";
  obsConnected = false;
});

async function ensureObs() {
  if (obsConnected || connecting) {
    return;
  }

  connecting = true;
  try {
    await obs.connect(config.obsUrl, config.obsPassword || undefined);
    obsConnected = true;
    lastConnectError = null;
    console.log(`[bridge] Connected to OBS at ${config.obsUrl}`);
  } catch (error) {
    obsConnected = false;
    lastConnectError = error?.message ?? "Unable to connect to OBS.";
  } finally {
    connecting = false;
  }
}

function emptyTelemetry() {
  return {
    obsConnected: false,
    obsVersion: null,
    studioModeEnabled: false,
    programScene: null,
    previewScene: null,
    scenes: [],
    streaming: false,
    recording: false,
    streamTimecode: null,
    recordTimecode: null,
    stats: null,
  };
}

/** Everything the console is allowed to know. Scene names and counters only. */
async function readTelemetry() {
  if (!obsConnected) {
    return emptyTelemetry();
  }

  try {
    const [version, sceneList, studioMode, streamStatus, recordStatus, stats] =
      await Promise.all([
        obs.call("GetVersion"),
        obs.call("GetSceneList"),
        obs.call("GetStudioModeEnabled"),
        obs.call("GetStreamStatus"),
        obs.call("GetRecordStatus"),
        obs.call("GetStats"),
      ]);

    return {
      obsConnected: true,
      obsVersion: version?.obsVersion ?? null,
      studioModeEnabled: Boolean(studioMode?.studioModeEnabled),
      programScene: sceneList?.currentProgramSceneName ?? null,
      previewScene: sceneList?.currentPreviewSceneName || null,
      scenes: (sceneList?.scenes ?? [])
        .map((scene) => scene?.sceneName)
        .filter((name) => typeof name === "string" && name.length > 0)
        // OBS returns bottom-up; the console reads top-down like the OBS list.
        .reverse(),
      streaming: Boolean(streamStatus?.outputActive),
      recording: Boolean(recordStatus?.outputActive),
      streamTimecode: streamStatus?.outputTimecode?.slice(0, 8) ?? null,
      recordTimecode: recordStatus?.outputTimecode?.slice(0, 8) ?? null,
      stats: {
        kbps: measureKbps(streamStatus),
        droppedFrames: streamStatus?.outputSkippedFrames ?? null,
        totalFrames: streamStatus?.outputTotalFrames ?? null,
        cpuUsage:
          typeof stats?.cpuUsage === "number"
            ? Math.round(stats.cpuUsage * 10) / 10
            : null,
      },
    };
  } catch (error) {
    obsConnected = false;
    lastConnectError = error?.message ?? "OBS stopped responding.";
    return emptyTelemetry();
  }
}

/** OBS reports bytes sent, not bitrate, so derive it from the delta. */
function measureKbps(streamStatus) {
  const bytes = streamStatus?.outputBytes;
  const now = Date.now();

  if (!streamStatus?.outputActive || typeof bytes !== "number") {
    lastStreamSample = null;
    return null;
  }

  const previous = lastStreamSample;
  lastStreamSample = { bytes, at: now };

  if (!previous || now <= previous.at || bytes < previous.bytes) {
    return null;
  }

  const seconds = (now - previous.at) / 1000;
  return Math.round(((bytes - previous.bytes) * 8) / 1000 / seconds);
}

/* ------------------------------------------------------------------ campus */

async function campusFetch(path, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(`${config.apiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${config.token}`,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `${response.status} ${response.statusText}${detail ? ` — ${detail.slice(0, 200)}` : ""}`,
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function pullCommands() {
  const query = `?bridge=${encodeURIComponent(config.bridgeKey)}`;
  const body = await campusFetch(`/api/studio/bridge/commands${query}`);
  return Array.isArray(body?.commands) ? body.commands : [];
}

async function postState(telemetry, results) {
  await campusFetch("/api/studio/bridge/state", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      bridge: config.bridgeKey,
      runId,
      agentVersion: AGENT_VERSION,
      ...telemetry,
      error: telemetry.obsConnected ? null : lastConnectError,
      results,
    }),
  });
}

/* -------------------------------------------------------------------- loop */

let lastPostedAt = 0;
let lastPostedSignature = "";
let stopping = false;

function signature(telemetry) {
  return JSON.stringify([
    telemetry.obsConnected,
    telemetry.studioModeEnabled,
    telemetry.programScene,
    telemetry.previewScene,
    telemetry.scenes,
    telemetry.streaming,
    telemetry.recording,
  ]);
}

async function runCommands(telemetry) {
  let commands = [];

  try {
    commands = await pullCommands();
  } catch (error) {
    console.error(`[bridge] Command poll failed: ${error.message}`);
    return [];
  }

  const results = [];
  for (const command of commands) {
    const handler = COMMAND_HANDLERS[command?.kind];

    if (!handler) {
      results.push({
        id: command?.id,
        status: "FAILED",
        error: `Command kind "${command?.kind}" is not on the bridge whitelist.`,
      });
      continue;
    }

    if (!obsConnected) {
      results.push({
        id: command.id,
        status: "FAILED",
        error: lastConnectError ?? "OBS is not connected.",
      });
      continue;
    }

    try {
      await handler(obs, command.payload ?? {}, telemetry);
      results.push({ id: command.id, status: "DONE" });
      console.log(`[bridge] Ran ${command.kind}`);
    } catch (error) {
      results.push({
        id: command.id,
        status: "FAILED",
        error: error?.message ?? "OBS rejected the command.",
      });
      console.error(`[bridge] ${command.kind} failed: ${error?.message}`);
    }
  }

  return results;
}

async function cycle() {
  await ensureObs();

  // Read before running so a scene command can be checked against the real
  // scene list, then read again after so the console sees the outcome.
  const before = await readTelemetry();
  const results = await runCommands(before);
  const telemetry = results.length > 0 ? await readTelemetry() : before;

  const current = signature(telemetry);
  const due = Date.now() - lastPostedAt >= config.heartbeatMs;

  if (results.length > 0 || current !== lastPostedSignature || due) {
    try {
      await postState(telemetry, results);
      lastPostedAt = Date.now();
      lastPostedSignature = current;
    } catch (error) {
      console.error(`[bridge] State post failed: ${error.message}`);
    }
  }
}

async function main() {
  console.log(
    `[bridge] Blue Don Studio Bridge ${AGENT_VERSION} — device "${config.bridgeKey}" → ${config.apiUrl}`,
  );

  while (!stopping) {
    try {
      await cycle();
    } catch (error) {
      console.error(`[bridge] Cycle error: ${error?.message ?? error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (stopping) {
      process.exit(0);
    }
    stopping = true;
    console.log(
      "[bridge] Shutting down. The studio console shows DISCONNECTED within about 20 seconds.",
    );
    obs.disconnect().catch(() => {});
    setTimeout(() => process.exit(0), 500);
  });
}

main();
