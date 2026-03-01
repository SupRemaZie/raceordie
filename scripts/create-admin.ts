/**
 * Crée ou met à jour le compte admin en base.
 * Usage:
 *   npx tsx scripts/create-admin.ts <username> <password>
 *
 * Exemple:
 *   npx tsx scripts/create-admin.ts shadowracer MonMotDePasse123!
 */
import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'

// Charge .env.local si présent
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main(): Promise<void> {
  const [,, username, password] = process.argv

  if (!username || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <username> <password>')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Le mot de passe doit faire au moins 8 caractères.')
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  // Supprime l'éventuel ancien admin avant d'en créer un nouveau
  await prisma.user.deleteMany({ where: { role: 'admin' } })

  const user = await prisma.user.create({
    data: { username, password: hash, role: 'admin' },
  })

  console.log(`\n✅  Compte admin créé`)
  console.log(`    username : ${user.username}`)
  console.log(`    id       : ${user.id}`)
  console.log(`    role     : ${user.role}`)
  console.log(`\n    Connecte-toi avec le code : <ton mot de passe>\n`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
