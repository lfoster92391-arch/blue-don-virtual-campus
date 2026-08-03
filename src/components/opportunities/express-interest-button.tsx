"use client";

import { useEffect, useState } from "react";
import { Check, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "blue-don:opportunity-interest";

function readInterest(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeInterest(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

type ExpressInterestButtonProps = {
  opportunityId: string;
  size?: "sm" | "default" | "lg";
  className?: string;
};

/**
 * Lightweight in-app "Express interest" flag. Stores the student's saved
 * opportunities client-side so the Future Center flow can be wired to real
 * persistence later without changing the UI.
 */
export function ExpressInterestButton({
  opportunityId,
  size = "sm",
  className,
}: ExpressInterestButtonProps) {
  const [interested, setInterested] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setInterested(readInterest().has(opportunityId));
    setReady(true);
  }, [opportunityId]);

  function toggle() {
    const current = readInterest();
    if (current.has(opportunityId)) {
      current.delete(opportunityId);
      setInterested(false);
    } else {
      current.add(opportunityId);
      setInterested(true);
    }
    writeInterest(current);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={interested ? "outline" : "default"}
      onClick={toggle}
      aria-pressed={interested}
      disabled={!ready}
      className={cn(
        interested && "border-[#2E8B57]/40 text-[#2E8B57]",
        className,
      )}
    >
      {interested ? (
        <>
          <Check className="size-4" aria-hidden="true" />
          Interested — Future Center notified
        </>
      ) : (
        <>
          <Star className="size-4" aria-hidden="true" />
          Express interest
        </>
      )}
    </Button>
  );
}
