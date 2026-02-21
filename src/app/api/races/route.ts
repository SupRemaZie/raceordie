import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { raceService } from '@/lib/container'
import { prisma } from '@/lib/prisma'
import { DomainError } from '@/domain/errors/DomainError'

const createRaceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  raceDate: z.string().transform((v) => new Date(v)),
  checkpoints: z.array(z.string().min(1)).max(6).default([]),
  participants: z.array(
    z.object({ driverId: z.string(), stake: z.number().int().positive() }),
  ).min(2),
  commissionRate: z.union([z.literal(0.25), z.literal(0.30)]),
  circuitId: z.string().optional(),
})

export async function GET(): Promise<NextResponse> {
  const races = await prisma.race.findMany({
    include: { results: { include: { driver: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(races)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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
