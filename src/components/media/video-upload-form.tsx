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
};

export function VideoUploadForm({ storageConfigured }: VideoUploadFormProps) {
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
          placeholder="Friday game highlights"
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
        {pending ? "Uploading..." : "Publish video"}
      </Button>
    </form>
  );
}
