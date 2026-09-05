"use client";

import Link from "next/link";
import {
  Bell,
  Eye,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VIEW_AS_LABELS, type ViewAsPersona } from "@/config/view-as";
import { startViewAsAction } from "@/features/admin/preview-actions";
import { ROLE_LABELS } from "@/config/roles";
import type { CampusUser } from "@/types/auth";

const VIEW_AS_CHOICES: ViewAsPersona[] = [
  "student",
  "parent",
  "guest",
  "coach",
  "faculty",
  "admin",
];

export function HeaderOverflowMenu({
  user,
  showViewAs = false,
}: {
  user: CampusUser;
  showViewAs?: boolean;
}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open account and tools"
          >
            <MoreHorizontal className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {user.displayName}
          <span className="mt-0.5 block font-normal">
            {ROLE_LABELS[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showViewAs ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Eye className="size-4" />
              View as
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              {VIEW_AS_CHOICES.map((persona) => (
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
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : null}
        <DropdownMenuItem disabled>
          <Search className="size-4" />
          Search campus
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Bell className="size-4" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="size-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="size-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile" className="flex w-full items-center gap-2">
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/settings" className="flex w-full items-center gap-2">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/auth/signout" className="flex w-full items-center gap-2">
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
