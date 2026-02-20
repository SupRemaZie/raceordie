import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: false })
dotenv.config({ path: '.env', override: false })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main(): Promise<void> {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env.local')
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed },
  })

  console.log(`✅  Compte admin créé/mis à jour : ${user.username} (id: ${user.id})`)
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
