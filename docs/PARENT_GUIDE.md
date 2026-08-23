# Parent Guide

The parent-facing walkthrough for Blue Don Virtual Campus, and the reference for
whoever has to answer a parent's question at the front desk.

- **In the app:** `/parent/guide` — linked from the Parent Portal, the Cafeteria
  Lunch page, and the sidebar (parents see **Parent Guide**; staff see it under
  **Staff & Admin**).
- **Production:** <https://campus.assetpilotedu.com/parent/guide>

The page needs a signed-in account but no particular role, so office staff can
read a family exactly what a family sees. Admins previewing the family view
(**Preview as parent** on `/lunch`) get the same guide.

---

## 1. Creating a parent account

Parents cannot self-serve their way onto campus. The account is created by the
family and then approved *and linked* by hand.

1. Go to `campus.assetpilotedu.com/register?role=parent`. The `?role=parent`
   matters — without it the form registers a student and demands a school email.
2. Enter a personal email. `requiresSchoolEmail("parent")` is false, so Gmail and
   the like are fine. Students and staff still need `@weirtonmadonna.org`.
3. Fill in **Relationship to school** (`relationshipNote`) — this is what the
   approver reads to decide which student to link.
4. Password, twice, minimum 8 characters. **Create account**.
5. Confirm the email. The link lands on `/auth/callback`, which runs
   `ensureUserProfile()` and creates the row with `status: PENDING`.
6. `/onboarding` collects first and last name. Parents stay **PENDING** here;
   every other role flips to ACTIVE.
7. `requireCampusAccess()` bounces them to `/pending-approval`. Registration copy
   tells them to email `lisamorris@weirtonmadonna.org`.
8. An admin approves at `/admin/parent-approvals` with **Approve and link**,
   which sets `ACTIVE` **and** writes the `ParentStudentLink` row in one action.
9. An approved parent with no link is held at
   `/pending-approval?reason=awaiting_student_link`. A parent account is useless
   without at least one linked student, by design.

There is no linking code and no self-service claim flow. Extra children are
linked by an admin from `/service-desk/users`.

## 2. Choosing meals

Route: `/lunch` (nav: **Cafeteria Lunch**).

1. Each linked student gets their own section. A teacher who is also a Madonna
   parent sees their own tray plus each child.
