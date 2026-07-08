# Asset Pilot EDU Integration Playbook

Blue Don Virtual Campus integrates with [Asset Pilot EDU](https://www.assetpilotedu.com) via custom domain, cross-site navigation, and an embed/SSO foundation.

**Production URL (custom domain):** `https://campus.assetpilotedu.com`  
**Fallback (Vercel):** `https://blue-don-virtual-campus.vercel.app`

---

## Subdomain recommendation

| Option | URL | Recommendation |
|--------|-----|----------------|
| **Preferred** | `https://campus.assetpilotedu.com` | Clear product name; easy for students and parents |
| Alternative | `https://blue-don.assetpilotedu.com` | Brand-specific; use if `campus` is taken |

**Recommendation:** Use **`campus.assetpilotedu.com`** unless you already use `campus` for another service.

---

## 1. DNS configuration

At your domain registrar (where `assetpilotedu.com` DNS is managed), add:

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| **CNAME** | `campus` | `cname.vercel-dns.com` | 300–3600 |

> Vercel may show a project-specific CNAME target after you add the domain (e.g. `xxxxxxxx.vercel-dns-017.com`). **Use the exact value Vercel displays** — it can differ from the generic `cname.vercel-dns.com`.

### Optional: apex redirect

If you want `assetpilotedu.com/campus` to redirect to the subdomain, configure that at your main site host (not in this repo).

### Verification

After DNS propagates (usually 5–60 minutes):

```bash
nslookup campus.assetpilotedu.com
```

You should see the CNAME pointing at Vercel.

---

## 2. Vercel custom domain

**Status:** `campus.assetpilotedu.com` has been added to project `blue-don-virtual-campus` via CLI.

```bash
vercel domains add campus.assetpilotedu.com
# > Success! Domain campus.assetpilotedu.com added to project blue-don-virtual-campus.
```

**Required DNS record** (add at your registrar — domain will not work until this is live):

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| **CNAME** | `campus` | `cname.vercel-dns.com` | Auto / 300 |

> Confirmed via `www.assetpilotedu.com` CNAME on the same zone. Use the exact target shown in [Vercel → Domains](https://vercel.com/dashboard) if it differs.

After adding DNS, wait for **Valid Configuration** (green check) in Vercel.

---

## 3. Environment variables (Vercel)

Set in **Project → Settings → Environment Variables** for **Production** (and Preview if desired):

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://campus.assetpilotedu.com` | Canonical app URL (auth, PWA, absolute links) — **set in Vercel Production** |
| `NEXT_PUBLIC_PARTNER_SITE_URL` | `https://www.assetpilotedu.com` | "Back to Asset Pilot" link (footer + profile menu) |
| `ASSETPILOT_SITE_URL` | `https://www.assetpilotedu.com` | Server-side fallback if public var not set |

**Important:** Set `NEXT_PUBLIC_PARTNER_SITE_URL` (not only `ASSETPILOT_SITE_URL`) so the partner link works in client components.

Redeploy after changing env vars:

```bash
vercel --prod --yes
```

---

## 4. Supabase auth URL updates

In **Supabase → Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| **Site URL** | `https://campus.assetpilotedu.com` |
| **Redirect URLs** | Add all of the following |

```
https://campus.assetpilotedu.com/**
https://blue-don-virtual-campus.vercel.app/**
http://localhost:3000/**
```

Keep the Vercel URL during transition so existing bookmarks keep working.

### Google OAuth (if enabled)

In Google Cloud Console → OAuth client → **Authorized redirect URIs**, add:

```
https://<your-supabase-project>.supabase.co/auth/v1/callback
```

Supabase handles the callback; no change needed on the campus domain for Google itself.

---

## 5. Link from assetpilotedu.com

Add a navigation link on the main Asset Pilot site pointing to the campus.

### HTML snippet (nav)

```html
<nav>
  <!-- existing links -->
  <a href="https://campus.assetpilotedu.com" class="nav-link">
    Virtual Campus
  </a>
</nav>
```

### HTML snippet (hero / CTA button)

```html
<a
  href="https://campus.assetpilotedu.com"
  class="btn btn-primary"
  rel="noopener"
>
  Enter Blue Don Virtual Campus
</a>
```

### Embedded dashboard (iframe)

Use after custom domain and auth are working:

```html
<iframe
  src="https://campus.assetpilotedu.com/embed/dashboard"
  title="Blue Don Virtual Campus Dashboard"
  width="100%"
  height="800"
  style="border: 0; border-radius: 8px;"
  loading="lazy"
  allow="clipboard-write"
></iframe>
```

See [Embed caveats](#embed-route-caveats) below.

---

## 6. In-app partner link

When `NEXT_PUBLIC_PARTNER_SITE_URL` or `ASSETPILOT_SITE_URL` is set, the campus shows **"Back to Asset Pilot EDU"** in:

- Page footer
- Profile menu (top-right)

No code changes needed on assetpilotedu.com for this — only the env var.

---

## 7. Embed route

| Route | Purpose |
|-------|---------|
| `/embed/dashboard` | Dashboard with reduced chrome for iframe embedding |

Features:

- No sidebar or mobile nav
- Minimal top bar with "Open full campus" link
- Partner back-link when configured
- `Content-Security-Policy: frame-ancestors` restricts embedding to your partner origin when `NEXT_PUBLIC_PARTNER_SITE_URL` is set

### Embed route caveats

1. **Authentication:** Users must be logged in. Unauthenticated visitors are redirected to `/login` (may break inside an iframe — see SSO roadmap).
2. **Third-party cookies:** Some browsers block cookies in cross-site iframes. Full SSO (below) is the long-term fix.
3. **Height:** Set iframe `height` explicitly or use `postMessage` resize (future enhancement).
4. **PWA / service worker:** Not active inside embed; use full campus URL for install prompts.
5. **Framing:** Only `assetpilotedu.com` origin can embed when partner URL env is set. Add more origins in `next.config.ts` if needed.

---

## 8. SSO roadmap

### Phase A — Shared Google Workspace (recommended first step)

**Prerequisite:** Asset Pilot EDU and campus users share a Google Workspace domain (e.g. `@assetpilotedu.com` or school domain).

1. Enable **Google** provider in Supabase Auth
2. Restrict OAuth to your Google Workspace hosted domain
3. Users sign in once with Google on either site (same IdP)

**Asset Pilot provides:**

- [ ] Google Workspace admin confirmation that OAuth is allowed
- [ ] Hosted domain name(s) for login restriction

### Phase B — SAML / OIDC (enterprise SSO)

When Asset Pilot has an IdP (Okta, Azure AD, Google SAML, etc.):

1. Asset Pilot provides **SAML metadata XML** or OIDC discovery URL
2. Configure **Supabase SAML 2.0** (Pro plan) or custom OIDC
3. Map SAML attributes → campus user profile (email, name, role)

**Asset Pilot provides:**

- [ ] IdP metadata XML or OIDC issuer URL
- [ ] Attribute mapping (email, given_name, family_name, groups/roles)
- [ ] Test account for staging

### Phase C — Seamless iframe auth (future)

- OAuth `prompt=none` silent auth when parent site shares session
- `postMessage` token handoff from assetpilotedu.com parent frame
- Requires security review and shared auth architecture

---

## 9. API roadmap

Foundation for programmatic integration between Asset Pilot EDU and Blue Don Virtual Campus.

### Phase 1 — Read-only campus API (planned)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Service status (exists today at `/api/health`) |
| `/api/v1/users/:id/summary` | GET | Student dashboard summary for Asset Pilot profile pages |
| `/api/v1/academies` | GET | Academy list and metadata |

**Auth:** API keys or Supabase service JWT scoped to Asset Pilot integration.

### Phase 2 — Provisioning webhooks

- Asset Pilot → Campus: user created/updated/deactivated
- Campus → Asset Pilot: portfolio milestone, badge earned

**Asset Pilot provides:**

- [ ] Webhook endpoint URL on assetpilotedu.com
- [ ] Signing secret for HMAC verification
- [ ] User ID mapping scheme (shared UUID or email)

### Phase 3 — Embedded widgets

- `/embed/dashboard` (shipped)
- `/embed/portfolio` (planned)
- `/embed/academy/:slug` (planned)

---

## 10. Rollout checklist

### You (domain owner) — no secrets in chat

- [x] **Confirm subdomain:** `campus.assetpilotedu.com`
- [ ] **Add DNS CNAME** at registrar → `campus` → `cname.vercel-dns.com` (**required — site won't work until done**)
- [x] **Add domain in Vercel** (`vercel domains add campus.assetpilotedu.com`)
- [x] **Update Vercel env:** `NEXT_PUBLIC_APP_URL=https://campus.assetpilotedu.com`
- [ ] **Update Vercel env:** `NEXT_PUBLIC_PARTNER_SITE_URL=https://www.assetpilotedu.com`
- [ ] **Update Supabase** Site URL + Redirect URLs
- [ ] **Add nav link** on assetpilotedu.com → campus URL
- [ ] **Test:** login, logout, Google OAuth (if used), PWA install on new domain
- [ ] **Test embed:** iframe on assetpilotedu.com with logged-in user

### For SSO (when ready)

- [ ] Google Workspace domain name OR SAML metadata XML
- [ ] Test user accounts on staging
- [ ] Role mapping requirements (student / teacher / admin)

### For API (when ready)

- [ ] API key delivery method (Vercel env, not chat)
- [ ] Webhook URL on Asset Pilot side
- [ ] User ID correlation strategy

---

## 11. Troubleshooting

| Issue | Fix |
|-------|-----|
| Domain not verifying | Wait for DNS propagation; confirm CNAME name is `campus` not `campus.assetpilotedu.com` |
| Auth redirect loop | Add new domain to Supabase Redirect URLs; set `NEXT_PUBLIC_APP_URL` |
| "Back to Asset Pilot" missing | Set `NEXT_PUBLIC_PARTNER_SITE_URL` and redeploy |
| Iframe blank / login page | User not authenticated; third-party cookie blocked — use top-level link or SSO |
| Iframe refused to connect | Check `frame-ancestors` CSP; ensure `NEXT_PUBLIC_PARTNER_SITE_URL` matches parent origin |

---

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel, env vars, health check
- [PWA.md](./PWA.md) — install scope requires correct `NEXT_PUBLIC_APP_URL`
