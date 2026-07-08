# Deployment Guide

## Platform

**Vercel** — preview deployments for pull requests, production approval required.

## Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Local | — | `http://localhost:3000` |
| Preview | PR branches | `*.vercel.app` |
| Production | `main` | `https://campus.assetpilotedu.com` (custom domain) |

## Custom Domain (e.g. campus.assetpilotedu.com)

See **[ASSETPILOT_INTEGRATION.md](./ASSETPILOT_INTEGRATION.md)** for the full Asset Pilot EDU integration guide. Summary:

1. ~~**Vercel → Settings → Domains** → add `campus.assetpilotedu.com`~~ ✅ Added via CLI
2. **DNS at registrar** (assetpilotedu.com zone) → CNAME `campus` → `cname.vercel-dns.com` — **you must add this record**
3. Set env vars:
   ```
   NEXT_PUBLIC_APP_URL=https://campus.assetpilotedu.com
   NEXT_PUBLIC_PARTNER_SITE_URL=https://www.assetpilotedu.com
   ```
4. **Supabase → Auth → URL Configuration** → Site URL + Redirect URLs for the new domain
5. Verify: `GET https://campus.assetpilotedu.com/api/health`

## Setup

### 1. Vercel Project

1. Import the GitHub repository in Vercel
2. Framework preset: **Next.js**
3. Root directory: `.`

### 2. Environment Variables

Set in Vercel project settings:

```
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_PARTNER_SITE_URL
ASSETPILOT_SITE_URL
```

**`NEXT_PUBLIC_PARTNER_SITE_URL`** (recommended) — enables "Back to Asset Pilot EDU" in footer and profile menu, and allows iframe embedding from the partner origin. Example: `https://www.assetpilotedu.com`.

**`ASSETPILOT_SITE_URL`** (optional server fallback) — used when `NEXT_PUBLIC_PARTNER_SITE_URL` is not set. Prefer setting the public var for client-side links.

See **[ASSETPILOT_INTEGRATION.md](./ASSETPILOT_INTEGRATION.md)** for the full playbook.

**`NEXT_PUBLIC_APP_URL`** — set to your canonical production origin (HTTPS, no trailing slash). Production value:

```
https://campus.assetpilotedu.com
```

Set in Vercel Production env (already configured). Keep `https://blue-don-virtual-campus.vercel.app/**` in Supabase redirect URLs during transition.

Used for auth redirects, absolute links, and PWA scope. The build **does not fail** if this variable is missing or invalid: the app falls back to `https://${VERCEL_URL}` during Vercel deployments, then to `https://blue-don-virtual-campus.vercel.app`. Set it explicitly so preview and production URLs stay correct for Supabase auth and PWA install scope.

### 3. Supabase

1. Create a Supabase project
2. Copy the Postgres connection string to `DATABASE_URL`
3. Copy API keys from Project Settings → API
4. Run migrations after Phase 2+: `npm run db:migrate`
5. Add your production URL to **Authentication → URL Configuration**:
   - **Site URL**: `https://campus.assetpilotedu.com` (or current Vercel URL during transition)
   - **Redirect URLs**: include `https://campus.assetpilotedu.com/**`, `https://blue-don-virtual-campus.vercel.app/**`, and preview URLs if needed

## PWA (Progressive Web App)

The app ships with install support for desktop and mobile. See `docs/PWA.md` for details.

### Vercel notes

- PWA assets (`manifest.webmanifest`, `sw.js`, icons) are served from `public/` automatically.
- Service worker registration runs in production only.
- Set `NEXT_PUBLIC_APP_URL` to the exact production origin (HTTPS, no trailing slash), e.g. `https://blue-don-virtual-campus.vercel.app`. Invalid or empty values are ignored at build time; Vercel's `VERCEL_URL` is used as a fallback when available.

### How users install

| Device | Steps |
|--------|-------|
| **Desktop (Chrome/Edge)** | Open the site → click install icon in address bar or use the **Install campus app** banner |
| **iPhone/iPad** | Safari → Share → **Add to Home Screen** |
| **Android** | Chrome → menu → **Install app** or **Add to Home screen** |

## Deployment Flow

```
Local → Development → Preview (PR) → Production
```

**Rule:** No direct production edits. No direct production testing.

## Health Check

After deployment, verify:

```
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "blue-don-virtual-campus",
  "phase": 0,
  "checks": {
    "app": "healthy",
    "database": "configured",
    "supabase": "configured"
  }
}
```

## Rollback

Vercel supports instant rollback to previous deployments from the dashboard.
