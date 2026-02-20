import { NextRequest, NextResponse } from 'next/server'
import { seasonService } from '@/lib/container'

export async function GET(): Promise<NextResponse> {
  const stats = await seasonService.getStats()
  return NextResponse.json(stats)
}

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const rewards = await seasonService.closeSeason()
  return NextResponse.json({ success: true, rewards })
}
