'use client'

import { useQuery } from '@tanstack/react-query'

type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'

interface Challenge {
  id: string
  season: number
  player1Id: string
  player2Id: string
  winnerId: string | null
  stake: number
  totalPool: number
  organizerFee: number
  winnerPrize: number
  status: ChallengeStatus
}

async function fetchChallenges(): Promise<Challenge[]> {
  const res = await fetch('/api/challenges')
  if (!res.ok) throw new Error('Failed to fetch challenges')
  return res.json() as Promise<Challenge[]>
}

export function useChallenges() {
  return useQuery({ queryKey: ['challenges'], queryFn: fetchChallenges })
}
