# Club Focus Pivot

Soft-wipe of the broad Blue Don campus platform around **three clubs**: IT Club, Broadcasting, and Cricut Club — plus a **Today at Madonna** home briefing.

Toggle: `BLUE_DON_FOCUSED_CLUBS` (default **on**). Set to `0` / `false` / `off` to restore the full Phase 18 grouped navigation.

Soft-wipe behavior:

- Primary nav + mobile tabs demote ~90% of campus modules
- Middleware redirects soft-wiped paths to `/home` (allowlist in `src/config/focused-clubs-allowlist.ts`)
- Route files remain for later restore — this is an IA wipe, not a delete

## Soft-wiped (hidden + redirected)

When focused mode is on, students no longer reach via nav (and most bounce to Home):

- Future Center / Pathways / Mentors / Partners / Academies / Athletics
- Traditions / Rewards / Arcade / Corner Store (Corner redirects to Cricut Shop)
- Forms Center, Knowledge Vault, Equipment as primary destinations
- Discover hub, School Hub, Madonna World, My Journey, etc.
- Global Service Desk stays as **IT Help Desk** under IT Club only

## Primary nav (focused mode)

```
Home                         → /home  (Today at Madonna briefing)
IT Club (group)
  ├── Overview               → /organizations/it-club
  ├── Finances               → /organizations/it-club?tab=finances
  └── IT Help Desk           → /service-desk
Broadcasting                 → /organizations/broadcasting
Cricut Club (group)
  ├── Overview               → /organizations/cricut-club
  └── Shop                   → /cricut/shop
Staff & Admin (roles)
  ├── Principal Dashboard
  └── Administration
```

Mobile: Home · IT · Broadcast · Cricut (+ Menu).

## Home briefing (`/home`)

Today at Madonna vertical briefing:

1. Campus weather alerts & information  
2. Today's schedule  
3. Announcements (Broadcasting daily + feed)  
4. Today in Madonna History  
5. Daily Discovery  
6. Fun Fact  
7. Word of the Day  
8. Faith — Saint of the Day  

## Cricut Club Shop

Routes:

| Path | Role |
|------|------|
| `/cricut/shop` | Product grid + sell form (leads/officers/advisors/admins) |
| `/cricut/shop/[id]` | Detail · Add to cart · Buy now |
| `/cricut/cart` | Client cart (localStorage) |
| `/cricut/checkout` | Pickup vs ship |

Shipping (`src/config/cricut-shop.ts`):

- **Pickup at Madonna** (Weirton, WV) — free  
- **Ship** — flat **$7.99** standard from Weirton, WV (`CRICUT_SHIPPING.standardFlatCents`, overridable via `NEXT_PUBLIC_CRICUT_SHIPPING_CENTS`)

## Invoices → club ledger

Models: `ClubInvoice`, `ClubInvoiceLine` (+ `ClubLedgerEntry.invoiceId` / `receiptUrl`).

- Clubs submit expenses with vendor, date, materials lines, receipt photo/PDF  
- Status **PENDING** until advisor/admin/finance lead **Approves** → creates `ClubLedgerEntry` **WITHDRAWAL**  
- Tabs: **Invoices** on IT / Broadcasting / Cricut  
- **IT Finances** shows all focus-club balances + pending invoices for approval  

## How to try

1. `npx prisma migrate deploy` then `npm run db:seed`  
2. `/home`, `/organizations/it-club?tab=finances`, `/organizations/broadcasting?tab=invoices`, `/cricut/shop`  
3. Restore full nav: `BLUE_DON_FOCUSED_CLUBS=0`
