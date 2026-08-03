"use client";

import { useEffect } from "react";

/**
 * PWA registration is disabled while diagnosing Chromium renderer crashes.
 * On load we unregister any existing workers and clear their caches so prior
 * installs cannot keep serving stale/broken assets.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      } catch {
        // ignore
      }

      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("blue-don-"))
              .map((key) => caches.delete(key)),
          );
        } catch {
          // ignore
        }
      }
    })();
  }, []);

  return null;
}
