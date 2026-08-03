"use client";

import { useSyncExternalStore } from "react";

import { themeInitScript } from "@/lib/theme";

const noopSubscribe = () => () => {};

// React 19 (shipped with Next.js 16) emits a dev-only error whenever a
// non-hoistable inline <script> is created during a *client* render, since
// browsers never execute scripts inserted that way. The no-flash theme script
// must still run before paint on the initial document, so we emit it only on
// the server render and the matching hydration render, then render nothing on
// subsequent client renders. `useSyncExternalStore` keeps this value stable
// across the hydration boundary (no mismatch); by the time React drops the tag
// after hydration the IIFE has already applied the theme, so there is no flash.
export function ThemeInitScript() {
  const isServerRender = useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true,
  );

  if (!isServerRender) {
    return null;
  }

  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
