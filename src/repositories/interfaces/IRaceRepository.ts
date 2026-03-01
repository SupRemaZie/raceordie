export interface RaceResultRecord {
  id: string
  raceId: string
  driverId: string
  position: number
  payout: number
  stake: number
  createdAt: Date
}

export interface RaceRecord {
  id: string
  name: string
  raceDate: Date
  checkpoints: string[]
  season: number
  organizerFee: number
  finalPotCut: number
  commissionRate: number
  resolvedAt: Date | null
  circuitId: string | null
  createdAt: Date
  updatedAt: Date
  results: RaceResultRecord[]
}

export interface CreateRaceInput {
  name: string
  raceDate: Date
  checkpoints: string[]
  season: number
  organizerFee: number
  finalPotCut: number
  commissionRate: number
  circuitId?: string | null
  participants: Array<{ driverId: string; stake: number }>
}

export interface IRaceRepository {
  findById(id: string): Promise<RaceRecord | null>
  findBySeason(season: number): Promise<RaceRecord[]>
  findAll(): Promise<RaceRecord[]>
  create(input: CreateRaceInput): Promise<RaceRecord>
  updateResults(
    id: string,
    results: Array<{ driverId: string; position: number; payout: number }>,
  ): Promise<RaceRecord>
  delete(id: string): Promise<void>
}
