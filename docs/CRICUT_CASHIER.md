# Cricut Club cashier (register)

The register lives at **`/cricut/pos`** — "Cashier" in the Cricut Club sidebar,
and a button on the production hub at `/cricut`.

It is for money taken in person: the hallway table, a game night, open house.
Each ticket posts to the Cricut Club ledger as a **deposit** with a memo that
starts `Register sale`, so the club Finances tab and its CSV export already
account for it. Online orders still go through the shop and `/cricut/orders`.

## Who sees it

The same officers who run the shop and the club books: club President and Vice
President, anyone with `org:finances:manage`, academy leads, and admins. That is
`canManageCricutShop`, reused rather than reinvented. Everyone else is
redirected to `/cricut`, and the sidebar entry never renders for them.

## The PIN

Access is gated a second time by a four-digit cashier PIN, so a signed-in phone
left on a table cannot ring up sales.

- The digits are compared in a Server Action and never sent to the browser.
  Reading the JavaScript bundle reveals nothing.
- A correct PIN sets `bd_pos_unlock`, an HttpOnly, HMAC-signed cookie that is
  bound to that user and expires after **8 hours** — one entry per shift, not
  per click. "Lock register" clears it immediately.
- Five wrong tries in a row rest the pad for 30 seconds.

### Changing the PIN

Set `POS_PIN` to four digits in the deployment environment (Vercel → Project →
Settings → Environment Variables) and redeploy. Never prefix it with
`NEXT_PUBLIC_`. With no value set, the register falls back to the PIN the office
is already using, so a fresh environment does not lock staff out.

`POS_SESSION_SECRET` optionally keys the unlock cookie's signature; it falls
back to `SUPABASE_SERVICE_ROLE_KEY`, then `DATABASE_URL`.

## Ringing a sale

Tap catalog items to build a ticket, adjust quantities, or type a one-off amount
for something that was never listed. Choose how it was paid (cash, Venmo, card,
other), add an optional note, and record it. Prices are re-read from the catalog
on the server, so a tampered request cannot post an invented amount.
