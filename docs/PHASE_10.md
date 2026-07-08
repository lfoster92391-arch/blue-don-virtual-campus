# Phase 10 — Knowledge Vault

**Status:** Complete  
**Goal:** Published campus guides and academy resources

## Deliverables

- [x] Prisma model: `knowledge_articles` with slug, tags, status workflow
- [x] Seed articles when admin user exists (`welcome-to-blue-don`, `joining-an-academy`)
- [x] `/knowledge` — browse published articles by category
- [x] `/knowledge/[slug]` — article reader
- [x] `/admin/knowledge` — create, publish, archive articles
- [x] Server actions: create, publish, archive
- [x] Service: `knowledge-service` with search helper
- [x] Role permissions: `knowledge:view`, `knowledge:manage`
- [x] Sidebar Knowledge Vault navigation enabled
- [x] Admin governance hub link to Knowledge Vault
- [x] `siteConfig.phase` updated to `10`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/knowledge` | Authenticated campus users | Published articles |
| `/knowledge/[slug]` | Authenticated campus users | Article detail |
| `/admin/knowledge` | Admin | Draft → Publish → Archive |

## Not Included (By Design)

- Global search UI (Phase 11 Reporting & Admin)
- Rich text / markdown editor
- Version history

## Next Phase

**Phase 11 — Reporting & Admin** — MVP complete milestone per blueprint build order.

## Setup

```bash
npm run db:migrate   # Apply Phase 6–10 migration
npm run db:seed      # Seed knowledge articles (requires admin user)
npm run build
```
