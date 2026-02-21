import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: false })
dotenv.config({ path: '.env', override: false })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

const SEASON = 1

// ── Helpers ──────────────────────────────────────────────────────────────────

function prizePool(totalPool: number, commissionRate: number): number {
  return totalPool - Math.floor(totalPool * commissionRate)
}

function payout(prizePool: number, position: number): number {
  if (position === 1) return Math.floor(prizePool * 0.60)
  if (position === 2) return Math.floor(prizePool * 0.25)
  if (position === 3) return Math.floor(prizePool * 0.15)
  return 0
}

// ── Data ─────────────────────────────────────────────────────────────────────

const DRIVERS = [
  { tag: 'KING', name: 'King',       elo: 1285, balance: 182_400 },
  { tag: 'BLCK', name: 'Blackout',   elo: 1220, balance: 143_550 },
  { tag: 'NTRO', name: 'Nitro',      elo: 1175, balance:  97_200 },
  { tag: 'XYLO', name: 'Xylo',       elo: 1140, balance:  85_000 },
  { tag: 'RAFA', name: 'El Rafa',    elo: 1095, balance:  61_650 },
  { tag: 'DUSK', name: 'Dusk',       elo: 1050, balance:  39_900 },
  { tag: 'VALK', name: 'Valkyrie',   elo:  985, balance:  26_250 },
  { tag: 'GZMO', name: 'Gazmo',      elo:  950, balance:  14_700 },
  { tag: 'RUDY', name: 'Rudy',       elo:  910, balance:   7_500 },
  { tag: 'ZERO', name: 'Zero',       elo:  875, balance:       0 },
]

// Chaque race : { name, totalPool, commissionRate, raceDate, resolvedAt, checkpoints, résultats [tag, pos] }
const RACES = [
  {
    name: 'Midnight Sprint',
    totalPool: 20_000, commissionRate: 0.25,
    raceDate:   new Date('2025-09-05T02:00:00Z'),
    resolvedAt: new Date('2025-09-05T04:30:00Z'),
    checkpoints: ['Tunnel Nord', 'Pont des Lumières'],
    results: [
      { tag: 'KING', position: 1 },
      { tag: 'BLCK', position: 2 },
      { tag: 'NTRO', position: 3 },
      { tag: 'RAFA', position: 4 },
    ],
  },
  {
    name: 'Neon Circuit',
    totalPool: 32_000, commissionRate: 0.25,
    raceDate:   new Date('2025-09-19T23:30:00Z'),
    resolvedAt: new Date('2025-09-20T01:00:00Z'),
    checkpoints: ['Zone Industrielle', 'Carrefour Rouge', 'Dock 7'],
    results: [
      { tag: 'BLCK', position: 1 },
      { tag: 'XYLO', position: 2 },
      { tag: 'KING', position: 3 },
      { tag: 'DUSK', position: 4 },
    ],
  },
  {
    name: 'Ghost Highway',
    totalPool: 50_000, commissionRate: 0.30,
    raceDate:   new Date('2025-10-04T01:15:00Z'),
    resolvedAt: new Date('2025-10-04T03:00:00Z'),
    checkpoints: [],
    results: [
      { tag: 'KING', position: 1 },
      { tag: 'NTRO', position: 2 },
      { tag: 'XYLO', position: 3 },
      { tag: 'VALK', position: 4 },
      { tag: 'GZMO', position: 5 },
    ],
  },
  {
    name: "Devil's Run",
    totalPool: 45_000, commissionRate: 0.30,
    raceDate:   new Date('2025-10-18T00:00:00Z'),
    resolvedAt: new Date('2025-10-18T02:15:00Z'),
    checkpoints: ['Virage du Diable', 'Ligne de Feu'],
    results: [
      { tag: 'NTRO', position: 1 },
      { tag: 'RAFA', position: 2 },
      { tag: 'DUSK', position: 3 },
    ],
  },
  {
    name: 'Shadow Grand Prix',
    totalPool: 80_000, commissionRate: 0.25,
    raceDate:   new Date('2025-11-01T03:00:00Z'),
    resolvedAt: new Date('2025-11-01T05:30:00Z'),
    checkpoints: ['Entrée Autoroute', 'Échangeur Ombre', 'Sortie Fantôme'],
    results: [
      { tag: 'BLCK', position: 1 },
      { tag: 'KING', position: 2 },
      { tag: 'XYLO', position: 3 },
      { tag: 'NTRO', position: 4 },
    ],
  },
  {
    name: 'Red Zone Finale',
    totalPool: 60_000, commissionRate: 0.30,
    raceDate:   new Date('2025-11-15T02:30:00Z'),
    resolvedAt: new Date('2025-11-15T04:45:00Z'),
    checkpoints: ['Zone Rouge Alpha', 'Passage Interdit', 'Fin de Partie'],
    results: [
      { tag: 'KING', position: 1 },
      { tag: 'BLCK', position: 2 },
      { tag: 'RAFA', position: 3 },
      { tag: 'VALK', position: 4 },
      { tag: 'ZERO', position: 5 },
    ],
  },
]

