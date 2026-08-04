"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { StudioControlBar } from "@/components/studio/studio-control-bar";
import { GameControlPanel } from "@/components/studio/studio-game-control";
import { GraphicsPanel } from "@/components/studio/studio-graphics-panel";
import { StudioHeader } from "@/components/studio/studio-header";
import {
  AudioPanel,
  CrewPanel,
  ProgramPanel,
  RunOfShowPanel,
  ScenesPanel,
  SourcesPanel,
  SystemHealthPanel,
} from "@/components/studio/studio-panels";
import { STUDIO_POLL_INTERVAL_MS } from "@/config/broadcast-studio";
import type { StudioScoreActionState } from "@/features/broadcast-studio/actions";
import type {
  StudioConsoleSnapshot,
  StudioScoreboardState,
} from "@/services/broadcast-studio-service";

const STATE_ENDPOINT = "/api/broadcast/studio/state";

type StudioConsoleProps = {
  initialSnapshot: StudioConsoleSnapshot;
  operatorName: string;
  operatorRole: string;
  streamKeyHint: string;
  hasSharedStreamKey: boolean;
  /**
   * OBS Browser Source path for the graphics overlay. Rendered once with the
   * crew-gated page rather than carried in the snapshot the console re-polls.
   */
  overlayPath: string | null;
};

/** A just-saved score, held until a poll from after the write catches up. */
type ScoreWrite = {
  savedAt: number;
  scoreboard: StudioScoreboardState;
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
  overlayPath,
}: StudioConsoleProps) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [scoreWrite, setScoreWrite] = useState<ScoreWrite | null>(null);
  const { snapshot, syncError, refresh } = useStudioSnapshot(
    initialSnapshot,
    selectedGameId,
  );

  // A queued OBS command only shows up as telemetry once the bridge has run it,
  // so read again straight away rather than waiting out the 5 s poll.
  const onCommandSettled = useCallback(() => {
    void refresh();
  }, [refresh]);

  // A score write and the 5 s poll race each other: show the saved score until a
  // read that started after the write lands, so a tap never appears to bounce
  // back to the old number.
  const scoreboard =
    scoreWrite &&
    scoreWrite.scoreboard.gameId === snapshot.scoreboard?.gameId &&
    Date.parse(snapshot.fetchedAt) < scoreWrite.savedAt
      ? scoreWrite.scoreboard
      : snapshot.scoreboard;

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
            <ScenesPanel
              bridge={snapshot.bridge}
              onCommandSettled={onCommandSettled}
            />
            <CrewPanel crew={snapshot.crew} />
            <SystemHealthPanel
              streamKeyHint={streamKeyHint}
              hasSharedStreamKey={hasSharedStreamKey}
              onAir={snapshot.program.state === "LIVE"}
              bridge={snapshot.bridge}
            />
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <ProgramPanel program={snapshot.program} />
            <div className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[minmax(0,1fr)_13rem]">
              <GraphicsPanel
                graphics={snapshot.graphics}
                fetchedAt={snapshot.fetchedAt}
                scoreboard={scoreboard}
                roster={snapshot.roster}
                overlayPath={overlayPath}
                onChanged={onCommandSettled}
              />
              <div className="flex min-h-0 flex-col gap-2">
                <SourcesPanel />
                <AudioPanel />
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <GameControlPanel
              scoreboard={scoreboard}
              gameOptions={snapshot.gameOptions}
              selectedGameId={selectedGameId}
              onSelectGame={(gameId) => {
                setScoreWrite(null);
                setSelectedGameId(gameId);
                // Read straight away so the panel is not stuck on the previous
                // game until the next poll.
                void refresh(gameId);
              }}
              onSaved={(result: StudioScoreActionState) => {
                if (result.scoreboard && result.savedAt) {
                  setScoreWrite({
                    savedAt: result.savedAt,
                    scoreboard: result.scoreboard,
                  });
                }
                void refresh();
              }}
            />
            <RunOfShowPanel runOfShow={snapshot.runOfShow} />
          </div>
        </div>
      </main>

      <StudioControlBar
        activeLiveId={snapshot.program.mediaId}
        programTitle={snapshot.program.title}
        bridge={snapshot.bridge}
        onCommandSettled={onCommandSettled}
      />
    </>
  );
}

/**
 * Polls the crew-gated console endpoint. Pauses while the tab is hidden so an
 * unattended console does not hammer the database, and refreshes immediately on
 * the way back, when the operator picks a different game, and after a write.
 */
function useStudioSnapshot(
  initialSnapshot: StudioConsoleSnapshot,
  selectedGameId: string | null,
): {
  snapshot: StudioConsoleSnapshot;
  syncError: string | null;
  /** Read now. Pass a game id to read for a pin the poller has not seen yet. */
  refresh: (gameId?: string | null) => Promise<void>;
} {
  const [polled, setPolled] = useState<StudioConsoleSnapshot | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const inFlight = useRef(false);

  // Whichever read is newer wins, so a route revalidation (Go Live, End
  // broadcast) is not overwritten by an older polled snapshot. Once the operator
  // pins a game, the polled read is the only one carrying that pin, so it always
  // wins — otherwise a revalidation would snap the console back to the
  // automatically chosen game.
  const snapshot =
    polled &&
    (selectedGameId ||
      Date.parse(polled.fetchedAt) >= Date.parse(initialSnapshot.fetchedAt))
      ? polled
      : initialSnapshot;

  const read = useCallback(
    async (options?: { force?: boolean; gameId?: string | null }) => {
      if (inFlight.current || (document.hidden && !options?.force)) {
        return;
      }
      inFlight.current = true;

      try {
        // An explicit gameId is the game the operator just picked, which this
        // callback has not been rebuilt for yet.
        const pinned =
          options?.gameId === undefined ? selectedGameId : options.gameId;
        const url = pinned
          ? `${STATE_ENDPOINT}?gameId=${encodeURIComponent(pinned)}`
          : STATE_ENDPOINT;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Console read failed (${response.status})`);
        }

        setPolled((await response.json()) as StudioConsoleSnapshot);
        setSyncError(null);
      } catch (error) {
        setSyncError(
          error instanceof Error ? error.message : "Console read failed.",
        );
      } finally {
        inFlight.current = false;
      }
    },
    [selectedGameId],
  );

  useEffect(() => {
    const timer = window.setInterval(() => void read(), STUDIO_POLL_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) {
        void read();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [read]);

  const refresh = useCallback(
    (gameId?: string | null) => read({ force: true, gameId }),
    [read],
  );

  return { snapshot, syncError, refresh };
}
