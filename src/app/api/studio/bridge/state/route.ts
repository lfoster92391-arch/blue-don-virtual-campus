import { NextResponse } from "next/server";
import { z } from "zod";

import {
  authorizeBridgeRequest,
  recordStudioBridgeState,
} from "@/services/studio-bridge-service";

export const runtime = "nodejs";

const resultSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(["DONE", "FAILED"]),
  error: z.string().max(500).nullish(),
});

/**
 * Everything the agent is allowed to say about the OBS machine. Deliberately
 * narrow: scene names, transport flags, and encoder counters. No file paths, no
 * stream key, no OBS password — those never leave the Studio B PC.
 */
const stateSchema = z.object({
  bridge: z.string().max(64).optional(),
  runId: z.string().max(64).optional(),
  agentVersion: z.string().max(40).optional(),
  obsConnected: z.boolean(),
  obsVersion: z.string().max(40).nullish(),
  studioModeEnabled: z.boolean().optional(),
  programScene: z.string().max(200).nullish(),
  previewScene: z.string().max(200).nullish(),
  scenes: z.array(z.string().max(200)).max(100).optional(),
  streaming: z.boolean().optional(),
  recording: z.boolean().optional(),
  streamTimecode: z.string().max(20).nullish(),
  recordTimecode: z.string().max(20).nullish(),
  stats: z
    .object({
      kbps: z.number().nullish(),
      droppedFrames: z.number().nullish(),
      totalFrames: z.number().nullish(),
      cpuUsage: z.number().nullish(),
    })
    .nullish(),
  error: z.string().max(500).nullish(),
  results: z.array(resultSchema).max(20).optional(),
});

/**
 * Telemetry push from the Studio Bridge agent, plus the outcome of the commands
 * it just ran. This is the only source the console's OBS readouts draw from —
 * if the agent stops posting, System Health reports DISCONNECTED rather than
 * holding the last good state.
 */
export async function POST(request: Request) {
  const auth = authorizeBridgeRequest(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = stateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid bridge state." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const input = parsed.data;
  const recorded = await recordStudioBridgeState({
    bridgeKey: input.bridge ?? "",
    tokenHash: auth.tokenHash,
    runId: input.runId,
    agentVersion: input.agentVersion,
    telemetry: {
      obsConnected: input.obsConnected,
      obsVersion: input.obsVersion,
      studioModeEnabled: input.studioModeEnabled,
      programScene: input.programScene,
      previewScene: input.previewScene,
      scenes: input.scenes,
      streaming: input.streaming,
      recording: input.recording,
      streamTimecode: input.streamTimecode,
      recordTimecode: input.recordTimecode,
      stats: input.stats
        ? {
            kbps: input.stats.kbps ?? null,
            droppedFrames: input.stats.droppedFrames ?? null,
            totalFrames: input.stats.totalFrames ?? null,
            cpuUsage: input.stats.cpuUsage ?? null,
          }
        : null,
      error: input.error,
    },
    results: input.results?.map((result) => ({
      id: result.id,
      status: result.status,
      error: result.error ?? null,
    })),
  });

  if (!recorded) {
    return NextResponse.json(
      { error: "Studio bridge storage is unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { bridge: recorded.bridgeKey, results: recorded.applied },
    { headers: { "Cache-Control": "no-store" } },
  );
}
