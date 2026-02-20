'use client'

import { useQuery } from '@tanstack/react-query'

interface Driver {
  id: string
  tag: string
  name: string
  elo: number
  balance: number
}

async function fetchDrivers(): Promise<Driver[]> {
  const res = await fetch('/api/drivers')
  if (!res.ok) throw new Error('Failed to fetch drivers')
  return res.json() as Promise<Driver[]>
}

export function useDrivers() {
  return useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers })
}
