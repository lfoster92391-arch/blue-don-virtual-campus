/**
 * Browser-side gate in front of every Server Action file upload.
 *
 * Without this, a phone photo (routinely 6–12 MB) blows past the Server Action
 * body limit and the request is rejected by the platform before our action
 * runs — the form just fails with no usable message. Here the photo is
 * re-encoded down to something that fits, and anything genuinely un-shrinkable
 * gets a plain-English error instead of a dead submit button.
 */

import {
  IMAGE_UPLOAD_MAX_DIMENSION,
  IMAGE_UPLOAD_TARGET_BYTES,
  formatUploadSize,
} from "@/config/uploads";

export type PreparedUpload = {
  file: File;
  /** Set when the file was re-encoded, so the UI can say what happened. */
  note: string | null;
};

export class UploadRejectedError extends Error {}

export type PrepareUploadOptions = {
  /** Ceiling the prepared file must fit under. */
  targetBytes?: number;
  /** Longest edge of a resized photo. */
  maxDimension?: number;
  /** Allow non-image files (receipts as PDF). They are never re-encoded. */
  allowNonImage?: boolean;
};

/** Re-encoding an animated GIF or a vector would destroy it, so those pass or fail as-is. */
const RESIZABLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * Android and Windows pickers routinely hand over an empty `type` for HEIC and
 * occasionally for WebP, which would otherwise look like "not an image".
 */
const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  svg: "image/svg+xml",
};

/** The image type to treat this file as, or null when it is not an image. */
function resolveImageType(file: File): string | null {
  const reported = file.type.trim().toLowerCase().split(";")[0];
  if (reported.startsWith("image/")) {
    return reported;
  }
  if (reported && reported !== "application/octet-stream") {
    return null;
  }
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  return EXTENSION_TYPES[extension] ?? null;
}

/** PNG and WebP can carry transparency — a club logo flattened onto white is a bug. */
const ALPHA_TYPES = new Set(["image/png", "image/webp"]);

const QUALITY_LADDER: { dimension: number; quality: number }[] = [
  { dimension: 1, quality: 0.82 },
  { dimension: 0.85, quality: 0.75 },
  { dimension: 0.7, quality: 0.7 },
  { dimension: 0.55, quality: 0.65 },
  { dimension: 0.4, quality: 0.6 },
];

function extensionFor(mimeType: string): string {
  return mimeType === "image/webp" ? "webp" : "jpg";
}

function renameTo(fileName: string, mimeType: string): string {
  const base = fileName.replace(/\.[^./\\]+$/, "") || "photo";
  return `${base}.${extensionFor(mimeType)}`;
}

async function decodeImage(file: File): Promise<ImageBitmap | null> {
  if (typeof createImageBitmap !== "function") {
    return null;
  }
  try {
    return await createImageBitmap(file);
  } catch {
    // HEIC outside Safari, or a corrupt file — the caller decides what to do.
    return null;
  }
}

function encodeBitmap(
  bitmap: ImageBitmap,
  longestEdge: number,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  const scale = Math.min(1, longestEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return Promise.resolve(null);
  }

  if (mimeType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function shrinkImage(
  file: File,
  imageType: string,
  targetBytes: number,
  maxDimension: number,
): Promise<File | null> {
  const bitmap = await decodeImage(file);
  if (!bitmap) {
    return null;
  }

  const outputType = ALPHA_TYPES.has(imageType) ? "image/webp" : "image/jpeg";
  const startingEdge = Math.min(
    maxDimension,
    Math.max(bitmap.width, bitmap.height),
  );

  try {
    for (const step of QUALITY_LADDER) {
      const blob = await encodeBitmap(
        bitmap,
        Math.round(startingEdge * step.dimension),
        outputType,
        step.quality,
      );
      if (blob && blob.size > 0 && blob.size <= targetBytes) {
        return new File([blob], renameTo(file.name, outputType), {
          type: outputType,
          lastModified: Date.now(),
        });
      }
    }
  } finally {
    bitmap.close?.();
  }

  return null;
}

/**
 * Returns the file to submit. Throws {@link UploadRejectedError} with a message
 * meant to be shown to the user when nothing can be salvaged.
 */
export async function prepareUpload(
  file: File,
  options: PrepareUploadOptions = {},
): Promise<PreparedUpload> {
  const targetBytes = options.targetBytes ?? IMAGE_UPLOAD_TARGET_BYTES;
  const maxDimension = options.maxDimension ?? IMAGE_UPLOAD_MAX_DIMENSION;
  const limitLabel = formatUploadSize(targetBytes);

  if (file.size === 0) {
    throw new UploadRejectedError(
      `“${file.name}” is empty. Pick the file again and retry.`,
    );
  }

  const imageType = resolveImageType(file);

  if (!imageType && !options.allowNonImage) {
    throw new UploadRejectedError(
      `“${file.name}” is not an image. Choose a JPG, PNG, WebP, GIF, or HEIC photo.`,
    );
  }

  const sizeLabel = formatUploadSize(file.size);

  if (!imageType) {
    if (file.size <= targetBytes) {
      return { file, note: null };
    }
    throw new UploadRejectedError(
      `“${file.name}” is ${sizeLabel}. Files must be ${limitLabel} or smaller — compress the PDF, or photograph the receipt instead of scanning it.`,
    );
  }

  // A file the picker could not name has to be re-encoded even when it is
  // small, or the server rejects it against its MIME allowlist.
  const needsKnownType = file.type.trim().toLowerCase() !== imageType;

  if (file.size <= targetBytes && !needsKnownType) {
    return { file, note: null };
  }

  if (!RESIZABLE_TYPES.has(imageType)) {
    if (file.size <= targetBytes) {
      return { file, note: null };
    }
    throw new UploadRejectedError(
      `“${file.name}” is ${sizeLabel} and cannot be shrunk automatically. Export it as a JPG or PNG under ${limitLabel}.`,
    );
  }

  const shrunk = await shrinkImage(file, imageType, targetBytes, maxDimension);
  if (!shrunk) {
    if (file.size <= targetBytes) {
      // Untouched but within budget — let the server have its say.
      return { file, note: null };
    }
    throw new UploadRejectedError(
      `“${file.name}” is ${sizeLabel} and this browser could not resize it. Export it as a JPG under ${limitLabel} and try again.`,
    );
  }

  return {
    file: shrunk,
    note:
      file.size <= targetBytes
        ? `Converted to ${extensionFor(shrunk.type).toUpperCase()} so campus storage can accept it.`
        : `Resized from ${sizeLabel} to ${formatUploadSize(shrunk.size)} so it can be uploaded.`,
  };
}

/**
 * Swaps the prepared file into the picker so the surrounding `<form>` submits
 * it. Returns false when the browser has no `DataTransfer`, in which case the
 * original file stays selected.
 */
export function replaceInputFile(
  input: HTMLInputElement,
  file: File,
): boolean {
  if (typeof DataTransfer !== "function") {
    return false;
  }
  try {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    return true;
  } catch {
    return false;
  }
}
