import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { driverService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'
import { getSupabase } from '@/lib/supabaseClient'

function extractStoragePath(photoUrl: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = photoUrl.indexOf(marker)
    if (idx === -1) return null
    return photoUrl.slice(idx + marker.length)
  } catch {
    return null
  }
}

const updateDriverSchema = z.object({
  name: z.string().min(2).optional(),
  action: z.enum(['archive', 'unarchive']).optional(),
  photo: z.string().url().optional(),
  loginCode: z.string().min(4).max(20).optional(),
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
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 404 })
    throw err
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'
  const isOwnDriver = session?.user?.driverId === id

  if (!isAdmin && !isOwnDriver) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body: unknown = await req.json()
  const parsed = updateDriverSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  // loginCode is admin-only
  if (parsed.data.loginCode !== undefined && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // photo requires either admin or the driver themselves
  if (parsed.data.photo !== undefined && !isAdmin && session?.user?.driverId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // archive/unarchive/name changes require admin
  if ((parsed.data.action !== undefined || parsed.data.name !== undefined) && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    let driver

    if (parsed.data.action === 'archive') {
      driver = await driverService.archiveDriver(id)
    } else if (parsed.data.action === 'unarchive') {
      driver = await driverService.unarchiveDriver(id)
    } else if (parsed.data.photo !== undefined || parsed.data.loginCode !== undefined) {
      driver = await prisma.driver.update({
        where: { id },
        data: {
          ...(parsed.data.photo !== undefined ? { photo: parsed.data.photo } : {}),
          ...(parsed.data.loginCode !== undefined ? { loginCode: parsed.data.loginCode } : {}),
        },
      })
    } else {
      driver = await driverService.updateDriver(id, { name: parsed.data.name })
    }

    return NextResponse.json(driver)
  } catch (err) {
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 422 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    // Récupérer la photo avant suppression
    const driver = await prisma.driver.findUnique({ where: { id }, select: { photo: true } })

    await driverService.deleteDriver(id)

    // Supprimer la photo du bucket (best-effort)
    if (driver?.photo) {
      const path = extractStoragePath(driver.photo, 'drivers')
      if (path) {
        await getSupabase().storage.from('drivers').remove([path])
      }
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof DomainError) return NextResponse.json({ error: err.code }, { status: 422 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
