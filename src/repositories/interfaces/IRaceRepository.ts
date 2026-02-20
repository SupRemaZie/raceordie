import type { CommissionRate } from '@/domain/race/types'

export interface RaceResultRecord {
  id: string
  raceId: string
  driverId: string
  position: number
  payout: number
  createdAt: Date
}

export interface RaceRecord {
  id: string
  season: number
  organizerFee: number
  finalPotCut: number
  commissionRate: number
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
  results: RaceResultRecord[]
}

export interface CreateRaceInput {
  season: number
  organizerFee: number
  finalPotCut: number
  commissionRate: CommissionRate
  results: Array<{
    driverId: string
    position: number
    payout: number
  }>
}

export interface IRaceRepository {
  findById(id: string): Promise<RaceRecord | null>
  findBySeason(season: number): Promise<RaceRecord[]>
  findAll(): Promise<RaceRecord[]>
  create(input: CreateRaceInput): Promise<RaceRecord>
  markResolved(id: string): Promise<RaceRecord>
}
