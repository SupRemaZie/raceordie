import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { raceService } from '@/lib/container'
import { prisma } from '@/lib/prisma'
import { DomainError } from '@/domain/errors/DomainError'

const createRaceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  raceDate: z.string().transform((v) => new Date(v)),
  checkpoints: z.array(z.string().min(1).max(200)).max(6).default([]),
  participants: z.array(
    z.object({
      driverId: z.string(),
      stake: z.number().int().positive().max(10_000_000),
    }),
  ).min(2),
  circuitId: z.string().optional(),
})

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const races = await prisma.race.findMany({
    include: { results: { include: { driver: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(races)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: unknown = await req.json()
  const parsed = createRaceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    const raceId = await raceService.createPendingRace(parsed.data)
    return NextResponse.json({ raceId }, { status: 201 })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
