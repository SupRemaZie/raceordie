import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { circuitService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'

const createCircuitSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  checkpoints: z.array(z.string()).max(6).default([]),
  photos: z.array(z.string().url()).default([]),
})

export async function GET(): Promise<NextResponse> {
  const circuits = await circuitService.listCircuits()
  return NextResponse.json(circuits)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: unknown = await req.json()
  const parsed = createCircuitSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    const circuit = await circuitService.createCircuit(parsed.data)
    return NextResponse.json(circuit, { status: 201 })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
