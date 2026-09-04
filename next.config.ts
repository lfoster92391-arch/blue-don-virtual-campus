import type { NextConfig } from "next";

function buildEmbedFrameAncestors(): string {
  const raw = process.env.ASSETPILOT_SITE_URL?.trim();
  const ancestors = ["'self'"];

  if (raw) {
    try {
      const normalized = /^https?:\/\//i.test(raw)
        ? raw.replace(/\/+$/, "")
        : `https://${raw.replace(/\/+$/, "")}`;
      const url = new URL(normalized);
      ancestors.push(url.origin);
      const hostname = url.hostname.replace(/^www\./, "");
      ancestors.push(`https://*.${hostname}`);
    } catch {
      // ignore invalid ASSETPILOT_SITE_URL at build time
    }
  }

  return ancestors.join(" ");
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      // Default is 1 MB, which silently breaks every image upload form (club
      // logos, storefront photos, invoice scans). 4 MB is the practical
      // ceiling: Vercel rejects any function request body over 4.5 MB at the
      // infrastructure level. Video is deliberately not sent through an action
      // at all — it goes straight to Supabase Storage from the browser.
      bodySizeLimit: "4mb",
    },
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/home", permanent: false },
      { source: "/future", destination: "/pathways", permanent: false },
      { source: "/live", destination: "/watch", permanent: false },
    ];
  },
  async headers() {
    const frameAncestors = buildEmbedFrameAncestors();

    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
