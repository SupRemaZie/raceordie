'use client'

import { useQuery } from '@tanstack/react-query'

interface Driver {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
}

async function fetchRanking(): Promise<Driver[]> {
  const res = await fetch('/api/elo')
  if (!res.ok) throw new Error('Failed to fetch ranking')
  return res.json() as Promise<Driver[]>
}

export function useRanking() {
  return useQuery({ queryKey: ['ranking'], queryFn: fetchRanking })
}
