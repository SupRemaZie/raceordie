import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { raceService } from '@/lib/container'
import { prisma } from '@/lib/prisma'
import { DomainError } from '@/domain/errors/DomainError'

const finishRaceSchema = z.object({
  top3: z.array(z.string()).length(3),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const race = await prisma.race.findUnique({
    where: { id },
    include: { results: { include: { driver: true } } },
  })

  if (!race) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(race)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body: unknown = await req.json()
  const parsed = finishRaceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    await raceService.finishRace({ raceId: id, top3: parsed.data.top3 })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  try {
    await raceService.deleteRace(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 422 })
    throw err
  }
}
