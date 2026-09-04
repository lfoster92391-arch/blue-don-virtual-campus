# Parent Guide

The parent-facing walkthrough for Blue Don Virtual Campus, and the reference for
whoever has to answer a parent's question at the front desk.

- **In the app:** `/parent/guide` — linked from the Parent Portal, the Madonna
  Hub, and the sidebar (parents see **Parent Guide**; staff see it under
  **Staff & Admin**).
- **Production:** <https://campus.assetpilotedu.com/parent/guide>

The page needs a signed-in account but no particular role, so office staff can
read a family exactly what a family sees. Admins previewing the family view
(**Preview as parent** on `/admin/students`) get the same guide.

> **Lunch is not in this app.** Menus, ordering, and cafeteria payments are on
> **FuelTheDons**. The campus lunch system was retired — see
> [§3](#3-lunch-is-on-fuelthedons) and `docs/MADONNA_HUB.md`.

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

## 2. What a parent account can actually do

Inventory of shipped, parent-reachable surfaces (focused-clubs mode on):

| Surface | Route | Notes |
| --- | --- | --- |
| Madonna Hub | `/madonna` | Front door: today's schedule and announcement, next game, next broadcast, section tiles |
| Today | `/madonna/today` | Bell schedule, weather, today's announcement in full |
| Sports | `/madonna/sports` | Schedules, scores, student coverage, recap video |
| Broadcast | `/madonna/broadcast` | Blue Don Live plus the announcement archive |
| Campus | `/madonna/campus` | Bell schedule, calendar, lunch link, archive, parent guide |
| Participate | `/madonna/participate` | Submitting an announcement, covering a game, joining a club |
| Parent Portal | `/parent` | Linked students, agreements, child club approvals |
| Parent Guide | `/parent/guide` | This document, in app |
| Today at Madonna | `/home` | Command Center — messages sent to the parent, agreements |
| Watch Broadcasting LIVE | `/watch` | Public live player — **no login**. `/live` redirects here. |
| Watch Broadcasting hub | `/media` | Signed-in live card plus recorded student video |
| Blue Don Sports | `/sports` | The full athletics hub |
| Profile / Settings | `/profile`, `/settings` | Name, password, display |

Parents see the same five hub sections as students, with parent-oriented copy —
`describeMadonnaSection(section, role)` in `src/config/madonna-hub.ts` swaps the
description, and the hub adds Parent Portal / Parent Guide links.

Deliberately absent, and the guide says so plainly: no grades, no attendance, no
direct parent-to-teacher messaging, and no visibility into other families.

> `/forms-center` is **not** on the focused-mode allowlist, so the Parent Portal's
> Forms Center button redirects to `/home` while focused mode is on. Worth
> knowing before someone reports it as a bug.

## 3. Lunch is on FuelTheDons

The app used to take lunch orders, publish a menu calendar, print a kitchen prep
sheet, review dietary forms, and keep a cafeteria ledger. **All of that is
retired.** Madonna runs lunch on FuelTheDons, and the campus site links out.

- Config: `src/config/fuel-the-dons.ts` (`NEXT_PUBLIC_FUEL_THE_DONS_URL`
  overrides the URL).
- Component: `FuelTheDonsRow` / `FuelTheDonsLink` in
  `src/components/lunch/fuel-the-dons-link.tsx` — new tab, host shown, clearly
  labelled as leaving the site.
- Where a parent finds it: `/parent`, `/parent/guide` (§3 in the app),
  `/madonna`, `/madonna/today`, `/madonna/campus`, `/hub`, `/home`, and `/lunch`.

`/lunch` is now a short page that says where lunch lives; `/lunch/selections`,
`/lunch/kitchen`, `/admin/lunch-menu`, `/admin/dietary`, and `/admin/cafeteria`
redirect there. Nav entries are gone. The guide tells families that a severe
allergy still deserves a phone call to the office, and repeats that nobody from
Madonna will ever ask for card or bank details through the site, email, or text.

The Prisma tables and services from the old system are still in the repo —
retiring the UX did not need a destructive migration. Their history is in
`docs/CAFETERIA_LUNCH.md`, kept for reference only.

## 4. Notifications

What actually exists today, which is what the guide describes:

| Notice | Where it lands | How it is created |
| --- | --- | --- |
| Daily announcements | `/madonna/today`, `/madonna/broadcast`, `/home` briefing | `BroadcastAnnouncement` |
| Agreements awaiting signature | `/parent` and `/home` | `AgreementsWidget` |
| Staff messages | `/home` | `StudentMessage` addressed to the parent's user id |

The low cafeteria balance message went away with the ledger. The header bell
(`notifications-menu.tsx`) is still a placeholder and the dashboard notification
widget still runs on mock data; neither is mentioned in the guide, because
neither does anything yet. The app sends no SMS, and only sends email for account
plumbing (confirmation, password reset).

## 5. Routing and focused mode

`/parent`, `/madonna`, `/lunch`, and `/admin` are all on
`FOCUSED_MODE_ALLOWED_PREFIXES`, and every parent-reachable route nests under one
of them — including all five hub sections, which need no separate entries. A
future top-level parent route would.

## 6. Follow-ups

- A deeper parent hub: per-child views, multi-role accounts (a teacher who is
  also a Madonna parent), and supporter/alumni accounts.
- A receipt or statement a family can print — now a FuelTheDons question.
- The header bell is still a placeholder.
- `/forms-center` is off the focused-mode allowlist while the Parent Portal still
  links to it.
