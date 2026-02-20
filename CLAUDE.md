# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project overview

**Underground Racing ELO** — a competitive street racing management platform handling ELO rankings, per-driver finances, 1v1 challenges, seasonal licenses, and end-of-season rewards.

**Stack:** Next.js 14+ (App Router) · NextAuth.js v5 · PostgreSQL via Prisma ORM · Tailwind CSS + shadcn/ui · Zustand (client state) · React Query (server state) · Vitest + Playwright

---

## Commands

```bash
pnpm dev                                      # dev server
pnpm build && pnpm lint && pnpm type-check    # pre-commit checks
pnpm test                                     # Vitest unit tests
pnpm test --run src/domain/elo/EloCalculator.test.ts  # single test file
pnpm test:e2e                                 # Playwright
pnpm test:coverage                            # target >80% on /domain
pnpm prisma migrate dev --name <description>  # DB migration
pnpm prisma studio                            # DB browser
```

---

## Architecture

```
src/
├── app/              # Next.js App Router — routes only, no business logic
│   ├── (auth)/       # login, register
│   ├── (dashboard)/  # ranking, races, challenges, drivers, season
│   └── api/          # route handlers — validate with zod, delegate to services
│
├── domain/           # ★ Pure business logic — zero framework dependencies
│   ├── elo/          # EloCalculator.ts + test
│   ├── race/         # RaceFinance.ts + types + test
│   ├── challenge/    # ChallengeRules.ts + types
│   └── season/       # SeasonRewards.ts + types
│
├── services/         # Orchestration layer — composes domain + repositories
│   # RaceService, ChallengeService, DriverService, SeasonService
│
├── repositories/
│   ├── interfaces/   # IDriverRepository, IRaceRepository, IChallengeRepository
│   └── prisma/       # Prisma implementations of each interface
│
├── components/       # UI only — no domain logic
│   ├── ui/           # shadcn/ui primitives
│   └── ranking/ race/ challenge/ shared/
│
├── hooks/            # React hooks (data fetching, UI state)
├── lib/              # auth config, prisma client, container.ts (DI)
└── types/            # shared global types
```

**Data flow:** `route handler → zod validation → Service → domain functions + repositories → Prisma`

Services receive all dependencies via constructor injection using interfaces (never concrete Prisma classes). `src/lib/container.ts` wires up dependencies for production; tests use mock repositories.

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

### Seasonal license

- Price: **$50,000** per driver per season
- Mandatory to appear in ranking · invalidated each new season

### Season rewards

| Position | Title            | Prize pool cut | ELO bonus next season | Privilege           |
|----------|------------------|---------------|----------------------|---------------------|
| 1st      | King of the Streets | 60–70%     | +50                  | Can run VIP races   |
| 2nd      | Elite Runner     | 20–25%        | —                    | −50% buy-in S+1     |
| 3rd      | Night Predator   | 10–15%        | +25                  | —                   |

---

## Prisma schema summary

Models: `Driver` · `Race` · `RaceResult` · `Challenge` · `License` · `User`

Key constraints:
- `Driver.elo` defaults to 1000 · `Driver.tag` is VARCHAR(4)
- `RaceResult` has `@@unique([raceId, driverId])`
- `License` has `@@unique([driverId, season])`
- `ChallengeStatus` enum: `PENDING | ACTIVE | RESOLVED | CANCELLED`

---

## Code conventions

| Element           | Convention          | Example                          |
|-------------------|---------------------|----------------------------------|
| Interfaces        | `I` prefix          | `IDriverRepository`, `IEloCalculator` |
| Domain classes    | PascalCase          | `EloCalculator`, `RaceFinance`   |
| React hooks       | `use` + PascalCase  | `useDriverRanking`               |
| Server Actions    | verb + noun         | `resolveRace`, `submitChallenge` |
| Business constants| UPPER_SNAKE_CASE    | `ELO_FLOOR`, `LICENSE_PRICE`     |
| Test files        | `.test.ts` co-located | `EloCalculator.test.ts`        |

- No `any` — use `unknown` + type guards
- Explicit return types on all functions
- Business errors: `throw new DomainError('CODE')`, never bare `throw new Error('string')`
- Server Components by default; `'use client'` only for interactive forms, modals, local UI state
- Domain functions are pure — no Prisma calls, no fetch, no side effects
- File > 150 lines → question whether SRP is violated
