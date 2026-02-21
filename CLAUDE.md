# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project overview

**Underground Racing ELO** — a competitive street racing management platform handling ELO rankings, per-driver finances, 1v1 challenges, seasonal licenses, end-of-season rewards, and circuit management with photo uploads.

**Stack:** Next.js 16 (App Router) · NextAuth.js v5 · PostgreSQL via Prisma 7 · Tailwind CSS + shadcn/ui · Vitest · Supabase Storage (circuit photos)

---

## Commands

```bash
npm run dev                                        # dev server
npm run build && npm run lint && npm run type-check  # pre-commit checks
npm test                                           # Vitest unit tests (22 passing)
npm run type-check                                 # tsc --noEmit
npx prisma db push                                 # push schema changes (non-interactive env)
npx prisma generate                                # regenerate client after schema changes
npx prisma studio                                  # DB browser
```

> **Important:** `prisma migrate dev` is non-interactive in this environment — use `prisma db push` instead, then `prisma generate`.

---

## Architecture

```
src/
├── app/              # Next.js App Router — routes only, no business logic
│   ├── (auth)/       # login
│   ├── (dashboard)/  # ranking, races, circuits, challenges, drivers, season
│   └── api/          # route handlers — validate with zod, delegate to services
│
├── domain/           # ★ Pure business logic — zero framework dependencies
│   ├── elo/          # EloCalculator.ts + test
│   ├── race/         # RaceFinance.ts + types + test
│   ├── challenge/    # ChallengeRules.ts + types
│   ├── season/       # SeasonRewards.ts + types
│   └── errors/       # DomainError
│
├── services/         # Orchestration layer — composes domain + repositories
│   # RaceService, ChallengeService, DriverService, SeasonService, CircuitService
│
├── repositories/
│   ├── interfaces/   # IDriverRepository, IRaceRepository, IChallengeRepository, ICircuitRepository
│   └── prisma/       # Prisma implementations of each interface
│
├── components/       # UI only — no domain logic
│   ├── ui/           # shadcn/ui primitives
│   └── ranking/ race/ challenge/ circuit/ driver/ shared/
│
├── lib/              # auth config, prisma client, container.ts (DI), supabaseClient.ts
└── types/            # shared global types
```

**Data flow:** `route handler → zod validation → Service → domain functions + repositories → Prisma`

Services receive all dependencies via constructor injection using interfaces (never concrete Prisma classes). `src/lib/container.ts` wires up all dependencies for production.

---

## Authentication

Code-based login (no per-user accounts). Two roles:
- `admin` — code: `shadowracer` — full access to all pages and CRUD
- `racer` — code: `RACER` — read-only, `/ranking` page only

Auth config: `src/lib/auth.ts` · middleware in `src/auth.config.ts`

---

## SOLID constraints

- **SRP:** If you must write "AND" to describe what a file does, split it.
- **OCP:** New race/payout variants → new file implementing `IPayoutStrategy`, not modifications to existing strategies.
- **LSP:** `MockXxxRepository` in tests must honor the exact same contract as `PrismaXxxRepository`.
- **ISP:** Interfaces are narrow — a read-only consumer imports `IDriverReader`, not the full `IDriverRepository`.
- **DIP:** Services depend on interfaces (`IRaceRepository`, `IEloCalculator`), never on Prisma or concrete classes.

---

## Business rules

### ELO calculation (`domain/elo/EloCalculator.ts`)

| Condition (loserElo − winnerElo) | Winner delta | Loser delta |
|----------------------------------|-------------|-------------|
| diff > +50 (beat stronger)       | +25         | −15         |
| −50 ≤ diff ≤ +50 (even match)    | +15         | −15         |
| diff < −50 (beat weaker)         | +8          | −25         |

Invariants: ELO floor = **800** · Starting ELO = **1000** · Season-end bonus: King +50, Night Predator +25 (applied in `SeasonRewards.ts`)

### Race finance (`domain/race/RaceFinance.ts`)

- `commissionRate` is **0.25 or 0.30 only**
- `organizerFee = totalPool × commissionRate`
- `finalPotContribution = organizerFee × 0.05` (set aside each race)
- Payouts split: **60% / 25% / 15%** (1st/2nd/3rd)
- All amounts are integers (dollars, no floats)

### Challenge 1v1 (`domain/challenge/ChallengeRules.ts`)

- Commission: fixed **15%** of total pool (stake × 2)
- `winnerPrize = totalPool − organizerFee`
- Status flow: `PENDING → ACTIVE → RESOLVED` (or `CANCELLED` from any non-resolved state)

### Seasonal license

- Price: **$50,000** per driver per season
- Mandatory to appear in ranking · invalidated each new season

### Season rewards

