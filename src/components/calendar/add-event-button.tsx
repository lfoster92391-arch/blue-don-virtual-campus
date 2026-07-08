"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { newEventUrl } from "@/lib/calendar/utils";
import { cn } from "@/lib/utils";

type AddEventButtonProps = {
  date?: Date;
  variant?: "default" | "outline" | "fab" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
  showLabel?: boolean;
};

export function AddEventButton({
  date,
  variant = "default",
  size = "default",
  className,
  label = "Add event",
  showLabel = true,
}: AddEventButtonProps) {
  const href = newEventUrl(date);

  if (variant === "fab") {
    return (
      <Button
        size="lg"
        className={cn(
          "size-14 rounded-full bg-[#0A2342] shadow-lg hover:bg-[#0A2342]/90",
          className,
        )}
        nativeButton={false}
        render={
          <Link href={href} aria-label={label}>
            <Plus className="size-6" />
          </Link>
        }
      />
    );
  }

  return (
    <Button
      variant={variant === "default" ? "default" : variant}
      size={size}
      className={className}
      nativeButton={false}
      render={
        <Link href={href}>
          <Plus className="size-4" />
          {showLabel ? label : null}
        </Link>
      }
    />
  );
}
