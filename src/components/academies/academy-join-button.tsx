"use client";

import { useState, useTransition } from "react";

import { buildClubMembershipCommitmentContent } from "@/config/club-commitment";
import { joinAcademyWithCommitmentAction } from "@/features/academies/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AcademyMembershipStatus } from "@/generated/prisma/client";

type AcademyJoinButtonProps = {
  academyId: string;
  academyName: string;
  slug: string;
  membershipStatus: AcademyMembershipStatus | null;
  defaultSignatureName?: string;
};

export function AcademyJoinButton({
  academyId,
  academyName,
  slug,
  membershipStatus,
  defaultSignatureName = "",
}: AcademyJoinButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const commitmentText = buildClubMembershipCommitmentContent(academyName);

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

  const isRetry = membershipStatus === "REJECTED";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const signatureName = String(formData.get("signatureName") ?? "").trim();
    const agreeToTerms = formData.get("agreeToTerms") === "on";

    if (!signatureName) {
      setError("Typed signature is required.");
      return;
    }

    if (!agreeToTerms) {
      setError("You must agree to the club membership commitment.");
      return;
    }

    startTransition(async () => {
      const result = await joinAcademyWithCommitmentAction({
        academyId,
        slug,
        academyName,
        signatureName,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(result.success ?? "Join request submitted.");
      setOpen(false);
    });
  }

  return (
    <>
      {isRetry ? (
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          Declined
        </span>
      ) : null}
      <Button
        size="sm"
        variant={isRetry ? "outline" : "default"}
        onClick={() => setOpen(true)}
      >
        {isRetry ? "Request again" : "Request to join"}
      </Button>

      {success ? (
        <p className="w-full text-sm text-[#2E8B57] sm:w-auto">{success}</p>
      ) : null}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Club membership commitment</SheetTitle>
            <SheetDescription>
              Sign this commitment before joining {academyName}. Your signature
              is required for every club or academy you join.
            </SheetDescription>
          </SheetHeader>

          <article className="mt-6 space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed">
            {commitmentText.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </article>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="signatureName" className="text-sm font-medium">
                Typed signature
              </label>
              <Input
                id="signatureName"
                name="signatureName"
                required
                disabled={pending}
                defaultValue={defaultSignatureName}
                placeholder="Type your full legal name"
              />
            </div>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="agreeToTerms"
                required
                disabled={pending}
                className="mt-1 size-4 rounded border-input"
              />
              <span>
                I have read the Club Membership Commitment for {academyName} and
                agree that my typed name constitutes my electronic signature.
              </span>
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Submitting…" : "Sign and request to join"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
