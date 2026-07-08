# Phase 2 — Authentication & Roles

**Status:** Complete — awaiting approval  
**Goal:** Users enter safely with role-aware access

## Deliverables

- [x] Supabase Auth integration (email + Google OAuth)
- [x] Login (`/login`)
- [x] Registration (`/register`) with invite role support (`?role=parent`)
- [x] Onboarding (`/onboarding`) for profile completion
- [x] OAuth callback (`/auth/callback`)
- [x] Sign out (`/auth/signout`)
- [x] Server-validated sessions via middleware
- [x] Protected campus routes
- [x] Prisma `users` model with RBAC roles
- [x] Role assignment (admin-only form in Settings)
- [x] Profile menu shows authenticated user
- [x] Permission helpers (`hasPermission`, `canAccessAdmin`)

## Roles Supported

- Admin
- Advisor
- Student (default)
- Parent
- Sponsor

## Setup Required

1. Configure Supabase project URL and anon key in `.env`
2. Enable Email and Google providers in Supabase Auth
3. Add redirect URL: `http://localhost:3000/auth/callback`
4. Run database migration: `npm run db:migrate`

## Not Included (By Design)

- Dashboard widgets (Phase 3)
- Parent portal routes (later phase)
- Full admin center (Phase 5+)
- Email invite token system (invite role via URL only)

## Next Phase

**Phase 3 — Campus Dashboard**

Today, calendar, assignments, notifications, events, portfolio summary, quick actions.

**Stop after Phase 3 and wait for approval.**
