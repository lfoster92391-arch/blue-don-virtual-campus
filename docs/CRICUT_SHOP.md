# Cricut Club production shop

Lisa — how the Cricut maker shop, orders, designs, and wishlist fit together.

## Routes / tabs

| Surface | Route |
|---------|--------|
| Production hub (counter, fundraising, wishlist settings) | `/cricut` |
| Easy cheap creations (dollar-store projects) | `/cricut/projects` — see [CRICUT_PROJECTS.md](CRICUT_PROJECTS.md) |
| Catalog / sell | `/cricut/shop` |
| Product detail | `/cricut/shop/[id]` |
| Cart | `/cricut/cart` |
| Order form (checkout) | `/cricut/checkout` |
| Buyer + crew orders | `/cricut/orders` |
| Order tracking / status desk | `/cricut/orders/[id]` |
| Design submission hub | `/cricut/designs` |
| Club overview (counter + wishlist + links) | `/organizations/cricut-club` |
| Club tab shortcuts | Shop → `/cricut/shop`, Designs → `/cricut/designs`, Orders → `/cricut/orders`, Fundraisers (officers) |

Nav: Cricut section also lists Production hub, Projects, Shop, Designs, Orders.

Project ideas feed the shop: **Sell this** on `/cricut/projects/[id]` creates a `CricutShopItem` at the suggested price, which then flows through the normal cart → order form → Command Center pipeline below.

## Product catalog

- Members & officers upload: photo, title, description, price, **product type**
- Types: **Shirt** (S–XXL + customization + qty), **Tumbler** (sport/name/font/design + qty), **Other** (customization + qty), **Custom built** (qty + optional note; customization off by default)
- **Available to sell** toggle — on = purchasable; off = catalog showcase only
- President / VP can flip sellability, customization, and product type on existing listings

## Order flow → Command Center

1. Customer adds sellable items → cart → **order form** (name, contact, qty, pickup/ship notes, customization)
2. Submit creates `CricutShopOrder` (status **Order sent** / `PENDING`)
3. Command Center message to Cricut officers (+ later assignees): **“You have a new order”** with **[ Check it out ]** **[ View Later ]**
4. Message kind: `CRICUT_ORDER` → `/cricut/orders/[id]`

## Live order tracking

Progress bar:

1. **Order sent** (`PENDING`)
2. **In production** (`IN_PRODUCTION` / legacy `CONFIRMED`)
3. **Ready for pickup** (`READY_FOR_PICKUP`)
4. **Completed** (`COMPLETED` / legacy `FULFILLED`)

- Buyer: `/cricut/orders` + detail page (+ status-change messages on Command Center)
- Officers: update status; President/VP assign crew
- Members: update status on assigned (or fulfillable) orders

## Design hub

Any signed-in student: title, description, optional reference image → `CricutDesignSubmission`  
Crew review: pending / accepted / declined / in production / completed  
Visible on `/cricut/designs` and linked from overview / hub.

## Production counter

Live total = completed shop orders + completed club projects + completed design builds  
Prominent on `/cricut` and club overview.

## Fundraising

Reuses `ClubFundraiser` — shown on `/cricut` hub and overview; manage under club Finances / Fundraisers tab.

## Amazon wishlist

- Org field `organizations.amazon_wishlist_url` (President/VP set on `/cricut`)
- Env fallback: `CRICUT_AMAZON_WISHLIST_URL`
- Appears on: Cricut hub, shop, product page, design hub, club overview, home Focus Clubs hero strip

## Permissions

| Role | Catalog | Orders / status | Fundraisers / wishlist | Designs review |
|------|---------|-----------------|------------------------|----------------|
| President / VP | Manage + sell toggle | Full + assign | Yes | Yes |
| Secretary | List products | Fulfill / docs | View finances | — |
| Member | List products | Fulfill assigned / club orders | — | — |
| Any campus user | Browse | Buy + track own | View counter/wishlist | Submit ideas |

## Migration

`prisma/migrations/20260804140000_cricut_production_shop/`
