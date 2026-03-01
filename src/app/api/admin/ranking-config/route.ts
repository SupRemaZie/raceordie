import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { rankingConfigRepo } from '@/lib/container'

const positiveInt = z.number().int().positive()

const patchSchema = z.object({
  eloFloor: positiveInt.optional(),
  diffThreshold: positiveInt.optional(),
  strongWinDelta: positiveInt.optional(),
  strongLossDelta: positiveInt.optional(),
  evenWinDelta: positiveInt.optional(),
  evenLossDelta: positiveInt.optional(),
  weakWinDelta: positiveInt.optional(),
  weakLossDelta: positiveInt.optional(),
  racePoints1: positiveInt.optional(),
  racePoints2: positiveInt.optional(),
  racePoints3: positiveInt.optional(),
  racePointsOther: positiveInt.optional(),
})

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const config = await rankingConfigRepo.get()
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: unknown = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const config = await rankingConfigRepo.update(parsed.data)
  return NextResponse.json(config)
}
