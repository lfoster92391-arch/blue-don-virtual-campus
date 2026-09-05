"use client";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VIEW_AS_LABELS, type ViewAsPersona } from "@/config/view-as";
import { startViewAsAction } from "@/features/admin/preview-actions";

const CHOICES: ViewAsPersona[] = [
  "student",
  "parent",
  "guest",
  "coach",
  "faculty",
  "admin",
];

export function ViewAsHeaderControl() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye className="size-4" />
            <span className="hidden sm:inline">View as</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>View as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CHOICES.map((persona) => (
          <form key={persona} action={startViewAsAction}>
            <input type="hidden" name="persona" value={persona} />
            <button
              type="submit"
              className="flex w-full cursor-default items-center rounded-md px-1.5 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
            >
              {VIEW_AS_LABELS[persona]}
            </button>
          </form>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
