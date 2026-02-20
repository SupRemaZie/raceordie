import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { driverService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'

const updateDriverSchema = z.object({
  name: z.string().min(2).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  try {
    const driver = await driverService.getDriver(id)
    return NextResponse.json(driver)
  } catch (err) {
    if (err instanceof DomainError && err.code === 'DRIVER_NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw err
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const body: unknown = await req.json()
  const parsed = updateDriverSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const driver = await driverService.getDriver(id)
    const updated = await (await import('@/lib/container')).driverService.listAll()
    void updated
    // Direct update via repo not exposed on service — use prisma
    const { prisma } = await import('@/lib/prisma')
    const result = await prisma.driver.update({
      where: { id: driver.id },
      data: parsed.data,
    })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
