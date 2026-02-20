import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { challengeService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'

const resolveSchema = z.object({
  action: z.enum(['resolve', 'cancel', 'activate']),
  winnerId: z.string().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const { prisma } = await import('@/lib/prisma')
  const challenge = await prisma.challenge.findUnique({ where: { id } })
  if (!challenge) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(challenge)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const body: unknown = await req.json()
  const parsed = resolveSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    let result
    if (parsed.data.action === 'resolve') {
      if (!parsed.data.winnerId) {
        return NextResponse.json({ error: 'winnerId required' }, { status: 400 })
      }
      result = await challengeService.resolveChallenge(id, parsed.data.winnerId)
    } else if (parsed.data.action === 'cancel') {
      result = await challengeService.cancelChallenge(id)
    } else {
      result = await challengeService.activateChallenge(id)
    }
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
