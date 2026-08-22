"use client";

import { useActionState, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CAMPUS_MEDIA_MAX_BYTES,
  CAMPUS_MEDIA_MAX_LABEL,
  CAMPUS_MEDIA_VIDEO_ACCEPT,
  resolveCampusVideoContentType,
} from "@/config/campus-video";
import {
  createVideoUploadTicketAction,
  uploadCampusVideoAction,
  type MediaActionState,
} from "@/features/media/actions";

const initialState: MediaActionState = {};

type VideoUploadFormProps = {
  storageConfigured: boolean;
  /** Pre-selects the on-demand category (e.g. Sports Highlights on Sports Recap). */
  defaultCategory?: string;
  /** Pre-ticks "Feature in Highlight Reel". */
  defaultHighlightReel?: boolean;
  titlePlaceholder?: string;
  submitLabel?: string;
};

/**
 * PUTs the file straight to the signed Supabase URL. XHR rather than fetch
 * because uploading 50 MB over school Wi-Fi needs a progress bar — without one
 * the form looks frozen and producers give up thinking it is broken.
 */
function putToSignedUrl(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUrl);
    request.setRequestHeader("content-type", contentType);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      // Supabase answers an over-limit object with a 400 whose body carries 413.
      if (request.status === 413 || request.responseText.includes("EntityTooLarge")) {
        reject(
          new Error(
            `Campus storage rejected this file as too large. The limit is ${CAMPUS_MEDIA_MAX_LABEL}.`,
          ),
        );
        return;
      }

      reject(
        new Error(
          `Upload failed (${request.status}). Check your connection and try again.`,
        ),
      );
    };

    request.onerror = () =>
      reject(new Error("Lost connection while uploading. Try again on a stronger network."));
    request.onabort = () => reject(new Error("Upload cancelled."));

    request.send(file);
  });
}

export function VideoUploadForm({
  storageConfigured,
  defaultCategory = "",
  defaultHighlightReel = false,
  titlePlaceholder = "Friday game highlights",
  submitLabel = "Publish video",
}: VideoUploadFormProps) {
  const [state, formAction, saving] = useActionState(uploadCampusVideoAction, initialState);
  const [isSubmitting, startSubmitting] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const busy = saving || isSubmitting || progress !== null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("videoFile");
    setUploadError(null);

    // No file picked — this is a hosted-URL submission, let the plain Server
    // Action handle it. Same for a browser without JS, which never gets here.
    if (!(file instanceof File) || file.size === 0) {
      return;
    }

    event.preventDefault();

    if (file.size > CAMPUS_MEDIA_MAX_BYTES) {
      setUploadError(
        `“${file.name}” is ${(file.size / (1024 * 1024)).toFixed(0)} MB. Videos must be ${CAMPUS_MEDIA_MAX_LABEL} or smaller — trim the clip, export at 1080p, or paste a hosted video URL instead.`,
      );
      return;
    }

    if (!resolveCampusVideoContentType(file.name, file.type)) {
      setUploadError(
        `“${file.name}” is not a supported video. Upload MP4, WebM, or MOV (convert .avi, .mkv, or .wmv to MP4 first).`,
      );
      return;
    }

    setProgress(0);

    const { ticket, error } = await createVideoUploadTicketAction({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (error || !ticket) {
      setUploadError(error ?? "Unable to start the upload.");
      setProgress(null);
      return;
    }

    try {
      await putToSignedUrl(ticket.signedUrl, file, ticket.contentType, setProgress);
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "Unable to upload the video.",
      );
      setProgress(null);
      return;
    }

    // The bytes are in storage; the action only records the path.
    data.delete("videoFile");
    data.set("storagePath", ticket.storagePath);
    setProgress(null);
    startSubmitting(() => formAction(data));
  }

  const buttonLabel =
    progress !== null ? `Uploading ${progress}%` : busy ? "Publishing..." : submitLabel;

  return (
    // Remounting on a new item id is what clears the uncontrolled fields after
    // a successful publish, so a failed publish keeps everything typed.
    <form
      key={state.itemId ?? "new"}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="media-title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="media-title"
          name="title"
          required
          placeholder={titlePlaceholder}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="media-description" className="text-sm font-medium">
          Description (optional)
        </label>
        <Input
          id="media-description"
          name="description"
          placeholder="Short caption for the school feed"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="videoFile" className="text-sm font-medium">
          Video file
        </label>
        <input
          id="videoFile"
          name="videoFile"
          type="file"
          accept={CAMPUS_MEDIA_VIDEO_ACCEPT}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          MP4, WebM, or MOV · up to {CAMPUS_MEDIA_MAX_LABEL}
          {storageConfigured ? "" : " · storage bucket not configured — use URL below"}
        </p>
      </div>

      {progress !== null ? (
        <div className="space-y-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Video upload progress"
          >
            <div
              className="h-full rounded-full bg-[#0A2342] transition-[width] duration-200 dark:bg-[#C9A227]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Sending your video to campus storage — keep this tab open.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="videoUrl" className="text-sm font-medium">
          Or hosted video URL
        </label>
        <Input
          id="videoUrl"
          name="videoUrl"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="media-category" className="text-sm font-medium">
          On-demand category
        </label>
        <select
          id="media-category"
          name="category"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={defaultCategory}
        >
          <option value="">Uncategorized</option>
          <option value="MORNING_ANNOUNCEMENTS">Morning Announcements</option>
          <option value="SPORTS_HIGHLIGHTS">Sports Highlights</option>
          <option value="STUDENT_SPOTLIGHT">Student Spotlight</option>
          <option value="SPECIAL_EVENTS">Special Events</option>
          <option value="HIGHLIGHT_REEL">Highlight Reel</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isHighlightReel"
          value="1"
          defaultChecked={defaultHighlightReel}
          className="size-4"
        />
        Feature in Highlight Reel
      </label>

      {uploadError ?? state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {uploadError ?? state.error}
        </p>
      ) : null}
      {state.success && !uploadError ? (
        <p className="text-sm text-emerald-600" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={busy}>
        {buttonLabel}
      </Button>
    </form>
  );
}
