import { isPhoneLiveEmbed } from "@/config/phone-live";

/** Normalize YouTube watch / short URLs into embeddable iframe src. */
export function toMediaEmbedUrl(url: string): string {
  if (isPhoneLiveEmbed(url)) {
    return "";
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch {
    return url;
  }

  return url;
}

export function isHostedPlayerUrl(url: string | null | undefined): boolean {
  if (!url || isPhoneLiveEmbed(url)) {
    return false;
  }
  return /^https?:\/\//i.test(url.trim());
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}
