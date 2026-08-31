"use client";

import type { UploadGuard } from "@/lib/uploads/use-upload-guard";

/** Shared "we resized it" / "we can't take that" line under a file picker. */
export function UploadGuardNotice({ guard }: { guard: UploadGuard }) {
  if (guard.preparing) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        Preparing photo…
      </p>
    );
  }

  if (guard.error) {
    return (
      <p className="text-xs text-destructive" role="alert">
        {guard.error}
      </p>
    );
  }

  if (guard.note) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        {guard.note}
      </p>
    );
  }

  return null;
}
