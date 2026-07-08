# 12 — Rewards & Gamification

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `06_RBAC_PERMISSIONS.md`, `09_EVENT_ENGINE.md`, `10_ORGANIZATION_WORKSPACES.md`  
**Current implementation:** `Event.impactPoints`, `LeaderboardEntry` (academy-scoped)

---

## Purpose

Define the **Blue Don Rewards economy**: XP, Blue Don Coins, badges, streaks, leaderboards, campus store, and teacher reward grants — with anti-gaming rules.

---

## Navigation Placement

| Surface | Route | Nav |
|---------|-------|-----|
| **Rewards home** | `/rewards` | Primary nav #9 |
| **My wallet** | `/rewards/wallet` | Sub-nav |
| **Badges** | `/rewards/badges` | Sub-nav |
| **Leaderboards** | `/rewards/leaderboards` | Sub-nav |
| **Campus store** | `/rewards/store` | Sub-nav |
| **Teacher grant** | `/rewards/grant` | Teacher/advisor quick action (not primary nav) |
| **Admin economy** | `/admin/rewards` | Administration |

**Mobile:** Store and wallet as top tabs; leaderboards swipeable by scope.  
**Desktop:** Dashboard-style layout with wallet hero + store grid.

---

## Currency Model

### XP (Experience Points)

| Property | Rule |
|----------|------|
| Purpose | Progress, levels, leaderboard ranking |
| Spendable | **No** — display only |
| Level formula | `level = floor(sqrt(totalXp / 100))` |
| Decay | None |
| Visibility | Self always; peers on leaderboards |

### Blue Don Coins

| Property | Rule |
|----------|------|
| Purpose | Campus store redemptions, org store (optional) |
| Earn rate | ~1 coin per 10 XP from qualifying activities (configurable) |
| Spend | Store items, event perks, org fundraisers |
| Transfer | **Disabled** between students (anti-gaming) |
| Expiry | Optional semester reset for coins > cap (admin config) |

---

## Earning Rules

### Activity → XP awards

| Activity | XP | Coins | Source event |
|----------|-----|-------|--------------|
| Event attendance (verified) | 50–200 | 5–20 | `EventParticipant.ATTENDED` |
| Service hours logged | 25/hour | 2/hour | Event + reflection approved |
| Academy module complete | 100 | 10 | Progress table write (Phase 23) |
| Mission complete | 150 | 15 | `Mission` completion |
| Certification earned | 500 | 50 | `Certification` |
| Portfolio publish | 75 | 7 | `PortfolioItem` PUBLISHED |
| Kindness action | 30 | 3 | `KindnessAction` verified |
| Journey check-in | 40 | 4 | `JourneyCheckIn` completed |
| Streak bonus | +10%/day cap 7d | +5% | Daily login streak |

**`impactPoints` migration:** `Event.impactPoints` maps 1:1 to base XP on attendance; deprecate field after Phase 22.

### Teacher grants

| Grant type | Max/day/teacher | Permission |
|------------|-----------------|------------|
| XP bonus | 500 | `rewards:grant` |
| Coin bonus | 50 | `rewards:grant` |
| Badge award | 5 | `rewards:grant` |

Requires reason text (audit). Cannot grant to self.

---

## Badges

### Categories

| Category | Examples |
|----------|----------|
| Journey | First Check-In, About Me Complete |
| Academy | Explorer, Innovator, Master (per academy) |
| Service | 10/50/100 Hour Service |
| Leadership | Club Officer, Team Captain |
| Community | Kindness Champion |
| Events | Perfect Attendance Semester |
| Future | First Application, Scholarship Winner |
| Special | Admin-issued commemorative |

### Badge model

```prisma
model Badge {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  imageUrl    String   @map("image_url")
  category    BadgeCategory
  criteria    Json?    // rule definition for auto-award
  active      Boolean  @default(true)
  @@map("badges")
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String   @map("user_id") @db.Uuid
  badgeId   String   @map("badge_id")
  awardedAt DateTime @default(now()) @map("awarded_at")
  awardedBy String?  @map("awarded_by") @db.Uuid // null = system
  @@unique([userId, badgeId])
  @@map("user_badges")
}
```

---

## Streaks

| Streak type | Rule |
|-------------|------|
| Daily login | Consecutive school days (Mon–Fri); grace 1 holiday week |
| Academy weekly | ≥1 module progress per week |
| Kindness | 1 kindness action per week |

