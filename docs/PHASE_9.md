# Phase 9 — Service Desk

**Status:** Complete  
**Goal:** Campus support ticketing for students and staff

## Deliverables

- [x] Prisma models: `tickets`, `ticket_comments`
- [x] `/service-desk` — ticket list (own tickets or all for staff)
- [x] `/service-desk/new` — create ticket form
- [x] `/service-desk/[id]` — thread view with comments and status
- [x] Server actions: create ticket, add comment, update status
- [x] Service: `ticket-service`
- [x] Role permissions: `tickets:create`, `tickets:manage`
- [x] Sidebar Service Desk navigation enabled
- [x] Dashboard metrics — open ticket count
- [x] Profile quick actions — Submit Ticket link
- [x] `siteConfig.phase` updated to `9`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/service-desk` | Authenticated users | Own tickets; staff see all |
| `/service-desk/new` | Students+ | Create support request |
| `/service-desk/[id]` | Owner or staff | Conversation thread |

## Not Included (By Design)

- Email/Slack notifications
- SLA timers and escalation
- Attachment uploads

## Next Phase

**Phase 10 — Knowledge Vault** (see `docs/PHASE_10.md`)
