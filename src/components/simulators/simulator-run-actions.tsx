"use client";

import Link from "next/link";
import { useTransition } from "react";

import { logSimulatorRunAction } from "@/features/simulators/actions";
import { Button } from "@/components/ui/button";

function isInternalUrl(url: string) {
  return url.startsWith("/");
}

export function SimulatorRunActions({
  simulatorId,
  slug,
  launchUrl,
  showLaunch = true,
}: {
  simulatorId: string;
  slug: string;
  launchUrl: string;
  showLaunch?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const internal = isInternalUrl(launchUrl);

  return (
    <div className="flex flex-wrap gap-3">
      {showLaunch ? (
        <Button
          nativeButton={false}
          render={
            internal ? (
              <Link href={launchUrl}>Launch simulator</Link>
            ) : (
              <a href={launchUrl} target="_blank" rel="noopener noreferrer">
                Launch simulator
              </a>
            )
          }
        />
      ) : null}
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await logSimulatorRunAction(simulatorId, slug);
          })
        }
      >
        {pending ? "Logging…" : "Log completion"}
      </Button>
    </div>
  );
}
