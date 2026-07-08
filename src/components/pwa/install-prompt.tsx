"use client";

import { Share, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { brandAssets, siteConfig } from "@/config/site";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "bd-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "true") {
      return;
    }

    if (isStandaloneMode()) {
      return;
    }

    if (isIosDevice()) {
      setShowIosHint(true);
      setVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
    setDeferredPrompt(null);
  };

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Install app"
      className={cn(
        "fixed inset-x-4 bottom-20 z-50 rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm",
        "lg:inset-x-auto lg:right-4 lg:bottom-4 lg:max-w-sm",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0A2342]/10 dark:bg-white/10">
          {showIosHint ? (
            <Share className="size-4 text-[#0A2342] dark:text-white" aria-hidden="true" />
          ) : (
            <Image
              src={brandAssets.emblem}
              alt=""
              width={36}
              height={36}
              className="size-9 object-contain"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
            Install campus app
          </p>
          <p className="text-xs text-muted-foreground">
            {showIosHint
              ? "Tap Share, then Add to Home Screen for quick access."
              : `Add ${siteConfig.name} to your device for faster access.`}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      {!showIosHint ? (
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            Not now
          </Button>
          <Button type="button" size="sm" onClick={install}>
            Install
          </Button>
        </div>
      ) : null}
    </div>
  );
}
