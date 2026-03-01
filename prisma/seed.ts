/**
 * prisma/seed.ts — Données mock underground racing
 * Run: npx tsx prisma/seed.ts
 */
import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local if present (Next.js convention)
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

// ── Mock drivers — underground racing scene ────────────────────────────────
const DRIVERS = [
  // ── ELITE tier (≥1300) ──────────────────────────────────────────────────
  {
    tag: 'GHST',
    name: 'Ghost',
    elo: 1487,
    balance: 148_500,
    archived: false,
    loginCode: 'ghost2025',
    createdAt: new Date('2025-09-12'),
  },
  {
    tag: 'NYTE',
    name: 'Nyte',
    elo: 1356,
    balance: 97_200,
    archived: false,
    loginCode: 'nyte2025',
    createdAt: new Date('2025-09-18'),
  },
  // ── PRO tier (1100–1299) ─────────────────────────────────────────────────
  {
    tag: 'VNMN',
    name: 'Venom',
    elo: 1245,
    balance: 74_800,
    archived: false,
    loginCode: 'venom2025',
    createdAt: new Date('2025-10-03'),
  },
  {
    tag: 'WRAT',
    name: 'Wraith',
    elo: 1134,
    balance: 53_100,
    archived: false,
    createdAt: new Date('2025-10-14'),
  },
  {
    tag: 'BLCK',
    name: 'Blackout',
    elo: 1108,
    balance: 41_700,
    archived: false,
    createdAt: new Date('2025-11-01'),
  },
  // ── ROOKIE tier (900–1099) ───────────────────────────────────────────────
  {
    tag: 'BLZE',
    name: 'Blaze',
    elo: 1042,
    balance: 28_300,
    archived: false,
    createdAt: new Date('2025-11-20'),
  },
  {
    tag: 'LYNX',
    name: 'Lynx',
    elo: 987,
    balance: 19_600,
    archived: false,
    createdAt: new Date('2025-12-05'),
  },
  {
    tag: 'NOVA',
    name: 'Nova',
    elo: 934,
    balance: 11_400,
    archived: false,
    createdAt: new Date('2025-12-19'),
  },
  // ── FARM tier (<900) ─────────────────────────────────────────────────────
  {
    tag: 'SCRB',
    name: 'Scrub',
    elo: 871,
    balance: 4_200,
    archived: false,
    createdAt: new Date('2026-01-08'),
  },
  {
    tag: 'ZERO',
    name: 'Zero',
    elo: 812,
    balance: 1_100,
    archived: false,
    createdAt: new Date('2026-01-22'),
  },
  // ── Archivé — n'apparaît pas dans le classement ──────────────────────────
  {
    tag: 'EXIL',
    name: 'Exile',
    elo: 1023,
    balance: 0,
    archived: true,
    createdAt: new Date('2025-08-30'),
  },
]

async function main(): Promise<void> {
  console.log('🏁  Seeding underground drivers…\n')

  // Wipe existing drivers (cascade deletes race results, challenges)
  await prisma.raceResult.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.driver.deleteMany()

  for (const d of DRIVERS) {
    const driver = await prisma.driver.create({ data: d })
    const status = d.archived ? '📦 archived' : `ELO ${driver.elo}`
    console.log(`  ✓  [${driver.tag}]  ${driver.name.padEnd(12)}  ${status}`)
  }

  console.log(`\n✅  ${DRIVERS.filter(d => !d.archived).length} active drivers seeded.`)
  console.log('    Run: npm run dev → /ranking\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
