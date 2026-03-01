import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { driverService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'

const createDriverSchema = z.object({
  name: z.string().min(2),
  userId: z.string().optional(),
})

export async function GET(): Promise<NextResponse> {
  const drivers = await driverService.listAll()
  return NextResponse.json(drivers)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json()
  const parsed = createDriverSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  try {
    const driver = await driverService.createDriver(parsed.data)
    return NextResponse.json(driver, { status: 201 })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
