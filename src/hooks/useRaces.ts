'use client'

import { useQuery } from '@tanstack/react-query'

interface RaceResult {
  id: string
  driverId: string
  position: number
  payout: number
}

interface Race {
  id: string
  season: number
  organizerFee: number
  commissionRate: number
  resolvedAt: string | null
  results: RaceResult[]
}

async function fetchRaces(): Promise<Race[]> {
  const res = await fetch('/api/races')
  if (!res.ok) throw new Error('Failed to fetch races')
  return res.json() as Promise<Race[]>
}

export function useRaces() {
  return useQuery({ queryKey: ['races'], queryFn: fetchRaces })
}
