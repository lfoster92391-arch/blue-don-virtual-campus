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
  const label = studentName
    ? `Previewing as ${studentName}`
    : clubSlug
      ? `Previewing ${focusClubName(clubSlug)} member view`
      : "Preview mode";

  return (
    <div className="sticky top-0 z-50 border-b border-[#D4A017]/40 bg-[#D4A017] text-[#0A2342]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2 lg:px-6">
        <p className="text-sm font-medium">
          <span className="font-semibold">{label}</span>
          <span className="ml-2 font-normal opacity-90">
            Nav and club access match their membership. Your admin session is
            unchanged — exit anytime.
          </span>
        </p>
        <form action={exitPreviewAction}>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="border-[#0A2342]/30 bg-white/90 text-[#0A2342] hover:bg-white"
          >
            <EyeOff className="size-4" />
            Exit preview
          </Button>
        </form>
      </div>
    </div>
  );
}