Stored in `UserStreak`; broken streak resets bonus multiplier.

---

## Leaderboards

| Scope | Query | Reset |
|-------|-------|-------|
| School | Top XP this semester | Semester |
| Academy | Per `organizationId` (academy) | Semester |
| Org | Club/team optional opt-in | Configurable |
| Grade | `StudentProfile.gradeLevel` | Semester |

**Privacy:** Parents see linked student rank only. Opt-out for students (`leaderboardVisible: false`) — default true.

**Maps from:** `LeaderboardEntry` → generalize to `LeaderboardSnapshot` job.

---

## Campus Store

| Item type | Price (coins) | Fulfillment |
|-----------|---------------|-------------|
| Spirit wear coupon | 100–500 | Admin redeem |
| Cafeteria voucher | 50 | QR code |
| Event priority seating | 75 | Event-specific |
| Academy swag | 200 | Pickup |
| Digital flair | 25 | Profile badge frame |

```prisma
model RewardStoreItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  priceCoins  Int      @map("price_coins")
  inventory   Int?
  active      Boolean  @default(true)
  @@map("reward_store_items")
}

model Redemption {
  id        String   @id @default(cuid())
  userId    String   @map("user_id") @db.Uuid
  itemId    String   @map("item_id")
  coinsSpent Int     @map("coins_spent")
  status    RedemptionStatus
  createdAt DateTime @default(now()) @map("created_at")
  @@map("redemptions")
}
```

---

## Ledger & Wallet

```prisma
model XpLedger {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  amount      Int
  reason      String
  sourceType  String   @map("source_type")
  sourceId    String?  @map("source_id")
  grantedBy   String?  @map("granted_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")
  @@index([userId, createdAt])
  @@map("xp_ledger")
}

model CoinWallet {
  userId    String @id @map("user_id") @db.Uuid
  balance   Int    @default(0)
  lifetime  Int    @default(0) // total earned
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("coin_wallets")
}
```

All mutations via `rewards-service` transactions (atomic coin debit on redeem).

---

## Anti-Gaming & Fairness

| Rule | Enforcement |
|------|-------------|
| No self-attendance | Organizer cannot mark self attended without co-organizer |
| Rate limits | Max 3 attendance XP awards/day/student |
| Duplicate prevention | Unique `(sourceType, sourceId, userId)` on ledger |
| Teacher grant audit | `AuditLog` + admin report |
| Coin cap | Soft cap 2000/semester; excess XP still counts |
| Leaderboard opt-out | Hides name, shows "Anonymous" |
| Parent/sponsor | No earn; view linked student only |

---

## Permissions

| Action | Permission |
|--------|------------|
| Earn XP/coins | `rewards:earn` (students) |
| Grant rewards | `rewards:grant` (teacher, advisor, coach, admin) |
| Manage store | `rewards:manage_store` (admin) |
| View wallet | self or `parent:view_student` |
| Configure rules | `admin:access` |

---

## Mobile vs Desktop

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Wallet | Hero balance + recent ledger | Chart + ledger table |
| Store | 2-col grid, tap redeem | 4-col grid |
| Grant flow | Student search → amount → reason | Same with bulk CSV (admin) |
| Leaderboard | Top 10 + self rank sticky | Full table paginated |
| Badge showcase | Profile + rewards tab | Grid with filters |

---

## Scalability Notes

- Ledger append-only; wallet balance materialized
- Leaderboard snapshots via nightly job + on-demand after XP burst
- Store inventory uses row-level locking on redeem
- Event attendance → rewards via queue (`rewards-award-job`)
- Archive ledgers yearly to cold storage

---

## Mapping to Phase 0–15 Code

| As-built | Target |
|----------|--------|
| `Event.impactPoints` | Seed XP on attendance award |
| `LeaderboardEntry` | Migrate to snapshot model per academy |
| Academy leaderboard UI | `/rewards/leaderboards?scope=academy` |
| No wallet/store | New Phase 22 |
| Dashboard | Add `rewards_balance` widget (Phase 22) |

---

## Related Documents

- [07_PERSONALIZED_DASHBOARD.md](./07_PERSONALIZED_DASHBOARD.md)
- [09_EVENT_ENGINE.md](./09_EVENT_ENGINE.md)
- [05_ROADMAP.md](./05_ROADMAP.md) — Phase 22
