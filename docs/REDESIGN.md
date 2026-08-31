# Blue Don Virtual Campus — UI Redesign Proposal

**Phase:** Audit & Direction Selection (Phase 1)  
**Date:** July 2026  
**Live:** [campus.assetpilotedu.com](https://campus.assetpilotedu.com)  
**Partner:** [assetpilotedu.com](https://www.assetpilotedu.com)  
**Platform state:** Phase 15 · 14 academies · full Madonna Education Network catalog

---

## Blueprint Gate (July 2026)

> **UI redesign follows enterprise blueprint IA approval — not the reverse.**

Structural navigation and layout changes are **blocked** until stakeholders approve the target information architecture in:

- [docs/enterprise-blueprint/03_INFORMATION_ARCHITECTURE.md](./enterprise-blueprint/03_INFORMATION_ARCHITECTURE.md) — twelve primary destinations vs current sidebar
- [docs/enterprise-blueprint/01_PLATFORM_MODULES.md](./enterprise-blueprint/01_PLATFORM_MODULES.md) — 27 platform modules
- [docs/enterprise-blueprint/05_ROADMAP.md](./enterprise-blueprint/05_ROADMAP.md) — Phase 17 IA migration

**What can proceed now:** Token foundation (Phase 1, done), visual direction selection (A/B/C below), component-level polish that does not change nav structure.

**What waits for IA approval:** Sidebar restructure, twelve-destination nav, mobile bottom nav role shortcuts, route renames (`/service-desk` → `/service-center`, etc.), dashboard widget reorganization tied to role templates.

See [docs/enterprise-blueprint/README.md](./enterprise-blueprint/README.md) for the full blueprint index.

---

## Executive Summary

The campus platform has a **solid shell** (sidebar, dashboard command center, academy engine, mobile bottom nav) that users previously liked. The redesign opportunity is **visual refinement and density management** — after enterprise IA is approved, not before.

This document captures the current-state audit, partner brand analysis, pain points, and **three design directions**. No full redesign has been implemented pending blueprint IA approval and direction choice.

---

## 1. Current State Audit

### 1.1 Design system source

| Source | Status |
|--------|--------|
| `docs/blueprint/06_UI_SYSTEM.md` | **Not present in repo** — referenced in `docs/blueprint/README.md` only |
| `src/app/globals.css` | Active token layer (shadcn + Blue Don brand vars) |
| `src/config/site.ts` | Brand assets, colors, site metadata |
| `public/brand/mhs-broadcasting-logo.png` | MHS Broadcasting mark (navy rounded tile, knight/shield/camera) — header, sidebar, auth |
| `public/icons/source-logo.png` | Same mark flattened on navy; the input for generated favicon and PWA icons |

### 1.2 Typography

| Element | Current |
|---------|---------|
| Font family | **Inter** (`next/font/google`) — same as Asset Pilot EDU |
| Headings | `font-semibold`, ad-hoc sizes (`text-2xl`–`text-3xl`) |
| Eyebrow labels | Uppercase, `tracking-[0.18em]`, `#2F80ED` (info blue) |
| Body | Default shadcn muted foreground |

**Gap:** No shared type scale; sizes duplicated per component.

### 1.3 Color palette (campus today)

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0A2342` | Sidebar, hero, headings, primary |
| Silver | `#C6CCD6` | Borders, sidebar muted text |
| Info blue | `#2F80ED` | Accents, progress bars, eyebrows |
| Success | `#2E8B57` | Membership counts, status badges |
| Warning/Gold | `#D4A017` | Pending states |
| Danger | `#C62828` | Destructive actions |

**Gap:** ~50+ component files hardcode hex values instead of CSS tokens. No gold accent in primary brand set (despite Campus Badge Studio identity). Dark mode partially disconnects from navy brand (generic oklch grays).

### 1.4 Layout shell

```
┌─────────────┬──────────────────────────────────────────┐
│  Sidebar    │  Header (clock, search, notifications)   │
│  (navy)     ├──────────────────────────────────────────┤
│  12 nav     │  Main content (max-w 1440px)             │
│  items      │                                          │
│             ├──────────────────────────────────────────┤
│             │  Footer (5 philosophy blocks + partner)  │
└─────────────┴──────────────────────────────────────────┘
Mobile: bottom tab bar (4 items) + hamburger sheet sidebar
```

**Strengths:** Familiar app shell, collapsible sidebar, sticky header, partner back-link.  
**Weaknesses:** Nav item count vs mobile affordances; footer adds significant scroll.

### 1.5 Key surfaces reviewed

| Surface | File(s) | Notes |
|---------|---------|-------|
| Header | `header.tsx` | Crowded on mobile; logo only on small screens |
| Sidebar | `sidebar.tsx` | Navy hardcoded; good collapse behavior |
| Mobile nav | `mobile-nav.tsx` | 4 tabs; doesn't cover Calendar, Forms, Labs, etc. |
| Mobile sidebar | `mobile-sidebar.tsx` | Active state uses exact path match only (desktop uses `startsWith`) |
| Dashboard | `dashboard-content.tsx` + widgets | 8+ stacked sections; Quick Actions lists 14+ links |
| Academies | `academies/page.tsx` | Flat 2-col card grid; 14 cards = long scroll |
| Auth | `auth-shell.tsx` | Split navy panel (desktop) / plain form (mobile) |
| Page headers | `shell-page.tsx` | Consistent eyebrow + title pattern |

---

## 2. Asset Pilot EDU Brand Analysis

Fetched from [www.assetpilotedu.com](https://www.assetpilotedu.com) HTML + CSS (July 2026).

### 2.1 Partner visual language

| Attribute | Asset Pilot | Campus (today) |
|-----------|---------------|----------------|
| Primary brand | **Blue `#0069D9`** (brand-600) | Navy `#0A2342` |
| Accent scale | brand-50 `#EFF6FF` → brand-900 `#003366` | Info blue `#2F80ED` (close but not matched) |
| Neutrals | Slate scale (`slate-900` headings, `slate-500` body) | shadcn oklch grays + silver borders |
| Typography | Inter, bold headlines, uppercase eyebrow `tracking-[0.14em]` | Inter, semibold, `tracking-[0.18em]` eyebrows |
| Layout feel | Clean white landing, minimal chrome, rounded-2xl CTAs | App shell with navy sidebar, card-heavy interior |
| Logo | `asset-logo-header.png` (horizontal) | `mhs-broadcasting-logo.png` (square MHS Broadcasting tile) |

### 2.2 Should campus align with Asset Pilot?

**Recommendation: Partial alignment (Direction C default)** — not a full rebrand.

| Align | Keep distinct |
|-------|---------------|
| Inter typography | Navy sidebar / academic identity |
| Partner blue for cross-links & integration touchpoints | Campus Badge Studio logo & gold accents |
| Slate neutral text hierarchy | Dashboard density & academy-specific color coding |
| White/light content surfaces | Hero gradients & institutional tone |

Campus lives at `campus.assetpilotedu.com` — users should feel **one ecosystem**, but campus is the **learning/academic product** vs Asset Pilot's **operations/IT product**. Visual cousin, not clone.

---

## 3. Pain Points

### P1 — Mobile navigation gap
- Bottom nav: Dashboard, Academies, Profile, Menu (4 items)
- Sidebar: 12 items including Calendar, Forms, Labs, Simulators, Portfolio, Events, Service Desk, Impact Fund, Knowledge Vault
- **Impact:** Most features require opening the hamburger sheet; two navigation systems to learn

### P2 — Dashboard density
- Hero + Quick Actions (14 links) + Metrics + 4-card grid + Portfolio + Progress widget
- Quick Actions duplicates sidebar nav
- **Impact:** Overwhelming first paint; hard to scan on phone

### P3 — Hardcoded brand colors
- `#0A2342`, `#2F80ED`, `#C6CCD6` repeated across 50+ files
- **Impact:** Redesign requires wide refactor; dark mode inconsistent

### P4 — Academy cards at scale
- 14 academies in uniform 2-column cards
- No grouping, search, or filter on list page
- Per-academy color only on small icon badge
- **Impact:** Long scroll; hard to find your academy

### P5 — Auth mobile experience
- Full navy brand panel hidden below `lg`
- Mobile users see logo + form only — loses tagline/institution story
- **Impact:** Weaker first impression for new students/parents

### P6 — Footer weight
- 5 philosophy blocks (`Why This Matters`, `Life Application`, etc.) on every page
- **Impact:** Extra scroll on mobile; competes with bottom nav safe area

### P7 — Partner visual disconnect
- Campus info blue (`#2F80ED`) ≠ Asset Pilot brand blue (`#0069D9`)
- Partner back-link styled in campus navy, not partner brand
- **Impact:** Subtle "different product" feeling when crossing sites

### P8 — Missing UI blueprint doc
- `06_UI_SYSTEM.md` not in repo
- **Impact:** No single source of truth for component specs during redesign

---

## 4. Design Directions

### Direction A — Campus Badge Studio Branded

**Tagline:** *"The academic home of the DONS."*

| Attribute | Spec |
|-----------|------|
| Primary | Navy `#0A2342` (unchanged) |
| Accent | **Gold `#C9A227`** for CTAs, active nav, badges, achievements |
| Secondary | Silver `#C6CCD6`, warm off-white backgrounds |
| Typography | Inter + optional serif for display headings (e.g. Playfair or Libre Baskerville) |
| Sidebar | Deep navy with gold active indicator (left border or icon fill) |
| Cards | Subtle navy tint borders; gold progress rings for academy completion |
| Hero | Navy gradient with gold accent orb (replace blue glow) |
| Auth | Full-bleed navy with gold tagline accents |

**Mock description:**  
Imagine walking into a modern university portal — dark wood-toned sidebar (navy), crest logo prominent, gold highlights on your enrolled academies and earned badges. Dashboard hero feels like a dean's welcome letter. Academy cards show embossed gold borders when you're a member. Feels **institutional, proud, scholarly**.

**Best for:** Madonna High School identity, student pride, distinction from Asset Pilot ops tooling.

---

### Direction B — Asset Pilot Aligned

**Tagline:** *"One platform family."*

| Attribute | Spec |
|-----------|------|
| Primary | Partner blue `#0069D9` |
| Neutrals | Slate scale matching partner site |
| Sidebar | White or `slate-50` with blue active states (like partner app shell) |
| Typography | Inter only; match partner weight scale (bold H1, medium labels) |
| Cards | White, `border-slate-200`, `rounded-2xl`, minimal shadow |
| Hero | White/slate header band instead of navy gradient |
| Auth | White split layout with partner logo co-brand row |
| Cross-links | Partner blue for "Back to Asset Pilot EDU" |

**Mock description:**  
Campus feels like clicking "Virtual Campus" inside Asset Pilot — same blue buttons, same clean white surfaces, same eyebrow label style. Sidebar becomes light mode. Blue Don logo sits beside a small "Powered by Asset Pilot" mark. Feels **professional, operational, unified**.

**Best for:** District IT-led rollout, parent familiarity, embedded iframe/dashboard continuity.

---

### Direction C — Modern Hybrid (Recommended)

**Tagline:** *"Academic soul, platform polish."*

| Attribute | Spec |
|-----------|------|
| Structure | Keep navy sidebar (Direction A identity) |
| Content area | Asset Pilot white/slate surfaces (Direction B clarity) |
| Accents | Navy for structure; partner blue `#0069D9` for links/integration; gold for achievements only |
| Typography | Inter; shared eyebrow pattern with partner (`tracking-[0.14em]`, `text-brand-600`) |
| Cards | `.campus-card` utilities — white, soft shadow, `rounded-xl` |
| Dashboard | Collapsed Quick Actions by default; grouped widgets; sticky section tabs on mobile |
| Mobile | Bottom nav expands to 5 (add Calendar); sidebar groups nav into sections |
| Partner touchpoints | Blue partner link; navy everywhere else |

**Mock description:**  
You still feel the Blue Don navy sidebar and crest when you log in — unmistakably campus. But the dashboard content area is as clean and breathable as Asset Pilot's landing page: white cards, slate text, blue links when you're crossing to partner features. Gold appears only on badges and certifications. Mobile bottom bar shows your top 5 destinations. Feels **modern, balanced, ecosystem-aware**.

**Best for:** Current user base who loved layout, new Asset Pilot integration, phased rollout.

---

## 5. Direction Comparison

| Criteria | A — Campus | B — Asset Pilot | C — Hybrid |
|----------|------------|-----------------|------------|
| Brand distinction | ★★★★★ | ★★☆☆☆ | ★★★★☆ |
| Partner cohesion | ★★☆☆☆ | ★★★★★ | ★★★★☆ |
| Implementation effort | Medium | High (sidebar retheme) | Medium |
| Mobile improvement | Medium | Medium | High (planned nav/density fixes) |
| Risk to loved layout | Low | High | Low |

---

## 6. Implementation Status

### ✅ Done in Phase 1 (foundation only)

| Change | File | Notes |
|--------|------|-------|
| Extended brand tokens (gold, partner blue, typography scale) | `globals.css` | Direction-neutral; no component migration yet |
| Tailwind theme color aliases | `globals.css` `@theme` | `brand-navy`, `brand-gold`, `partner-brand`, etc. |
| Component utility classes | `globals.css` | `.campus-card`, `.campus-eyebrow`, `.campus-hero` (opt-in) |
| Extended `brandColors` config | `site.ts` | For TS references in future phases |

**Visual impact today:** Minimal — existing components still use hardcoded hex. Foundation is ready for direction-specific Phase 2.

### ⏸ Waiting on user direction choice

| Work item | Depends on |
|-----------|------------|
| Migrate hardcoded hex → tokens | Direction pick |
| Sidebar retheme (light vs navy) | B or C |
| Gold accent rollout | A or C |
| Dashboard density / Quick Actions collapse | C (or all) |
| Mobile nav expansion & grouping | C (or all) |
| Academy list search/filter/grouping | Any |
| Auth mobile brand panel | A or C |
| Footer slim-down | Any |
| Restore `06_UI_SYSTEM.md` from blueprint | Any |
| Partner link color → `#0069D9` | B or C |

### 🚫 Not deployed

No production deploy — foundation changes are token-level only with no visible UI shift.

---

## 7. Recommended Next Steps

1. **Approve enterprise blueprint IA** — [03_INFORMATION_ARCHITECTURE.md](./enterprise-blueprint/03_INFORMATION_ARCHITECTURE.md) (twelve destinations, current→target mapping).
2. **Review 27 modules** — [01_PLATFORM_MODULES.md](./enterprise-blueprint/01_PLATFORM_MODULES.md) for scope alignment.
3. **Pick a visual direction** (A, B, or C) — or mix ("C but more gold").
4. **Phase 2 scope** (after IA approval):
   - Slice 1: Token migration + sidebar/header (enterprise labels)
   - Slice 2: Role-personalized dashboard + mobile nav shortcuts
   - Slice 3: Academies + auth surfaces
5. **Restore UI blueprint** doc to repo for component contracts.
6. **Prototype** one screen (dashboard) in chosen direction before wide rollout.

---

## 8. Quick Reference — Brand Values

```css
/* Blue Don */
--brand-navy: #0A2342;
--brand-gold: #C9A227;
--brand-silver: #C6CCD6;
--brand-info: #2F80ED;

/* Asset Pilot */
--partner-brand: #0069D9;
--partner-brand-light: #EFF6FF;
```

---

*Generated as Phase 1 audit. Awaiting enterprise blueprint IA approval and direction selection before visual redesign.*
