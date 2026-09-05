import { redirect } from "next/navigation";

/**
 * Club workspaces are query-tabbed (`?tab=calendar`). Server actions that only
 * `revalidatePath("/organizations/:slug")` can drop that query and land on
 * Overview — which feels like the browser back button.
 */
export function clubTabPath(slug: string, tab: string): string {
  const safeSlug = slug.trim();
  if (!safeSlug) {
    return "/home";
  }
  if (!tab || tab === "overview") {
    return `/organizations/${safeSlug}`;
  }
  return `/organizations/${safeSlug}?tab=${encodeURIComponent(tab)}`;
}

export function redirectToClubTab(slug: string, tab: string): never {
  redirect(clubTabPath(slug, tab));
}

/** `redirect()` throws; never swallow it inside a `try/catch`. */
export function rethrowIfRedirect(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}
