"use client";

import Link from "next/link";
import { Gift, Headphones, ListChecks, Settings, User } from "lucide-react";

import { PartnerBackLink } from "@/components/layout/partner-back-link";
import { isPartnerLinked } from "@/config/partner";
import { ROLE_LABELS } from "@/config/roles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CampusUser } from "@/types/auth";

export function QuickActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Quick Actions
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/events/new" className="flex w-full items-center gap-2">
            Create Event
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/service-desk/new" className="flex w-full items-center gap-2">
            <Headphones className="size-4" />
            Submit Ticket
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/checklists" className="flex w-full items-center gap-2">
            <ListChecks className="size-4" />
            Complete Checklist
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProfileMenu({ user }: { user: CampusUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 px-2"
            aria-label="Open profile menu"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#0A2342] text-xs font-semibold text-white">
              {user.initials}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-sm font-medium">{user.displayName}</span>
              <span className="block text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
        {user.role === "teacher" ||
        user.role === "advisor" ||
        user.role === "admin" ||
        user.role === "coach" ? (
          <DropdownMenuItem>
            <Link href="/teacher/wishlists" className="flex w-full items-center gap-2">
              <Gift className="size-4" />
              Class wishlists
            </Link>
          </DropdownMenuItem>
        ) : null}
        {isPartnerLinked() ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PartnerBackLink variant="menu" />
            </DropdownMenuItem>
          </>
        ) : null}
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
