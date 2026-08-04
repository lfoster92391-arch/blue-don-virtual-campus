"use client";

import { useCallback, useState, useTransition } from "react";

import {
  queueStudioCommandAction,
  type StudioCommandActionState,
} from "@/features/broadcast-studio/actions";
import type { StudioCommandKind } from "@/generated/prisma/client";

export type StudioCommandRequest = {
  kind: StudioCommandKind;
  sceneName?: string | null;
};

/**
 * Sends one OBS command to the queue and tracks what is in flight.
 *
 * The console never learns whether OBS actually did the thing from this hook —
 * only that the command was accepted for delivery. The outcome comes back on
 * the next state poll as a DONE or FAILED row, which is why `onSettled`
 * triggers a refresh rather than this hook reporting success.
 */
export function useStudioCommand(onSettled?: () => void): {
  send: (request: StudioCommandRequest) => void;
  /** The kind currently being handed off, so only that button shows a wait state. */
  pendingKind: StudioCommandKind | null;
  pending: boolean;
  /** A refusal from the server (bridge offline, no permission, unknown scene). */
  error: string | null;
  clearError: () => void;
} {
  const [isPending, startTransition] = useTransition();
  const [pendingKind, setPendingKind] = useState<StudioCommandKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    (request: StudioCommandRequest) => {
      setPendingKind(request.kind);
      setError(null);

      startTransition(async () => {
        let result: StudioCommandActionState;
        try {
          result = await queueStudioCommandAction(request);
        } catch (caught) {
          result = {
            error:
              caught instanceof Error
                ? caught.message
                : "Unable to reach the studio bridge.",
          };
        }

        setError(result.error ?? null);
        setPendingKind(null);
        onSettled?.();
      });
    },
    [onSettled],
  );

  return {
    send,
    pendingKind,
    pending: isPending,
    error,
    clearError: useCallback(() => setError(null), []),
  };
}
