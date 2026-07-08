"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShellStore } from "@/stores/shell-store";
import { cn } from "@/lib/utils";

export function CampusSearch() {
  const { searchOpen, setSearchOpen } = useShellStore();

  return (
    <div className="relative flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className={cn("lg:hidden", searchOpen && "hidden")}
        aria-label="Open search"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="size-4" />
      </Button>

      <div
        className={cn(
          "flex items-center gap-2",
          searchOpen ? "flex w-full" : "hidden lg:flex lg:w-64 xl:w-80",
        )}
      >
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search campus..."
            aria-label="Search campus"
            className="h-9 pl-9"
            disabled
          />
        </div>
        {searchOpen ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
