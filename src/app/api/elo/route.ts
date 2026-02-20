import { NextResponse } from 'next/server'
import { driverService } from '@/lib/container'

export async function GET(): Promise<NextResponse> {
  const ranking = await driverService.getRanking()
  return NextResponse.json(ranking)
}
