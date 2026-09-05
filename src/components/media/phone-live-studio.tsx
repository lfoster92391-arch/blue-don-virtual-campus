"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlipHorizontal,
  Mic,
  MicOff,
  Radio,
  Square,
  Video,
  VideoOff,
} from "lucide-react";

import {
  PHONE_LIVE_ROUTE,
  PHONE_LIVE_SEGMENT_MS,
  PUBLIC_WATCH_PATH,
  extensionForLiveMime,
  pickMediaRecorderMimeType,
} from "@/config/phone-live";
import {
  createPhoneLiveSegmentTicketAction,
  endPhoneLiveBroadcastAction,
  startPhoneLiveBroadcastAction,
} from "@/features/phone-live/actions";
import { siteConfig } from "@/config/site";

type Facing = "user" | "environment";

type PhoneLiveStudioProps = {
  initialTitle?: string;
  storageConfigured: boolean;
  activeLiveId?: string | null;
  activeLiveTitle?: string | null;
  canRecord?: boolean;
};

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function recordSegment(
  stream: MediaStream,
  mimeType: string,
  durationMs: number,
  signal: AbortSignal,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === "undefined") {
      reject(new Error("This browser cannot record video."));
      return;
    }

    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_500_000 })
        : new MediaRecorder(stream, { videoBitsPerSecond: 1_500_000 });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onerror = () => reject(new Error("Recording failed on this phone."));
    recorder.onstop = () => {
      resolve(
        new Blob(chunks, {
          type: recorder.mimeType || mimeType || "video/webm",
        }),
      );
    };

    recorder.start();
    const timer = window.setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, durationMs);

    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      },
      { once: true },
    );
  });
}

