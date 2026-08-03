"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import {
  isNavGroup,
  isNavItemActive,
  type NavEntry,
  type NavGroup,
  type NavItem,
} from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function entryIsPrimary(entry: NavEntry): boolean {
  return Boolean(entry.primary);
}

function itemIsActive(
  pathname: string,
  search: string,
  item: NavItem,
): boolean {
  return Boolean(item.href) && isNavItemActive(pathname, item.href as string, search);
}

function groupHasActive(
  pathname: string,
  search: string,
  group: NavGroup,
): boolean {
  return group.children.some((child) => itemIsActive(pathname, search, child));
}

function LeafLink({
  item,
  pathname,
  search,
  onNavigate,
  indented,
}: {
  item: NavItem;
  pathname: string;
  search: string;
  onNavigate?: () => void;
  indented?: boolean;
}) {
  const Icon = item.icon;
  const isActive = itemIsActive(pathname, search, item);

  const content = (
    <span
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        indented && "pl-9",
        item.primary && !indented && "font-semibold",
        item.enabled
          ? isActive
            ? "bg-white/15 text-white"
            : item.primary && !indented
              ? "text-white hover:bg-white/10"
              : "text-[#C6CCD6] hover:bg-white/10 hover:text-white"
          : "cursor-not-allowed text-white/35",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </span>
  );

  if (!item.enabled || !item.href) {
    return (
      <div aria-disabled="true" className="w-full">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

function GroupBlock({
  group,
  pathname,
  search,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  search: string;
  onNavigate?: () => void;
}) {
  const Icon = group.icon;
  const containsActive = groupHasActive(pathname, search, group);
  const [open, setOpen] = useState(group.defaultOpen || containsActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          group.primary ? "font-semibold" : "font-medium",
          containsActive || group.primary
            ? "text-white"
            : "text-[#C6CCD6] hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{group.label}</span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
      {open ? (
        <div className="mt-1 space-y-1">
          {group.children.map((child) => (
            <LeafLink
              key={child.label}
              item={child}
              pathname={pathname}
              search={search}
              onNavigate={onNavigate}
              indented
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Collapsed icon rail: flatten every leaf into an icon + tooltip link. */
function CollapsedRail({
  entries,
  pathname,
  search,
  onNavigate,
}: {
  entries: NavEntry[];
  pathname: string;
  search: string;
  onNavigate?: () => void;
}) {
  const leaves = entries.flatMap((entry) =>
    isNavGroup(entry) ? entry.children : [entry],
  );

  return (
    <>
      {leaves.map((item) => {
        const Icon = item.icon;
        const isActive = itemIsActive(pathname, search, item);
        const content = (
          <span
            className={cn(
              "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm transition-colors",
              item.enabled
                ? isActive
                  ? "bg-white/15 text-white"
                  : "text-[#C6CCD6] hover:bg-white/10 hover:text-white"
                : "cursor-not-allowed text-white/35",
            )}
          >
            <Icon className="size-4 shrink-0" />
          </span>
        );

        if (!item.enabled || !item.href) {
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger
                render={
                  <div aria-disabled="true" className="w-full">
                    {content}
                  </div>
                }
              />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Tooltip key={`${item.label}-${item.href}`}>
            <TooltipTrigger
              render={
                <Link href={item.href} onClick={onNavigate}>
                  {content}
                </Link>
              }
            />
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}

/**
 * Renders the condensed grouped navigation. Top-level entries are either direct
 * links or collapsible parent groups. When {@link sidebarCollapsed} is set the
 * tree flattens to an icon-only rail with tooltips.
 */
function NavTreeBody({
  entries,
  pathname,
  search,
  sidebarCollapsed = false,
  onNavigate,
}: {
  entries: NavEntry[];
  pathname: string;
  search: string;
  sidebarCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  if (sidebarCollapsed) {
    return (
      <CollapsedRail
        entries={entries}
        pathname={pathname}
        search={search}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <>
      {entries.map((entry, index) => {
        const prev = entries[index - 1];
        const showDivider =
          index > 0 &&
          entryIsPrimary(prev) &&
          !entryIsPrimary(entry);

        const node = isNavGroup(entry) ? (
          <GroupBlock
            key={entry.label}
            group={entry}
            pathname={pathname}
            search={search}
            onNavigate={onNavigate}
          />
        ) : (
          <LeafLink
            key={entry.label}
            item={entry}
            pathname={pathname}
            search={search}
            onNavigate={onNavigate}
          />
        );

        if (!showDivider) {
          return node;
        }

        return (
          <div key={`after-primary-${index}`} className="space-y-1">
            <div
              className="mx-3 my-2 border-t border-white/10"
              role="separator"
              aria-hidden="true"
            />
            {node}
          </div>
        );
      })}
    </>
  );
}

function NavTreeWithSearch(
  props: Omit<Parameters<typeof NavTreeBody>[0], "search">,
) {
  const searchParams = useSearchParams();
  return <NavTreeBody {...props} search={searchParams.toString()} />;
}

export function NavTree(
  props: Omit<Parameters<typeof NavTreeBody>[0], "search">,
) {
  return (
    <Suspense fallback={<NavTreeBody {...props} search="" />}>
      <NavTreeWithSearch {...props} />
    </Suspense>
  );
}
