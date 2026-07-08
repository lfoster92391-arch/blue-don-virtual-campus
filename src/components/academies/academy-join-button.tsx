"use client";

import { useTransition } from "react";

import { joinAcademyAction } from "@/features/academies/actions";
import { Button } from "@/components/ui/button";
import type { AcademyMembershipStatus } from "@/generated/prisma/client";

type AcademyJoinButtonProps = {
  academyId: string;
  slug: string;
  membershipStatus: AcademyMembershipStatus | null;
};

export function AcademyJoinButton({
  academyId,
  slug,
  membershipStatus,
}: AcademyJoinButtonProps) {
  const [pending, startTransition] = useTransition();

  if (membershipStatus === "ACTIVE") {
    return (
      <span className="rounded-full bg-[#2E8B57]/10 px-3 py-1 text-xs font-medium text-[#2E8B57]">
        Member
      </span>
    );
  }

  if (membershipStatus === "PENDING") {
    return (
      <span className="rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-medium text-[#D4A017]">
        Pending approval
      </span>
    );
  }

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await joinAcademyAction(academyId, slug);
        })
      }
    >
      {pending ? "Submitting…" : "Request to join"}
    </Button>
  );
}
