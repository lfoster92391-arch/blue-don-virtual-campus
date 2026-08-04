"use client";

import { useEffect, useRef, useState } from "react";

import { StudioControlBar } from "@/components/studio/studio-control-bar";
import { StudioHeader } from "@/components/studio/studio-header";
import {
  AudioPanel,
  CrewPanel,
  GraphicsPanel,
  ProgramPanel,
  RunOfShowPanel,
  ScenesPanel,
  ScoreboardPanel,
  SourcesPanel,
  SponsorsPanel,
  SystemHealthPanel,
} from "@/components/studio/studio-panels";
import { STUDIO_POLL_INTERVAL_MS } from "@/config/broadcast-studio";
import type { StudioConsoleSnapshot } from "@/services/broadcast-studio-service";

const STATE_ENDPOINT = "/api/broadcast/studio/state";

type StudioConsoleProps = {
  initialSnapshot: StudioConsoleSnapshot;
  operatorName: string;
  operatorRole: string;
  streamKeyHint: string;
  hasSharedStreamKey: boolean;
};

/**
 * Live console surface. Holds the snapshot the panels read and re-polls the
 * server so on-air state, the countdown, the rundown, and the score stay current
 * without reloading the page.
 */
export function StudioConsole({
  initialSnapshot,
  operatorName,
  operatorRole,
  streamKeyHint,
  hasSharedStreamKey,
}: StudioConsoleProps) {
  const { snapshot, syncError } = useStudioSnapshot(initialSnapshot);

  return (
    <>
      <StudioHeader
        operatorName={operatorName}
        operatorRole={operatorRole}
        airState={snapshot.program.state}
        programTitle={snapshot.program.title}
        onAirSince={snapshot.program.onAirSince}
        nextAir={snapshot.nextAir}
        event={snapshot.event}
        syncedAt={snapshot.fetchedAt}
        syncError={syncError}
      />

      <main className="min-h-0 flex-1 overflow-auto p-2 lg:overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-[13rem_minmax(0,1fr)_19rem]">
          <div className="flex min-h-0 flex-col gap-2">
            <ScenesPanel />
            <CrewPanel crew={snapshot.crew} />
            <SystemHealthPanel
              streamKeyHint={streamKeyHint}
              hasSharedStreamKey={hasSharedStreamKey}
              onAir={snapshot.program.state === "LIVE"}
            />
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <ProgramPanel program={snapshot.program} />
            <div className="grid min-h-0 gap-2 sm:grid-cols-2">
              <SourcesPanel />
              <AudioPanel />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <ScoreboardPanel scoreboard={snapshot.scoreboard} />
            <GraphicsPanel />
            <SponsorsPanel />
            <RunOfShowPanel runOfShow={snapshot.runOfShow} />
          </div>
        </div>
      </main>

      <StudioControlBar
        activeLiveId={snapshot.program.mediaId}
        programTitle={snapshot.program.title}
      />
    </>
  );
}

/**
 * Polls the crew-gated console endpoint. Pauses while the tab is hidden so an
 * unattended console does not hammer the database, and refreshes immediately on
 * the way back.
 */
function useStudioSnapshot(initialSnapshot: StudioConsoleSnapshot): {
  snapshot: StudioConsoleSnapshot;
  syncError: string | null;
} {
  const [polled, setPolled] = useState<StudioConsoleSnapshot | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const inFlight = useRef(false);

  // Whichever read is newer wins, so a route revalidation (Go Live, End
  // broadcast) is not overwritten by an older polled snapshot.
  const snapshot =
    polled &&
    Date.parse(polled.fetchedAt) >= Date.parse(initialSnapshot.fetchedAt)
      ? polled
      : initialSnapshot;

  useEffect(() => {
    let cancelled = false;

    async function read() {
      if (inFlight.current || document.hidden) {
        return;
      }
      inFlight.current = true;

      try {
        const response = await fetch(STATE_ENDPOINT, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Console read failed (${response.status})`);
        }

        const next = (await response.json()) as StudioConsoleSnapshot;
        if (!cancelled) {
          setPolled(next);
          setSyncError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setSyncError(
            error instanceof Error ? error.message : "Console read failed.",
          );
        }
      } finally {
        inFlight.current = false;
      }
    }

    const timer = window.setInterval(read, STUDIO_POLL_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) {
        void read();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return { snapshot, syncError };
}
