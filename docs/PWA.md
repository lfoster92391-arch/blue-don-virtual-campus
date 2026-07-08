# PWA — Blue Don Virtual Campus

Blue Don Virtual Campus is installable as a Progressive Web App (PWA) on desktop and mobile.

## What is included

- `public/manifest.webmanifest` — app name, colors, icons, and display mode
- `public/icons/` — 192×192, 512×512, and 180×180 Apple touch icon
- `public/sw.js` — minimal service worker (cache-first for static assets only)
- Install prompt banner — dismissible, stored in `localStorage`

## Install after Vercel deploy

### Desktop (Chrome / Edge)

1. Open the production URL (must be HTTPS).
2. Look for the install icon in the address bar, or use the in-app **Install campus app** banner.
3. Click **Install** and confirm.

### iPhone / iPad (Safari)

1. Open the production URL in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Confirm the name and tap **Add**.

The install banner also shows brief iOS instructions when Safari is detected.

### Android (Chrome)

1. Open the production URL in Chrome.
2. Tap the menu (⋮) → **Install app** or **Add to Home screen**.
3. Or use the in-app install banner when Chrome offers it.

## Regenerating icons

Icons are generated from `public/icons/icon.svg`:

```bash
npm install -D sharp
node scripts/generate-pwa-icons.mjs
```

## Local testing

Service worker registration runs in production builds only (`npm run build && npm run start`). For local PWA testing, use the production server rather than `npm run dev`.

## Browser support

| Platform | Install method | Service worker required |
|----------|----------------|-------------------------|
| Chrome desktop | Address bar / banner | Yes |
| Edge desktop | Address bar / banner | Yes |
| Safari iOS | Add to Home Screen | No (manifest + meta tags) |
| Chrome Android | Menu / banner | Yes |

## Dismissing the install banner

Users can dismiss the banner with **Not now** or the close button. The choice is saved in `localStorage` under `bd-pwa-install-dismissed`.
