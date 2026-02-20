import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { driverService } from '@/lib/container'
import { DomainError } from '@/domain/errors/DomainError'

function isAdmin(username: string | null | undefined): boolean {
  return !!username && username === process.env.ADMIN_USERNAME
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (!isAdmin(session?.user?.name)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { id } = await params
  try {
    await driverService.purchaseLicense(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.code }, { status: 422 })
    }
    throw err
  }
}
