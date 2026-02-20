import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  username: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and _ only'),
  password: z.string().min(6),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username: parsed.data.username },
    })
    if (existing) {
      return NextResponse.json({ error: 'Pseudo already taken' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(parsed.data.password, 12)

    await prisma.user.create({
      data: {
        username: parsed.data.username,
        password: hashed,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    const message = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
