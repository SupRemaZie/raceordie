import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { raceService } from '@/lib/container'
import { prisma } from '@/lib/prisma'
import { DomainError } from '@/domain/errors/DomainError'

const resolveRaceSchema = z.object({
  finishedOrder: z.array(z.string()).min(3),
  stakes: z.array(z.number().int().positive()).min(3),
  commissionRate: z.union([z.literal(0.25), z.literal(0.30)]),
})

export async function GET(): Promise<NextResponse> {
  const races = await prisma.race.findMany({
    include: { results: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(races)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json()
  const parsed = resolveRaceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  try {
    const raceId = await raceService.resolveRace(parsed.data)
    return NextResponse.json({ raceId }, { status: 201 })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
