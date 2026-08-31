"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  prepareUpload,
  replaceInputFile,
  UploadRejectedError,
  type PrepareUploadOptions,
} from "@/lib/uploads/prepare-upload";

export type UploadGuard = {
  /** Wire to the file input's `onChange`. */
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Object URL for the selected image, or null. Images only. */
  preview: string | null;
  /** What the guard did to the file, e.g. resized it. */
  note: string | null;
  /** Why the file was refused. */
  error: string | null;
  /** True while the photo is being re-encoded. */
  preparing: boolean;
  /** Drop the selection and reset the input. */
  clear: () => void;
};

export function useUploadGuard(
  options: PrepareUploadOptions & {
    inputRef?: React.RefObject<HTMLInputElement | null>;
  } = {},
): UploadGuard {
  const { inputRef, targetBytes, maxDimension, allowNonImage } = options;
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const previewRef = useRef<string | null>(null);

  const setPreviewUrl = useCallback((url: string | null) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    previewRef.current = url;
    setPreview(url);
  }, []);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const clear = useCallback(() => {
    setPreviewUrl(null);
    setNote(null);
    setError(null);
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
  }, [inputRef, setPreviewUrl]);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const file = input.files?.[0];

      setNote(null);
      setError(null);

      if (!file) {
        setPreviewUrl(null);
        return;
      }

      setPreparing(true);
      void prepareUpload(file, { targetBytes, maxDimension, allowNonImage })
        .then((prepared) => {
          if (prepared.file !== file) {
            replaceInputFile(input, prepared.file);
          }
          setNote(prepared.note);
          setPreviewUrl(
            prepared.file.type.startsWith("image/")
              ? URL.createObjectURL(prepared.file)
              : null,
          );
        })
        .catch((cause: unknown) => {
          input.value = "";
          setPreviewUrl(null);
          setError(
            cause instanceof UploadRejectedError
              ? cause.message
              : "That file could not be read. Try a different one.",
          );
        })
        .finally(() => setPreparing(false));
    },
    [allowNonImage, maxDimension, setPreviewUrl, targetBytes],
  );

  return { onFileChange, preview, note, error, preparing, clear };
}
