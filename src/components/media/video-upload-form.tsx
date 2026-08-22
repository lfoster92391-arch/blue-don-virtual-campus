"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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

export function VideoUploadForm({
  storageConfigured,
  defaultCategory = "",
  defaultHighlightReel = false,
  titlePlaceholder = "Friday game highlights",
  submitLabel = "Publish video",
}: VideoUploadFormProps) {
  const [state, formAction, pending] = useActionState(uploadCampusVideoAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
          accept="video/mp4,video/webm,video/quicktime"
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          MP4, WebM, or MOV · up to 100 MB
          {storageConfigured ? "" : " · storage bucket not configured — use URL below"}
        </p>
      </div>

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

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-600" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Uploading..." : submitLabel}
      </Button>
    </form>
  );
}
