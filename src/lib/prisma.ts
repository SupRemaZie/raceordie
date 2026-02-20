import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Lazy singleton — pool is created on first access, not at import time,
// so process.env.DATABASE_URL is guaranteed to be loaded by Next.js first.
let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (_prisma) return _prisma
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _prisma = new PrismaClient({ adapter } as any)
  return _prisma
}

// Convenience export — still usable as `prisma.user.findFirst()` everywhere
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
