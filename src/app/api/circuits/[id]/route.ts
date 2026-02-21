import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { circuitService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'

const updateCircuitSchema = z.object({
  name: z.string().min(1).optional(),
  checkpoints: z.array(z.string()).max(6).optional(),
  photos: z.array(z.string().url()).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  try {
    const circuit = await circuitService.getCircuit(id)
    return NextResponse.json(circuit)
  } catch (err) {
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 404 })
    throw err
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body: unknown = await req.json()
  const parsed = updateCircuitSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  try {
    const circuit = await circuitService.updateCircuit(id, parsed.data)
    return NextResponse.json(circuit)
  } catch (err) {
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 422 })
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
    await circuitService.deleteCircuit(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 422 })
    throw err
  }
}
