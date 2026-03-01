import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { seasonService } from '@/lib/container'

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stats = await seasonService.getStats()
  return NextResponse.json(stats)
}

export async function POST(): Promise<NextResponse> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rewards = await seasonService.closeSeason()
  return NextResponse.json({ success: true, rewards })
}