const CHALLENGES = [
  {
    player1: 'KING', player2: 'BLCK', stake: 20_000,
    winner: 'KING', status: 'RESOLVED' as const,
    createdAt: new Date('2025-09-28T22:00:00Z'),
  },
  {
    player1: 'NTRO', player2: 'XYLO', stake: 10_000,
    winner: 'XYLO', status: 'RESOLVED' as const,
    createdAt: new Date('2025-10-10T23:00:00Z'),
  },
  {
    player1: 'RAFA', player2: 'DUSK', stake: 8_000,
    winner: 'RAFA', status: 'RESOLVED' as const,
    createdAt: new Date('2025-10-25T21:30:00Z'),
  },
  {
    player1: 'BLCK', player2: 'NTRO', stake: 15_000,
    winner: null, status: 'PENDING' as const,
    createdAt: new Date('2025-11-16T20:00:00Z'),
  },
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱 Seeding RACEORDIE...\n')

  // ── Drivers + Licenses ───────────────────────────────────────────────────
  const driverIds: Record<string, string> = {}

  for (const d of DRIVERS) {
    const driver = await prisma.driver.upsert({
      where: { tag: d.tag },
      update: { name: d.name, elo: d.elo, balance: d.balance },
      create: { tag: d.tag, name: d.name, elo: d.elo, balance: d.balance },
    })
    driverIds[d.tag] = driver.id

    await prisma.license.upsert({
      where: { driverId_season: { driverId: driver.id, season: SEASON } },
      update: {},
      create: { driverId: driver.id, season: SEASON },
    })

    console.log(`  [${d.tag}] ${d.name.padEnd(18)} ELO ${d.elo}   $${d.balance.toLocaleString()}`)
  }

  // ── Races ────────────────────────────────────────────────────────────────
  console.log('\n🏁 Courses :')

  await prisma.raceResult.deleteMany({})
  await prisma.race.deleteMany({})

  for (const r of RACES) {
    const organizerFee = Math.floor(r.totalPool * r.commissionRate)
    const finalPotCut  = Math.floor(organizerFee * 0.05)
    const pool         = prizePool(r.totalPool, r.commissionRate)
    const stakeEach    = Math.floor(r.totalPool / r.results.length)

    await prisma.race.create({
      data: {
        name:           r.name,
        raceDate:       r.raceDate,
        checkpoints:    r.checkpoints,
        season:         SEASON,
        commissionRate: r.commissionRate,
        organizerFee,
        finalPotCut,
        resolvedAt:     r.resolvedAt,
        results: {
          create: r.results.map(({ tag, position }) => ({
            driverId: driverIds[tag],
            position,
            stake: stakeEach,
            payout: payout(pool, position),
          })),
        },
      },
    })

    const winner = r.results.find((x) => x.position === 1)!
    console.log(
      `  "${r.name}"`.padEnd(26) +
      ` pool $${r.totalPool.toLocaleString()}  comm ${r.commissionRate * 100}%` +
      `  → 🥇 [${winner.tag}] +$${payout(pool, 1).toLocaleString()}`,
    )
  }

  // ── Challenges ───────────────────────────────────────────────────────────
  console.log('\n⚡ Challenges :')

  await prisma.challenge.deleteMany({})

  for (const c of CHALLENGES) {
    const totalPool    = c.stake * 2
    const organizerFee = Math.floor(totalPool * 0.15)
    const winnerPrize  = totalPool - organizerFee

    await prisma.challenge.create({
      data: {
        season:       SEASON,
        player1Id:    driverIds[c.player1],
        player2Id:    driverIds[c.player2],
        winnerId:     c.winner ? driverIds[c.winner] : null,
        stake:        c.stake,
        totalPool,
        organizerFee,
        winnerPrize,
        status:       c.status,
        createdAt:    c.createdAt,
      },
    })

    const result = c.winner
      ? `→ 🏆 [${c.winner}] +$${winnerPrize.toLocaleString()}`
      : '→ ⏳ en attente'
    console.log(`  [${c.player1}] vs [${c.player2}]  $${c.stake.toLocaleString()} stake  ${result}`)
  }

  console.log('\n✅ Seed terminé — 10 pilotes, 6 courses, 4 challenges')
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => void prisma.$disconnect())