| Position | Title               | Prize pool cut | ELO bonus next season | Privilege           |
|----------|---------------------|---------------|----------------------|---------------------|
| 1st      | King of the Streets | 60–70%        | +50                  | Can run VIP races   |
| 2nd      | Elite Runner        | 20–25%        | —                    | −50% buy-in S+1     |
| 3rd      | Night Predator      | 10–15%        | +25                  | —                   |

---

## Prisma schema summary

Models: `Driver` · `Race` · `RaceResult` · `Challenge` · `License` · `Circuit` · `User`

Key constraints:
- `Driver.elo` defaults to 1000 · `Driver.tag` is VARCHAR(4) unique · `Driver.name` is unique
- `Driver.archived` Boolean defaults to false — archived drivers hidden from ranking
- `Race.circuitId` is optional (`String?`) — links to a Circuit
- `Circuit.name` is unique · `Circuit.checkpoints String[]` · `Circuit.photos String[]` (Supabase public URLs)
- `RaceResult` has `@@unique([raceId, driverId])`
- `License` has `@@unique([driverId, season])`
- `ChallengeStatus` enum: `PENDING | ACTIVE | RESOLVED | CANCELLED`

---

## Supabase Storage

Used for circuit photos only. Bucket: `circuits` (public).

- Client: `src/lib/supabaseClient.ts` — lazy singleton, use `getSupabase()`
- Env vars required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Upload path: `public/<timestamp>-<filename>` (required by RLS policy)
- RLS policy: INSERT allowed for `anon` role with `bucket_id = 'circuits'`
- Add new hostnames to `next.config.ts` `images.remotePatterns` as needed

---

## API routes

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/drivers` | GET, POST | POST: admin only |
| `/api/drivers/[id]` | GET, PATCH, DELETE | PATCH supports `action: 'archive' \| 'unarchive'` or `name` update |
| `/api/races` | GET, POST | POST: admin only |
| `/api/races/[id]` | GET, PATCH, DELETE | PATCH: finish race; DELETE: pending only |
| `/api/circuits` | GET, POST | POST: admin only |
| `/api/circuits/[id]` | GET, PATCH, DELETE | admin only |
| `/api/challenges` | GET, POST | POST: admin only |
| `/api/challenges/[id]` | GET, PATCH, DELETE | PATCH: `action: resolve \| cancel \| activate` |

All admin-only routes return 403 if `session.user.role !== 'admin'`.

---

## DomainError codes

| Code | Meaning |
|------|---------|
| `TAG_TAKEN` | Driver tag already exists |
| `NAME_TAKEN` | Driver name already exists |
| `DRIVER_NOT_FOUND` | No driver with that id |
| `INSUFFICIENT_DRIVERS` | Race needs ≥ 2 participants |
| `RACE_NOT_FOUND` | No race with that id |
| `RACE_ALREADY_RESOLVED` | Cannot modify a finished race |
| `INVALID_TOP3` | top3 must have exactly 3 driver ids |
| `DRIVER_NOT_IN_RACE` | top3 contains a driver not in the race |
| `CHALLENGE_NOT_FOUND` | No challenge with that id |
| `CHALLENGE_NOT_ACTIVE` | Cannot resolve a non-active challenge |
| `CHALLENGE_NOT_PENDING` | Cannot activate a non-pending challenge |
| `CHALLENGE_ALREADY_RESOLVED` | Cannot cancel/delete a resolved challenge |
| `WINNER_NOT_PARTICIPANT` | Winner not in the challenge |
| `SAME_DRIVER` | Cannot challenge yourself |
| `CIRCUIT_NOT_FOUND` | No circuit with that id |
| `CIRCUIT_NAME_REQUIRED` | Circuit name is empty |
| `TOO_MANY_CHECKPOINTS` | Max 6 checkpoints |
| `LICENSE_ALREADY_OWNED` | Driver already has a license this season |
| `INSUFFICIENT_BALANCE` | Not enough balance to buy license |

---

## Code conventions

| Element            | Convention           | Example                           |
|--------------------|----------------------|-----------------------------------|
| Interfaces         | `I` prefix           | `IDriverRepository`, `IEloCalculator` |
| Domain classes     | PascalCase           | `EloCalculator`, `RaceFinance`    |
| React hooks        | `use` + PascalCase   | `useDriverRanking`                |
| Server Actions     | verb + noun          | `resolveRace`, `submitChallenge`  |
| Business constants | UPPER_SNAKE_CASE     | `ELO_FLOOR`, `LICENSE_PRICE`      |
| Test files         | `.test.ts` co-located | `EloCalculator.test.ts`          |

- No `any` — use `unknown` + type guards
- Explicit return types on all functions
- Business errors: `throw new DomainError('CODE')`, never bare `throw new Error('string')`
- Server Components by default; `'use client'` only for interactive forms, modals, local UI state
- Domain functions are pure — no Prisma calls, no fetch, no side effects
- File > 150 lines → question whether SRP is violated
