"use client";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delay={0}>
        <ServiceWorkerRegistration />
        {children}
        <InstallPrompt />
      </TooltipProvider>
    </ThemeProvider>
  );
}
