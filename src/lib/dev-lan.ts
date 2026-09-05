import os from "node:os";
import { headers } from "next/headers";

import type { PhoneAccessHintData } from "@/components/auth/phone-access-hint";
import { PRODUCTION_DEFAULT_APP_URL } from "@/config/env";

function getPrivateLanOrigin(): string | null {
  const port = process.env.PORT?.trim() || "3000";
  const nets = os.networkInterfaces();

  for (const addrs of Object.values(nets)) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        return `http://${addr.address}:${port}`;
      }
    }
  }

  return null;
}

/** Shown on /login during local `next dev` so phones are not pointed at localhost. */
export async function getDevPhoneAccessHint(): Promise<PhoneAccessHintData | null> {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const host = (await headers()).get("host") ?? "";
  const viewingLocalhost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  if (!viewingLocalhost) {
    return null;
  }

  const lanOrigin = getPrivateLanOrigin();
  return {
    productionLogin: `${PRODUCTION_DEFAULT_APP_URL}/login`,
    lanLogin: lanOrigin ? `${lanOrigin}/login` : null,
  };
}
