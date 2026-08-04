"use client";

import { EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { focusClubName } from "@/config/focus-club-access";
import type { FocusClubSlug } from "@/config/focused-clubs";
import { exitPreviewAction } from "@/features/admin/preview-actions";

export function PreviewBanner({
  studentName,
  clubSlug,
}: {
  studentName?: string | null;
  clubSlug?: FocusClubSlug | null;
}) {
  const who = studentName
    ? studentName
    : clubSlug
      ? `${focusClubName(clubSlug)} member view`
      : "member view";

  return (
    <div
      className="sticky top-0 z-50 border-b-2 border-[#0A2342]/20 bg-[#D4A017] text-[#0A2342] shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <p className="text-sm font-semibold sm:text-base">
          Previewing as {who}
          <span className="mx-2 font-normal opacity-80">—</span>
          <span className="font-medium">Exit preview</span>
          <span className="mt-1 block text-xs font-normal opacity-90 sm:mt-0 sm:ml-2 sm:inline">
            Nav and club access match their membership. Your admin session is
            unchanged.
          </span>
        </p>
        <form action={exitPreviewAction}>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="border-[#0A2342]/40 bg-white font-semibold text-[#0A2342] hover:bg-white"
          >
            <EyeOff className="size-4" />
            Exit preview
          </Button>
        </form>
      </div>
    </div>
  );
}