2. Each row is one weekday, showing that day's entree and sides from the menu the
   office published, plus any note for that day ("Early dismissal — cold lunch
   only"). The board offers the next 10 service days.
3. Four choices: **Hot lunch**, **Vegetarian**, **Packing lunch**, **Not eating**.
   Only the first two count as trays for the kitchen.
4. Tapping saves immediately through `placeLunchOrderAction`. There is no submit
   button.
5. A day locks at **9:00 AM** that morning (`LUNCH_ORDER_CUTOFF_HOUR`, enforced
   server-side, evaluated in UTC).
6. An accepted dietary record shows next to the student's name, and a restriction
   that rules out meat marks **Hot lunch** as a conflict.

### Confirming what saved

The board only flashes **Saved** on the button just tapped, and that flash is
gone on the next page load. Two surfaces answer "did it take?":

- **Your selections** card at the bottom of `/lunch` — every saved choice, per
  student, with the dish and a green check, plus a count of open days with no
  choice.
- `/lunch/selections` (nav: **Your Lunch Selections**) — the same thing as a full
  page, including days nobody has answered yet and a padlock on locked days.

Both are built by `buildLunchSelectionSummary()` in `src/lib/lunch-selections.ts`
from the same `LunchBoard` the ordering board uses, so they cannot disagree with
what the kitchen sees.

## 3. What a parent account can actually do

Inventory of shipped, parent-reachable surfaces (focused-clubs mode on):

| Surface | Route | Notes |
| --- | --- | --- |
| Today at Madonna | `/home` | Schedule, weather, announcements, messages sent to the parent |
| Parent Portal | `/parent` | Linked students, agreements, child club approvals, cafeteria balance |
| Cafeteria Lunch | `/lunch` | Ordering, saved selections, balance, dietary form |
| Your Lunch Selections | `/lunch/selections` | Read-back of every saved choice |
| Parent Guide | `/parent/guide` | This document, in app |
| Madonna Hub | `/madonna` | Announcements, sports recap, highlight reel |
| Announcements | `/madonna/announcements` | Today plus the archive |
| Watch Broadcasting | `/media` | Live and recorded student video |
| Blue Don Sports | `/sports` | Schedules and coverage |
| Profile / Settings | `/profile`, `/settings` | Name, password, display |

Deliberately absent, and the guide says so plainly: no grades, no attendance, no
direct parent-to-teacher messaging, and no visibility into other families.

> `/forms-center` is **not** on the focused-mode allowlist, so the Parent Portal's
> Forms Center button redirects to `/home` while focused mode is on. Unrelated to
> this work, but worth knowing before someone reports it as a bug.

## 4. Paying for lunch — the process

**There is no card checkout anywhere in the app, and there should not be one.**

1. Cash or a check goes in an **envelope**.
2. The **student's name** is written on the outside. This is the part that fails
   most often; an unnamed envelope cannot be credited.
3. The envelope comes to the school office.
4. **Mrs. Dalfol** records it at `/admin/cafeteria` (nav: **Cafeteria Accounts**,
   under Staff & Admin).
5. The new balance appears on `/lunch`, `/lunch/selections`, `/parent`, and
   `/parent/guide` immediately.

The guide also carries a plain warning that nobody from Madonna will ever ask a
family for card or bank details through the site, email, or text.

### How the balance is modeled

Added by this work, since nothing tracked cafeteria money before.

- `CafeteriaAccount` — one row per student, `balanceCents` (whole cents) plus
  `lowBalanceNotifiedAt`. A row is created lazily on the first entry, so families
  who pack every day never get a balance or a nudge.
- `CafeteriaLedgerEntry` — every movement, with `kind` (`CREDIT` / `CHARGE` /
  `ADJUSTMENT`), a positive `amountCents`, the frozen `balanceAfterCents`, a
  note, and `recordedById`. An envelope can always be traced to whoever opened it.
- Migration: `prisma/migrations/20260823200000_cafeteria_accounts`.
- Permission: `cafeteria:manage`, held by **admin** and **staff** only.
  Deliberately narrower than `lunch:manage` — seeing kitchen counts is not the
  same as moving money. Mrs. Dalfol needs a `staff` (or admin) account.
- Corrections require a note. Single entries are capped at $1,000 as a typo guard.
- Reads and writes share a transaction, so two people crediting at once cannot
  post against a stale total.

Charges are recorded by the office too — nothing debits automatically, because
there is no per-meal price modeled yet. If Madonna wants meals to charge
themselves, that is the next step: a price per choice and a nightly job that
posts `CHARGE` entries from `LunchOrder`.

## 5. Notifications

What actually exists today, which is what the guide describes:

| Notice | Where it lands | How it is created |
| --- | --- | --- |
| Low cafeteria balance | Command Center messages on `/home` | `recordCafeteriaLedgerEntry()` sends a `StudentMessage` to every linked parent |
| Daily announcements | `/home` briefing and `/madonna/announcements` | `BroadcastAnnouncement` |
| Agreements awaiting signature | `/parent` and `/home` | `AgreementsWidget` |
| Staff messages | `/home` | `StudentMessage` addressed to the parent's user id |

Low-balance rules:

- Triggers at **$10.00 or less**, including a negative balance
  (`CAFETERIA_LOW_BALANCE_CENTS`).
- One message per slide downward. A second message only after
  `CAFETERIA_LOW_BALANCE_QUIET_HOURS` (72h), so a run of daily charges does not
  produce a run of daily messages.
- `lowBalanceNotifiedAt` is cleared once a family tops the account back up, which
  re-arms the warning for next time.
- Delivered to every linked parent via `listLinkedParentIds()` and
  `sendSystemStudentMessages()` — the same Command Center inbox that carries
  advisor and club messages, so families have one place to look.

The header bell (`notifications-menu.tsx`) is still a placeholder and the
dashboard notification widget still runs on mock data. Neither is mentioned in
the guide, because neither does anything yet. The app sends no SMS, and only
sends email for account plumbing (confirmation, password reset).

## 6. Kitchen and menu side

Staff need quantities, not a list of taps.

- `/lunch` **Kitchen counts** — the original per-day table of Hot / Vegetarian /
  Packed / Not eating plus trays to prepare. Still there, now linking onward.
- `/lunch/kitchen` (nav: **Kitchen Prep Sheet**, under Staff & Admin) — the new
  surface, gated on `lunch:manage`:
  - window totals across the next 10 service days,
  - per day: count tiles labelled with the actual dish (Hot shows the entree,
    Vegetarian shows the vegetarian dish), trays to prepare, response count, and
    whether the day is still open or locked,
  - serving lists by dish with staff trays marked,
  - **Allergies on the line** — everyone eating a tray who has an accepted
    dietary record, by name, with allergens and restrictions,
  - free-text notes families left on an order.

Built by `getLunchKitchenPlan()` in `src/services/lunch-kitchen-service.ts`: one
query over the window joined to dietary profiles and the published menu.
Read-only and soft-failing, so a database hiccup shows an empty prep sheet rather
than a broken page during service.

Days are grouped into school weeks with per-week totals, which is what makes the
sheet usable on a Sunday — see **Weekend head counts** in
`docs/CAFETERIA_LUNCH.md`. Short version: the sheet is open every day of the
week, on a weekend it counts the week ahead, expands the next upcoming day
instead of "today", and says so in a banner.

Staff publish the menu itself at `/admin/lunch-menu` (nav: **Lunch Menu
Calendar**): edit each day, save it as a draft, then publish the week to
families, optionally messaging every parent account that it is up. Days that are
never published fall back to the standard rotating menu.

## 7. Routing and focused mode

`/parent`, `/lunch`, and `/admin` were already on
`FOCUSED_MODE_ALLOWED_PREFIXES`. Every route added here nests under one of them
(`/parent/guide`, `/lunch/selections`, `/lunch/kitchen`, `/admin/cafeteria`,
`/admin/lunch-menu`), so the allowlist needed no change. A future top-level
parent route would.

## 8. Follow-ups

- Per-meal pricing so charges post themselves instead of being keyed in.
- A receipt or statement a family can print for a whole month.
- The header bell is still a placeholder; low-balance notices only surface on
  `/home`.
- `/forms-center` is off the focused-mode allowlist while the Parent Portal still
  links to it.
