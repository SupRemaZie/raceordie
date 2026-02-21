export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'

export interface ChallengeRecord {
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
  createdAt: Date
  updatedAt: Date
}

export interface CreateChallengeInput {
  season: number
  player1Id: string
  player2Id: string
  stake: number
  totalPool: number
  organizerFee: number
  winnerPrize: number
}

export interface IChallengeRepository {
  findById(id: string): Promise<ChallengeRecord | null>
  findBySeason(season: number): Promise<ChallengeRecord[]>
  findByDriver(driverId: string): Promise<ChallengeRecord[]>
  create(input: CreateChallengeInput): Promise<ChallengeRecord>
  resolve(id: string, winnerId: string): Promise<ChallengeRecord>
  cancel(id: string): Promise<ChallengeRecord>
  activate(id: string): Promise<ChallengeRecord>
  delete(id: string): Promise<void>
}
