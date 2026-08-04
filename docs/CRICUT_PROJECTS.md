# Cricut Club — easy cheap creations

Lisa — the dollar-store project hub: browse a project, see what it takes to make it, and see what it sells for.

## Routes

| Surface | Route |
|---------|--------|
| Project options (catalog) | `/cricut/projects` |
| Project detail — Make this / Sell this | `/cricut/projects/[id]` |
| Sell view straight from a card | `/cricut/projects/[id]?view=sell` |

Also linked from: Cricut hub `/cricut`, nav (Cricut → Projects), club overview `/organizations/cricut-club`, and the club workspace tab.

## Make this

**[ Make this ]** opens the project and shows:

1. **What you need** — every material with quantity, where to buy it (dollar store vs. club supply cart), and its cost
2. **Total funds needed** — the estimated build cost, split into "you buy" vs. "club supplies"
3. **Step-by-step** — ordered instructions with a detail line for the fiddly parts

Pressing **[ Make this ]** on the detail page opens a personal checklist (`CricutProjectBuild`). Tap any supply or step to check it off; status moves `On my list → Making it → Made it` automatically, and **Mark it made** / **Set aside** are there for manual overrides. Progress is per student, so two makers on the same idea never collide.

## Sell this

**[ Sell this ]** shows the money side:

- Supplies cost, suggested sell price, profit, margin %, and cost multiple (recalculates live as the price field changes)
- Selling notes — bundle pricing, best season, custom add-on pricing
- **[ Sell this ]** publishes it straight into the shop catalog as a `CricutShopItem` (title, description, price, sell toggle), so it flows into the existing cart → order form → Command Center order pipeline

Anyone who can list in the shop (any active Cricut member or officer) can list a project. The build record remembers the listing so the panel links back to it.

## Catalog

Nine starter dollar-store builds ship with the app: monogram candle jar, canvas tote, name water bottle, quote picture frame, filled ornament, teacher mug, locker mirror + magnet set, wood welcome sign, and party favor treat boxes.

They live in `src/config/cricut-projects.ts` and are **seeded** into the database by `npm run db:seed:focus-clubs`. Because they are club content (a menu, not fake activity), they also serve as the fallback catalog when the database is empty or unreachable — the hub never renders blank. Starter entries are marked "Starter idea" and can't hold a saved checklist until they're seeded.

## Officer admin

President / VP (same permission as the shop: `canManageCricutShop`) get an **Add a project** panel on `/cricut/projects`. Materials and steps are one-per-line, pipe separated:

```
Glass candle jar | 1 | Dollar Tree | 1.25
Permanent vinyl | 3x3 in | Club cart | 0.55
```

```
Design the monogram | Size it to 2 in tall
Cut on permanent vinyl | Mirror OFF
```

## Permissions

| Role | Browse | Make this (checklist) | Sell this (list in shop) | Edit catalog |
|------|--------|----------------------|--------------------------|--------------|
| President / VP | Yes | Yes | Yes | Yes |
| Member | Yes | Yes | Yes | — |
| Any campus user | Yes | Yes | — | — |

## Data

- `CricutProjectIdea` — title, summary, `materials` JSON, `steps` JSON, `estimatedCostCents`, `suggestedSellPriceCents`, image, `dollarStoreTag`, `difficulty`, `timeMinutes`, `sellNotes`, `active`, `sortOrder`
- `CricutProjectBuild` — per-student run at an idea: `intent` (MAKE/SELL), `status`, `completedSteps`, `gatheredMaterials`, `listedItemId` → `CricutShopItem`

Migration: `prisma/migrations/20260804180000_cricut_project_ideas/`
