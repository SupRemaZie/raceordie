import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { challengeService } from '@/lib/container'
import { prisma } from '@/lib/prisma'
import { DomainError } from '@/domain/errors/DomainError'

const createChallengeSchema = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  stake: z.number().int().positive(),
})

export async function GET(): Promise<NextResponse> {
  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(challenges)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json()
  const parsed = createChallengeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  try {
    const challenge = await challengeService.createChallenge(parsed.data)
    return NextResponse.json(challenge, { status: 201 })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
