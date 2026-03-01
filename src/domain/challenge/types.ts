export interface ChallengeFinanceInput {
  stake: number // per driver, integer
  commissionRate?: number
}

export interface ChallengeFinanceResult {
  totalPool: number
  organizerFee: number
  winnerPrize: number
}