async function putSegment(signedUrl: string, blob: Blob, contentType: string) {
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}). Check your connection.`);
  }
}

/**
 * Full-bleed phone studio. Camera starts on a tap (required by iOS), preview
 * stays on screen, Go Live records short files and uploads them for /watch.
 */
export function PhoneLiveStudio({
  initialTitle = "",
  storageConfigured,
  activeLiveId = null,
  activeLiveTitle = null,
  canRecord = false,
}: PhoneLiveStudioProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const liveIdRef = useRef<string | null>(activeLiveId);
  const indexRef = useRef(1);

  const [title, setTitle] = useState(initialTitle);
  const [facing, setFacing] = useState<Facing>("environment");
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [goingLive, setGoingLive] = useState(false);
  const [liveId, setLiveId] = useState<string | null>(activeLiveId);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isLive = Boolean(liveId);
  liveIdRef.current = liveId;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  const attachStream = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream;
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      await video.play().catch(() => undefined);
    }
    setCameraOn(true);
  }, []);

  const startCamera = useCallback(
    async (nextFacing: Facing = facing) => {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "This browser cannot open the camera. Use Safari on iPhone or Chrome on Android, over HTTPS.",
        );
        return;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      const attempts: MediaStreamConstraints[] = [
        {
          audio: { echoCancellation: true, noiseSuppression: true },
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        {
          audio: true,
          video: { facingMode: nextFacing },
        },
        { audio: true, video: true },
      ];

      let lastError: unknown;
      for (const constraints of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          await attachStream(stream);
          setFacing(nextFacing);
          return;
        } catch (caught) {
          lastError = caught;
        }
      }

      const message =
        lastError instanceof Error ? lastError.message : "Camera permission was denied.";
      setError(
        `${message} Allow Camera and Microphone for this site, then tap Turn camera on again.`,
      );
    },
    [attachStream, facing],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) {
      return;
    }
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, [muted]);

  const runUploadLoop = useCallback(async (itemId: string, stream: MediaStream) => {
    const abort = new AbortController();
    abortRef.current?.abort();
    abortRef.current = abort;
    const mimeType = pickMediaRecorderMimeType();
    indexRef.current = 1;

    while (!abort.signal.aborted) {
      let blob: Blob;
      try {
        blob = await recordSegment(
          stream,
          mimeType,
          PHONE_LIVE_SEGMENT_MS,
          abort.signal,
        );
      } catch (caught) {
        if (abort.signal.aborted) {
          break;
        }
        setError(
          caught instanceof Error ? caught.message : "Recording stopped unexpectedly.",
        );
        break;
      }

      if (blob.size < 800) {
        continue;
      }

      const index = indexRef.current;
      indexRef.current += 1;
      const ext = extensionForLiveMime(blob.type || mimeType);
      const name = `seg-${String(index).padStart(5, "0")}.${ext}`;

      try {
        const ticket = await createPhoneLiveSegmentTicketAction({
          itemId,
          index,
          name,
          size: blob.size,
          type: blob.type || mimeType || (ext === "mp4" ? "video/mp4" : "video/webm"),
        });
        if (ticket.error || !ticket.ticket) {
          setStatus(ticket.error ?? "Could not upload this clip.");
          continue;
        }
        await putSegment(ticket.ticket.signedUrl, blob, ticket.ticket.contentType);
        setStatus("On air — clips are reaching Watch Broadcasting LIVE.");
      } catch (caught) {
        setStatus(
          caught instanceof Error
            ? caught.message
            : "A clip failed to upload. Trying the next one.",
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!liveId || !cameraOn || !streamRef.current) {
      return;
    }
    void runUploadLoop(liveId, streamRef.current);
    return () => {
      abortRef.current?.abort();
    };
  }, [liveId, cameraOn, runUploadLoop]);

  async function handleGoLive() {
    const show = title.trim();
    if (!show) {
      setError("Name today's show first.");
      return;
    }
    if (!storageConfigured) {
      setError(
        "Campus video storage is not connected, so a phone cannot go live yet. Ask an advisor.",
      );
      return;
    }

    setGoingLive(true);
    setError(null);

    try {
      if (!streamRef.current) {
        await startCamera();
      }
      const stream = streamRef.current;
      if (!stream) {
        setGoingLive(false);
        return;
      }

      const started = await startPhoneLiveBroadcastAction({ title: show });
      if (started.error || !started.itemId) {
        setError(started.error ?? "Could not go live.");
        setGoingLive(false);
        return;
      }

      setLiveId(started.itemId);
      setStatus(started.success ?? "You are live.");

      try {
        await navigator.wakeLock?.request("screen");
      } catch {
        // Wake Lock is optional — iOS Safari added it late.
      }
    } finally {
      setGoingLive(false);
    }
  }

  async function handleEnd() {
    const id = liveIdRef.current;
    abortRef.current?.abort();
    abortRef.current = null;
    if (id) {
      await endPhoneLiveBroadcastAction(id);
    }
    setLiveId(null);
    setStatus("Broadcast ended. The camera stays on until you leave this page.");
  }

  const watchUrl = `${siteConfig.url}${PUBLIC_WATCH_PATH}`;

  return (
    <div className="flex min-h-dvh flex-col bg-[#050B14] text-white">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-white/50 uppercase">
            Blue Don Live
          </p>
          <p className="truncate text-sm font-semibold">
            {isLive ? activeLiveTitle || title || "On air" : "Go live from this device"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLive ? "bg-red-600 text-white" : "bg-white/10 text-white/70"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${isLive ? "animate-pulse bg-white" : "bg-white/40"}`}
          />
          {isLive ? "LIVE" : "Offline"}
        </span>
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          className="size-full object-cover"
          playsInline
          autoPlay
          muted
          aria-label="Camera preview"
        />
        {!cameraOn ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <Video className="size-12 text-white/50" aria-hidden="true" />
            <p className="max-w-sm text-sm text-white/70">
              Tap below to turn on this device&apos;s camera. Safari or Chrome will
              ask for Camera and Microphone — allow both.
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="text-sm text-emerald-300" role="status">
            {status}
          </p>
        ) : null}

        {!isLive ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-white/60">Show name</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Morning Announcements"
              maxLength={120}
              className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-base text-white placeholder:text-white/30 focus:border-[#2F80ED] focus:outline-none"
            />
          </label>
        ) : null}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void startCamera()}
            className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold"
          >
            {cameraOn ? (
              <>
                <Video className="size-4" aria-hidden="true" />
                Camera on
              </>
            ) : (
              <>
                <VideoOff className="size-4" aria-hidden="true" />
                Turn camera on
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => void startCamera(facing === "environment" ? "user" : "environment")}
            disabled={!cameraOn || isLive}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 disabled:opacity-40"
            aria-label="Flip camera"
          >
            <FlipHorizontal className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            disabled={!cameraOn}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 disabled:opacity-40"
            aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          >
            {muted ? (
              <MicOff className="size-5" aria-hidden="true" />
            ) : (
              <Mic className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {isLive ? (
          <button
            type="button"
            onClick={() => void handleEnd()}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-base font-semibold text-[#0A2342]"
          >
            <Square className="size-5" aria-hidden="true" />
            End broadcast
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {canRecord ? (
              <Link
                href="/organizations/broadcasting?tab=media#record"
                className="campus-btn-royal inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold"
              >
                Record
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void handleGoLive()}
              disabled={goingLive}
              className="campus-btn-royal inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold disabled:opacity-50"
            >
              <Radio className="size-5" aria-hidden="true" />
              {goingLive ? "Going live…" : "Go Live"}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-white/45">
          Viewers watch at{" "}
          <Link href={PUBLIC_WATCH_PATH} className="text-[#7EB6FF] underline">
            {watchUrl.replace(/^https?:\/\//, "")}
          </Link>
          . Keep this page open while you are live.
          {" · "}
          <Link href="/organizations/broadcasting?tab=media" className="underline">
            Control Room
          </Link>
          {" · "}
          <Link href={PHONE_LIVE_ROUTE} className="underline">
            Reload
          </Link>
        </p>
      </div>
    </div>
  );
}
