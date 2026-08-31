import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { ThemeInitScript } from "@/components/providers/theme-init-script";
import { BRAND_ASSET_VERSION, brandAssets, brandColors, siteConfig } from "@/config/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cacheBust = `?v=${BRAND_ASSET_VERSION}`;

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.shortName,
  },
  icons: {
    icon: [
      { url: `/favicon.ico${cacheBust}`, sizes: "32x32" },
      { url: `${brandAssets.icon192}${cacheBust}`, sizes: "192x192", type: "image/png" },
      { url: `${brandAssets.icon512}${cacheBust}`, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: `/icons/apple-touch-icon.png${cacheBust}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: brandColors.navy,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
